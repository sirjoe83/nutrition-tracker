import { Injectable, computed, signal } from '@angular/core';
import { GoalType, Meal, UserProfile } from '../models/nutrition.models';

type QuickMeal = Omit<Meal, 'time' | 'date'>;

const RECENT_MEALS_KEY = 'recent-meals';
const MEALS_KEY = 'meals';
const MAX_RECENT = 10;
export const PROFILE_KEY = 'user-profile';

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function today(): string {
  return formatDate(new Date());
}

const DEFAULT_PROFILE: UserProfile = {
  gender: 'm',
  age: 25,
  height: 175,
  weight: 70,
  activityFactor: 1.375,
  tdee: 2415,
  goal: 1915,
  goalType: 'deficit',
};

function loadRecentMeals(): QuickMeal[] {
  try {
    const raw = localStorage.getItem(RECENT_MEALS_KEY);
    return raw ? (JSON.parse(raw) as QuickMeal[]) : [];
  } catch {
    return [];
  }
}

function loadMeals(): Meal[] {
  try {
    const raw = localStorage.getItem(MEALS_KEY);
    return raw ? (JSON.parse(raw) as Meal[]) : [];
  } catch {
    return [];
  }
}

function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

@Injectable({ providedIn: 'root' })
export class NutritionService {
  readonly quickMeals = signal<QuickMeal[]>(loadRecentMeals());

  readonly profile = signal<UserProfile>(loadProfile());

  readonly meals = signal<Meal[]>(loadMeals());

  readonly selectedDate = signal<string>(today());

  readonly isToday = computed(() => this.selectedDate() === today());

  readonly todaysMeals = computed(() =>
    this.meals().filter((m) => m.date === this.selectedDate()),
  );

  readonly totalEaten = computed(() =>
    this.todaysMeals().reduce((sum, m) => sum + m.kcal, 0),
  );

  readonly remaining = computed(() => this.profile().goal - this.totalEaten());

  readonly percentConsumed = computed(() =>
    Math.min(Math.round((this.totalEaten() / this.profile().goal) * 100), 100),
  );

  goToPreviousDay(): void {
    const [y, m, d] = this.selectedDate().split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 1);
    this.selectedDate.set(formatDate(date));
  }

  goToNextDay(): void {
    if (this.isToday()) return;
    const [y, m, d] = this.selectedDate().split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 1);
    this.selectedDate.set(formatDate(date));
  }

  calcTdee(
    gender: 'm' | 'f',
    age: number,
    height: number,
    weight: number,
    activityFactor: number,
  ): number {
    const bmr =
      gender === 'm'
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;
    return Math.round(bmr * activityFactor);
  }

  updateProfile(partial: Partial<UserProfile>): void {
    this.profile.update((p) => ({ ...p, ...partial }));
  }

  setGoal(goalType: GoalType, offset: number): void {
    const goal = this.profile().tdee + offset;
    this.profile.update((p) => ({ ...p, goalType, goal }));
  }

  addMeal(meal: Omit<Meal, 'time' | 'date'>): void {
    this.meals.update((ms) => {
      const updated = [...ms, { ...meal, time: Date.now(), date: today() }];
      localStorage.setItem(MEALS_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  deleteMeal(time: number): void {
    this.meals.update((ms) => {
      const updated = ms.filter((m) => m.time !== time);
      localStorage.setItem(MEALS_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  saveProfile(): void {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(this.profile()));
  }

  addToRecentMeals(meal: QuickMeal): void {
    this.quickMeals.update((list) => {
      const filtered = list.filter((m) => m.name !== meal.name);
      const updated = [meal, ...filtered].slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_MEALS_KEY, JSON.stringify(updated));
      return updated;
    });
  }
}
