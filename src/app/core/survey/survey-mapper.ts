/**
 * @fileoverview Maps Supabase rows and create-survey drafts onto UI models.
 */
import {
  DraftAnswer,
  DraftQuestion,
  DraftSurvey,
  Survey,
  SurveyOption,
  SurveyQuestion,
  createId,
  daysUntil,
} from './survey.model';

/** Row shape returned by the nested Supabase READ query. */
export interface SurveyRow {
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
export interface QuestionRow {
  id: string;
  text: string;
  allow_multiple: boolean;
  sort_order: number;
  options: OptionRow[] | null;
}

/** Nested option row from Supabase, including vote ids. */
export interface OptionRow {
  id: string;
  text: string;
  sort_order: number;
  votes: { id: string }[] | null;
}

/**
 * @param a - First survey.
 * @param b - Second survey.
 * @returns Negative when `a` ends sooner.
 */
export function sortByEndDateAsc(a: Survey, b: Survey): number {
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
export function sortByEndDateDesc(a: Survey, b: Survey): number {
  return sortByEndDateAsc(b, a);
}

/**
 * @param survey - Survey to inspect.
 * @param endingSoonDays - Inclusive window in days.
 */
export function isEndingSoon(survey: Survey, endingSoonDays: number): boolean {
  const days = daysUntil(survey.endsAt);
  return days !== null && days >= 0 && days <= endingSoonDays;
}

/**
 * Maps a nested Supabase READ row onto the UI survey model.
 *
 * @param row - Database row with nested questions and options.
 */
export function mapSurveyRow(row: SurveyRow): Survey {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    category: row.category,
    status: row.status,
    endsAt: row.ends_at,
    createdAt: row.created_at,
    questions: mapQuestionRows(row.questions ?? []),
  };
}

/**
 * Converts a create-survey draft into a published survey entity.
 *
 * @param draft - Validated overlay form.
 */
export function mapDraftToSurvey(draft: DraftSurvey): Survey {
  return {
    id: createId(),
    title: draft.title.trim(),
    description: draft.description.trim(),
    category: draft.category,
    status: 'published',
    endsAt: endDateToIso(draft.endsAt),
    createdAt: new Date().toISOString(),
    questions: mapDraftQuestions(draft.questions),
  };
}

function mapQuestionRows(rows: QuestionRow[]): SurveyQuestion[] {
  return rows
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(mapQuestionRow);
}

function mapQuestionRow(question: QuestionRow): SurveyQuestion {
  return {
    id: question.id,
    text: question.text,
    allowMultiple: question.allow_multiple,
    sortOrder: question.sort_order,
    options: mapOptionRows(question.options ?? []),
  };
}

function mapOptionRows(rows: OptionRow[]): SurveyOption[] {
  return rows
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(mapOptionRow);
}

function mapOptionRow(option: OptionRow): SurveyOption {
  return {
    id: option.id,
    text: option.text,
    sortOrder: option.sort_order,
    votes: option.votes ?? [],
  };
}

function mapDraftQuestions(questions: DraftQuestion[]): SurveyQuestion[] {
  return questions
    .filter((question) => question.text.trim())
    .map((question, index) => mapDraftQuestion(question, index));
}

function mapDraftQuestion(question: DraftQuestion, sortOrder: number): SurveyQuestion {
  return {
    id: question.id,
    text: question.text.trim(),
    allowMultiple: question.allowMultiple,
    sortOrder,
    options: mapDraftAnswers(question.answers),
  };
}

function mapDraftAnswers(answers: DraftAnswer[]): SurveyOption[] {
  return answers
    .filter((answer) => answer.text.trim())
    .map((answer, index) => ({
      id: answer.id,
      text: answer.text.trim(),
      sortOrder: index,
      votes: [],
    }));
}

function endDateToIso(endsAt: string): string | null {
  return endsAt ? new Date(`${endsAt}T18:00:00`).toISOString() : null;
}
