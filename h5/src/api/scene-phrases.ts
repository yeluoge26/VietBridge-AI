import { apiGet } from "./client";

export interface ScenePhrase {
  id: string;
  scene: string;
  vi: string;
  zh: string;
  pinyin: string;
  culture: string;
}

export function fetchScenePhrases(scene?: string): Promise<ScenePhrase[]> {
  const p: Record<string, string> = {};
  if (scene) p.scene = scene;
  return apiGet<ScenePhrase[]>("/api/scene-phrases", p);
}
