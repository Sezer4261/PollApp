/**
 * @fileoverview Survey detail page with voting on the left and live results on the right.
 */
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Survey, SurveyQuestion, isSurveyPast } from '../../core/survey/survey.model';
import { OverlayService } from '../../core/services/overlay.service';
import { SurveyService } from '../../core/survey/survey.service';
import { Header } from '../../layout/header/header';
import { EndsOnPipe, OptionLetterPipe } from '../../shared/pipes/poll.pipes';
import { ResultsPanel } from './results-panel/results-panel';

/**
 * Vote form and live results. Past surveys stay visible but cannot be submitted.
 */
@Component({
  selector: 'app-survey-detail',
  imports: [Header, ResultsPanel, EndsOnPipe, OptionLetterPipe],
  templateUrl: './survey-detail.html',
  styleUrl: './survey-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveyDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly surveys = inject(SurveyService);
  private readonly overlay = inject(OverlayService);

  /** Survey id from `/survey/:id`. */
  private readonly surveyId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' },
  );

  /** Survey matching the current route. */
  readonly survey = computed(() => this.surveys.surveyById(this.surveyId()));
  /** True when the deadline is over. */
  readonly isPast = computed(() => {
    const survey = this.survey();
    return survey ? isSurveyPast(survey) : false;
  });
  /** True when this browser already completed the survey. */
  readonly alreadyCompleted = computed(() => this.surveys.hasCompleted(this.surveyId()));
  /** True when options must stay disabled. */
  readonly locked = computed(() => this.isPast() || this.alreadyCompleted());
  /** Selected option ids grouped by question id. */
  readonly selected = signal<Record<string, string[]>>({});
  /** Validation message kept in a reserved slot so the layout does not jump. */
  readonly formError = signal<string | null>(null);
  /** True while votes are being stored. */
  readonly submitting = signal(false);

  /** Opens the create-survey overlay from the detail header. */
  openCreate(): void {
    this.overlay.openCreate();
  }

  /**
   * Splits the team-event title so "Let's Plan the Next Team" stays on one line.
   *
   * @param title - Survey title to display.
   * @returns One or two lines for the heading.
   */
  titleLines(title: string): string[] {
    const firstLine = "Let's Plan the Next Team";
    if (!title.startsWith(firstLine)) {
      return [title];
    }
    const rest = title.slice(firstLine.length).trim();
    return rest ? [firstLine, rest] : [firstLine];
  }

  /**
   * @param questionId - Question to inspect.
   * @param optionId - Option to inspect.
   * @returns True when the option is currently selected.
   */
  isChecked(questionId: string, optionId: string): boolean {
    return this.selected()[questionId]?.includes(optionId) ?? false;
  }

  /**
   * Selects or deselects an option. Does nothing for locked surveys.
   *
   * @param question - Question that owns the option.
   * @param optionId - Chosen option.
   */
  toggleOption(question: SurveyQuestion, optionId: string): void {
    if (this.locked()) {
      return;
    }
    this.selected.update((current) => ({
      ...current,
      [question.id]: nextOptionIds(current[question.id] ?? [], optionId, question.allowMultiple),
    }));
  }

  /** Validates answers and submits votes so live results can update. */
  async complete(): Promise<void> {
    const survey = this.survey();
    if (!survey || this.locked() || this.hasMissingAnswers(survey)) {
      return;
    }
    this.formError.set(null);
    this.submitting.set(true);
    await this.surveys.submitVotes(survey.id, selectedOptionIds(survey, this.selected()));
    this.submitting.set(false);
  }

  /** Returns to the dashboard. */
  goHome(): void {
    void this.router.navigateByUrl('/');
  }

  private hasMissingAnswers(survey: Survey): boolean {
    const missing = survey.questions.some((question) => (this.selected()[question.id] ?? []).length === 0);
    if (missing) {
      this.formError.set('Please answer every question before completing the survey.');
    }
    return missing;
  }
}

function nextOptionIds(existing: string[], optionId: string, allowMultiple: boolean): string[] {
  if (!allowMultiple) {
    return [optionId];
  }
  return existing.includes(optionId)
    ? existing.filter((id) => id !== optionId)
    : [...existing, optionId];
}

function selectedOptionIds(survey: Survey, selected: Record<string, string[]>): string[] {
  return survey.questions.flatMap((question) => selected[question.id] ?? []);
}
