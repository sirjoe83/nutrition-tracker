export type Gender = 'm' | 'f';
export type GoalType = 'deficit' | 'maintain' | 'surplus';

export interface UserProfile {
  gender: Gender;
  age: number;
  height: number;
  weight: number;
  activityFactor: number;
  tdee: number;
  goal: number;
  goalType: GoalType;
}

export interface Meal {
  name: string;
  kcal: number;
  type: string;
  time: number;
}

export const QUICK_MEALS: Meal[] = [
  { name: 'Haferflocken', kcal: 350, type: '🌅 Frühstück', time: 0 },
  { name: 'Banane', kcal: 90, type: '🍎 Snack', time: 0 },
  { name: 'Hühnchenbrust', kcal: 165, type: '☀️ Mittagessen', time: 0 },
  { name: 'Vollkornbrot', kcal: 120, type: '🌅 Frühstück', time: 0 },
  { name: 'Joghurt', kcal: 100, type: '🍎 Snack', time: 0 },
  { name: 'Nudeln', kcal: 350, type: '☀️ Mittagessen', time: 0 },
  { name: 'Salat', kcal: 80, type: '🌙 Abendessen', time: 0 },
  { name: 'Proteinshake', kcal: 200, type: '🍎 Snack', time: 0 },
  { name: 'Ei (2 Stk)', kcal: 140, type: '🌅 Frühstück', time: 0 },
];

export const ACTIVITY_LEVELS = [
  { factor: 1.2, icon: '🛋️', label: 'Sitzend', description: 'Kein Sport' },
  { factor: 1.375, icon: '🚶', label: 'Leicht aktiv', description: '1–3× / Woche' },
  { factor: 1.55, icon: '🏃', label: 'Moderat', description: '3–5× / Woche' },
  { factor: 1.725, icon: '💪', label: 'Sehr aktiv', description: '6–7× / Woche' },
] as const;
