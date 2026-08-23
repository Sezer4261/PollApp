/**
 * @fileoverview Question block used inside the create-survey overlay.
 */
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { DraftQuestion, emptyDraftAnswer } from '../../../core/models/survey.model';
import { OptionLetterPipe } from '../../pipes/option-letter.pipe';

/**
 * Edits one question. Question 1 can only be cleared, later questions can be removed.
 */
@Component({
  selector: 'app-question-editor',
  imports: [OptionLetterPipe],
  templateUrl: './question-editor.html',
  styleUrl: './question-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionEditor {
  /** Question currently being edited. */
  @Input({ required: true }) question!: DraftQuestion;
  /** Zero-based index used for the "1. Question" label. */
  @Input() index = 0;
  /** True for the first question, which cannot be deleted entirely. */
  @Input() isFirst = false;
  /** Emits the updated question model. */
  @Output() questionChange = new EventEmitter<DraftQuestion>();
  /** Emits when a non-first question should be removed. */
  @Output() removeQuestion = new EventEmitter<void>();
  /** Emits when the first question should be reset instead of removed. */
  @Output() clearQuestion = new EventEmitter<void>();

  /**
   * @param event - Native input event.
   * @returns Current field value.
   */
  inputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  /**
   * @param event - Native change event.
   * @returns Whether the checkbox is checked.
   */
  checked(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }

  /** Clears question 1 or removes any later question. */
  onDeleteQuestion(): void {
    if (this.isFirst) {
      this.clearQuestion.emit();
      return;
    }
    this.removeQuestion.emit();
  }

  /**
   * @param partial - Fields to merge into the current question.
   */
  patch(partial: Partial<DraftQuestion>): void {
    this.questionChange.emit({ ...this.question, ...partial });
  }

  /**
   * @param answerId - Answer row to update.
   * @param text - New answer text.
   */
  updateAnswer(answerId: string, text: string): void {
    this.patch({
      answers: this.question.answers.map((answer) =>
        answer.id === answerId ? { ...answer, text } : answer,
      ),
    });
  }

  /** Adds another answer row. */
  addAnswer(): void {
    this.patch({ answers: [...this.question.answers, emptyDraftAnswer()] });
  }

  /**
   * Removes an answer when more than two rows remain, otherwise clears its text.
   *
   * @param answerId - Answer row to delete.
   */
  removeAnswer(answerId: string): void {
    if (this.question.answers.length <= 2) {
      this.updateAnswer(answerId, '');
      return;
    }
    this.patch({
      answers: this.question.answers.filter((answer) => answer.id !== answerId),
    });
  }
}
