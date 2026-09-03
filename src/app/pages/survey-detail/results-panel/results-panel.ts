/**
 * @fileoverview Live results panel shown beside the survey form.
 */
import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import {
  Survey,
  SurveyOption,
  SurveyQuestion,
  optionPercent,
  surveyHasAnswers,
} from '../../../core/survey/survey.model';
import { OptionLetterPipe, VotePercentPipe } from '../../../shared/pipes/poll.pipes';

/**
 * Renders live percentages with a collapsible body on every viewport size.
 */
@Component({
  selector: 'app-results-panel',
  imports: [OptionLetterPipe, VotePercentPipe],
  templateUrl: './results-panel.html',
  styleUrl: './results-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultsPanel {
  /** Survey whose live votes are displayed. */
  @Input({ required: true }) survey!: Survey;

  /** Whether the results body is visible. */
  readonly expanded = signal(true);

  /** True when at least one vote exists. */
  get hasAnswers(): boolean {
    return surveyHasAnswers(this.survey);
  }

  /** Shows or hides the results body. */
  toggleExpanded(): void {
    this.expanded.update((open) => !open);
  }

  /**
   * Uses `scaleX` so percentage changes do not resize the layout.
   *
   * @param option - Option whose bar should be drawn.
   * @param question - Parent question used as 100%.
   * @returns CSS transform value.
   */
  barTransform(option: SurveyOption, question: SurveyQuestion): string {
    return `scaleX(${optionPercent(option, question) / 100})`;
  }
}
