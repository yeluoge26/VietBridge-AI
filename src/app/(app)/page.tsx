"use client";

// ============================================================================
// VietBridge AI V2 — Home Page / Main Chat Interface
// Composes: TopBar, ContextBar, SceneChips, ChatView, AutoDetectBanner,
//           ToneSlider, InputBar, TaskDrawer, Toast
// ============================================================================

import { useState, useCallback, useEffect } from "react";
import TopBar from "@/components/app/TopBar";
import TaskDrawer from "@/components/app/TaskDrawer";
import ContextBar from "@/components/app/ContextBar";
import SceneChips from "@/components/app/SceneChips";
import ChatView from "@/components/app/ChatView";
import AutoDetectBanner from "@/components/app/AutoDetectBanner";
import ToneSlider from "@/components/app/ToneSlider";
import InputBar from "@/components/app/InputBar";
import Toast from "@/components/shared/Toast";
import { TASKS, type TaskId } from "@/lib/intelligence/tasks";

interface Message {
  id: string;
  type: string;
  role: "user" | "assistant";
  content: string;
  [key: string]: unknown;
}

export default function HomePage() {
  // ── State ──────────────────────────────────────────────────────────────
  const [task, setTask] = useState<TaskId>("translate");
  const [scene, setScene] = useState("general");
  const [tone, setTone] = useState(50);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [langDir, setLangDir] = useState("zh-vi");
  const [autoDetect, setAutoDetect] = useState(false);
  const [autoDetectTask, setAutoDetectTask] = useState("");
  const [autoDetectScene, setAutoDetectScene] = useState<string | null>(null);
  const [autoDetectConfidence, setAutoDetectConfidence] = useState(0);
  const [toneActive, setToneActive] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // ── Current task info ──────────────────────────────────────────────────
  const currentTaskInfo = TASKS[task];

  // ── Toast helper ───────────────────────────────────────────────────────
  function showToast(msg: string) {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  }

  // ── Intent detection on input change ───────────────────────────────────
  useEffect(() => {
    if (!input.trim() || input.trim().length < 4) {
      setAutoDetect(false);
      return;
    }

    // Simple client-side heuristic intent detection
    // Full LLM-based detection via lib/llm/intent-detector would be called here
    const trimmed = input.trim().toLowerCase();
    let detectedTask = "";
    let detectedScene: string | null = null;
    let confidence = 0;

    if (trimmed.includes("翻译") || trimmed.includes("dịch")) {
      detectedTask = "translate";
      confidence = 85;
    } else if (trimmed.includes("回复") || trimmed.includes("trả lời")) {
      detectedTask = "reply";
      confidence = 80;
    } else if (trimmed.includes("风险") || trimmed.includes("rủi ro")) {
      detectedTask = "risk";
      confidence = 82;
    } else if (trimmed.includes("教") || trimmed.includes("học")) {
      detectedTask = "learn";
      confidence = 78;
    }

    if (confidence > 0 && detectedTask !== task) {
      setAutoDetectTask(detectedTask);
      setAutoDetectScene(detectedScene);
      setAutoDetectConfidence(confidence);
      setAutoDetect(true);
    } else {
      setAutoDetect(false);
    }
  }, [input, task]);

  // ── Send message ───────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: task,
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          task,
          scene,
          tone,
          langDir,
        }),
      });

      const data = await res.json();

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-res`,
        type: task,
        role: "assistant",
        content: data.reply || data.error || "服务暂时不可用",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        id: `msg-${Date.now()}-err`,
        type: task,
        role: "assistant",
        content: "网络错误，请重试",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, task, scene, tone, langDir]);

  // ── Tone modifier helpers ──────────────────────────────────────────────
  const toneModifiers = [
    { label: "更强势", delta: 20 },
    { label: "更委婉", delta: -20 },
    { label: "更正式", delta: 10 },
  ];

  function applyToneModifier(delta: number) {
    setTone((prev) => Math.max(0, Math.min(100, prev + delta)));
  }

  // ── Modify last assistant message ──────────────────────────────────────
  function handleModify(mod: string) {
    showToast(`正在${mod}调整...`);
    // Future: re-call /api/chat with modifier
  }

  // ── Task selection ─────────────────────────────────────────────────────
  function handleTaskSelect(taskId: string) {
    setTask(taskId as TaskId);
    setDrawerOpen(false);
  }

  // ── Apply auto-detected intent ─────────────────────────────────────────
  function applyAutoDetect() {
    if (autoDetectTask) {
      setTask(autoDetectTask as TaskId);
    }
    if (autoDetectScene) {
      setScene(autoDetectScene);
    }
    setAutoDetect(false);
    showToast("已切换到建议模式");
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-1 flex-col bg-[#F8F7F5]">
      {/* TopBar */}
      <TopBar
        currentTask={currentTaskInfo}
        onOpenTaskDrawer={() => setDrawerOpen(true)}
      />

      {/* ContextBar */}
      <ContextBar
        task={task}
        scene={scene}
        location=""
        langDir={langDir}
        onToggleLang={() =>
          setLangDir((d) => (d === "zh-vi" ? "vi-zh" : "zh-vi"))
        }
      />

      {/* SceneChips */}
      <SceneChips
        activeScene={scene}
        onSceneChange={setScene}
        visible={true}
      />

      {/* ChatView — flex-1 to take remaining space */}
      <ChatView
        messages={messages}
        loading={loading}
        taskColor={currentTaskInfo.color}
        onTaskSelect={handleTaskSelect}
        onModify={handleModify}
      />

      {/* AutoDetectBanner */}
      <AutoDetectBanner
        task={autoDetectTask}
        scene={autoDetectScene}
        confidence={autoDetectConfidence}
        onApply={applyAutoDetect}
        visible={autoDetect}
      />

      {/* ToneSlider (only when active) */}
      {toneActive && (
        <ToneSlider value={tone} onChange={setTone} />
      )}

      {/* Tone modifiers */}
      <div className="flex gap-2 px-4 pb-2">
        <button
          onClick={() => setToneActive((v) => !v)}
          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
            toneActive
              ? "border-[#111] bg-[#111] text-white"
              : "border-[#DDD] bg-white text-[#666]"
          }`}
        >
          语气 {tone}
        </button>
        {toneActive &&
          toneModifiers.map((mod) => (
            <button
              key={mod.label}
              onClick={() => applyToneModifier(mod.delta)}
              className="rounded-full border border-[#DDD] bg-white px-3 py-1 text-xs text-[#666] transition-colors hover:bg-[#F0F0F0]"
            >
              {mod.label}
            </button>
          ))}
      </div>

      {/* InputBar */}
      <InputBar
        value={input}
        onChange={setInput}
        onSend={handleSend}
        loading={loading}
        taskColor={currentTaskInfo.color}
      />

      {/* TaskDrawer overlay */}
      <TaskDrawer
        open={drawerOpen}
        currentTask={task}
        onSelect={handleTaskSelect}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Toast */}
      <Toast message={toastMessage} visible={toastVisible} />
    </div>
  );
}
