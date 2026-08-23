/**
 * @fileoverview Clickable survey card for ending-soon highlights and the main list.
 */
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Survey, SurveyCardVariant } from '../../../core/models/survey.model';
import { EndsInPipe } from '../../pipes/ends-in.pipe';

/**
 * Renders one survey with category, title and deadline.
 */
@Component({
  selector: 'app-survey-card',
  imports: [EndsInPipe],
  templateUrl: './survey-card.html',
  styleUrl: './survey-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SurveyCard {
  /** Survey shown on the card. */
  @Input({ required: true }) survey!: Survey;
  /** Visual style: light highlight card or dark list card. */
  @Input() variant: SurveyCardVariant = 'list';
  /** Emits the survey id when the card is opened. */
  @Output() selectSurvey = new EventEmitter<string>();

  /** Forwards the survey id to the parent page. */
  open(): void {
    this.selectSurvey.emit(this.survey.id);
  }
}
