import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ACTIVITY_LEVELS, GoalType } from '../../models/nutrition.models';
import { NutritionService } from '../../services/nutrition.service';

@Component({
  selector: 'app-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {
  private readonly router = inject(Router);
  private readonly nutrition = inject(NutritionService);

  readonly activityLevels = ACTIVITY_LEVELS;

  private readonly saved = this.nutrition.profile();

  readonly gender = signal<'m' | 'f'>(this.saved.gender);
  readonly age = signal(this.saved.age);
  readonly height = signal(this.saved.height);
  readonly weight = signal(this.saved.weight);
  readonly selectedFactor = signal(this.saved.activityFactor);
  readonly goalType = signal<GoalType>(this.saved.goalType);
  readonly offset = signal(this.saved.goal - this.saved.tdee);

  readonly tdee = computed(() =>
    this.nutrition.calcTdee(
      this.gender(),
      this.age(),
      this.height(),
      this.weight(),
      this.selectedFactor(),
    ),
  );

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

  selectActivity(factor: number): void {
    this.selectedFactor.set(factor);
  }

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

  save(): void {
    const tdee = this.tdee();
    this.nutrition.updateProfile({
      gender: this.gender(),
      age: this.age(),
      height: this.height(),
      weight: this.weight(),
      activityFactor: this.selectedFactor(),
      tdee,
      goal: tdee + this.offset(),
      goalType: this.goalType(),
    });
    this.nutrition.saveProfile();
    this.router.navigate(['/dashboard']);
  }

  back(): void {
    this.router.navigate(['/dashboard']);
  }

  fmt(n: number): string {
    return Math.round(n).toLocaleString('de-DE');
  }
}
