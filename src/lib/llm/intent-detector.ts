// ============================================================================
// VietBridge AI V2 - Intent Detector
// Ported from V5 prototype detectIntent
// Uses regex patterns to detect task type, scene, and confidence
// ============================================================================

import type { TaskId } from "../intelligence/tasks";
import type { SceneId } from "../intelligence/scene-rules";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DetectedIntent {
  task: TaskId;
  scene: SceneId | null;
  confidence: number;
}

// ---------------------------------------------------------------------------
// Pattern definitions
// ---------------------------------------------------------------------------

/** Risk-related keywords (Chinese + Vietnamese) */
const RISK_PATTERNS =
  /骗|风险|安全|注意|小心|危险|坑|宰|陷阱|诈骗|lừa|đảo|nguy hiểm|cẩn thận|rủi ro|合同|签约|押金|定金|被坑|被骗|黑店|乱收费/i;

/** Teaching request patterns */
const LEARN_PATTERNS =
  /教我|怎么说|怎么讲|如何说|怎样说|学|说法|表达|dạy|nói thế nào|cách nói|我想学|教一下|怎么用越南语/i;

/** Vietnamese character detection (accented vowels and special consonants) */
const VIETNAMESE_PATTERN =
  /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i;

/** Reply suggestion patterns */
const REPLY_PATTERNS =
  /回复|怎么回|怎么答|帮我回|回什么|回他|回她|回Ta|reply|trả lời|该说什么|该怎么说|该回什么|对方说|他说|她说|收到.*消息/i;

/** Scene keyword maps */
const SCENE_KEYWORDS: Record<SceneId, RegExp> = {
  general: /^$/,
  business:
    /商务|合作|公司|投资|股份|合同|生意|business|kinh doanh|hợp tác|công ty|đầu tư|谈判|报价|合伙/i,
  staff:
    /员工|工人|下属|管理|工资|辞退|招聘|nhân viên|công nhân|quản lý|lương|sa thải|tuyển dụng|加班|考勤|请假/i,
  couple:
    /女朋友|男朋友|老婆|老公|对象|情人|约会|表白|bạn gái|bạn trai|vợ|chồng|người yêu|hẹn hò|亲爱|宝贝|爱/i,
  restaurant:
    /餐厅|吃饭|点菜|菜单|menu|nhà hàng|ăn|gọi món|好吃|餐|饭店|小吃|外卖|堂食|点餐|买单|结账/i,
  rent: /租房|房子|公寓|房租|房东|搬家|thuê nhà|căn hộ|phòng trọ|chủ nhà|tiền thuê|押金|水电|合同/i,
  hospital:
    /医院|看病|医生|药|生病|bệnh viện|bác sĩ|thuốc|ốm|đau|头疼|发烧|感冒|拉肚子|过敏|急诊|挂号|体检/i,
  housekeeping:
    /家政|保姆|钟点工|打扫|清洁|giúp việc|dọn dẹp|lau nhà|giặt đồ|nấu ăn|保洁|阿姨|做饭|洗衣|拖地/i,
};

// ---------------------------------------------------------------------------
// Detection logic
// ---------------------------------------------------------------------------

/**
 * Detect the user's intent from their input text.
 * Returns the most likely task, scene, and confidence score.
 */
export function detectIntent(text: string): DetectedIntent {
  const trimmed = text.trim();
  if (!trimmed) {
    return { task: "translate", scene: null, confidence: 0.1 };
  }

  let task: TaskId = "translate";
  let confidence = 0.5;
  let scene: SceneId | null = null;

  // --- Step 1: Detect task ---

  // Risk analysis takes highest priority (safety-first)
  if (RISK_PATTERNS.test(trimmed)) {
    task = "risk";
    confidence = 0.85;
  }
  // Learning / teaching request
  else if (LEARN_PATTERNS.test(trimmed)) {
    task = "learn";
    confidence = 0.8;
  }
  // Reply suggestion (usually contains Vietnamese text + request for help)
  else if (REPLY_PATTERNS.test(trimmed)) {
    task = "reply";
    confidence = 0.75;
  }
  // Vietnamese text without explicit request → likely translation
  else if (VIETNAMESE_PATTERN.test(trimmed)) {
    task = "translate";
    confidence = 0.7;
  }
  // Chinese text → likely translation
  else if (/[\u4e00-\u9fff]/.test(trimmed)) {
    task = "translate";
    confidence = 0.65;
  }
  // Default: translation with lower confidence
  else {
    task = "translate";
    confidence = 0.4;
  }

  // --- Step 2: Detect scene ---

  for (const [sceneId, pattern] of Object.entries(SCENE_KEYWORDS)) {
    if (sceneId === "general") continue;
    if (pattern.test(trimmed)) {
      scene = sceneId as SceneId;
      // Boost confidence when scene is detected
      confidence = Math.min(confidence + 0.1, 0.95);
      break;
    }
  }

  // --- Step 3: Confidence adjustments ---

  // Longer inputs generally have clearer intent
  if (trimmed.length > 50) {
    confidence = Math.min(confidence + 0.05, 0.95);
  }

  // Very short inputs are less certain
  if (trimmed.length < 5) {
    confidence = Math.max(confidence - 0.15, 0.1);
  }

  // Multiple signals boost confidence
  const hasVietnamese = VIETNAMESE_PATTERN.test(trimmed);
  const hasChinese = /[\u4e00-\u9fff]/.test(trimmed);
  if (hasVietnamese && hasChinese) {
    // Bilingual input — likely translation or learning
    confidence = Math.min(confidence + 0.1, 0.95);
  }

  return { task, scene, confidence };
}
