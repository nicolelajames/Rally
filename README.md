# Rally — Family Activity Command Center

A mobile-first web app for busy parents to track school events, permission slips, activities, and scheduling conflicts across their kids. Scan documents with AI, share a live feed with co-parents in real-time.

## Tech Stack

- React + Vite + TypeScript
- Tailwind CSS (mobile-first, 390px base)
- Supabase (auth, postgres, realtime, storage)
- Anthropic Claude API (document parsing)
- React Router v6, Lucide React

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase/schema.sql`
3. Create a **Storage bucket** called `documents` with public read access
4. Copy your project URL and anon key from **Settings > API**

### 3. Anthropic API key

Get an API key at [console.anthropic.com](https://console.anthropic.com)

### 4. Environment variables

Edit `.env.local` with your actual credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_ANTHROPIC_API_KEY=your_anthropic_key
```

### 5. Seed data (optional)

Run `supabase/seed.sql` in the Supabase SQL editor for demo data. You'll need to update the profile UUID to match your auth user after signing up.

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Features

- **Smart Feed** — Priority-sorted cards for action items, events, conflicts, and upcoming items
- **Document Scanner** — Take a photo of school papers; AI extracts dates, deadlines, and events
- **Co-Parent Sharing** — Share a 6-digit code; both parents see the same live feed
- **Real-time Sync** — Supabase Realtime updates the feed instantly when a co-parent makes changes
- **Calendar View** — Month view with color-coded dots per child
- **Kid Profiles** — Track each child with custom colors, school, and grade
# Rally
