// ============================================================================
// VietBridge AI V2 - 7-Layer Prompt Builder
// Ported from V5 prototype buildPrompt
// ============================================================================

import type { TaskId } from "../intelligence/tasks";
import { TASKS } from "../intelligence/tasks";
import type { SceneId, SceneRule } from "../intelligence/scene-rules";
import { SCENE_RULES, SCENES } from "../intelligence/scene-rules";
import type { ModelSelection } from "./model-router";
import { selectModel } from "./model-router";
import type { Message } from "./types";

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface Layer {
  label: string;
  content: string;
}

export interface PromptLayers {
  system: Layer;
  memory: Layer;
  task: Layer;
  scene: Layer;
  tone: Layer;
  context: Layer;
  input: Layer;
}

export interface UserMemory {
  role: string;
  location: string;
  preferredTone: number;
  isPro: boolean;
}

export interface BuildPromptParams {
  task: TaskId;
  scene: SceneId;
  tone: number;
  memory: UserMemory;
  input: string;
  conversationHistory: Message[];
}

export interface BuildPromptResult {
  layers: PromptLayers;
  model: ModelSelection;
  sceneRule: SceneRule;
}

// ---------------------------------------------------------------------------
// Tone descriptions
// ---------------------------------------------------------------------------

const TONE_LABELS: Record<number, string> = {
  1: "非常随意 (rất thoải mái)",
  2: "随意 (thoải mái)",
  3: "偏随意 (hơi thoải mái)",
  4: "日常 (bình thường)",
  5: "中性 (trung tính)",
  6: "偏正式 (hơi trang trọng)",
  7: "正式 (trang trọng)",
  8: "很正式 (rất trang trọng)",
  9: "非常正式 (cực kỳ trang trọng)",
  10: "最高敬语 (kính ngữ cao nhất)",
};

function getToneLabel(tone: number): string {
  const clamped = Math.max(1, Math.min(10, Math.round(tone)));
  return TONE_LABELS[clamped] || TONE_LABELS[5];
}

// ---------------------------------------------------------------------------
// Task-specific prompt instructions
// ---------------------------------------------------------------------------

function getTaskPrompt(task: TaskId): string {
  switch (task) {
    case "translate":
      return `你是VietBridge AI翻译引擎。用户输入中文或越南语，你需要：
1. 检测输入语言（中文→越南语，越南语→中文）
2. 提供准确翻译
3. 提供更自然/口语化的表达
4. 根据场景和语气调整人称代词和句尾助词
5. 如有文化差异，给出文化提示

必须以JSON格式返回：
{"original":"原文","translation":"翻译","natural":"自然表达","tone":"语气说明","scene":"场景说明","context":"语境分析","culture":"文化提示或null","grammarNote":{"self":"自称","other":"对方称呼","particles":["句尾助词"],"formality":"正式程度"}}`;

    case "reply":
      return `你是VietBridge AI回复建议引擎。用户粘贴收到的越南语消息，你需要：
1. 分析对方消息的情绪和意图
2. 生成3-5条不同风格的回复建议
3. 每条回复标注风格（如：礼貌、亲切、直接、幽默等）
4. 提供中文翻译

必须以JSON格式返回：
{"explanation":"对方意思分析","emotion":"对方情绪","context":"对话语境","replies":[{"level":1,"style":"风格","text":"越南语回复","zh":"中文翻译"}]}`;

    case "risk":
      return `你是VietBridge AI风险分析引擎。用户描述一个在越南的场景或交易，你需要：
1. 评估风险等级（0-100分）
2. 列出风险因素
3. 给出防范建议
4. 提供实用的越南语应对话术

必须以JSON格式返回：
{"score":风险分数,"context":"场景分析","situation":"具体情况","factors":[{"label":"因素","weight":权重,"active":true/false}],"tips":["建议"],"scripts":[{"vi":"越南语","zh":"中文"}],"knowledgeHits":[]}`;

    case "learn":
      return `你是VietBridge AI越南语教学引擎。用户想学某个场景的越南语表达，你需要：
1. 给出最实用的越南语表达
2. 提供拼音标注
3. 解释文化背景
4. 给出实际对话例句

必须以JSON格式返回：
{"context":"使用场景","phrase":{"vi":"越南语","zh":"中文","pinyin":"拼音"},"culture":"文化说明","examples":[{"vi":"越南语例句","zh":"中文翻译"}]}`;

    default:
      return "";
  }
}

