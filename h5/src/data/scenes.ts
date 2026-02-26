export interface SceneRule {
  pronounSelf: string;
  pronounOther: string;
  toneDesc: string;
  particles: string[];
  formality: string;
  promptRule: string;
}

export interface Scene {
  id: SceneId;
  label: string;
  emoji: string;
}

export type SceneId =
  | "general" | "business" | "staff" | "couple"
  | "restaurant" | "rent" | "hospital" | "housekeeping"
  | "ktv" | "dirtyword" | "transport" | "mlove"
  | "customer" | "pickup" | "antiscam";

export const SCENES: Scene[] = [
  { id: "ktv", label: "KTV夜生活", emoji: "🎤" },
  { id: "dirtyword", label: "吵架骂人", emoji: "🤬" },
  { id: "transport", label: "交通摩托", emoji: "🏍️" },
  { id: "mlove", label: "情侣亲密", emoji: "🔥" },
  { id: "customer", label: "消费购物", emoji: "🛒" },
  { id: "pickup", label: "认识陌生人", emoji: "👋" },
  { id: "antiscam", label: "防被宰", emoji: "🛡️" },
];

export const SCENE_COLORS: Partial<Record<SceneId, string>> = {
  ktv: "#9C27B0", dirtyword: "#D32F2F", transport: "#FF6F00", mlove: "#E91E63",
  customer: "#00897B",
  pickup: "#5C6BC0",
  antiscam: "#F44336",
};
