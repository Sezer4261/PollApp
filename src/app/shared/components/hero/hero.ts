/**
 * @fileoverview Dashboard hero with headline, CTA and the floating phone illustration.
 */
import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';

/**
 * Top section of the homescreen.
 */
@Component({
  selector: 'app-hero',
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  /** Emitted when "New survey" is clicked. */
  @Output() newSurvey = new EventEmitter<void>();
}
