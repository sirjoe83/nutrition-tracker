import { Injectable, computed, signal } from '@angular/core';
import { GoalType, Meal, UserProfile } from '../models/nutrition.models';

@Injectable({ providedIn: 'root' })
export class NutritionService {
  readonly profile = signal<UserProfile>({
    gender: 'm',
    age: 25,
    height: 175,
    weight: 70,
    activityFactor: 1.375,
    tdee: 2415,
    goal: 1915,
    goalType: 'deficit',
  });

  readonly meals = signal<Meal[]>([]);

  readonly totalEaten = computed(() =>
    this.meals().reduce((sum, m) => sum + m.kcal, 0),
  );

  readonly remaining = computed(() => this.profile().goal - this.totalEaten());

  readonly percentConsumed = computed(() =>
    Math.min(Math.round((this.totalEaten() / this.profile().goal) * 100), 100),
  );

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

  addMeal(meal: Omit<Meal, 'time'>): void {
    this.meals.update((ms) => [...ms, { ...meal, time: Date.now() }]);
  }

  deleteMeal(index: number): void {
    this.meals.update((ms) => ms.filter((_, i) => i !== index));
  }
}
