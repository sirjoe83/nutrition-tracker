import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GoalType } from '../../../models/nutrition.models';
import { NutritionService } from '../../../services/nutrition.service';

@Component({
  selector: 'app-setup-step2',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './setup-step2.component.html',
  styleUrl: './setup-step2.component.css',
})
export class SetupStep2Component {
  private readonly router = inject(Router);
  private readonly nutrition = inject(NutritionService);

  readonly goalType = signal<GoalType>('deficit');
  readonly offset = signal(-500);

  readonly tdee = computed(() => this.nutrition.profile().tdee);
  readonly goal = computed(() => this.tdee() + this.offset());

  readonly sliderLabel = computed(() => {
    const v = this.offset();
    if (v < 0) return `Kaloriendefizit: ${this.fmt(Math.abs(v))} kcal/Tag`;
    if (v === 0) return 'Kalorienbilanz: ausgeglichen';
    return `Kalorienüberschuss: +${this.fmt(v)} kcal/Tag`;
  });

  readonly weeklyLabel = computed(() => {
    const v = this.offset();
    return (v >= 0 ? '+' : '') + this.fmt(v * 7) + ' kcal';
  });

  readonly macros = computed(() => ({
    protein: Math.round((this.goal() * 0.25) / 4),
    carbs: Math.round((this.goal() * 0.5) / 4),
    fat: Math.round((this.goal() * 0.25) / 9),
  }));

  selectGoal(type: GoalType): void {
    this.goalType.set(type);
    if (type === 'deficit') this.offset.set(-500);
    else if (type === 'maintain') this.offset.set(0);
    else this.offset.set(500);
  }

  onSliderChange(value: string): void {
    this.offset.set(+value);
    if (+value < 0) this.goalType.set('deficit');
    else if (+value === 0) this.goalType.set('maintain');
    else this.goalType.set('surplus');
  }

  next(): void {
    this.nutrition.setGoal(this.goalType(), this.offset());
    this.router.navigate(['/setup/3']);
  }

  back(): void {
    this.router.navigate(['/setup/1']);
  }

  fmt(n: number): string {
    return Math.round(n).toLocaleString('de-DE');
  }
}
