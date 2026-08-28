# Poll App

Angular 21 survey app with Signals, routing, custom pipes, overlays and a Supabase-ready READ process.

## Start

```bash
npm install
npm start
```

Then open `http://127.0.0.1:4200`.

The app runs with local seed data out of the box, including active surveys, ending-soon surveys and past surveys.

## Build / Upload

```bash
npm run build
```

Upload the contents of `dist/poll-app/browser`. That folder contains the production `index.html`, JS, CSS, fonts and favicon.


## Supabase (optional)

1. Run `supabase/schema.sql` in the SQL editor.
2. Put the project URL and anon key into `src/environments/environment.ts`.
3. Restart `npm start`.

If Supabase is not configured, the same READ / create / vote flow uses localStorage.

## Checklist extras

- Create-survey is an overlay, not a route.
- Question 1 can only be cleared; later questions can be removed.
- Live results update after voting (and via Supabase realtime when connected).
- Hero floating icons animate on desktop hover only.
