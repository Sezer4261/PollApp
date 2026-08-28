/**
 * @fileoverview Category dropdown used by Active and Past survey lists.
 */
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ALL_CATEGORIES_VALUE, SURVEY_CATEGORIES } from '../../../core/survey/survey.model';

/**
 * Filter control that never mixes Active and Past category selections.
 */
@Component({
  selector: 'app-category-filter',
  templateUrl: './category-filter.html',
  styleUrl: './category-filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryFilter {
  /** Available categories from the shared constant. */
  readonly categories = SURVEY_CATEGORIES;
  /** Value that resets the list to every category. */
  readonly allValue = ALL_CATEGORIES_VALUE;

  /** Currently selected category or `all`. */
  @Input() value = ALL_CATEGORIES_VALUE;
  /** Whether the dropdown menu is visible. */
  @Input() open = false;
  /** Emits the chosen category. */
  @Output() valueChange = new EventEmitter<string>();
  /** Emits the next open/closed state. */
  @Output() openChange = new EventEmitter<boolean>();

  /** Toggles the dropdown without moving surrounding layout. */
  toggle(): void {
    this.openChange.emit(!this.open);
  }

  /**
   * Applies a category and closes the menu.
   *
   * @param category - Chosen category or `all`.
   */
  choose(category: string): void {
    this.valueChange.emit(category);
    this.openChange.emit(false);
  }

  /**
   * @param value - Stored filter value.
   * @returns Label shown in the menu.
   */
  labelFor(value: string): string {
    return value === this.allValue ? 'All Surveys' : value;
  }
}
