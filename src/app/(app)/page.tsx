"use client";

// ============================================================================
// VietBridge AI V2 — Home Page / Main Chat Interface
// Uses useChat hook with conversation persistence and TTS
// ============================================================================

import { useState, useEffect } from "react";
import TopBar from "@/components/app/TopBar";
import TaskDrawer from "@/components/app/TaskDrawer";
import ContextBar from "@/components/app/ContextBar";
import SceneChips from "@/components/app/SceneChips";
import ChatView from "@/components/app/ChatView";
import AutoDetectBanner from "@/components/app/AutoDetectBanner";
import ToneSlider from "@/components/app/ToneSlider";
import InputBar from "@/components/app/InputBar";
import Toast from "@/components/shared/Toast";
import { useChat } from "@/hooks/useChat";
import { TASKS, type TaskId } from "@/lib/intelligence/tasks";
import type { SceneId } from "@/lib/intelligence/scene-rules";
import { speak } from "@/lib/tts";

export default function HomePage() {
  // ── State ──────────────────────────────────────────────────────────────
  const [task, setTask] = useState<TaskId>("translate");
  const [scene, setScene] = useState<SceneId>("general");
  const [tone, setTone] = useState(50);
  const [input, setInput] = useState("");
  const [langDir, setLangDir] = useState("zh2vi");
  const [autoDetect, setAutoDetect] = useState(false);
  const [autoDetectTask, setAutoDetectTask] = useState("");
  const [autoDetectScene, setAutoDetectScene] = useState<string | null>(null);
  const [autoDetectConfidence, setAutoDetectConfidence] = useState(0);
  const [toneActive, setToneActive] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // ── Chat hook ─────────────────────────────────────────────────────────
  const {
    messages,
    loading,
    error,
    send,
    clearMessages,
    conversationId,
  } = useChat({ task, scene, tone, langDir });

  const currentTaskInfo = TASKS[task];

  function showToast(msg: string) {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  }

  useEffect(() => {
    if (error) showToast(error);
  }, [error]);

  // ── Intent detection on input change ───────────────────────────────────
  useEffect(() => {
    if (!input.trim() || input.trim().length < 4) {
      setAutoDetect(false);
      return;
    }

    const trimmed = input.trim().toLowerCase();
    let detectedTask = "";
    const detectedScene: string | null = null;
    let confidence = 0;

    if (trimmed.includes("翻译") || trimmed.includes("dịch")) {
      detectedTask = "translate"; confidence = 85;
    } else if (trimmed.includes("回复") || trimmed.includes("trả lời")) {
      detectedTask = "reply"; confidence = 80;
    } else if (trimmed.includes("风险") || trimmed.includes("rủi ro")) {
      detectedTask = "risk"; confidence = 82;
    } else if (trimmed.includes("教") || trimmed.includes("học")) {
      detectedTask = "learn"; confidence = 78;
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

  // ── Handlers ───────────────────────────────────────────────────────────
  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    send(trimmed);
    setInput("");
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).then(() => showToast("已复制"));
  }

  function handleSpeak(text: string, lang: "vi-VN" | "zh-CN" = "vi-VN") {
    speak(text, lang);
    showToast("正在播放...");
  }

  async function handleShare(text: string) {
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: "VietBridge AI", text }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      showToast("已复制到剪贴板");
    }
  }

  function handleModify(mod: string) {
    showToast(`正在${mod}调整...`);
    const lastUserMsg = [...messages].reverse().find((m) => m.type === "user");
    if (lastUserMsg?.text) send(lastUserMsg.text);
  }

  function handleTaskSelect(taskId: string) {
    setTask(taskId as TaskId);
    setDrawerOpen(false);
  }

  function applyAutoDetect() {
    if (autoDetectTask) setTask(autoDetectTask as TaskId);
    if (autoDetectScene) setScene(autoDetectScene as SceneId);
    setAutoDetect(false);
    showToast("已切换到建议模式");
  }

  function handleNewConversation() {
    clearMessages();
    showToast("新对话已开始");
  }

  const toneModifiers = [
    { label: "更强势", delta: 20 },
    { label: "更委婉", delta: -20 },
    { label: "更正式", delta: 10 },
  ];

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-1 flex-col bg-[#F8F7F5]">
      <TopBar
        currentTask={currentTaskInfo}
        onOpenTaskDrawer={() => setDrawerOpen(true)}
      />

      <ContextBar
        task={task}
        scene={scene}
        location=""
        langDir={langDir}
        onToggleLang={() => setLangDir((d) => (d === "zh2vi" ? "vi2zh" : "zh2vi"))}
      />

      <SceneChips
        activeScene={scene}
        onSceneChange={(s) => setScene(s as SceneId)}
        visible={true}
      />

      <ChatView
        messages={messages}
        loading={loading}
        taskColor={currentTaskInfo.color}
        onTaskSelect={handleTaskSelect}
        onModify={handleModify}
        onCopy={handleCopy}
        onSpeak={handleSpeak}
        onShare={handleShare}
      />

      <AutoDetectBanner
        task={autoDetectTask}
        scene={autoDetectScene}
        confidence={autoDetectConfidence}
        onApply={applyAutoDetect}
        visible={autoDetect}
      />

      {toneActive && <ToneSlider value={tone} onChange={setTone} />}

      <div className="flex items-center gap-2 px-4 pb-2">
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
              onClick={() => setTone((prev) => Math.max(0, Math.min(100, prev + mod.delta)))}
              className="rounded-full border border-[#DDD] bg-white px-3 py-1 text-xs text-[#666] transition-colors hover:bg-[#F0F0F0]"
            >
              {mod.label}
            </button>
          ))}
        <div className="flex-1" />
        {(messages.length > 0 || conversationId) && (
          <button
            onClick={handleNewConversation}
            className="rounded-full border border-[#DDD] bg-white px-3 py-1 text-xs text-[#666] transition-colors hover:bg-[#F0F0F0]"
          >
            新对话
          </button>
        )}
      </div>

      <InputBar
        value={input}
        onChange={setInput}
        onSend={handleSend}
        loading={loading}
        taskColor={currentTaskInfo.color}
        voiceLang={langDir === "zh2vi" ? "zh-CN" : "vi-VN"}
      />

      <TaskDrawer
        open={drawerOpen}
        currentTask={task}
        onSelect={handleTaskSelect}
        onClose={() => setDrawerOpen(false)}
      />

      <Toast message={toastMessage} visible={toastVisible} />
    </div>
  );
}
