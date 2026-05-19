import { Injectable, computed, signal } from '@angular/core';
import { FavoriteMeal, GoalType, Meal, UserProfile } from '../models/nutrition.models';

const FAVORITE_MEALS_KEY = 'favorite-meals';
const RECENT_MEALS_KEY = 'recent-meals'; // kept for migration only
const MEALS_KEY = 'meals';
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

function loadFavoriteMeals(): FavoriteMeal[] {
  try {
    const favorites = localStorage.getItem(FAVORITE_MEALS_KEY);
    if (favorites) return JSON.parse(favorites) as FavoriteMeal[];
    // migrate from recentMeals on first load
    const recent = localStorage.getItem(RECENT_MEALS_KEY);
    const migrated = recent ? (JSON.parse(recent) as FavoriteMeal[]) : [];
    if (migrated.length) {
      localStorage.setItem(FAVORITE_MEALS_KEY, JSON.stringify(migrated));
    }
    return migrated;
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
  readonly favoriteMeals = signal<FavoriteMeal[]>(loadFavoriteMeals());

  readonly profile = signal<UserProfile>(loadProfile());

  readonly meals = signal<Meal[]>(loadMeals());

  readonly selectedDate = signal<string>(today());

  readonly isToday = computed(() => this.selectedDate() === today());

  readonly todaysMeals = computed(() => this.meals().filter((m) => m.date === this.selectedDate()));

  readonly totalEaten = computed(() => this.todaysMeals().reduce((sum, m) => sum + m.kcal, 0));

  readonly remaining = computed(() => this.profile().goal - this.totalEaten());

  readonly percentConsumed = computed(() =>
    Math.min(Math.round((this.totalEaten() / this.profile().goal) * 100), 100),
  );

  private readonly favoriteNames = computed(() => new Set(this.favoriteMeals().map((m) => m.name)));

  isFavorite(name: string): boolean {
    return this.favoriteNames().has(name);
  }

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

  addToFavorites(meal: FavoriteMeal): void {
    if (this.isFavorite(meal.name)) return;
    this.favoriteMeals.update((list) => {
      const updated = [...list, meal];
      localStorage.setItem(FAVORITE_MEALS_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  removeFromFavorites(name: string): void {
    this.favoriteMeals.update((list) => {
      const updated = list.filter((m) => m.name !== name);
      localStorage.setItem(FAVORITE_MEALS_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  toggleFavorite(meal: FavoriteMeal): void {
    if (this.isFavorite(meal.name)) {
      this.removeFromFavorites(meal.name);
    } else {
      this.addToFavorites(meal);
    }
  }

  exportData() {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      meals: this.meals(),
      favoriteMeals: this.favoriteMeals(),
    };
  }

  importData(raw: unknown): void {
    const data = raw as {
      meals: Meal[];
      favoriteMeals?: FavoriteMeal[];
      recentMeals?: FavoriteMeal[];
      profile: UserProfile;
    };
    const favorites = data?.favoriteMeals ?? data?.recentMeals;
    if (
      !Array.isArray(data?.meals) ||
      !Array.isArray(favorites) ||
      typeof data?.profile !== 'object' ||
      data?.profile === null
    ) {
      throw new Error('Ungültiges Exportformat');
    }
    localStorage.setItem(MEALS_KEY, JSON.stringify(data.meals));
    localStorage.setItem(FAVORITE_MEALS_KEY, JSON.stringify(favorites));
    localStorage.setItem(PROFILE_KEY, JSON.stringify(data.profile));
    this.meals.set(data.meals);
    this.favoriteMeals.set(favorites);
    this.profile.set(data.profile);
  }
}
