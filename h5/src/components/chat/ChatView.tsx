import { useRef, useEffect } from "react";
import DailyCard from "@/components/cards/DailyCard";
import TranslationCard from "@/components/cards/TranslationCard";
import ReplyCard from "@/components/cards/ReplyCard";
import RiskCard from "@/components/cards/RiskCard";
import TeachCard from "@/components/cards/TeachCard";
import FadeIn from "@/components/shared/FadeIn";
import type { ChatMessage } from "@/hooks/useChat";

interface ChatViewProps {
  messages: ChatMessage[];
  loading: boolean;
  taskColor: string;
  onTaskSelect: (task: string) => void;
  onModify: (mod: string) => void;
  onCopy?: (text: string) => void;
  onSpeak?: (text: string, lang?: "vi-VN" | "zh-CN") => void;
  onShare?: (text: string) => void;
}

const quickActions = [
  { id: "translate", icon: "\uD83C\uDF10", label: "帮我翻译" },
  { id: "reply", icon: "\uD83D\uDCAC", label: "帮我回复" },
  { id: "risk", icon: "\uD83D\uDEE1\uFE0F", label: "风险检查" },
  { id: "learn", icon: "\uD83D\uDCD6", label: "教我说" },
];

function LoadingDots({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span key={i} className="inline-block h-2 w-2 animate-bounce rounded-full" style={{ backgroundColor: color, animationDelay: `${i * 150}ms`, animationDuration: "600ms" }} />
        ))}
      </div>
    </div>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end px-4 py-1.5">
      <div className="max-w-[80%] rounded-[14px] rounded-br-[4px] bg-[#111] px-4 py-2.5 text-sm text-white">{content}</div>
    </div>
  );
}

function StreamingBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-start px-4 py-1.5">
      <div className="max-w-[85%] rounded-[14px] rounded-bl-[4px] border border-[#EDEDED] bg-white px-4 py-2.5 text-sm text-[#111] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="whitespace-pre-wrap">{text}</div>
        <span className="inline-block h-4 w-1 animate-pulse bg-[#111]" />
      </div>
    </div>
  );
}

function FallbackBubble({ content, onModify }: { content: string; onModify: (mod: string) => void }) {
  return (
    <div className="flex justify-start px-4 py-1.5">
      <div className="max-w-[85%]">
        <div className="rounded-[14px] rounded-bl-[4px] border border-[#EDEDED] bg-white px-4 py-2.5 text-sm text-[#111] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="whitespace-pre-wrap">{content}</div>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {["更正式", "更随意", "更简短"].map((mod) => (
            <button key={mod} onClick={() => onModify(mod)} className="rounded-[20px] border border-[#EDEDED] bg-white px-2.5 py-1 text-[11px] text-[#999] transition-colors hover:bg-[#F2F1EF] hover:text-[#666] active:scale-[0.97]">{mod}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChatView({ messages, loading, taskColor, onTaskSelect, onModify, onCopy, onSpeak, onShare }: ChatViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const isEmpty = messages.length === 0;
  const handleCopy = (text: string) => { if (onCopy) onCopy(text); };

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      {isEmpty ? (
        <div className="flex flex-col gap-4 pt-6">
          <FadeIn delay={0} direction="up"><DailyCard /></FadeIn>
          <div className="grid grid-cols-2 gap-2.5 px-4">
            {quickActions.map((action, i) => (
              <FadeIn key={action.id} delay={100 + i * 60} direction="up">
                <button
                  onClick={() => onTaskSelect(action.id)}
                  className="flex w-full items-center gap-2 rounded-[14px] border border-[#EDEDED] bg-white px-4 py-3 text-left transition-all hover:bg-[#F8F7F5] hover:shadow-sm active:scale-[0.98]"
                >
                  <span className="text-lg">{action.icon}</span>
                  <span className="text-sm font-medium text-[#111]">{action.label}</span>
                </button>
              </FadeIn>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1 pt-3">
          {messages.map((msg, idx) => {
            const key = `msg-${idx}`;

            if (msg.type === "user") {
              return <FadeIn key={key} direction="left" duration={200}><UserBubble content={msg.text || ""} /></FadeIn>;
            }

            if (msg.streaming) {
              return <StreamingBubble key={key} text={msg.streamText || ""} />;
            }

            if (msg.type === "translation" && msg.data) {
              return (
                <FadeIn key={key} direction="up" duration={350} className="px-4 py-1.5">
                  <TranslationCard data={msg.data} prompt={msg.prompt} proactiveWarnings={msg.proactiveWarnings} hasContext={msg.hasContext} onCopy={handleCopy} onModify={onModify} onSpeak={onSpeak} onShare={onShare} />
                </FadeIn>
              );
            }

            if (msg.type === "reply" && msg.data) {
              return (
                <FadeIn key={key} direction="up" duration={350} className="px-4 py-1.5">
                  <ReplyCard data={msg.data} tone={50} prompt={msg.prompt} proactiveWarnings={msg.proactiveWarnings} hasContext={msg.hasContext} onCopy={handleCopy} onSpeak={onSpeak} onShare={onShare} />
                </FadeIn>
              );
            }

            if (msg.type === "risk" && msg.data) {
              return (
                <FadeIn key={key} direction="up" duration={350} className="px-4 py-1.5">
                  <RiskCard data={msg.data} prompt={msg.prompt} proactiveWarnings={msg.proactiveWarnings} hasContext={msg.hasContext} onCopy={handleCopy} />
                </FadeIn>
              );
            }

            if (msg.type === "teaching" && msg.data) {
              return (
                <FadeIn key={key} direction="up" duration={350} className="px-4 py-1.5">
                  <TeachCard data={msg.data} prompt={msg.prompt} onCopy={handleCopy} onSpeak={onSpeak} onShare={onShare} />
                </FadeIn>
              );
            }

            return (
              <FadeIn key={key} direction="right" duration={250}>
                <FallbackBubble content={msg.text || msg.data?.raw || ""} onModify={onModify} />
              </FadeIn>
            );
          })}
        </div>
      )}

      {loading && <LoadingDots color={taskColor} />}
      <div ref={bottomRef} />
    </div>
  );
}
