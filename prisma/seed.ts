// ============================================================================
// VietBridge AI V2 — Database Seed
// Seeds: admin user, knowledge base, risk rules, model routes, prompt version
// Run: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
// Or: npx prisma db seed
// ============================================================================

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ── 1. Admin User ─────────────────────────────────────────────────────────
  const adminPassword = await hash("admin123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@vietbridge.ai" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@vietbridge.ai",
      hashedPassword: adminPassword,
      role: "admin",
      emailVerified: new Date(),
    },
  });

  await prisma.subscription.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      plan: "ENTERPRISE",
    },
  });

  console.log("  ✓ Admin user created (admin@vietbridge.ai / admin123456)");

  // ── 2. Knowledge Base Entries ─────────────────────────────────────────────
  const kbEntries = [
    {
      category: "danang_prices",
      key: "mi_quang",
      valueZh: "广面: 本地价25,000-35,000 VND，游客价50,000-80,000 VND",
      valueVi: "Mì Quảng: giá địa phương 25,000-35,000 VND, giá du lịch 50,000-80,000 VND",
      confidence: 0.85,
      source: "岘港本地调研 2025-01",
    },
    {
      category: "danang_prices",
      key: "banh_mi",
      valueZh: "越南法棍: 本地价15,000-20,000 VND，游客价30,000-50,000 VND",
      valueVi: "Bánh mì: giá địa phương 15,000-20,000 VND, giá du lịch 30,000-50,000 VND",
      confidence: 0.85,
      source: "岘港本地调研 2025-01",
    },
    {
      category: "danang_prices",
      key: "pho",
      valueZh: "河粉: 本地价30,000-45,000 VND，游客价60,000-100,000 VND",
      valueVi: "Phở: giá địa phương 30,000-45,000 VND, giá du lịch 60,000-100,000 VND",
      confidence: 0.85,
      source: "岘港本地调研 2025-01",
    },
    {
      category: "danang_prices",
      key: "ca_phe",
      valueZh: "冰奶咖啡: 本地价15,000-25,000 VND，游客价35,000-60,000 VND",
      valueVi: "Cà phê sữa đá: giá địa phương 15,000-25,000 VND, giá du lịch 35,000-60,000 VND",
      confidence: 0.85,
      source: "岘港本地调研 2025-01",
    },
    {
      category: "danang_prices",
      key: "hai_san",
      valueZh: "海鲜: 按市场价，游客加价30-100%。一定要提前问价",
      valueVi: "Hải sản: theo giá thị trường, du khách bị tăng 30-100%. Phải hỏi giá trước",
      confidence: 0.85,
      source: "岘港本地调研 2025-01",
    },
    {
      category: "rent_rules",
      key: "deposit",
      valueZh: "押金标准: 通常1-2个月房租作为押金(tiền cọc)。超过2个月押金需警惕",
      valueVi: "Tiền cọc tiêu chuẩn: thường 1-2 tháng tiền thuê. Cọc quá 2 tháng cần cảnh giác",
      confidence: 0.8,
      source: "岘港外国人租房经验汇总",
    },
    {
      category: "rent_rules",
      key: "utilities",
      valueZh: "水电费: 电费按政府阶梯价3,000-4,000 VND/kWh，水费约10,000 VND/m³",
      valueVi: "Điện nước: điện theo giá bậc thang 3,000-4,000 VND/kWh, nước khoảng 10,000 VND/m³",
      confidence: 0.8,
      source: "岘港外国人租房经验汇总",
    },
    {
      category: "rent_rules",
      key: "registration",
      valueZh: "外国人登记: 房东有义务帮外国租客做暂住登记(đăng ký tạm trú)，不登记可能导致罚款",
      valueVi: "Đăng ký tạm trú: chủ nhà có nghĩa vụ đăng ký cho người nước ngoài, không đăng ký có thể bị phạt",
      confidence: 0.8,
      source: "岘港外国人租房经验汇总",
    },
    {
      category: "scam_patterns",
      key: "restaurant_scam",
      valueZh: "餐厅宰客: 没有菜单或无价格，海鲜不标价按「市场价」结算。可拨打旅游投诉热线1039",
      valueVi: "Nhà hàng chặt chém: không có menu hoặc không ghi giá, hải sản tính \"giá thị trường\". Gọi 1039 để khiếu nại",
      confidence: 0.9,
      source: "在越华人社区反诈经验",
    },
    {
      category: "scam_patterns",
      key: "taxi_scam",
      valueZh: "出租车绕路: 拒绝打表或表跳异常快。优先使用Grab，出租车推荐Mai Linh或Vinasun",
      valueVi: "Taxi gian lận: từ chối bật đồng hồ hoặc đồng hồ nhảy nhanh. Ưu tiên dùng Grab, taxi nên chọn Mai Linh hoặc Vinasun",
      confidence: 0.9,
      source: "在越华人社区反诈经验",
    },
  ];

  for (const entry of kbEntries) {
    await prisma.knowledgeEntry.upsert({
      where: {
        id: `seed_${entry.category}_${entry.key}`,
      },
      update: { ...entry },
      create: {
        id: `seed_${entry.category}_${entry.key}`,
        ...entry,
      },
    });
  }

  console.log(`  ✓ ${kbEntries.length} knowledge base entries seeded`);

  // ── 3. Risk Rules ─────────────────────────────────────────────────────────
  const riskRules = [
    {
      id: "seed_rule_price",
      rule: "价格异常高于本地参考价200%以上",
      category: "price",
      weight: 30,
      severity: "high",
      action: "warn",
      active: true,
    },
    {
      id: "seed_rule_no_menu",
      rule: "无菜单或菜单无标价",
      category: "restaurant",
      weight: 25,
      severity: "medium",
      action: "warn",
      active: true,
    },
    {
      id: "seed_rule_deposit",
      rule: "押金超过2个月房租",
      category: "rent",
      weight: 20,
      severity: "medium",
      action: "warn",
      active: true,
    },
    {
      id: "seed_rule_no_contract",
      rule: "未签订正式合同",
      category: "rent",
      weight: 35,
      severity: "high",
      action: "block",
      active: true,
    },
    {
      id: "seed_rule_rush_sign",
      rule: "催促签字不给审核时间",
      category: "contract",
      weight: 30,
      severity: "high",
      action: "warn",
      active: true,
    },
    {
      id: "seed_rule_no_receipt",
      rule: "拒绝提供收费明细或收据",
      category: "billing",
      weight: 20,
      severity: "medium",
      action: "warn",
      active: true,
    },
  ];

  for (const rule of riskRules) {
    await prisma.riskRule.upsert({
      where: { id: rule.id },
      update: rule,
      create: rule,
    });
  }

  console.log(`  ✓ ${riskRules.length} risk rules seeded`);

  // ── 4. Model Routes ───────────────────────────────────────────────────────
  const modelRoutes = [
    {
      id: "seed_route_translate",
      taskType: "TRANSLATION" as const,
      sceneType: "GENERAL" as const,
      primaryModel: "qwen-plus",
      fallbackModel: "gpt-4o",
      maxCost: 0.01,
      maxLatency: 5000,
      active: true,
    },
    {
      id: "seed_route_reply",
      taskType: "REPLY" as const,
      sceneType: "GENERAL" as const,
      primaryModel: "qwen-plus",
      fallbackModel: "gpt-4o",
      maxCost: 0.01,
      maxLatency: 5000,
      active: true,
    },
    {
      id: "seed_route_risk",
      taskType: "RISK" as const,
      sceneType: "GENERAL" as const,
      primaryModel: "gpt-4o",
      fallbackModel: "qwen-plus",
      maxCost: 0.05,
      maxLatency: 8000,
      active: true,
    },
    {
      id: "seed_route_learn",
      taskType: "LEARN" as const,
      sceneType: "GENERAL" as const,
      primaryModel: "qwen-plus",
      fallbackModel: "gpt-4o",
      maxCost: 0.01,
      maxLatency: 5000,
      active: true,
    },
    {
      id: "seed_route_scan",
      taskType: "SCAN" as const,
      sceneType: "GENERAL" as const,
      primaryModel: "gpt-4o",
      fallbackModel: "qwen-plus",
      maxCost: 0.05,
      maxLatency: 10000,
      active: true,
    },
  ];

  for (const route of modelRoutes) {
    await prisma.modelRoute.upsert({
      where: { id: route.id },
      update: route,
      create: route,
    });
  }

  console.log(`  ✓ ${modelRoutes.length} model routes seeded`);

  // ── 5. Initial Prompt Version ─────────────────────────────────────────────
  await prisma.promptVersion.upsert({
    where: { id: "seed_prompt_v1" },
    update: {},
    create: {
      id: "seed_prompt_v1",
      task: "TRANSLATION",
      scene: "GENERAL",
      version: "v1.0",
      systemPrompt: "你是 VietBridge AI，专业的越南-中国跨境商务助手。",
      taskPrompt: "执行任务：中越双语翻译",
      scenePrompt: "场景：通用沟通",
      changes: "初始版本: 7层Prompt架构 (系统/记忆/任务/场景/语气/上下文/输入)",
      status: "active",
    },
  });

  console.log("  ✓ Initial prompt version (v1.0) seeded");

  // ── 6. Admin RBAC Roles ───────────────────────────────────────────────────
  const roles = [
    {
      id: "seed_role_super",
      name: "super_admin",
      permissions: ["all"],
      userIds: [admin.id],
    },
    {
      id: "seed_role_ops",
      name: "ops",
      permissions: ["dashboard", "logs", "users", "knowledge"],
      userIds: [],
    },
    {
      id: "seed_role_prompt",
      name: "prompt_engineer",
      permissions: ["dashboard", "prompts", "router", "logs"],
      userIds: [],
    },
    {
      id: "seed_role_viewer",
      name: "viewer",
      permissions: ["dashboard"],
      userIds: [],
    },
  ];

  for (const role of roles) {
    await prisma.adminRole.upsert({
      where: { id: role.id },
      update: role,
      create: role,
    });
  }

  console.log(`  ✓ ${roles.length} admin roles seeded`);

  console.log("\nSeed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
