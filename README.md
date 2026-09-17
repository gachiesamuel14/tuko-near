# Tuko Near

Location-based dating for Kenya. Discover people nearby by county, distance, and vibe.

## Live

Connect this repo to Netlify. Static files in the repo root.

## Features (demo)

- Registration / login (local demo accounts)
- Profile setup with photos, bio, county, interests
- Browser GPS for nearby
- Discover / swipe with county + age filters
- Matches list
- Chat (local, instant)
- Report / safety
- Premium teaser (Boost, Super Like, M-Pesa)

## Stack

- Frontend: HTML, CSS, vanilla JS (no build step)
- Hosting: Netlify
- Source: GitHub

## Going to production

Replace localStorage with:

- Auth + DB: Supabase (Postgres + Auth + Realtime + Storage)
- Payments: M-Pesa Daraja API or Pesapal
- Maps: Mapbox or Google Maps
- Push: OneSignal or FCM

## Local

Open `index.html` or:

```bash
npx serve .
```
