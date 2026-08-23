/**
 * @fileoverview Custom pipe that formats a deadline as "Ends on DD.MM.YYYY".
 */
import { Pipe, PipeTransform } from '@angular/core';

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
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `Ends on ${day}.${month}.${year}`;
  }
}
