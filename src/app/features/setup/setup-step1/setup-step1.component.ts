import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ACTIVITY_LEVELS } from '../../../models/nutrition.models';
import { NutritionService } from '../../../services/nutrition.service';

@Component({
  selector: 'app-setup-step1',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './setup-step1.component.html',
  styleUrl: './setup-step1.component.css',
})
export class SetupStep1Component {
  private readonly router = inject(Router);
  private readonly nutrition = inject(NutritionService);

  readonly activityLevels = ACTIVITY_LEVELS;

  readonly gender = signal<'m' | 'f'>('m');
  readonly age = signal(25);
  readonly height = signal(175);
  readonly weight = signal(70);
  readonly selectedFactor = signal(1.375);

  readonly tdee = signal(2415);

  recalc(): void {
    const tdee = this.nutrition.calcTdee(
      this.gender(),
      this.age(),
      this.height(),
      this.weight(),
      this.selectedFactor(),
    );
    this.tdee.set(tdee);
  }

  selectActivity(factor: number): void {
    this.selectedFactor.set(factor);
    this.recalc();
  }

  next(): void {
    const tdee = this.nutrition.calcTdee(
      this.gender(),
      this.age(),
      this.height(),
      this.weight(),
      this.selectedFactor(),
    );
    this.nutrition.updateProfile({
      gender: this.gender(),
      age: this.age(),
      height: this.height(),
      weight: this.weight(),
      activityFactor: this.selectedFactor(),
      tdee,
      goal: tdee - 500,
    });
    this.router.navigate(['/setup/2']);
  }

  fmt(n: number): string {
    return Math.round(n).toLocaleString('de-DE');
  }
}
