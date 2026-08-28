/**
 * @fileoverview Dashboard page with ending-soon cards, tabs, category filter and survey list.
 */
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { fadeListAnimation, tabSwitchAnimation } from '../../core/animations/poll.animations';
import { ALL_CATEGORIES_VALUE, SurveyListTab } from '../../core/survey/survey.model';
import { OverlayService } from '../../core/services/overlay.service';
import { SurveyService } from '../../core/survey/survey.service';
import { Header } from '../../layout/header/header';
import { CategoryFilter } from './category-filter/category-filter';
import { Hero } from './hero/hero';
import { SurveyCard } from './survey-card/survey-card';

/**
 * Homescreen. Active and Past keep separate category filters.
 */
@Component({
  selector: 'app-home',
  imports: [Header, Hero, SurveyCard, CategoryFilter],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeListAnimation, tabSwitchAnimation],
})
export class Home {
  private readonly surveys = inject(SurveyService);
  private readonly overlay = inject(OverlayService);
  private readonly router = inject(Router);

  /** True while the initial READ is running. */
  readonly loading = this.surveys.loading;
  /** Surveys that end soon, already sorted by deadline. */
  readonly endingSoon = this.surveys.endingSoonSurveys;
  /** Active or Past list tab. */
  readonly tab = signal<SurveyListTab>('active');
  /** Category filter for the Active list. */
  readonly activeCategory = signal(ALL_CATEGORIES_VALUE);
  /** Category filter for the Past list. */
  readonly pastCategory = signal(ALL_CATEGORIES_VALUE);
  /** Whether the category dropdown is open. */
  readonly filterOpen = signal(false);

  /** Category belonging to the currently visible tab. */
  readonly currentCategory = computed(() =>
    this.tab() === 'active' ? this.activeCategory() : this.pastCategory(),
  );

  /** Surveys for the current tab and category. */
  readonly visibleSurveys = computed(() => {
    const source = this.tab() === 'active' ? this.surveys.activeSurveys() : this.surveys.pastSurveys();
    const category = this.currentCategory();
    return category === ALL_CATEGORIES_VALUE
      ? source
      : source.filter((survey) => survey.category === category);
  });

  /** Opens the create-survey overlay. */
  openCreate(): void {
    this.overlay.openCreate();
  }

  /**
   * Switches between Active and Past without mixing filters.
   *
   * @param tab - Target list.
   */
  setTab(tab: SurveyListTab): void {
    this.tab.set(tab);
    this.filterOpen.set(false);
  }

  /**
   * Stores the category on the current tab only.
   *
   * @param category - Category or `all`.
   */
  setCategory(category: string): void {
    if (this.tab() === 'active') {
      this.activeCategory.set(category);
    } else {
      this.pastCategory.set(category);
    }
  }

  /**
   * Navigates to the survey detail route.
   *
   * @param id - Survey id.
   */
  openSurvey(id: string): void {
    void this.router.navigate(['/survey', id]);
  }
}
