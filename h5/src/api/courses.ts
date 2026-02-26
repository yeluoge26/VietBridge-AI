import { apiGet } from "./client";

export interface Course {
  id: string;
  category: string;
  chinese: string;
  vietnamese: string;
  pronunciation: string;
  culturalNote: string;
  exampleSentence: string;
  difficulty: string;
  isDaily: boolean;
}

export function fetchCourses(params?: { category?: string; difficulty?: string }): Promise<Course[]> {
  const p: Record<string, string> = {};
  if (params?.category) p.category = params.category;
  if (params?.difficulty) p.difficulty = params.difficulty;
  return apiGet<Course[]>("/api/courses", p);
}
