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
import { Meal, QUICK_MEALS } from '../../../models/nutrition.models';

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

  readonly mealAdded = output<Omit<Meal, 'time'>>();
  readonly closed = output<void>();

  readonly isOpen = signal(false);
  readonly quickMeals = QUICK_MEALS;

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

  fillQuick(meal: Omit<Meal, 'time'>): void {
    this.mealName.set(meal.name);
    this.mealKcal.set(meal.kcal);
    this.mealType.set(meal.type);
  }

  submit(): void {
    const name = this.mealName().trim();
    const kcal = this.mealKcal();
    if (!name || !kcal) return;
    this.mealAdded.emit({ name, kcal, type: this.mealType() });
    this.close();
  }
}
