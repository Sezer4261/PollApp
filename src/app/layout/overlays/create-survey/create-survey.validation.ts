/**
 * @fileoverview Validation helpers for the create-survey overlay.
 */
import { DraftQuestion, DraftSurvey } from '../../../core/survey/survey.model';

/** Message shown when the survey name is still empty. */
export const TITLE_REQUIRED = 'Survey name is required.';
/** Message shown when no category was picked. */
export const CATEGORY_REQUIRED = 'Please choose a category.';
/** Message shown for a question without text. */
export const QUESTION_TEXT_REQUIRED = 'Please enter the question.';
/** Message shown when a question has fewer than two filled answers. */
export const ANSWERS_REQUIRED = 'Please enter at least two answers.';

/**
 * @param draft - Current form values.
 * @returns Validation messages for every required field that is still empty.
 */
export function validateDraftSurvey(draft: DraftSurvey): string[] {
  return [...validateSurveyFields(draft), ...validateDraftQuestions(draft.questions)];
}

/**
 * @param question - Question to check.
 * @returns True when the question text is missing.
 */
export function isQuestionTextMissing(question: DraftQuestion): boolean {
  return !question.text.trim();
}

/**
 * Every question needs two real options, so blank rows do not count.
 *
 * @param question - Question to check.
 * @returns True when fewer than two answers carry text.
 */
export function areAnswersMissing(question: DraftQuestion): boolean {
  return question.answers.filter((answer) => answer.text.trim()).length < 2;
}

function validateSurveyFields(draft: DraftSurvey): string[] {
  const issues: string[] = [];
  if (!draft.title.trim()) {
    issues.push(TITLE_REQUIRED);
  }
  if (!draft.category) {
    issues.push(CATEGORY_REQUIRED);
  }
  return issues;
}

/// Every question block counts, including ones the user added and left empty:
/// silently dropping them would publish a survey the user did not expect.
function validateDraftQuestions(questions: DraftQuestion[]): string[] {
  return questions.flatMap((question, index) => validateQuestion(question, index));
}

function validateQuestion(question: DraftQuestion, index: number): string[] {
  const issues: string[] = [];
  const label = `Question ${index + 1}`;
  if (isQuestionTextMissing(question)) {
    issues.push(`${label}: ${QUESTION_TEXT_REQUIRED}`);
  }
  if (areAnswersMissing(question)) {
    issues.push(`${label}: ${ANSWERS_REQUIRED}`);
  }
  return issues;
}
