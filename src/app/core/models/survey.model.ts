/**
 * @fileoverview Domain models and helpers for surveys, questions, options and votes.
 */

/** Publication state of a survey. */
export type SurveyStatus = 'draft' | 'published';

/** Homescreen list tab. */
export type SurveyListTab = 'active' | 'past';

/** Visual variant of a survey card. */
export type SurveyCardVariant = 'highlight' | 'list';

/** A single recorded vote. */
export interface Vote {
  id: string;
}

/** One selectable answer belonging to a question. */
export interface SurveyOption {
  id: string;
  text: string;
  sortOrder: number;
  votes: Vote[];
}

/** A survey question with its options. */
export interface SurveyQuestion {
  id: string;
  text: string;
  allowMultiple: boolean;
  sortOrder: number;
  options: SurveyOption[];
}

/** Complete survey shown on the dashboard and detail page. */
export interface Survey {
  id: string;
  title: string;
  description: string;
  category: string;
  status: SurveyStatus;
  endsAt: string | null;
  createdAt: string;
  questions: SurveyQuestion[];
}

/** Draft answer while creating a survey. */
export interface DraftAnswer {
  id: string;
  text: string;
}

/** Draft question while creating a survey. */
export interface DraftQuestion {
  id: string;
  text: string;
  allowMultiple: boolean;
  answers: DraftAnswer[];
}

/** Form model for the create-survey overlay. */
export interface DraftSurvey {
  title: string;
  description: string;
  category: string;
  endsAt: string;
  questions: DraftQuestion[];
}

/**
 * Counts votes stored on an option.
 *
 * @param option - Option whose votes should be counted.
 * @returns Number of votes.
 */
export function optionVoteCount(option: SurveyOption): number {
  return option.votes.length;
}

/**
 * Sums all votes of a question.
 *
 * @param question - Question to total.
 * @returns Combined vote count.
 */
export function questionVoteTotal(question: SurveyQuestion): number {
  return question.options.reduce((sum, option) => sum + optionVoteCount(option), 0);
}

/**
 * Calculates an option's share of a question's votes.
 *
 * @param option - Option to convert.
 * @param question - Parent question with all options.
 * @returns Rounded percent from 0 to 100.
 */
export function optionPercent(option: SurveyOption, question: SurveyQuestion): number {
  const total = questionVoteTotal(question);
  if (total === 0) {
    return 0;
  }
  return Math.round((optionVoteCount(option) / total) * 100);
}

/**
 * Checks whether any question already has votes.
 *
 * @param survey - Survey to inspect.
 * @returns True when at least one vote exists.
 */
export function surveyHasAnswers(survey: Survey): boolean {
  return survey.questions.some((question) => questionVoteTotal(question) > 0);
}

/**
 * Returns true when the survey deadline is in the past.
 *
 * @param survey - Survey to inspect.
 * @param now - Reference time, defaults to the current date.
 */
export function isSurveyPast(survey: Survey, now: Date = new Date()): boolean {
  if (!survey.endsAt) {
    return false;
  }
  return new Date(survey.endsAt).getTime() < now.getTime();
}

/**
 * Whole days remaining until a deadline.
 *
 * @param isoDate - ISO timestamp or `null` when no deadline exists.
 * @param now - Reference time, defaults to the current date.
 * @returns Remaining days, negative when ended, or `null` without a date.
 */
export function daysUntil(isoDate: string | null, now: Date = new Date()): number | null {
  if (!isoDate) {
    return null;
  }
  const end = new Date(isoDate);
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.round((endDay.getTime() - start.getTime()) / 86_400_000);
}

/**
 * Creates a unique identifier for local and published entities.
 *
 * @returns UUID string.
 */
export function createId(): string {
  return crypto.randomUUID();
}

/**
 * Empty create-survey form with one required question.
 *
 * @returns A new draft survey.
 */
export function emptyDraftSurvey(): DraftSurvey {
  return {
    title: '',
    description: '',
    category: '',
    endsAt: '',
    questions: [emptyDraftQuestion()],
  };
}

/**
 * Empty question block with two answer fields.
 *
 * @returns A new draft question.
 */
export function emptyDraftQuestion(): DraftQuestion {
  return {
    id: createId(),
    text: '',
    allowMultiple: false,
    answers: [emptyDraftAnswer(), emptyDraftAnswer()],
  };
}

/**
 * Empty answer row.
 *
 * @returns A new draft answer.
 */
export function emptyDraftAnswer(): DraftAnswer {
  return {
    id: createId(),
    text: '',
  };
}
