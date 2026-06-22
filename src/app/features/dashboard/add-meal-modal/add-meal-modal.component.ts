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
import { FavoriteMeal, Meal } from '../../../models/nutrition.models';
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
  protected readonly nutrition = inject(NutritionService);

  readonly mealAdded = output<Omit<Meal, 'time' | 'date'>>();
  readonly closed = output<void>();

  readonly isOpen = signal(false);
  readonly favoriteMeals = this.nutrition.favoriteMeals;

  readonly mealName = signal('');
  readonly mealKcal = signal<number | null>(null);
  readonly mealType = signal('🌅 Frühstück');
  readonly saveAsFavorite = signal(false);

  readonly sheet = viewChild<ElementRef>('sheet');

  open(): void {
    this.mealName.set('');
    this.mealKcal.set(null);
    this.mealType.set('🌅 Frühstück');
    this.saveAsFavorite.set(false);
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    this.closed.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === this.el.nativeElement) this.close();
  }

  fillQuick(meal: FavoriteMeal): void {
    this.mealName.set(meal.name);
    this.mealKcal.set(meal.kcal);
    this.mealType.set(meal.type);
    this.saveAsFavorite.set(false);
  }

  removeFavorite(name: string): void {
    this.nutrition.removeFromFavorites(name);
  }

  toggleSaveAsFavorite(): void {
    this.saveAsFavorite.update((v) => !v);
  }

  submit(): void {
    const name = this.mealName().trim();
    if (!name) return;
    const kcal = this.mealKcal();
    const meal = { name, kcal, type: this.mealType() };
    if (this.saveAsFavorite()) {
      this.nutrition.addToFavorites(meal);
    }
    this.mealAdded.emit(meal);
    this.close();
  }
}
