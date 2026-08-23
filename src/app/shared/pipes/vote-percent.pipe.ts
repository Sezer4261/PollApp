/**
 * @fileoverview Custom pipe that converts option votes into a percentage.
 */
import { Pipe, PipeTransform } from '@angular/core';
import { optionPercent, SurveyOption, SurveyQuestion } from '../../core/models/survey.model';

/**
 * Calculates how many percent of a question's votes belong to one option.
 */
@Pipe({
  name: 'votePercent',
})
export class VotePercentPipe implements PipeTransform {
  /**
   * @param option - Option to convert.
   * @param question - Parent question used as the 100% baseline.
   * @returns Rounded percent from 0 to 100.
   */
  transform(option: SurveyOption, question: SurveyQuestion): number {
    return optionPercent(option, question);
  }
}
