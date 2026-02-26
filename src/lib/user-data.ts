// ============================================================================
// VietBridge AI — User Data Deletion (GDPR-style)
// Transactional deletion of all user data with optional account deletion
// ============================================================================

import { prisma } from "./prisma";
import { redis } from "./redis";

export interface DeleteDataResult {
  messages: number;
  conversations: number;
  usageLogs: number;
  llmLogs: number;
  apiKeys: number;
  userDeleted: boolean;
}

/**
 * Delete all data for a user. Optionally delete the user account itself.
 * Uses Prisma transaction for atomicity.
 */
export async function deleteUserData(
  userId: string,
  options: { deleteAccount?: boolean } = {}
): Promise<DeleteDataResult> {
  const result = await prisma.$transaction(async (tx) => {
    // 1. Messages (via conversations)
    const userConversations = await tx.conversation.findMany({
      where: { userId },
      select: { id: true },
    });
    const conversationIds = userConversations.map((c) => c.id);

    const messagesDeleted = await tx.message.deleteMany({
      where: { conversationId: { in: conversationIds } },
    });

    // 2. Conversations
    const conversationsDeleted = await tx.conversation.deleteMany({
      where: { userId },
    });

    // 3. UsageLogs
    const usageLogsDeleted = await tx.usageLog.deleteMany({
      where: { userId },
    });

    // 4. LlmLogs — soft delete to preserve audit trail
    const llmLogsDeleted = await tx.llmLog.updateMany({
      where: { userId, deleted: false },
      data: { deleted: true },
    });

    // 5. ApiKeys
    const apiKeysDeleted = await tx.apiKey.deleteMany({
      where: { userId },
    });

    // 6. Optionally delete the user (cascades to Account, Session, Subscription)
    let userDeleted = false;
    if (options.deleteAccount) {
      await tx.user.delete({ where: { id: userId } });
      userDeleted = true;
    }

    return {
      messages: messagesDeleted.count,
      conversations: conversationsDeleted.count,
      usageLogs: usageLogsDeleted.count,
      llmLogs: llmLogsDeleted.count,
      apiKeys: apiKeysDeleted.count,
      userDeleted,
    };
  });

  // Clean up Redis rate limit keys
  try {
    await redis.del(`rl:session:${userId}`);
  } catch (err) {
    console.error("[Redis Cleanup Error]", err);
  }

  return result;
}
