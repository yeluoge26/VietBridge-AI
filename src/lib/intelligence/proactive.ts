// ============================================================================
// VietBridge AI V2 - Proactive Warning System
// Ported from V5 prototype generateResponse proactive logic
// ============================================================================

export interface ProactiveWarning {
  type: "price" | "tone" | "tip" | "risk";
  text: string;
}

/**
 * Extract numbers from text, handling both Arabic numerals and Vietnamese/Chinese
 * number patterns. Returns all numeric values found.
 */
function extractNumbers(text: string): number[] {
  const numbers: number[] = [];

  // Match Arabic numerals (with optional commas/dots for thousands)
  const arabicMatches = text.match(/[\d,]+\.?\d*/g);
  if (arabicMatches) {
    for (const match of arabicMatches) {
      const cleaned = match.replace(/,/g, "");
      const num = parseFloat(cleaned);
      if (!isNaN(num)) {
        numbers.push(num);
      }
    }
  }

  // Match Vietnamese shorthand: e.g., "50k" = 50,000
  const kMatches = text.match(/(\d+)\s*k\b/gi);
  if (kMatches) {
    for (const match of kMatches) {
      const num = parseInt(match.replace(/k/i, ""), 10);
      if (!isNaN(num)) {
        numbers.push(num * 1000);
      }
    }
  }

  return numbers;
}

/**
 * Check for proactive warnings based on user input, scene, and tone.
 * Returns an array of warnings that should be displayed to the user.
 */
export function checkProactiveWarnings(
  input: string,
  scene: string,
  tone: number
): ProactiveWarning[] {
  const warnings: ProactiveWarning[] = [];
  const lowerInput = input.toLowerCase();
  const numbers = extractNumbers(input);

  // --- Restaurant price warnings ---
  if (scene === "restaurant") {
    // Check for high numbers that might indicate tourist pricing
    const highNumbers = numbers.filter((n) => n >= 100000);
    if (highNumbers.length > 0) {
      warnings.push({
        type: "price",
        text: `检测到较高金额（${highNumbers.map((n) => n.toLocaleString()).join(", ")} VND）。岘港本地餐厅人均一般30,000-60,000 VND，请核实价格是否合理。`,
      });
    }

    // Check for seafood mentions without price confirmation
    if (/海鲜|hải sản|tôm|cua|cá|螃蟹|虾|鱼|lobster|shrimp/.test(lowerInput)) {
      warnings.push({
        type: "price",
        text: "点海鲜前建议先确认价格并拍照留证。岘港海鲜市场价格波动大，部分商家对外国人加价。",
      });
    }

    // No menu / no price warning
    if (/没有菜单|没菜单|无价格|不标价|không có menu/.test(lowerInput)) {
      warnings.push({
        type: "risk",
        text: "没有菜单或不标价的餐厅风险较高。建议换一家或在点菜前逐一确认价格。",
      });
    }
  }

  // --- Couple tone warnings ---
  if (scene === "couple") {
    // High tone (very formal) in couple scene is unusual
    if (tone >= 8) {
      warnings.push({
        type: "tone",
        text: "当前语气偏正式。情侣间越南语交流通常更轻松亲密，建议降低语气等级以显得更自然。",
      });
    }

    // Low tone warning for sensitive topics
    if (
      tone <= 2 &&
      /生气|吵架|分手|离开|不要|đừng|chia tay|giận/.test(lowerInput)
    ) {
      warnings.push({
        type: "tone",
        text: "检测到可能的敏感话题。建议适当提高语气等级，越南文化中直接表达负面情绪可能造成更大伤害。",
      });
    }
  }

  // --- Business money tips ---
  if (scene === "business") {
    if (/钱|付款|转账|tiền|thanh toán|chuyển khoản|USD|VND|合同|hợp đồng/.test(lowerInput)) {
      warnings.push({
        type: "tip",
        text: "涉及金额交易，建议：1) 使用银行转账留凭证 2) 大额合同请律师审核 3) 分期付款降低风险。",
      });
    }

    // Contract signing warnings
    if (/签|ký|签字|签合同|合同/.test(lowerInput)) {
      warnings.push({
        type: "tip",
        text: "签合同注意：确保中越双语版本，关键条款请专业翻译确认，不要在催促下签字。",
      });
    }
  }

  // --- Staff management tips ---
  if (scene === "staff") {
    if (/开除|辞退|扣工资|罚款|sa thải|trừ lương|phạt/.test(lowerInput)) {
      warnings.push({
        type: "risk",
        text: "越南劳动法保护员工权益较强。辞退员工需按法定程序，否则可能面临劳动仲裁。建议先咨询律师。",
      });
    }
  }

  // --- Rent-related warnings ---
  if (scene === "rent") {
    // Deposit amount warning
    const depositNumbers = numbers.filter((n) => n >= 1000000);
    if (
      depositNumbers.length > 0 &&
      /押金|cọc|deposit/.test(lowerInput)
    ) {
      warnings.push({
        type: "tip",
        text: "押金建议不超过2个月房租。签约时拍照记录房屋现状，确保合同写明押金退还条件。",
      });
    }

    // No contract warning
    if (/没有合同|不签合同|口头|miệng|không có hợp đồng/.test(lowerInput)) {
      warnings.push({
        type: "risk",
        text: "强烈建议签署书面合同！口头协议在越南法律中难以维权。无合同租房风险极高。",
      });
    }
  }

  // --- Hospital warnings ---
  if (scene === "hospital") {
    if (/急|cấp cứu|emergency|严重|nghiêm trọng/.test(lowerInput)) {
      warnings.push({
        type: "tip",
        text: "紧急情况请拨打越南急救电话115。岘港推荐：岘港医院(Bệnh viện Đà Nẵng)急诊科、Family Medical Practice（外国人诊所）。",
      });
    }
  }

  // --- Repair warnings ---
  if (scene === "repair") {
    if (/报价|价格|多少钱|bao nhiêu|giá/.test(lowerInput)) {
      warnings.push({
        type: "tip",
        text: "维修前一定要先拿到书面报价。建议找2-3家比价。可以请越南朋友帮忙沟通以获得更合理价格。",
      });
    }
  }

  // --- General risk detection ---
  if (/骗|lừa|scam|坑|被宰|chặt chém|黑店/.test(lowerInput)) {
    warnings.push({
      type: "risk",
      text: "如遇诈骗或宰客，可拨打越南旅游投诉热线1039，或联系当地警察（公安 - công an）报案。保留所有证据（聊天记录、收据、照片）。",
    });
  }

  return warnings;
}
