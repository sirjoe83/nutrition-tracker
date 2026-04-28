import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Meal } from '../../../models/nutrition.models';
import { NutritionService } from '../../../services/nutrition.service';

@Component({
  selector: 'app-add-meal-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './add-meal-modal.component.html',
  styleUrl: './add-meal-modal.component.css',
  host: {
    '[class.open]': 'isOpen()',
    '(click)': 'onOverlayClick($event)',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': 'modal-title',
  },
})
export class AddMealModalComponent {
  private readonly el = inject(ElementRef);
  private readonly nutrition = inject(NutritionService);

  readonly mealAdded = output<Omit<Meal, 'time' | 'date'>>();
  readonly closed = output<void>();

  readonly isOpen = signal(false);
  readonly quickMeals = this.nutrition.quickMeals;

  readonly mealName = signal('');
  readonly mealKcal = signal<number | null>(null);
  readonly mealType = signal('🌅 Frühstück');

  readonly sheet = viewChild<ElementRef>('sheet');

  open(): void {
    this.mealName.set('');
    this.mealKcal.set(null);
    this.mealType.set('🌅 Frühstück');
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    this.closed.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === this.el.nativeElement) this.close();
  }

  fillQuick(meal: Omit<Meal, 'time' | 'date'>): void {
    this.mealName.set(meal.name);
    this.mealKcal.set(meal.kcal);
    this.mealType.set(meal.type);
  }

  submit(): void {
    const name = this.mealName().trim();
    const kcal = this.mealKcal();
    if (!name || !kcal) return;
    const meal = { name, kcal, type: this.mealType() };
    this.nutrition.addToRecentMeals(meal);
    this.mealAdded.emit(meal);
    this.close();
  }
}
