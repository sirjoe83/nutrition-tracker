import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { inject } from '@angular/core';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly router = inject(Router);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => (e as NavigationEnd).urlAfterRedirects),
    ),
    { initialValue: '' },
  );

  readonly showNav = computed(() =>
    this.currentUrl().startsWith('/dashboard') || this.currentUrl().startsWith('/settings'),
  );

  readonly isSettings = computed(() => this.currentUrl().startsWith('/settings'));

  navTo(tab: string): void {
    if (tab === 'settings') this.router.navigate(['/settings']);
    else this.router.navigate(['/dashboard']);
  }
}
