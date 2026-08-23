/**
 * @fileoverview Overlay form for creating and publishing a new survey.
 */
import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { overlayAnimation, panelAnimation } from '../../../core/animations/poll.animations';
import { SURVEY_CATEGORIES } from '../../../core/constants/categories';
import {
  DraftQuestion,
  DraftSurvey,
  emptyDraftQuestion,
  emptyDraftSurvey,
} from '../../../core/models/survey.model';
import { OverlayService } from '../../../core/services/overlay.service';
import { SurveyService } from '../../../core/services/survey.service';
import { QuestionEditor } from '../question-editor/question-editor';

/**
 * Create-survey modal. Not a route: it is shown above the current page.
 */
@Component({
  selector: 'app-create-survey-overlay',
  imports: [QuestionEditor],
  templateUrl: './create-survey-overlay.html',
  styleUrl: './create-survey-overlay.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [overlayAnimation, panelAnimation],
})
export class CreateSurveyOverlay {
  private readonly overlay = inject(OverlayService);
  private readonly surveys = inject(SurveyService);

  /** Categories offered in the required dropdown. */
  readonly categories = SURVEY_CATEGORIES;
  /** Current form state. */
  readonly draft = signal<DraftSurvey>(emptyDraftSurvey());
  /** Validation messages shown in a reserved error slot. */
  readonly errors = signal<string[]>([]);
  /** True while the survey is being persisted. */
  readonly submitting = signal(false);

  /** Closes the overlay without publishing. */
  close(): void {
    this.overlay.closeCreate();
  }

  /** Closes the overlay when Escape is pressed. */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  /** Clears the survey name field. */
  clearTitle(): void {
    this.patch({ title: '' });
  }

  /** Clears the optional end date. */
  clearEndsAt(): void {
    this.patch({ endsAt: '' });
  }

  /** Clears the optional describing text. */
  clearDescription(): void {
    this.patch({ description: '' });
  }

  /**
   * @param event - Native input or change event.
   * @returns Field value.
   */
  inputValue(event: Event): string {
    return (event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
  }

  /**
   * @param partial - Fields to merge into the draft.
   */
  patch(partial: Partial<DraftSurvey>): void {
    this.draft.update((current) => ({ ...current, ...partial }));
  }

  /**
   * Replaces one question in the draft.
   *
   * @param index - Question index.
   * @param question - Updated question.
   */
  updateQuestion(index: number, question: DraftQuestion): void {
    this.draft.update((current) => ({
      ...current,
      questions: current.questions.map((item, itemIndex) =>
        itemIndex === index ? question : item,
      ),
    }));
  }

  /** Appends another question block. */
  addQuestion(): void {
    this.draft.update((current) => ({
      ...current,
      questions: [...current.questions, emptyDraftQuestion()],
    }));
  }

  /** Clears question 1 instead of removing the required first block. */
  clearFirstQuestion(): void {
    this.draft.update((current) => ({
      ...current,
      questions: current.questions.map((question, index) =>
        index === 0 ? emptyDraftQuestion() : question,
      ),
    }));
  }

  /**
   * Removes a question after the first one.
   *
   * @param index - Question index to remove.
   */
  removeQuestion(index: number): void {
    if (index === 0) {
      this.clearFirstQuestion();
      return;
    }
    this.draft.update((current) => ({
      ...current,
      questions: current.questions.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  /** Validates required fields and publishes the survey. */
  async publish(): Promise<void> {
    const issues = this.validate(this.draft());
    this.errors.set(issues);
    if (issues.length > 0) {
      return;
    }

    this.submitting.set(true);
    const survey = await this.surveys.publishSurvey(this.draft());
    this.submitting.set(false);
    this.overlay.openConfirm(survey.id);
  }

  /**
   * @param draft - Current form values.
   * @returns Validation messages for required fields.
   */
  private validate(draft: DraftSurvey): string[] {
    const issues: string[] = [];
    if (!draft.title.trim()) {
      issues.push('Survey name is required.');
    }
    if (!draft.category) {
      issues.push('Please choose a category.');
    }

    const filledQuestions = draft.questions.filter((question) => question.text.trim());
    if (filledQuestions.length === 0) {
      issues.push('Add at least one question.');
    }

    for (const question of filledQuestions) {
      const answers = question.answers.filter((answer) => answer.text.trim());
      if (answers.length < 2) {
        issues.push(`“${question.text.trim()}” needs at least two answer options.`);
      }
    }

    return issues;
  }
}
