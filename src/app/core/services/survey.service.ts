/**
 * @fileoverview Survey READ/create/vote service with a Supabase path and a local fallback.
 */
import { Inject, Injectable, computed, signal } from '@angular/core';
import { POLL_APP_CONFIG, PollAppSettings } from '../config/poll-app.config';
import { cloneSurveys, createSeedSurveys, newVoteId } from '../data/seed-surveys';
import {
  DraftSurvey,
  Survey,
  createId,
  daysUntil,
  isSurveyPast,
} from '../models/survey.model';
import { SupabaseService } from './supabase.service';

/** localStorage key for the survey cache. */
const LOCAL_DB_KEY = 'poll-app.surveys.v3';
/** localStorage key for surveys this browser already completed. */
const LOCAL_VOTES_KEY = 'poll-app.completed-surveys';

/** Row shape returned by the nested Supabase READ query. */
interface SurveyRow {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: 'draft' | 'published';
  ends_at: string | null;
  created_at: string;
  questions: QuestionRow[] | null;
}

/** Nested question row from Supabase. */
interface QuestionRow {
  id: string;
  text: string;
  allow_multiple: boolean;
  sort_order: number;
  options: OptionRow[] | null;
}

/** Nested option row from Supabase, including vote ids. */
interface OptionRow {
  id: string;
  text: string;
  sort_order: number;
  votes: { id: string }[] | null;
}

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
    this.surveys()
      .filter((survey) => !isSurveyPast(survey))
      .sort(sortByEndDateAsc),
  );

  /** Surveys whose deadline is over, latest end date first. */
  readonly pastSurveys = computed(() =>
    this.surveys()
      .filter((survey) => isSurveyPast(survey))
      .sort(sortByEndDateDesc),
  );

  /** Active surveys that end within the configured window. */
  readonly endingSoonSurveys = computed(() =>
    this.activeSurveys()
      .filter((survey) => {
        const days = daysUntil(survey.endsAt);
        return days !== null && days >= 0 && days <= this.config.endingSoonDays;
      })
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
    this.completedIds.set(this.readCompletedIds());
    void this.readSurveys();
    this.subscribeToLiveVotes();
  }

  /**
   * Finds a survey by id.
   *
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

    if (this.supabase.isConfigured && this.supabase.client) {
      const { data, error } = await this.supabase.client
        .from('surveys')
        .select(
          `
          id,
          title,
          description,
          category,
          status,
          ends_at,
          created_at,
          questions (
            id,
            text,
            allow_multiple,
            sort_order,
            options (
              id,
              text,
              sort_order,
              votes (id)
            )
          )
        `,
        )
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (!error && data) {
        this.usingLocalData.set(false);
        this.surveys.set((data as SurveyRow[]).map(mapSurveyRow));
        this.loading.set(false);
        return;
      }

      this.error.set(error?.message ?? 'Supabase READ failed. Using local data.');
    }

    this.usingLocalData.set(true);
    this.surveys.set(this.readLocalSurveys());
    this.loading.set(false);
  }

  /**
   * Persists a validated draft as a published survey.
   *
   * @param draft - Form values from the create overlay.
   * @returns The published survey.
   */
  async publishSurvey(draft: DraftSurvey): Promise<Survey> {
    const survey = mapDraftToSurvey(draft);

    if (this.supabase.isConfigured && this.supabase.client) {
      const client = this.supabase.client;
      const { error: surveyError } = await client.from('surveys').insert({
        id: survey.id,
        title: survey.title,
        description: survey.description || null,
        category: survey.category,
        status: survey.status,
        ends_at: survey.endsAt,
      });

      if (!surveyError) {
        await client.from('questions').insert(
          survey.questions.map((question) => ({
            id: question.id,
            survey_id: survey.id,
            text: question.text,
            allow_multiple: question.allowMultiple,
            sort_order: question.sortOrder,
          })),
        );
        await client.from('options').insert(
          survey.questions.flatMap((question) =>
            question.options.map((option) => ({
              id: option.id,
              question_id: question.id,
              text: option.text,
              sort_order: option.sortOrder,
            })),
          ),
        );
        await this.readSurveys();
        return survey;
      }
    }

    const next = [survey, ...this.surveys()];
    this.surveys.set(next);
    this.writeLocalSurveys(next);
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

    if (this.supabase.isConfigured && this.supabase.client) {
      const rows = selectedOptionIds.map((optionId) => ({
        id: newVoteId(),
        option_id: optionId,
      }));
      await this.supabase.client.from('votes').insert(rows);
      this.markCompleted(surveyId);
      await this.readSurveys();
      return;
    }

    const next = this.surveys().map((survey) => {
      if (survey.id !== surveyId) {
        return survey;
      }
      return {
        ...survey,
        questions: survey.questions.map((question) => ({
          ...question,
          options: question.options.map((option) =>
            selectedOptionIds.includes(option.id)
              ? { ...option, votes: [...option.votes, { id: newVoteId() }] }
              : option,
          ),
        })),
      };
    });

    this.surveys.set(next);
    this.writeLocalSurveys(next);
    this.markCompleted(surveyId);
  }

  /** Subscribes to Supabase vote inserts so live results refresh automatically. */
  private subscribeToLiveVotes(): void {
    if (!this.supabase.isConfigured || !this.supabase.client) {
      return;
    }

    this.supabase.client
      .channel('live-votes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, () => {
        void this.readSurveys();
      })
      .subscribe();
  }

  /** Reads surveys from localStorage or writes the seed data on first use. */
  private readLocalSurveys(): Survey[] {
    const raw = localStorage.getItem(LOCAL_DB_KEY);
    if (!raw) {
      const seeded = cloneSurveys(createSeedSurveys());
      this.writeLocalSurveys(seeded);
      return seeded;
    }
    try {
      return JSON.parse(raw) as Survey[];
    } catch {
      return cloneSurveys(createSeedSurveys());
    }
  }

  /**
   * @param surveys - Snapshot to persist locally.
   */
  private writeLocalSurveys(surveys: Survey[]): void {
    localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(surveys));
  }

  /** @returns Survey ids already completed in this browser. */
  private readCompletedIds(): string[] {
    const raw = localStorage.getItem(LOCAL_VOTES_KEY);
    if (!raw) {
      return [];
    }
    try {
      return JSON.parse(raw) as string[];
    } catch {
      return [];
    }
  }

  /**
   * @param surveyId - Survey that can no longer be submitted in this browser.
   */
  private markCompleted(surveyId: string): void {
    this.completedIds.update((ids) => (ids.includes(surveyId) ? ids : [...ids, surveyId]));
    localStorage.setItem(LOCAL_VOTES_KEY, JSON.stringify(this.completedIds()));
  }
}

