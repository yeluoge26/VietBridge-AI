import { useState, useEffect, useCallback } from "react";
import DailyCard from "@/components/cards/DailyCard";
import { DAILY_PHRASES, getPhrasesByScene } from "@/data/daily-phrases";
import { SCENES } from "@/data/scenes";
import { speak } from "@/utils/tts";
import { fetchScenePhrases } from "@/api/scene-phrases";
import type { ScenePhrase } from "@/api/scene-phrases";
import type { Course } from "@/api/courses";

type LearnTab = "daily" | "courses" | "scenes" | "phrases";

// 场景学习的分类标签（用于 CourseCard 展开显示）
const SCENE_CN: Record<string, string> = {
  ktv: "KTV\u591C\u751F\u6D3B", dirtyword: "\u5435\u67B6\u9A82\u4EBA", transport: "\u4EA4\u901A\u6469\u6258", mlove: "\u60C5\u4FA3\u4EB2\u5BC6",
  customer: "\u6D88\u8D39\u8D2D\u7269", pickup: "\u8BA4\u8BC6\u964C\u751F\u4EBA", antiscam: "\u9632\u88AB\u5B70",
};

// 课程的8个分类
const COURSE_CATEGORIES: { id: string; label: string }[] = [
  { id: "general", label: "\u901A\u7528" },
  { id: "business", label: "\u5546\u52A1" },
  { id: "staff", label: "\u5458\u5DE5" },
  { id: "couple", label: "\u60C5\u4FA3" },
  { id: "restaurant", label: "\u9910\u5385" },
  { id: "rent", label: "\u79DF\u623F" },
  { id: "hospital", label: "\u533B\u9662" },
  { id: "housekeeping", label: "\u5BB6\u653F" },
];

const DIFF_CN: Record<string, string> = {
  beginner: "初级", intermediate: "中级", advanced: "高级",
};

const DIFF_STYLE: Record<string, { color: string; bg: string }> = {
  beginner: { color: "#22C55E", bg: "#22C55E18" },
  intermediate: { color: "#3B82F6", bg: "#3B82F618" },
  advanced: { color: "#F97316", bg: "#F9731618" },
};

