/**
 * @fileoverview Custom pipe that formats a deadline as "Ends in X Day(s)".
 */
import { Pipe, PipeTransform } from '@angular/core';
import { daysUntil } from '../../core/models/survey.model';

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
    if (days === null) {
      return 'No deadline';
    }
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
}
