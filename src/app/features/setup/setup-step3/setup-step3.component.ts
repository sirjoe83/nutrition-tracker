import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NutritionService } from '../../../services/nutrition.service';

@Component({
  selector: 'app-setup-step3',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './setup-step3.component.html',
  styleUrl: './setup-step3.component.css',
})
export class SetupStep3Component {
  private readonly router = inject(Router);
  private readonly nutrition = inject(NutritionService);

  readonly profile = this.nutrition.profile;

  readonly goalDiff = computed(() => this.profile().goal - this.profile().tdee);

  start(): void {
    this.router.navigate(['/dashboard']);
  }

  fmt(n: number): string {
    return Math.round(n).toLocaleString('de-DE');
  }
}
