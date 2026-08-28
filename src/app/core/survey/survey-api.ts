/**
 * @fileoverview Supabase queries and inserts for the survey READ/create/vote flow.
 */
import { SupabaseClient } from '@supabase/supabase-js';
import { Survey, createId } from './survey.model';

/** Nested select used by the published-survey READ process. */
export const SURVEY_READ_SELECT = `
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
`;

/** Loads published surveys with questions, options and votes. */
export function queryPublishedSurveys(client: SupabaseClient) {
  return client
    .from('surveys')
    .select(SURVEY_READ_SELECT)
    .eq('status', 'published')
    .order('created_at', { ascending: false });
}

/**
 * Inserts a published survey together with its questions and options.
 *
 * @param client - Configured Supabase client.
 * @param survey - Survey to persist remotely.
 * @returns False when the survey row could not be inserted.
 */
export async function insertRemoteSurvey(
  client: SupabaseClient,
  survey: Survey,
): Promise<boolean> {
  const { error } = await client.from('surveys').insert(toSurveyInsert(survey));
  if (error) {
    return false;
  }
  await client.from('questions').insert(questionInserts(survey));
  await client.from('options').insert(optionInserts(survey));
  return true;
}

/**
 * Stores votes for the selected options.
 *
 * @param client - Configured Supabase client.
 * @param optionIds - Option ids chosen by the participant.
 */
export async function insertRemoteVotes(
  client: SupabaseClient,
  optionIds: string[],
): Promise<void> {
  const rows = optionIds.map((optionId) => ({
    id: createId(),
    option_id: optionId,
  }));
  await client.from('votes').insert(rows);
}

/**
 * Refreshes local results whenever a remote vote changes.
 *
 * @param client - Configured Supabase client.
 * @param onChange - Callback that re-runs the READ process.
 */
export function subscribeToVoteChanges(
  client: SupabaseClient,
  onChange: () => void,
): void {
  client
    .channel('live-votes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, onChange)
    .subscribe();
}

function toSurveyInsert(survey: Survey) {
  return {
    id: survey.id,
    title: survey.title,
    description: survey.description || null,
    category: survey.category,
    status: survey.status,
    ends_at: survey.endsAt,
  };
}

function questionInserts(survey: Survey) {
  return survey.questions.map((question) => ({
    id: question.id,
    survey_id: survey.id,
    text: question.text,
    allow_multiple: question.allowMultiple,
    sort_order: question.sortOrder,
  }));
}

function optionInserts(survey: Survey) {
  return survey.questions.flatMap((question) =>
    question.options.map((option) => ({
      id: option.id,
      question_id: question.id,
      text: option.text,
      sort_order: option.sortOrder,
    })),
  );
}
