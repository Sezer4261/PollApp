/**
 * @fileoverview Survey domain types, categories and small helpers.
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

/** All selectable survey categories. */
export const SURVEY_CATEGORIES = [
  'Team activities',
  'Health & Wellness',
  'Gaming & Entertainment',
  'Food & Drinks',
  'Office & Workplace',
  'Learning & Development',
] as const;

/** One of the predefined survey categories. */
export type SurveyCategory = (typeof SURVEY_CATEGORIES)[number];

/** Sentinel value that shows every category in a list. */
export const ALL_CATEGORIES_VALUE = 'all';

/**
 * @param option - Option whose votes should be counted.
 * @returns Number of votes.
 */
export function optionVoteCount(option: SurveyOption): number {
  return option.votes.length;
}

/**
 * @param question - Question to total.
 * @returns Combined vote count.
 */
export function questionVoteTotal(question: SurveyQuestion): number {
  return question.options.reduce((sum, option) => sum + optionVoteCount(option), 0);
}

/**
 * @param option - Option to convert.
 * @param question - Parent question with all options.
 * @returns Rounded percent from 0 to 100.
 */
export function optionPercent(option: SurveyOption, question: SurveyQuestion): number {
  const total = questionVoteTotal(question);
  return total === 0 ? 0 : Math.round((optionVoteCount(option) / total) * 100);
}

/**
 * @param survey - Survey to inspect.
 * @returns True when at least one vote exists.
 */
export function surveyHasAnswers(survey: Survey): boolean {
  return survey.questions.some((question) => questionVoteTotal(question) > 0);
}

/**
 * @param survey - Survey to inspect.
 * @param now - Reference time, defaults to the current date.
 */
export function isSurveyPast(survey: Survey, now: Date = new Date()): boolean {
  return survey.endsAt ? new Date(survey.endsAt).getTime() < now.getTime() : false;
}

/**
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

/** @returns UUID string for local and published entities. */
export function createId(): string {
  return crypto.randomUUID();
}

/** @returns A new draft survey with one required question. */
export function emptyDraftSurvey(): DraftSurvey {
  return {
    title: '',
    description: '',
    category: '',
    endsAt: '',
    questions: [emptyDraftQuestion()],
  };
}

/** @returns A new draft question with two answer fields. */
export function emptyDraftQuestion(): DraftQuestion {
  return {
    id: createId(),
    text: '',
    allowMultiple: false,
    answers: [emptyDraftAnswer(), emptyDraftAnswer()],
  };
}

/** @returns A new draft answer. */
export function emptyDraftAnswer(): DraftAnswer {
  return { id: createId(), text: '' };
}
