import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { Meal } from '../../models/nutrition.models';
import { NutritionService } from '../../services/nutrition.service';
import { AddMealModalComponent } from './add-meal-modal/add-meal-modal.component';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AddMealModalComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private readonly router = inject(Router);
  private readonly nutrition = inject(NutritionService);

  readonly modal = viewChild.required(AddMealModalComponent);

  readonly meals = this.nutrition.todaysMeals;
  readonly profile = this.nutrition.profile;
  readonly totalEaten = this.nutrition.totalEaten;
  readonly remaining = this.nutrition.remaining;
  readonly pct = this.nutrition.percentConsumed;
  readonly isToday = this.nutrition.isToday;
  readonly selectedDate = this.nutrition.selectedDate;

  readonly selectedDateObj = computed(() => {
    const [y, m, d] = this.selectedDate().split('-').map(Number);
    return new Date(y, m - 1, d);
  });

  readonly titleLabel = computed(() => {
    if (this.isToday()) return 'Heute';
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yesterday = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (this.selectedDate() === yesterday) return 'Gestern';
    return this.selectedDateObj().toLocaleDateString('de-DE', { weekday: 'long' });
  });

  readonly donutStroke = computed(() => {
    const circumference = 2 * Math.PI * 52;
    const fill = (this.pct() / 100) * circumference;
    return `${fill} ${circumference}`;
  });

  readonly donutColor = computed(() => {
    const p = this.pct();
    if (p >= 100) return 'var(--danger)';
    if (p >= 75) return 'var(--accent2)';
    return 'var(--accent)';
  });

  readonly barColor = computed(() => {
    const p = this.pct();
    if (p >= 100) return 'var(--danger)';
    if (p >= 75) return 'var(--accent2)';
    return 'var(--accent)';
  });

  readonly status = computed(() => {
    const eaten = this.totalEaten();
    const rem = this.remaining();
    if (eaten === 0)
      return {
        type: 'ok',
        icon: '🌅',
        msg: this.isToday()
          ? 'Guten Start – logge deine erste Mahlzeit!'
          : 'Keine Mahlzeiten für diesen Tag erfasst.',
      };
    if (rem > 200)
      return { type: 'ok', icon: '✅', msg: `Noch ${this.fmt(rem)} kcal übrig – du liegst gut!` };
    if (rem >= 0)
      return { type: 'warn', icon: '⚠️', msg: `Nur noch ${this.fmt(rem)} kcal übrig – pass auf!` };
    return { type: 'over', icon: '🔴', msg: `${this.fmt(-rem)} kcal über dem Ziel.` };
  });

  goBack(): void {
    this.nutrition.goToPreviousDay();
  }

  goForward(): void {
    this.nutrition.goToNextDay();
  }

  openAddMeal(): void {
    this.modal().open();
  }

  onMealAdded(meal: Omit<Meal, 'time' | 'date'>): void {
    this.nutrition.addMeal(meal);
  }

  deleteMeal(time: number): void {
    this.nutrition.deleteMeal(time);
  }

  openSettings(): void {
    this.router.navigate(['/setup/1']);
  }

  fmt(n: number): string {
    return Math.round(Math.abs(n)).toLocaleString('de-DE');
  }

  fmtTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }
}
