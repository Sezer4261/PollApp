/**
 * @fileoverview Dashboard hero with headline, CTA and the floating phone illustration.
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { OverlayService } from '../../../core/services/overlay.service';

/**
 * Top section of the homescreen.
 */
@Component({
  selector: 'app-hero',
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  private readonly overlay = inject(OverlayService);

  /** Opens the create-survey overlay from the hero CTA. */
  openCreate(): void {
    this.overlay.openCreate();
  }
}
