/**
 * @fileoverview Local demo surveys, including ending-soon, active and past items.
 */
import { createId, Survey } from '../models/survey.model';

/**
 * Builds a list of fake votes used by the seed data.
 *
 * @param count - How many vote objects to create.
 * @param prefix - Id prefix so votes stay unique.
 */
function votes(count: number, prefix: string) {
  return Array.from({ length: count }, (_, index) => ({ id: `${prefix}-${index}` }));
}

/**
 * @param days - Offset from `now`. Negative values create past deadlines.
 * @param now - Reference date.
 * @returns ISO timestamp.
 */
function atDaysFromNow(days: number, now: Date): string {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  date.setHours(23, 59, 0, 0);
  return date.toISOString();
}

/**
 * Builds the demo catalog used when Supabase is not configured.
 *
 * @param now - Reference date so "Ends in 1 Day" stays correct.
 */
export function createSeedSurveys(now: Date = new Date()): Survey[] {
  return [
    {
      id: 'survey-team-event',
      title: "Let's Plan the Next Team Event Together",
      description:
        'Help us pick a date, activities and the right vibe for our next team event. Your answers will shape a day that actually feels fun for everyone.',
      category: 'Team activities',
      status: 'published',
      endsAt: atDaysFromNow(1, now),
      createdAt: atDaysFromNow(-12, now),
      questions: [
        {
          id: 'q-team-1',
          text: 'Which date would work best for you?',
          allowMultiple: true,
          sortOrder: 0,
          options: [
            { id: 'o-team-1a', text: '04.09.2026, Friday', sortOrder: 0, votes: votes(27, 'v-t1a') },
            { id: 'o-team-1b', text: '11.09.2026, Friday', sortOrder: 1, votes: votes(42, 'v-t1b') },
            { id: 'o-team-1c', text: '18.09.2026, Friday', sortOrder: 2, votes: votes(6, 'v-t1c') },
            { id: 'o-team-1d', text: '25.09.2026, Friday', sortOrder: 3, votes: votes(25, 'v-t1d') },
          ],
        },
        {
          id: 'q-team-2',
          text: 'Choose the activities you prefer',
          allowMultiple: true,
          sortOrder: 1,
          options: [
            { id: 'o-team-2a', text: 'Escape Room', sortOrder: 0, votes: votes(31, 'v-t2a') },
            { id: 'o-team-2b', text: 'Bowling', sortOrder: 1, votes: votes(22, 'v-t2b') },
            { id: 'o-team-2c', text: 'Cooking Class', sortOrder: 2, votes: votes(18, 'v-t2c') },
            { id: 'o-team-2d', text: 'Mini Golf', sortOrder: 3, votes: votes(9, 'v-t2d') },
            { id: 'o-team-2e', text: 'Picnic in the Park', sortOrder: 4, votes: votes(20, 'v-t2e') },
          ],
        },
        {
          id: 'q-team-3',
          text: "What's most important to you in a team event?",
          allowMultiple: true,
          sortOrder: 2,
          options: [
            { id: 'o-team-3a', text: 'Fun & Games', sortOrder: 0, votes: votes(36, 'v-t3a') },
            { id: 'o-team-3b', text: 'Good Food', sortOrder: 1, votes: votes(28, 'v-t3b') },
            { id: 'o-team-3c', text: 'Time to Talk', sortOrder: 2, votes: votes(21, 'v-t3c') },
            { id: 'o-team-3d', text: 'Something New', sortOrder: 3, votes: votes(15, 'v-t3d') },
          ],
        },
        {
          id: 'q-team-4',
          text: 'How long would you prefer the event to last?',
          allowMultiple: false,
          sortOrder: 3,
          options: [
            { id: 'o-team-4a', text: '2 hours', sortOrder: 0, votes: votes(19, 'v-t4a') },
            { id: 'o-team-4b', text: 'Half a day', sortOrder: 1, votes: votes(44, 'v-t4b') },
            { id: 'o-team-4c', text: 'Full day', sortOrder: 2, votes: votes(17, 'v-t4c') },
          ],
        },
      ],
    },
    {
      id: 'survey-wellness',
      title: 'Fit & wellness survey!',
      description: 'A quick pulse check so we can support energy, focus and balance in the team.',
      category: 'Health & Wellness',
      status: 'published',
      endsAt: atDaysFromNow(2, now),
      createdAt: atDaysFromNow(-6, now),
      questions: [
        {
          id: 'q-well-1',
          text: 'How is your energy this week?',
          allowMultiple: false,
          sortOrder: 0,
          options: [
            { id: 'o-well-1a', text: 'Fully charged', sortOrder: 0, votes: votes(8, 'v-w1a') },
            { id: 'o-well-1b', text: 'Doing okay', sortOrder: 1, votes: votes(14, 'v-w1b') },
            { id: 'o-well-1c', text: 'A bit drained', sortOrder: 2, votes: votes(11, 'v-w1c') },
            { id: 'o-well-1d', text: 'Need a reset', sortOrder: 3, votes: votes(4, 'v-w1d') },
          ],
        },
        {
          id: 'q-well-2',
          text: 'Which support would help most?',
          allowMultiple: true,
          sortOrder: 1,
          options: [
            { id: 'o-well-2a', text: 'Walking meetings', sortOrder: 0, votes: votes(9, 'v-w2a') },
            { id: 'o-well-2b', text: 'Focus-free Friday afternoon', sortOrder: 1, votes: votes(16, 'v-w2b') },
            { id: 'o-well-2c', text: 'Stretch break reminders', sortOrder: 2, votes: votes(7, 'v-w2c') },
          ],
        },
      ],
    },
    {
      id: 'survey-game-night',
      title: 'Gaming habits and favorite games!',
      description: 'Vote for the games we should put on the table this Friday.',
      category: 'Gaming & Entertainment',
      status: 'published',
      endsAt: atDaysFromNow(3, now),
      createdAt: atDaysFromNow(-4, now),
      questions: [
        {
          id: 'q-game-1',
          text: 'Which game should we start with?',
          allowMultiple: false,
          sortOrder: 0,
          options: [
            { id: 'o-game-1a', text: 'Catan', sortOrder: 0, votes: votes(5, 'v-g1a') },
            { id: 'o-game-1b', text: 'Codenames', sortOrder: 1, votes: votes(9, 'v-g1b') },
            { id: 'o-game-1c', text: 'Mario Kart', sortOrder: 2, votes: votes(12, 'v-g1c') },
            { id: 'o-game-1d', text: 'Jackbox Party Pack', sortOrder: 3, votes: votes(7, 'v-g1d') },
          ],
        },
      ],
    },
    {
      id: 'survey-lunch',
      title: 'Lunch Menu Vote',
      description: 'Tell us what should land on the shared lunch menu next week.',
      category: 'Food & Drinks',
      status: 'published',
      endsAt: atDaysFromNow(8, now),
      createdAt: atDaysFromNow(-2, now),
      questions: [
        {
          id: 'q-lunch-1',
          text: 'Pick your favorite lunch style',
          allowMultiple: true,
          sortOrder: 0,
          options: [
            { id: 'o-lunch-1a', text: 'Bowls', sortOrder: 0, votes: [] },
            { id: 'o-lunch-1b', text: 'Pasta', sortOrder: 1, votes: [] },
            { id: 'o-lunch-1c', text: 'Wraps', sortOrder: 2, votes: [] },
            { id: 'o-lunch-1d', text: 'Salad bar', sortOrder: 3, votes: [] },
          ],
        },
      ],
    },
    {
      id: 'survey-playlist',
      title: 'Office Playlist of the Month',
      description: 'Help us build a playlist that everyone can actually work to.',
      category: 'Office & Workplace',
      status: 'published',
      endsAt: atDaysFromNow(12, now),
      createdAt: atDaysFromNow(-1, now),
      questions: [
        {
          id: 'q-play-1',
          text: 'What should the office sound like?',
          allowMultiple: false,
          sortOrder: 0,
          options: [
            { id: 'o-play-1a', text: 'Lo-fi beats', sortOrder: 0, votes: votes(3, 'v-p1a') },
            { id: 'o-play-1b', text: 'Indie pop', sortOrder: 1, votes: votes(2, 'v-p1b') },
            { id: 'o-play-1c', text: 'Classical focus', sortOrder: 2, votes: votes(4, 'v-p1c') },
            { id: 'o-play-1d', text: 'Silence preferred', sortOrder: 3, votes: votes(1, 'v-p1d') },
          ],
        },
      ],
    },
    {
      id: 'survey-learning',
      title: 'Learning Friday Topics',
      description: 'Choose the skills we should spend our next Learning Friday on.',
      category: 'Learning & Development',
      status: 'published',
      endsAt: atDaysFromNow(14, now),
      createdAt: atDaysFromNow(-8, now),
      questions: [
        {
          id: 'q-learn-1',
          text: 'Which topic should we dive into?',
          allowMultiple: true,
          sortOrder: 0,
          options: [
            { id: 'o-learn-1a', text: 'Angular Signals', sortOrder: 0, votes: votes(10, 'v-l1a') },
            { id: 'o-learn-1b', text: 'Supabase Realtime', sortOrder: 1, votes: votes(8, 'v-l1b') },
            { id: 'o-learn-1c', text: 'UX writing', sortOrder: 2, votes: votes(5, 'v-l1c') },
          ],
        },
      ],
    },
    {
      id: 'survey-offsite',
      title: 'Summer Offsite Destination',
      description: 'Where should we go for the summer offsite?',
      category: 'Team activities',
      status: 'published',
      endsAt: atDaysFromNow(20, now),
      createdAt: atDaysFromNow(-3, now),
      questions: [
        {
          id: 'q-off-1',
          text: 'Pick a destination',
          allowMultiple: false,
          sortOrder: 0,
          options: [
            { id: 'o-off-1a', text: 'Lakeside cabin', sortOrder: 0, votes: votes(6, 'v-o1a') },
            { id: 'o-off-1b', text: 'City loft', sortOrder: 1, votes: votes(4, 'v-o1b') },
            { id: 'o-off-1c', text: 'Mountain lodge', sortOrder: 2, votes: votes(7, 'v-o1c') },
          ],
        },
      ],
    },
    {
      id: 'survey-christmas',
      title: 'Christmas Party Theme',
      description: 'This one already closed — use it to test past surveys.',
      category: 'Team activities',
      status: 'published',
      endsAt: atDaysFromNow(-40, now),
      createdAt: atDaysFromNow(-55, now),
      questions: [
        {
          id: 'q-xmas-1',
          text: 'Which theme should we go for?',
          allowMultiple: false,
          sortOrder: 0,
          options: [
            { id: 'o-xmas-1a', text: 'Ugly sweater', sortOrder: 0, votes: votes(22, 'v-x1a') },
            { id: 'o-xmas-1b', text: 'Masquerade', sortOrder: 1, votes: votes(14, 'v-x1b') },
            { id: 'o-xmas-1c', text: 'Cozy movie night', sortOrder: 2, votes: votes(18, 'v-x1c') },
          ],
        },
      ],
    },
    {
      id: 'survey-coffee',
      title: 'Best Coffee Brand for the Kitchen',
      description: 'A closed poll from last month.',
      category: 'Food & Drinks',
      status: 'published',
      endsAt: atDaysFromNow(-18, now),
      createdAt: atDaysFromNow(-30, now),
      questions: [
        {
          id: 'q-coffee-1',
          text: 'Which coffee should we stock?',
          allowMultiple: false,
          sortOrder: 0,
          options: [
            { id: 'o-coffee-1a', text: 'Espresso roast', sortOrder: 0, votes: votes(16, 'v-c1a') },
            { id: 'o-coffee-1b', text: 'House blend', sortOrder: 1, votes: votes(21, 'v-c1b') },
            { id: 'o-coffee-1c', text: 'Decaf option', sortOrder: 2, votes: votes(7, 'v-c1c') },
          ],
        },
      ],
    },
    {
      id: 'survey-hackathon',
      title: 'Q1 Hackathon Track',
      description: 'Ended last month — results stay visible, voting is locked.',
      category: 'Learning & Development',
      status: 'published',
      endsAt: atDaysFromNow(-28, now),
      createdAt: atDaysFromNow(-45, now),
      questions: [
        {
          id: 'q-hack-1',
          text: 'Which track should we run?',
          allowMultiple: false,
          sortOrder: 0,
          options: [
            { id: 'o-hack-1a', text: 'AI tools', sortOrder: 0, votes: votes(19, 'v-h1a') },
            { id: 'o-hack-1b', text: 'Internal DX', sortOrder: 1, votes: votes(13, 'v-h1b') },
            { id: 'o-hack-1c', text: 'Sustainability', sortOrder: 2, votes: votes(8, 'v-h1c') },
          ],
        },
      ],
    },
    {
      id: 'survey-desk',
      title: 'Desk Setup Poll',
      description: 'A past workplace poll for testing the Past survey tab.',
      category: 'Office & Workplace',
      status: 'published',
      endsAt: atDaysFromNow(-10, now),
      createdAt: atDaysFromNow(-20, now),
      questions: [
        {
          id: 'q-desk-1',
          text: 'What should we upgrade first?',
          allowMultiple: true,
          sortOrder: 0,
          options: [
            { id: 'o-desk-1a', text: 'Monitors', sortOrder: 0, votes: votes(11, 'v-d1a') },
            { id: 'o-desk-1b', text: 'Chairs', sortOrder: 1, votes: votes(17, 'v-d1b') },
            { id: 'o-desk-1c', text: 'Desklights', sortOrder: 2, votes: votes(6, 'v-d1c') },
          ],
        },
      ],
    },
  ];
}

/**
 * Deep-copies seed surveys so local edits cannot mutate the template.
 *
 * @param surveys - Surveys to clone.
 */
export function cloneSurveys(surveys: Survey[]): Survey[] {
  return JSON.parse(JSON.stringify(surveys)) as Survey[];
}

/**
 * @returns A new vote id.
 */
export function newVoteId(): string {
  return createId();
}
