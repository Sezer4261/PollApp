/**
 * @fileoverview Custom pipes used by survey cards, the detail form and live results.
 */
import { Pipe, PipeTransform } from '@angular/core';
import {
  SurveyOption,
  SurveyQuestion,
  daysUntil,
  optionPercent,
} from '../../core/survey/survey.model';

/**
 * Turns an ISO date into the countdown label shown on survey cards.
 */
@Pipe({
  name: 'endsIn',
})
export class EndsInPipe implements PipeTransform {
  /**
   * @param isoDate - Survey end date, or empty when there is no deadline.
   * @returns Human-readable countdown text.
   */
  transform(isoDate: string | null | undefined): string {
    if (!isoDate) {
      return 'No deadline';
    }
    const days = daysUntil(isoDate);
    return days === null ? 'No deadline' : formatEndsIn(days);
  }
}

/**
 * Turns an ISO date into the detail-page deadline label.
 */
@Pipe({
  name: 'endsOn',
})
export class EndsOnPipe implements PipeTransform {
  /**
   * @param isoDate - Survey end date, or empty when there is no deadline.
   * @returns Formatted date text.
   */
  transform(isoDate: string | null | undefined): string {
    if (!isoDate) {
      return 'No end date';
    }
    const date = new Date(isoDate);
    return `Ends on ${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
  }
}

/**
 * Converts a zero-based index into an answer letter.
 */
@Pipe({
  name: 'optionLetter',
})
export class OptionLetterPipe implements PipeTransform {
  /**
   * @param index - Zero-based option index.
   * @returns Uppercase letter for that index.
   */
  transform(index: number): string {
    return String.fromCharCode(65 + index);
  }
}

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

function formatEndsIn(days: number): string {
  if (days < 0) {
    return 'Ended';
  }
  if (days === 0) {
    return 'Ends today';
  }
  if (days === 1) {
    return 'Ends in 1 Day';
  }
  return `Ends in ${days} Days`;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}
