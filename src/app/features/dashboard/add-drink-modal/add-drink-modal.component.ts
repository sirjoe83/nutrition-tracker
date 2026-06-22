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
import { Drink } from '../../../models/nutrition.models';

@Component({
  selector: 'app-add-drink-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './add-drink-modal.component.html',
  styleUrl: './add-drink-modal.component.css',
  host: {
    '[class.open]': 'isOpen()',
    '(click)': 'onOverlayClick($event)',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': 'drink-modal-title',
  },
})
export class AddDrinkModalComponent {
  private readonly el = inject(ElementRef);

  readonly drinkAdded = output<Omit<Drink, 'time' | 'date'>>();
  readonly closed = output<void>();

  readonly isOpen = signal(false);

  readonly drinkName = signal('');
  readonly drinkAmount = signal<number | null>(null);
  readonly drinkKcal = signal<number | null>(null);

  readonly sheet = viewChild<ElementRef>('sheet');

  open(): void {
    this.drinkName.set('');
    this.drinkAmount.set(null);
    this.drinkKcal.set(null);
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    this.closed.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === this.el.nativeElement) this.close();
  }

  fillQuick(name: string, amount: number): void {
    this.drinkName.set(name);
    this.drinkAmount.set(amount);
  }

  submit(): void {
    const name = this.drinkName().trim();
    const amount = this.drinkAmount();
    if (!name || !amount || amount <= 0) return;
    this.drinkAdded.emit({ name, amount, kcal: this.drinkKcal() });
    this.close();
  }
}
