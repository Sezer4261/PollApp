/**
 * @fileoverview Survey READ/create/vote service with a Supabase path and a local fallback.
 */
import { Inject, Injectable, computed, signal } from '@angular/core';
import { POLL_APP_CONFIG, PollAppSettings } from '../config/poll-app.config';
import { SupabaseService } from '../services/supabase.service';
import { insertRemoteSurvey, insertRemoteVotes, queryPublishedSurveys, subscribeToVoteChanges } from './survey-api';
import {
  applyLocalVotes,
  readCompletedIds,
  readLocalSurveys,
  writeCompletedIds,
  writeLocalSurveys,
} from './survey-local';
import {
  SurveyRow,
  isEndingSoon,
  mapDraftToSurvey,
  mapSurveyRow,
  sortByEndDateAsc,
  sortByEndDateDesc,
} from './survey-mapper';
import { DraftSurvey, Survey, isSurveyPast } from './survey.model';

/**
 * Loads surveys, publishes drafts and stores votes.
 * Uses Supabase when configured, otherwise localStorage seed data.
 */
@Injectable()
export class SurveyService {
  /** All surveys currently shown in the UI. */
  readonly surveys = signal<Survey[]>([]);
  /** Survey ids already completed in this browser. */
  readonly completedIds = signal<string[]>([]);
  /** True while the initial READ is running. */
  readonly loading = signal(true);
  /** Last READ error message, if any. */
  readonly error = signal<string | null>(null);
  /** True when the UI is backed by local data instead of Supabase. */
  readonly usingLocalData = signal(true);

  /** Published surveys that have not ended yet, soonest deadline first. */
  readonly activeSurveys = computed(() =>
    this.surveys().filter((survey) => !isSurveyPast(survey)).sort(sortByEndDateAsc),
  );

  /** Surveys whose deadline is over, latest end date first. */
  readonly pastSurveys = computed(() =>
    this.surveys().filter((survey) => isSurveyPast(survey)).sort(sortByEndDateDesc),
  );

  /** Active surveys that end within the configured window. */
  readonly endingSoonSurveys = computed(() =>
    this.activeSurveys()
      .filter((survey) => isEndingSoon(survey, this.config.endingSoonDays))
      .sort(sortByEndDateAsc)
      .slice(0, this.config.endingSoonLimit),
  );

  /**
   * @param config - Ending-soon limits and Supabase credentials.
   * @param supabase - Optional remote client used for the READ process.
   */
  constructor(
    @Inject(POLL_APP_CONFIG) private readonly config: PollAppSettings,
    private readonly supabase: SupabaseService,
  ) {
    this.completedIds.set(readCompletedIds());
    void this.readSurveys();
    this.subscribeToLiveVotes();
  }

  /**
   * @param id - Survey id from the route.
   * @returns Matching survey or `undefined`.
   */
  surveyById(id: string): Survey | undefined {
    return this.surveys().find((survey) => survey.id === id);
  }

  /**
   * @param surveyId - Survey to check.
   * @returns True when this browser already submitted that survey.
   */
  hasCompleted(surveyId: string): boolean {
    return this.completedIds().includes(surveyId);
  }

  /**
   * READ process: loads surveys with questions, options and votes.
   * Falls back to local seed data when Supabase is missing or fails.
   */
  async readSurveys(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    const remote = await this.fetchRemoteSurveys();
    if (remote) {
      this.applyRemoteSurveys(remote);
      return;
    }
    this.applyLocalFallback();
  }

  /**
   * Persists a validated draft as a published survey.
   *
   * @param draft - Form values from the create overlay.
   * @returns The published survey.
   */
  async publishSurvey(draft: DraftSurvey): Promise<Survey> {
    const survey = mapDraftToSurvey(draft);
    if (await this.tryPublishRemote(survey)) {
      return survey;
    }
    this.persistLocalSurvey(survey);
    return survey;
  }

  /**
   * Stores votes for the selected options and marks the survey completed.
   *
   * @param surveyId - Survey that was submitted.
   * @param selectedOptionIds - Option ids chosen by the participant.
   */
  async submitVotes(surveyId: string, selectedOptionIds: string[]): Promise<void> {
    if (this.hasCompleted(surveyId) || selectedOptionIds.length === 0) {
      return;
    }
    if (await this.trySubmitRemote(surveyId, selectedOptionIds)) {
      return;
    }
    this.submitLocalVotes(surveyId, selectedOptionIds);
  }

  private async fetchRemoteSurveys(): Promise<Survey[] | null> {
    const client = this.supabase.client;
    if (!this.supabase.isConfigured || !client) {
      return null;
    }
    const { data, error } = await queryPublishedSurveys(client);
    if (error || !data) {
      this.error.set(error?.message ?? 'Supabase READ failed. Using local data.');
      return null;
    }
    return (data as SurveyRow[]).map(mapSurveyRow);
  }

  private applyRemoteSurveys(surveys: Survey[]): void {
    this.usingLocalData.set(false);
    this.surveys.set(surveys);
    this.loading.set(false);
  }

  private applyLocalFallback(): void {
    this.usingLocalData.set(true);
    this.surveys.set(readLocalSurveys());
    this.loading.set(false);
  }

  private async tryPublishRemote(survey: Survey): Promise<boolean> {
    const client = this.supabase.client;
    if (!this.supabase.isConfigured || !client) {
      return false;
    }
    const ok = await insertRemoteSurvey(client, survey);
    if (ok) {
      await this.readSurveys();
    }
    return ok;
  }

  private persistLocalSurvey(survey: Survey): void {
    const next = [survey, ...this.surveys()];
    this.surveys.set(next);
    writeLocalSurveys(next);
  }

  private async trySubmitRemote(surveyId: string, optionIds: string[]): Promise<boolean> {
    const client = this.supabase.client;
    if (!this.supabase.isConfigured || !client) {
      return false;
    }
    await insertRemoteVotes(client, optionIds);
    this.markCompleted(surveyId);
    await this.readSurveys();
    return true;
  }

  private submitLocalVotes(surveyId: string, optionIds: string[]): void {
    const next = applyLocalVotes(this.surveys(), surveyId, optionIds);
    this.surveys.set(next);
    writeLocalSurveys(next);
    this.markCompleted(surveyId);
  }

  private subscribeToLiveVotes(): void {
    const client = this.supabase.client;
    if (!this.supabase.isConfigured || !client) {
      return;
    }
    subscribeToVoteChanges(client, () => void this.readSurveys());
  }

  private markCompleted(surveyId: string): void {
    this.completedIds.update((ids) => (ids.includes(surveyId) ? ids : [...ids, surveyId]));
    writeCompletedIds(this.completedIds());
  }
}
