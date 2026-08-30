/**
 * @fileoverview Confirmation overlay shown after a survey was published.
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { overlayAnimation, panelAnimation } from '../../../core/animations/poll.animations';
import { OverlayService } from '../../../core/services/overlay.service';
import { PrimaryBtnIcons } from '../../../shared/icons/primary-btn-icons';

/**
 * Closing this overlay navigates to the newly created survey.
 */
@Component({
  selector: 'app-confirmation-overlay',
  imports: [PrimaryBtnIcons],
  templateUrl: './confirmation-overlay.html',
  styleUrl: './confirmation-overlay.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [overlayAnimation, panelAnimation],
})
export class ConfirmationOverlay {
  private readonly overlay = inject(OverlayService);
  private readonly router = inject(Router);

  /** Closes the overlay and opens the published survey view. */
  close(): void {
    const surveyId = this.overlay.closeConfirm();
    if (surveyId) {
      void this.router.navigate(['/survey', surveyId]);
    }
  }
}
