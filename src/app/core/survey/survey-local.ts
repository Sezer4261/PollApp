/**
 * @fileoverview localStorage cache for surveys and completed votes.
 */
import { cloneSurveys, createSeedSurveys } from './seed-surveys';
import {
  Survey,
  SurveyQuestion,
  createId,
} from './survey.model';

/** localStorage key for the survey cache. */
const LOCAL_DB_KEY = 'poll-app.surveys.v3';
/** localStorage key for surveys this browser already completed. */
const LOCAL_VOTES_KEY = 'poll-app.completed-surveys';

/** Reads surveys from localStorage or writes the seed data on first use. */
export function readLocalSurveys(): Survey[] {
  const raw = localStorage.getItem(LOCAL_DB_KEY);
  if (!raw) {
    const seeded = cloneSurveys(createSeedSurveys());
    writeLocalSurveys(seeded);
    return seeded;
  }
  return parseSurveys(raw);
}

/**
 * @param surveys - Snapshot to persist locally.
 */
export function writeLocalSurveys(surveys: Survey[]): void {
  localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(surveys));
}

/** @returns Survey ids already completed in this browser. */
export function readCompletedIds(): string[] {
  const raw = localStorage.getItem(LOCAL_VOTES_KEY);
  return raw ? parseIdList(raw) : [];
}

/**
 * @param ids - Survey ids that can no longer be submitted in this browser.
 */
export function writeCompletedIds(ids: string[]): void {
  localStorage.setItem(LOCAL_VOTES_KEY, JSON.stringify(ids));
}

/**
 * Applies selected option votes to a local survey snapshot.
 *
 * @param surveys - Current local catalog.
 * @param surveyId - Survey that received votes.
 * @param selectedOptionIds - Option ids chosen by the participant.
 */
export function applyLocalVotes(
  surveys: Survey[],
  surveyId: string,
  selectedOptionIds: string[],
): Survey[] {
  return surveys.map((survey) =>
    survey.id === surveyId ? withVotes(survey, selectedOptionIds) : survey,
  );
}

function parseSurveys(raw: string): Survey[] {
  try {
    return JSON.parse(raw) as Survey[];
  } catch {
    return cloneSurveys(createSeedSurveys());
  }
}

function parseIdList(raw: string): string[] {
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function withVotes(survey: Survey, selectedOptionIds: string[]): Survey {
  return {
    ...survey,
    questions: survey.questions.map((question) =>
      withQuestionVotes(question, selectedOptionIds),
    ),
  };
}

function withQuestionVotes(
  question: SurveyQuestion,
  selectedOptionIds: string[],
): SurveyQuestion {
  return {
    ...question,
    options: question.options.map((option) =>
      selectedOptionIds.includes(option.id)
        ? { ...option, votes: [...option.votes, { id: createId() }] }
        : option,
    ),
  };
}
