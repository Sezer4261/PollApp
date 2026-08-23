/**
 * @fileoverview Custom pipe that maps option indexes to letters A, B, C, ...
 */
import { Pipe, PipeTransform } from '@angular/core';

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
