/**
 * @fileoverview Category values used by the filter dropdown and the create-survey form.
 */

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
