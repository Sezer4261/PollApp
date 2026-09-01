/**
 * @fileoverview Plus/check icons for primary buttons (normal / hover / active states).
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Hidden by default; `.btn--primary:hover` reveals plus, `:active` reveals check.
 */
@Component({
  selector: 'app-primary-btn-icons',
  template: `
    <span class="btn__icon btn__icon--plus" aria-hidden="true">
      <svg viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="9.8" stroke="currentColor" stroke-width="2.4" />
        <path d="M11 6v10M6 11h10" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
      </svg>
    </span>
    <span class="btn__icon btn__icon--check" aria-hidden="true">
      <svg viewBox="0 0 22 22" fill="none">
        <path
          d="M6.2 11.4 9.4 14.6 15.8 8.2"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrimaryBtnIcons {}
