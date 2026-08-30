/**
 * @fileoverview Shared trash icon used by the create-survey form.
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Inline SVG so the same delete icon is not copied through several templates.
 */
@Component({
  selector: 'app-trash-icon',
  template: `
    <svg width="16" height="18" viewBox="0 0 14 16" fill="none" aria-hidden="true">
      <path
        d="M2.6 16A1.7 1.7 0 0 1 .9 14.2V2.7H0V1.8h4.4V.9h5.2v.9H14v.9h-.9v11.5A1.7 1.7 0 0 1 11.4 16H2.6Zm8.8-13.3H2.6v11.5h8.8V2.7ZM5.2 12.4h.9V4.4h-.9v8Zm2.7 0h.9V4.4h-.9v8Z"
        fill="currentColor"
      />
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrashIcon {}
