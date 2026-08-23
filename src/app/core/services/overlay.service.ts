/**
 * @fileoverview Overlay flags for creating a survey and confirming publish.
 */
import { Injectable, signal } from '@angular/core';

/**
 * Holds create-survey and publish-confirm visibility as signals.
 */
@Injectable()
export class OverlayService {
  /** Whether the create-survey overlay is open. */
  readonly createOpen = signal(false);
  /** Whether the publish confirmation overlay is open. */
  readonly confirmOpen = signal(false);
  /** Id of the survey that was just published. */
  readonly publishedSurveyId = signal<string | null>(null);

  /** Opens the create-survey overlay. */
  openCreate(): void {
    this.createOpen.set(true);
  }

  /** Closes the create-survey overlay. */
  closeCreate(): void {
    this.createOpen.set(false);
  }

  /**
   * Opens the confirmation overlay after a successful publish.
   *
   * @param surveyId - Id of the newly published survey.
   */
  openConfirm(surveyId: string): void {
    this.publishedSurveyId.set(surveyId);
    this.confirmOpen.set(true);
  }

  /**
   * Closes both overlays and returns the published survey id.
   *
   * @returns The published survey id, or `null` if none was stored.
   */
  closeConfirm(): string | null {
    const surveyId = this.publishedSurveyId();
    this.confirmOpen.set(false);
    this.createOpen.set(false);
    this.publishedSurveyId.set(null);
    return surveyId;
  }
}
