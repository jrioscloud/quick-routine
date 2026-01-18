# Quick Routine

A React Native (Expo) app for family routine management with offline support and AI-powered routine suggestions.

## Tech Stack

- **Framework:** Expo (managed workflow)
- **Language:** TypeScript
- **State Management:** Zustand with AsyncStorage persistence
- **Backend:** Supabase (PostgreSQL, Auth, Row Level Security)
- **AI:** Claude API (claude-sonnet-4-20250514)
- **Navigation:** Expo Router

## Features

1. **Authentication** - Email/password signup and login via Supabase
2. **Family Management** - Create family, add children, manage routines
3. **Countdown Timer** - Works offline, survives backgrounding and crashes
4. **Session Recording** - Tracks routine completions with offline queue
5. **AI Suggestions** - Claude-powered routine generation
6. **Share Images** - Generate and share completion certificates

## Setup Instructions

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your phone
- Supabase account
- Anthropic API key

### 1. Clone and Install

```bash
git clone <repo-url>
cd quick-routine
npm install
```

### 2. Environment Variables

Create a `.env` file in the root:

```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_CLAUDE_API_KEY=your_claude_api_key
```

### 3. Supabase Setup

Run the SQL in `supabase/schema.sql` to create tables and RLS policies.

### 4. Run the App

```bash
npx expo start
```

Scan the QR code with Expo Go.

## Test Account

```
Email: test@quickroutine.app
Password: TestPassword123!
```

**Note:** New accounts automatically get starter data on signup:
- 1 child ("My Child", age 6)
- 1 routine ("Morning Routine" with 5 tasks)

The test account above may have additional data from testing.

**Supabase Project:** `xrmbjfmadlkqbaflhwgl`

## Architecture Decisions

### Offline Timer (ADR-003)
The timer uses timestamp math, not background tasks:
- Stores `startedAt` timestamp in persisted Zustand store
- Calculates elapsed time as `Date.now() - startedAt`
- Automatically survives backgrounding, offline, and crashes
- Pause/resume tracks `totalPausedTime` for accurate duration

### State Persistence (ADR-002)
Zustand with AsyncStorage ensures:
- Active session survives app close
- Offline queue persists until sync
- User doesn't lose progress

### Session Recovery
On app open, checks for `in_progress` sessions and prompts user to resume or abandon via modal in the app layout.

### Offline Sync Queue (ADR-004)
- Pending operations queued when offline
- Auto-flushes when connectivity returns (NetInfo listener)
- Retry with backoff for failed operations
- Visual indicator on home screen shows pending sync status

### Supabase Queries
- Uses `.maybeSingle()` instead of `.single()` to gracefully handle empty results
- RLS policies ensure users only access their own family's data

## Known Limitations

- Single child flow only (multiple children selector is UI-ready but not fully tested)
- Basic styling (functional over beautiful, per assessment guidance)
- Claude API called directly from app (production would use edge function)
- Share image uses react-native-view-shot which doesn't work on web (native only)

## What I'd Improve With More Time

1. **Lottie animations** - Confetti celebration on routine completion
2. **Haptic feedback** - Vibration on task completion for tactile confirmation
3. **Edge function for Claude** - Move API key server-side for security
4. **Unit tests** - Jest tests for stores and timer logic
5. **E2E tests** - Detox/Maestro for critical user flows
6. **Better error boundaries** - Graceful error states throughout app
7. **Streak tracking** - Show consecutive days completed

## Project Structure

```
quick-routine/
├── app/                  # Expo Router screens
├── components/           # Reusable UI components
├── store/               # Zustand stores
├── lib/                 # Utilities (supabase, claude, share)
├── types/               # TypeScript types
└── constants/           # App configuration
```

## License

Proprietary - Built as technical assessment for Footprint Labs
