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
  date: string; // ISO date 'YYYY-MM-DD'
}


export const ACTIVITY_LEVELS = [
  { factor: 1.2, icon: '🛋️', label: 'Sitzend', description: 'Kein Sport' },
  { factor: 1.375, icon: '🚶', label: 'Leicht aktiv', description: '1–3× / Woche' },
  { factor: 1.55, icon: '🏃', label: 'Moderat', description: '3–5× / Woche' },
  { factor: 1.725, icon: '💪', label: 'Sehr aktiv', description: '6–7× / Woche' },
] as const;