/**
 * @param a - First survey.
 * @param b - Second survey.
 * @returns Negative when `a` ends sooner.
 */
function sortByEndDateAsc(a: Survey, b: Survey): number {
  if (!a.endsAt) {
    return 1;
  }
  if (!b.endsAt) {
    return -1;
  }
  return new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime();
}

/**
 * @param a - First survey.
 * @param b - Second survey.
 * @returns Negative when `a` ended later.
 */
function sortByEndDateDesc(a: Survey, b: Survey): number {
  return sortByEndDateAsc(b, a);
}

/**
 * Maps a nested Supabase READ row onto the UI survey model.
 *
 * @param row - Database row with nested questions and options.
 */
function mapSurveyRow(row: SurveyRow): Survey {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    category: row.category,
    status: row.status,
    endsAt: row.ends_at,
    createdAt: row.created_at,
    questions: (row.questions ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((question) => ({
        id: question.id,
        text: question.text,
        allowMultiple: question.allow_multiple,
        sortOrder: question.sort_order,
        options: (question.options ?? [])
          .slice()
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((option) => ({
            id: option.id,
            text: option.text,
            sortOrder: option.sort_order,
            votes: option.votes ?? [],
          })),
      })),
  };
}

/**
 * Converts a create-survey draft into a published survey entity.
 *
 * @param draft - Validated overlay form.
 */
function mapDraftToSurvey(draft: DraftSurvey): Survey {
  return {
    id: createId(),
    title: draft.title.trim(),
    description: draft.description.trim(),
    category: draft.category,
    status: 'published',
    endsAt: draft.endsAt ? new Date(`${draft.endsAt}T18:00:00`).toISOString() : null,
    createdAt: new Date().toISOString(),
    questions: draft.questions
      .filter((question) => question.text.trim())
      .map((question, questionIndex) => ({
      id: question.id,
      text: question.text.trim(),
      allowMultiple: question.allowMultiple,
      sortOrder: questionIndex,
      options: question.answers
        .filter((answer) => answer.text.trim())
        .map((answer, answerIndex) => ({
          id: answer.id,
          text: answer.text.trim(),
          sortOrder: answerIndex,
          votes: [],
        })),
    })),
  };
}