// ---------------------------------------------------------------------------
// Build prompt
// ---------------------------------------------------------------------------

export function buildPrompt(params: BuildPromptParams): BuildPromptResult {
  const { task, scene, tone, memory, input, conversationHistory } = params;

  const sceneRule = SCENE_RULES[scene];
  const sceneInfo = SCENES.find((s) => s.id === scene);
  const taskInfo = TASKS[task];
  const toneLabel = getToneLabel(tone);

  // Layer 1: System - Core identity and capabilities
  const system: Layer = {
    label: "系统层",
    content: `你是 VietBridge AI —— 专为在越南（尤其是岘港）生活的华人设计的AI助手。
你精通中文和越南语，了解越南文化、生活常识、商业环境。
你的回复必须精准、实用、接地气。
所有解释和说明使用中文，越南语内容需要准确规范。
当前任务：${taskInfo.label} - ${taskInfo.description}`,
  };

  // Layer 2: Memory - User preferences and history
  const memoryLayer: Layer = {
    label: "记忆层",
    content: `用户信息：
- 身份：${memory.role || "在越华人"}
- 所在城市：${memory.location || "岘港"}
- 偏好语气等级：${memory.preferredTone}/10
- 账户类型：${memory.isPro ? "Pro会员" : "免费用户"}`,
  };

  // Layer 3: Task - Task-specific instructions
  const taskLayer: Layer = {
    label: "任务层",
    content: getTaskPrompt(task),
  };

  // Layer 4: Scene - Scene-specific rules and grammar
  const sceneLayer: Layer = {
    label: "场景层",
    content: `当前场景：${sceneInfo?.emoji || ""} ${sceneInfo?.label || scene}
场景语法规则：
- 自称：${sceneRule.pronounSelf}
- 对方称呼：${sceneRule.pronounOther}
- 语气描述：${sceneRule.toneDesc}
- 常用句尾助词：${sceneRule.particles.join("、")}
- 正式程度：${sceneRule.formality}
- 特别规则：${sceneRule.promptRule}`,
  };

  // Layer 5: Tone - Tone adjustment
  const toneLayer: Layer = {
    label: "语气层",
    content: `语气等级：${tone}/10 - ${toneLabel}
${tone <= 3 ? "使用非常口语化、轻松的表达方式。可以使用缩写和俚语。" : ""}${tone >= 4 && tone <= 6 ? "使用标准日常表达，保持自然但不过于随意。" : ""}${tone >= 7 ? "使用正式、礼貌的表达。句尾加敬语助词。避免俚语。" : ""}`,
  };

  // Layer 6: Context - Conversation history
  const contextLayer: Layer = {
    label: "上下文层",
    content:
      conversationHistory.length > 0
        ? `对话历史（最近${Math.min(conversationHistory.length, 10)}条）：\n${conversationHistory
            .slice(-10)
            .map((m) => `[${m.role}]: ${m.content.substring(0, 200)}`)
            .join("\n")}`
        : "无对话历史（新对话）",
  };

  // Layer 7: Input - User's actual input
  const inputLayer: Layer = {
    label: "输入层",
    content: input,
  };

  const layers: PromptLayers = {
    system,
    memory: memoryLayer,
    task: taskLayer,
    scene: sceneLayer,
    tone: toneLayer,
    context: contextLayer,
    input: inputLayer,
  };

  // Select model based on task, scene, input, and user tier
  const model = selectModel({
    task,
    scene,
    input,
    isPro: memory.isPro,
  });

  return { layers, model, sceneRule };
}

/**
 * Flatten prompt layers into an array of OpenAI-compatible messages.
 */
export function flattenToMessages(
  layers: PromptLayers
): Array<{ role: "system" | "user"; content: string }> {
  return [
    {
      role: "system" as const,
      content: [
        layers.system.content,
        layers.memory.content,
        layers.task.content,
        layers.scene.content,
        layers.tone.content,
      ].join("\n\n---\n\n"),
    },
    ...(layers.context.content !== "无对话历史（新对话）"
      ? [{ role: "system" as const, content: layers.context.content }]
      : []),
    {
      role: "user" as const,
      content: layers.input.content,
    },
  ];
}
