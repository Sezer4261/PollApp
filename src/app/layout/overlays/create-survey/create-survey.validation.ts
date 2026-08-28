/**
 * @fileoverview Validation helpers for the create-survey overlay.
 */
import { DraftQuestion, DraftSurvey } from '../../../core/survey/survey.model';

/**
 * @param draft - Current form values.
 * @returns Validation messages for required fields.
 */
export function validateDraftSurvey(draft: DraftSurvey): string[] {
  return [...validateSurveyFields(draft), ...validateDraftQuestions(draft.questions)];
}

function validateSurveyFields(draft: DraftSurvey): string[] {
  const issues: string[] = [];
  if (!draft.title.trim()) {
    issues.push('Survey name is required.');
  }
  if (!draft.category) {
    issues.push('Please choose a category.');
  }
  return issues;
}

function validateDraftQuestions(questions: DraftQuestion[]): string[] {
  const filled = questions.filter((question) => question.text.trim());
  if (filled.length === 0) {
    return ['Add at least one question.'];
  }
  return filled.flatMap(validateQuestionAnswers);
}

function validateQuestionAnswers(question: DraftQuestion): string[] {
  const answers = question.answers.filter((answer) => answer.text.trim());
  if (answers.length >= 2) {
    return [];
  }
  return [`“${question.text.trim()}” needs at least two answer options.`];
}