export default function LearnPage() {
  const [tab, setTab] = useState<LearnTab>("daily");
  const [selectedScene, setSelectedScene] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseCategory, setCourseCategory] = useState("");
  const [courseDifficulty, setCourseDifficulty] = useState("");
  const [courseLoading, setCourseLoading] = useState(false);
  const [coursePage, setCoursePage] = useState(1);
  const [scenePage, setScenePage] = useState(1);
  const PAGE_SIZE = 10;
  const SCENE_PAGE_SIZE = 15;

  // API-driven scene phrases (fallback to static data)
  const [apiPhrases, setApiPhrases] = useState<ScenePhrase[]>([]);
  const [phrasesLoading, setPhrasesLoading] = useState(false);
  const [sceneCounts, setSceneCounts] = useState<Record<string, number>>({});

  const tabs: { id: LearnTab; label: string }[] = [
    { id: "daily", label: "每日一句" },
    { id: "courses", label: "课程学习" },
    { id: "scenes", label: "场景学习" },
    { id: "phrases", label: "常用短语" },
  ];

  const fetchCourses = useCallback(async () => {
    setCourseLoading(true);
    setCoursePage(1);
    const params = new URLSearchParams();
    if (courseCategory) params.set("category", courseCategory);
    if (courseDifficulty) params.set("difficulty", courseDifficulty);
    try {
      const res = await fetch(`/api/courses?${params}`);
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch { /* ignore */ }
    setCourseLoading(false);
  }, [courseCategory, courseDifficulty]);

  const totalPages = Math.max(1, Math.ceil(courses.length / PAGE_SIZE));
  const pagedCourses = courses.slice((coursePage - 1) * PAGE_SIZE, coursePage * PAGE_SIZE);

  // Fetch phrases from API for scenes/phrases/daily tabs
  const loadPhrases = useCallback(async (scene?: string) => {
    setPhrasesLoading(true);
    try {
      const data = await fetchScenePhrases(scene);
      setApiPhrases(data);
    } catch {
      // Fallback to static data
      const fallback = scene ? getPhrasesByScene(scene) : DAILY_PHRASES;
      setApiPhrases(fallback.map((p, i) => ({ id: `static-${i}`, ...p })));
    }
    setPhrasesLoading(false);
  }, []);

  // Load scene counts for the scene grid
  useEffect(() => {
    fetchScenePhrases().then((all) => {
      const counts: Record<string, number> = {};
      for (const p of all) {
        counts[p.scene] = (counts[p.scene] || 0) + 1;
      }
      setSceneCounts(counts);
    }).catch(() => {
      // Fallback: use static counts
      const counts: Record<string, number> = {};
      for (const p of DAILY_PHRASES) {
        counts[p.scene] = (counts[p.scene] || 0) + 1;
      }
      setSceneCounts(counts);
    });
  }, []);

  useEffect(() => {
    if (tab === "courses") fetchCourses();
  }, [tab, fetchCourses]);

  // Load phrases when switching to scenes/phrases/daily tabs or selecting a scene
  useEffect(() => {
    if (tab === "scenes" && selectedScene) { setScenePage(1); loadPhrases(selectedScene); }
    else if (tab === "phrases") loadPhrases();
    else if (tab === "daily") loadPhrases();
  }, [tab, selectedScene, loadPhrases]);

  return (
    <div className="flex flex-1 flex-col bg-[#F8F7F5]">
      <div className="sticky top-0 z-10 bg-[#F8F7F5] px-4 pt-4 pb-2">
        <h1 className="mb-3 text-lg font-bold text-[#111]">越南语学习</h1>
        <div className="flex gap-1 rounded-xl bg-[#EDEDED] p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSelectedScene(null); }}
              className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${tab === t.id ? "bg-white text-[#111] shadow-sm" : "text-[#999] hover:text-[#666]"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        {/* Daily */}
        {tab === "daily" && (
          <div className="space-y-4 pt-2">
            <DailyCard />
            <div className="px-4">
              <h2 className="mb-2 text-sm font-semibold text-[#111]">更多短语</h2>
              <div className="space-y-3">
                {(apiPhrases.length > 0 ? apiPhrases : DAILY_PHRASES).slice(0, 5).map((phrase, i) => <PhraseRow key={`daily-${i}`} phrase={phrase} />)}
              </div>
            </div>
          </div>
        )}

        {/* Courses */}
        {tab === "courses" && (
          <div className="p-4 space-y-3">
            {/* Course category chips */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCourseCategory("")}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${courseCategory === "" ? "border-[#111] bg-[#111] text-white" : "border-[#EDEDED] bg-white text-[#666] hover:bg-[#F2F1EF]"}`}
              >
                {"\u5168\u90E8"}
              </button>
              {COURSE_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCourseCategory(c.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${courseCategory === c.id ? "border-[#111] bg-[#111] text-white" : "border-[#EDEDED] bg-white text-[#666] hover:bg-[#F2F1EF]"}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            {/* Difficulty chips */}
            <div className="flex gap-2">
              {[
                { value: "", label: "全部", color: "#111", bg: "#111" },
                { value: "beginner", label: "初级", color: "#22C55E", bg: "#22C55E" },
                { value: "intermediate", label: "中级", color: "#3B82F6", bg: "#3B82F6" },
                { value: "advanced", label: "高级", color: "#F97316", bg: "#F97316" },
              ].map((d) => (
                <button
                  key={d.value}
                  onClick={() => setCourseDifficulty(d.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${courseDifficulty === d.value ? "text-white" : "border-[#EDEDED] bg-white text-[#666] hover:bg-[#F2F1EF]"}`}
                  style={courseDifficulty === d.value ? { backgroundColor: d.bg, borderColor: d.bg } : undefined}
                >
                  {d.label}
                </button>
              ))}
            </div>
            {courseLoading ? (
              <div className="text-center py-12 text-sm text-[#999]">加载中...</div>
            ) : courses.length === 0 ? (
              <div className="text-center py-12 text-sm text-[#999]">暂无课程</div>
            ) : (
              <>
                <div className="text-xs text-[#999]">共 {courses.length} 个课程</div>
                <div className="grid grid-cols-2 gap-3">{pagedCourses.map((c) => <CourseCard key={c.id} course={c} />)}</div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => setCoursePage((p) => Math.max(1, p - 1))}
                      disabled={coursePage <= 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#EDEDED] bg-white text-[#666] transition-all disabled:opacity-30"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                    </button>
                    <span className="text-xs text-[#666]">{coursePage} / {totalPages}</span>
                    <button
                      onClick={() => setCoursePage((p) => Math.min(totalPages, p + 1))}
                      disabled={coursePage >= totalPages}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#EDEDED] bg-white text-[#666] transition-all disabled:opacity-30"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Scenes */}
        {tab === "scenes" && !selectedScene && (
          <div className="grid grid-cols-2 gap-3 p-4">
            {SCENES.map((scene) => (
              <button key={scene.id} onClick={() => setSelectedScene(scene.id)} className="flex flex-col items-center gap-2 rounded-2xl border border-[#EDEDED] bg-white p-4 transition-all hover:shadow-md active:scale-[0.97]">
                <span className="text-2xl">{scene.emoji}</span>
                <span className="text-sm font-medium text-[#111]">{scene.label}</span>
                <span className="text-[11px] text-[#999]">{sceneCounts[scene.id] || getPhrasesByScene(scene.id).length} 个短语</span>
              </button>
            ))}
          </div>
        )}
        {tab === "scenes" && selectedScene && (() => {
          const sceneTotalPages = Math.max(1, Math.ceil(apiPhrases.length / SCENE_PAGE_SIZE));
          const pagedPhrases = apiPhrases.slice((scenePage - 1) * SCENE_PAGE_SIZE, scenePage * SCENE_PAGE_SIZE);
          return (
            <div className="p-4">
              <button onClick={() => setSelectedScene(null)} className="mb-3 flex items-center gap-1 text-sm text-[#999] hover:text-[#666]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                返回场景列表
              </button>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-bold text-[#111]">
                  {SCENES.find((s) => s.id === selectedScene)?.emoji}{" "}
                  {SCENES.find((s) => s.id === selectedScene)?.label}
                </h2>
                <span className="text-xs text-[#999]">共 {apiPhrases.length} 条</span>
              </div>
              {phrasesLoading ? (
                <div className="text-center py-12 text-sm text-[#999]">加载中...</div>
              ) : (
                <>
                  <div className="space-y-3">
                    {pagedPhrases.map((phrase) => <PhraseRow key={phrase.id} phrase={phrase} expanded />)}
                  </div>
                  {sceneTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 pt-4">
                      <button
                        onClick={() => setScenePage((p) => Math.max(1, p - 1))}
                        disabled={scenePage <= 1}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#EDEDED] bg-white text-[#666] transition-all disabled:opacity-30"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
                      </button>
                      <span className="text-xs text-[#666]">{scenePage} / {sceneTotalPages}</span>
                      <button
                        onClick={() => setScenePage((p) => Math.min(sceneTotalPages, p + 1))}
                        disabled={scenePage >= sceneTotalPages}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#EDEDED] bg-white text-[#666] transition-all disabled:opacity-30"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })()}

        {/* Phrases */}
        {tab === "phrases" && (
          <div className="space-y-3 p-4">
            {phrasesLoading ? (
              <div className="text-center py-12 text-sm text-[#999]">加载中...</div>
            ) : (
              apiPhrases.map((phrase) => <PhraseRow key={phrase.id} phrase={phrase} expanded />)
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  const [open, setOpen] = useState(false);
  const ds = DIFF_STYLE[course.difficulty] || { color: "#999", bg: "#eee" };

  return (
    <div className="rounded-xl border border-[#EDEDED] bg-white overflow-hidden">
      <button onClick={() => setOpen(!open)} className="flex w-full flex-col gap-1.5 px-3 py-3 text-left">
        <div className="flex items-center justify-between w-full">
          <span className="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium" style={{ color: ds.color, backgroundColor: ds.bg }}>
            {DIFF_CN[course.difficulty] || course.difficulty}
          </span>
          <button type="button" onClick={(e) => { e.stopPropagation(); speak(course.vietnamese, "vi-VN"); }} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2E7D32]/10 transition-colors hover:bg-[#2E7D32]/20" aria-label="\u64AD\u653E">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#2E7D32" stroke="none"><polygon points="5,3 19,12 5,21" /></svg>
          </button>
        </div>
        <p className="text-sm font-medium text-[#111] leading-tight">{course.vietnamese}</p>
        <p className="text-xs text-[#888]">{course.chinese}</p>
        {course.pronunciation && <p className="text-[11px] text-[#bbb] italic">{course.pronunciation}</p>}
      </button>
      {open && (
        <div className="border-t border-[#EDEDED] px-3 py-2.5 space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-[#999]">
            <span className="rounded-full bg-[#F2F1EF] px-1.5 py-0.5">{COURSE_CATEGORIES.find((c) => c.id === course.category)?.label || SCENE_CN[course.category] || course.category}</span>
            {course.isDaily && <span className="rounded-full bg-[#FEF3C7] px-1.5 py-0.5 text-[#92400E]">{"\u6BCF\u65E5\u4E00\u53E5"}</span>}
          </div>
          {course.culturalNote && (
            <div className="rounded-lg bg-[#F2F1EF] px-2 py-1.5">
              <p className="text-[11px] text-[#666]"><span className="mr-1">{"\uD83D\uDCA1"}</span>{course.culturalNote}</p>
            </div>
          )}
          {course.exampleSentence && (
            <div className="flex items-start gap-1.5">
              <p className="text-[11px] text-[#555] flex-1"><span className="text-[#999] mr-0.5">{"\u4F8B\u53E5:"}</span>{course.exampleSentence}</p>
              <button type="button" onClick={() => speak(course.exampleSentence, "vi-VN")} className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2E7D32]/10 mt-0.5">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="#2E7D32" stroke="none"><polygon points="5,3 19,12 5,21" /></svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface PhraseRowProps {
  phrase: { vi: string; zh: string; pinyin?: string; culture: string; scene: string };
  expanded?: boolean;
}

function PhraseRow({ phrase, expanded }: PhraseRowProps) {
  const [open, setOpen] = useState(false);
  const showDetails = expanded || open;

  return (
    <div className="rounded-xl border border-[#EDEDED] bg-white overflow-hidden">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#111] truncate">{phrase.vi}</p>
          <p className="text-xs text-[#888] truncate">{phrase.zh}</p>
        </div>
        <button type="button" onClick={(e) => { e.stopPropagation(); speak(phrase.vi, "vi-VN"); }} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2E7D32]/10 transition-colors hover:bg-[#2E7D32]/20" aria-label="播放">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#2E7D32" stroke="none"><polygon points="5,3 19,12 5,21" /></svg>
        </button>
      </button>
      {showDetails && (
        <div className="border-t border-[#EDEDED] px-4 py-3 space-y-2">
          {phrase.pinyin && <p className="text-xs text-[#999] italic">{phrase.pinyin}</p>}
          <div className="rounded-lg bg-[#F2F1EF] px-3 py-2">
            <p className="text-xs text-[#666]"><span className="mr-1">{"\uD83D\uDCA1"}</span>{phrase.culture}</p>
          </div>
        </div>
      )}
    </div>
  );
}
