/**
 * @fileoverview Site header with logo and optional create-survey action.
 */
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PrimaryBtnIcons } from '../../shared/icons/primary-btn-icons';

/**
 * Shared header used on the dark dashboard and the light survey detail page.
 */
@Component({
  selector: 'app-header',
  imports: [RouterLink, PrimaryBtnIcons],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  /** Color variant matching the current page background. */
  @Input() variant: 'dark' | 'light' = 'dark';
  /** When true, shows the "Create survey" button. */
  @Input() showCreate = false;
  /** Emitted when the user wants to open the create overlay. */
  @Output() createSurvey = new EventEmitter<void>();
}
