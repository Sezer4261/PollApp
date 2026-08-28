/**
 * @fileoverview Root shell that hosts routed pages and the create/publish overlays.
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OverlayService } from './core/services/overlay.service';
import { ConfirmationOverlay } from './layout/overlays/confirmation/confirmation-overlay';
import { CreateSurveyOverlay } from './layout/overlays/create-survey/create-survey-overlay';

/**
 * Root component. Overlays stay outside the router so create-survey is never a route.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CreateSurveyOverlay, ConfirmationOverlay],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  /** Shared overlay state used by header, home and detail views. */
  readonly overlay = inject(OverlayService);
}
