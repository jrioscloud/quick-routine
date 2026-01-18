# Quick Routine - Paid Technical Assessment

## Project Context

**Client:** Matt Sherry / Footprint Labs
**App:** One. Two. Done. (Family Productivity App)
**Assessment:** "Quick Routine" - mini version of the app
**Compensation:** $250 upon completion
**Deadline:** 72 hours from Jan 17, 2026 (~Jan 20, 2026)
**Submission:** GitHub repo + Loom video (15-20 min)

**Post-Assessment Opportunity:**
- Rate: $70-90/hr
- Duration: 12-week contract
- Hours: 20-30 hrs/week
- Potential: $21,000 - $32,400

---

## Files to Keep in Sync

When asked to update logs/docs, use these exact paths:

| File | Path | Purpose |
|------|------|---------|
| **Activity Log** | `/Volumes/Chocoflan/Documents/FN_Upwork_unlocked/clients/Matt_Sherry_Footprint_Labs/activity_log.md` | Time tracking, daily progress, status updates |
| **ADR** | `/Volumes/Chocoflan/Documents/FN_Upwork_unlocked/clients/Matt_Sherry_Footprint_Labs/development/ADR.md` | Architecture Decision Records |
| **Implementation Plan** | `/Volumes/Chocoflan/Documents/FN_Upwork_unlocked/clients/Matt_Sherry_Footprint_Labs/development/IMPLEMENTATION_PLANNING.md` | Current phase, blockers, next steps |
| **Project Plan** | `/Volumes/Chocoflan/Documents/FN_Upwork_unlocked/clients/Matt_Sherry_Footprint_Labs/development/PROJECT_PLAN.md` | Full project plan with phases |
| **Contract Scope** | `/Volumes/Chocoflan/Documents/FN_Upwork_unlocked/clients/Matt_Sherry_Footprint_Labs/contract_scope.md` | What's in/out of scope |
| **Upwork Chat** | `/Volumes/Chocoflan/Documents/FN_Upwork_unlocked/clients/Matt_Sherry_Footprint_Labs/upwork_chat.md` | Client communication history |

**Common update requests:**
- "update activity log" → Add time entry + progress to `activity_log.md`
- "update ADR" → Add/modify decision record in `development/ADR.md`
- "update implementation planning" → Update current status in `development/IMPLEMENTATION_PLANNING.md`

---

## Playwright MCP - Browser Automation

Use Playwright MCP for:
- Testing Supabase dashboard (RLS, tables, auth)
- Viewing Expo web version
- Debugging API responses
- Taking screenshots for documentation

### Available Commands

| Tool | Purpose |
|------|---------|
| `mcp__playwright__browser_navigate` | Go to URL |
| `mcp__playwright__browser_snapshot` | Get page accessibility tree (better than screenshot for actions) |
| `mcp__playwright__browser_take_screenshot` | Capture visual screenshot |
| `mcp__playwright__browser_click` | Click element by ref |
| `mcp__playwright__browser_type` | Type into input |
| `mcp__playwright__browser_fill_form` | Fill multiple form fields |
| `mcp__playwright__browser_evaluate` | Run JS in browser |

### Common Workflows

**Test Supabase Dashboard:**
```
1. Navigate to https://supabase.com/dashboard
2. Take snapshot to see current state
3. Navigate to project → Table Editor → Verify tables
4. Navigate to Authentication → Verify policies
```

**Test Supabase RLS:**
```
1. Navigate to SQL Editor in Supabase dashboard
2. Run test queries as authenticated user
3. Verify RLS blocks unauthorized access
```

**Capture Screenshots for Loom:**
```
1. Navigate to relevant page
2. Use browser_take_screenshot with descriptive filename
3. Screenshots saved for video walkthrough reference
```

**Test Expo Web (if applicable):**
```
1. Run `npx expo start --web`
2. Navigate to localhost:8081
3. Take snapshots of each screen
4. Test interactions
```

### Example Usage

```
"use playwright to check supabase tables"
→ Navigate to Supabase dashboard, snapshot Table Editor

"screenshot the RLS policies"
→ Navigate to Auth policies, take screenshot

"test the login flow in browser"
→ Navigate to app, fill login form, verify redirect
```

---

## Context7 MCP - Documentation Lookup

Use Context7 MCP to fetch up-to-date documentation for any library.

### Available Libraries (Pre-resolved)

| Library | Context7 ID | Snippets |
|---------|-------------|----------|
| React Native | `/websites/reactnative_dev` | 10,536 |
| Supabase JS | `/supabase/supabase-js` | 491 |
| Expo | `/llmstxt/expo_dev_llms_txt` | 7,050 |
| Zustand | `/websites/zustand_pmnd_rs` | 725 |
| Claude API | `/websites/platform_claude_en_api` | 1,217 |
| gluestack-ui | `/gluestack/gluestack-ui` | 844 |
| Lottie React Native | `/lottie-react-native/lottie-react-native` | 49 |

### Usage

```
"look up expo background tasks"
→ mcp__context7__query-docs with libraryId="/llmstxt/expo_dev_llms_txt"

"how does supabase RLS work"
→ mcp__context7__query-docs with libraryId="/supabase/supabase-js"

"zustand persist middleware"
→ mcp__context7__query-docs with libraryId="/websites/zustand_pmnd_rs"

"gluestack button component"
→ mcp__context7__query-docs with libraryId="/gluestack/gluestack-ui"

"lottie animation in react native"
→ mcp__context7__query-docs with libraryId="/lottie-react-native/lottie-react-native"
```

### When to Use

- Unsure about API syntax → Query Context7
- Need code examples → Query Context7
- Checking best practices → Query Context7
- Debugging library issues → Query Context7

---

## What We're Building

A React Native (Expo) app with:
1. **Auth and Family Setup** (Supabase)
2. **Countdown Timer with Offline Support** (React Native)
3. **Task Completion and Session Recording** (Supabase)
4. **AI-Powered Routine Suggestion** (Claude API)
5. **Share Image Generation** (React Native)

---

## Grading Rubric

| Component | Weight | What They Look For |
|-----------|--------|-------------------|
| Supabase Setup | 20% | Correct schema, working RLS, clean auth flow |
| React Native App | 30% | Clean code, TypeScript, offline timer, good UX |
| Session Recording | 15% | Accurate data, offline queue, edge case handling |
| AI Integration | 20% | Working Claude call, good prompt, robust parsing |
| Share Image | 15% | Generates correctly, looks decent, share works |

**Bonus:** Clean code, good error handling, thoughtful UI, clear docs
**Deductions:** TypeScript `any`, console errors, missing features, poor organization

---

## Database Schema (MUST MATCH EXACTLY)

```sql
-- families
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- children
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families NOT NULL,
  name TEXT NOT NULL,
  age INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- routines
CREATE TABLE routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families NOT NULL,
  name TEXT NOT NULL,
  routine_type TEXT NOT NULL, -- morning, evening, homework, custom
  created_at TIMESTAMPTZ DEFAULT now()
);

-- tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID REFERENCES routines NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL, -- emoji
  points INT NOT NULL DEFAULT 10,
  sort_order INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children NOT NULL,
  routine_id UUID REFERENCES routines NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  duration_seconds INT,
  points_earned INT,
  status TEXT NOT NULL DEFAULT 'in_progress', -- in_progress, completed, abandoned
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## RLS Policies (CRITICAL)

```sql
-- Enable RLS on all tables
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- families: user can only see their own
CREATE POLICY "Users manage own family" ON families
  FOR ALL USING (auth.uid() = user_id);

-- children: through family_id
CREATE POLICY "Users manage own children" ON children
  FOR ALL USING (family_id IN (SELECT id FROM families WHERE user_id = auth.uid()));

-- routines: through family_id
CREATE POLICY "Users manage own routines" ON routines
  FOR ALL USING (family_id IN (SELECT id FROM families WHERE user_id = auth.uid()));

-- tasks: through routine -> family
CREATE POLICY "Users manage own tasks" ON tasks
  FOR ALL USING (routine_id IN (
    SELECT id FROM routines WHERE family_id IN (
      SELECT id FROM families WHERE user_id = auth.uid()
    )
  ));

-- sessions: through child -> family
CREATE POLICY "Users manage own sessions" ON sessions
  FOR ALL USING (child_id IN (
    SELECT id FROM children WHERE family_id IN (
      SELECT id FROM families WHERE user_id = auth.uid()
    )
  ));
```

---

## Architecture Decisions

### ADR-001: Expo Managed Workflow
No native code needed. All features achievable with JS/TS + Expo SDK.

### ADR-002: Zustand + AsyncStorage
Required by assessment. Use persist middleware for offline state.

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const useSessionStore = create(
  persist(
    (set, get) => ({
      // state and actions
    }),
    {
      name: 'session-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
```

### ADR-003: Timer Strategy (CRITICAL)
**DO NOT use background tasks or intervals for the timer.**

The timer works by:
1. Store `startedAt: number` timestamp when routine begins
2. On each render, calculate `elapsed = Date.now() - startedAt`
3. Use `useEffect` with `setInterval` just for UI updates (1 second tick)
4. The ACTUAL elapsed time survives backgrounding/crashes because it's timestamp math

```typescript
// Timer calculation - always accurate
const getElapsedSeconds = () => {
  if (!startedAt) return 0
  return Math.floor((Date.now() - startedAt) / 1000)
}

// 5 minute timer = 300 seconds
const getRemainingSeconds = () => {
  const elapsed = getElapsedSeconds()
  return Math.max(0, 300 - elapsed)
}
```

### ADR-004: Offline Sync Queue
Store pending operations in Zustand. Flush on connectivity restore.

```typescript
interface SyncQueue {
  pendingOps: Array<{
    type: 'complete_session' | 'abandon_session'
    payload: SessionUpdate
    timestamp: number
  }>
}

// On app start or connectivity restore
const flushQueue = async () => {
  const { pendingOps } = get()
  for (const op of pendingOps) {
    await supabase.from('sessions').update(op.payload)
  }
  set({ pendingOps: [] })
}
```

### ADR-005: Claude API Integration
Direct REST call from app. Model: `claude-sonnet-4-20250514`

```typescript
const SYSTEM_PROMPT = `You are a child development expert helping parents create routines.

When given a description, create a routine with 4-6 age-appropriate tasks.

Respond in this exact JSON format:
{
  "routineName": "string",
  "routineType": "morning" | "evening" | "homework" | "custom",
  "explanation": "Brief 1-2 sentence explanation",
  "tasks": [
    { "name": "Task name", "icon": "emoji", "points": 5-20 }
  ]
}

Guidelines:
- Short, action-oriented task names (3-5 words)
- Positive, encouraging language
- Points reflect effort (harder = more)
- Total routine: 5-15 minutes
- Consider child's age if mentioned`
```

### ADR-006: Share Image
Use `react-native-view-shot` to capture a styled View, then `expo-sharing` to share.

**Required content:**
- Child name
- Routine name
- Completion time (e.g., "4:32")
- Points earned
- **"One. Two. Done." branding at bottom**

### ADR-007: UI Components - gluestack-ui v2
Pre-built accessible components to speed up development.

**Usage:**
- Form inputs (login, signup, routine suggestion)
- Buttons, modals, toasts for user feedback
- Cards for routine list
- Progress indicators

### ADR-008: Animations - Lottie
High-quality animations without complex code.

**Usage:**
- **Celebration screen**: Confetti/success animation
- **Loading states**: While fetching data or Claude API
- **Timer completion**: Animation when timer hits zero

**Animation files:** Store in `assets/animations/`

---

## Screen Requirements

### Screen 1: Login/Signup
- Email/password auth via Supabase
- On signup, create family record
- Navigate to home on success

### Screen 2: Home
- Display family name
- Child selector (if multiple)
- List routines for selected child
- Tap routine to start

### Screen 3: Active Routine
- Countdown timer (5 minutes for testing)
- Task list with checkboxes
- Progress indicator ("3 of 5 done")
- **Timer MUST work offline (airplane mode test)**
- On completion → celebration

### Screen 4: Celebration
- Display completion time
- Display points earned
- "Share" button (Part 5)
- "Done" returns to home

### Screen 5: Suggest a Routine
- Text input for description
- Submit → Claude API
- Show preview of suggested routine
- "Save Routine" saves to Supabase

---

## Session Recording Logic

**On routine start:**
```typescript
await supabase.from('sessions').insert({
  child_id: selectedChildId,
  routine_id: routineId,
  started_at: new Date().toISOString(),
  status: 'in_progress'
})
```

**On routine complete:**
```typescript
await supabase.from('sessions').update({
  completed_at: new Date().toISOString(),
  duration_seconds: elapsedSeconds,
  points_earned: totalPoints,
  status: 'completed'
}).eq('id', sessionId)
```

**Offline handling:**
- If offline, queue the update
- Show user "Data will sync when online"
- Sync when connectivity returns

**Crash recovery:**
- On app open, check for `in_progress` sessions
- If found, show dialog: "Resume" or "Abandon"

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Expo (managed workflow) |
| Language | TypeScript (strict, no `any`) |
| Navigation | Expo Router |
| UI Library | gluestack-ui v2 |
| Animations | lottie-react-native |
| State | Zustand + AsyncStorage persist |
| Backend | Supabase (Postgres, Auth, RLS) |
| AI | Claude API (claude-sonnet-4-20250514) |
| Image Capture | react-native-view-shot |
| Sharing | expo-sharing |
| Network | @react-native-community/netinfo |

---

## File Structure

```
quick-routine/
├── app/                      # Expo Router
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (app)/
│   │   ├── index.tsx         # Home
│   │   ├── routine/[id].tsx  # Active Routine
│   │   ├── celebration.tsx
│   │   └── suggest.tsx       # AI Suggestion
│   └── _layout.tsx
├── components/
│   ├── ui/                   # gluestack-ui components (auto-generated)
│   ├── Timer.tsx
│   ├── TaskItem.tsx
│   ├── RoutineCard.tsx
│   ├── ChildSelector.tsx
│   ├── ShareImage.tsx
│   └── LottieAnimation.tsx   # Wrapper for Lottie
├── assets/
│   └── animations/           # Lottie JSON files
│       ├── confetti.json
│       ├── success.json
│       └── loading.json
├── store/
│   ├── authStore.ts
│   ├── familyStore.ts
│   ├── sessionStore.ts
│   └── syncStore.ts
├── lib/
│   ├── supabase.ts
│   ├── claude.ts
│   └── share.ts
├── types/
│   └── database.ts
├── constants/
│   └── config.ts
├── CLAUDE.md                 # This file
└── README.md
```

---

## Environment Variables

```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
EXPO_PUBLIC_CLAUDE_API_KEY=sk-ant-...
```

---

## What's NOT Expected (Don't Build)

- Perfect visual design (basic styling is fine)
- Multiple children flow (one child is fine)
- Streaks or beat-yesterday features
- MCP server
- Voice input
- Push notifications

**Focus on the 5 core components. Do those well.**

---

## Submission Checklist

- [ ] GitHub repo (public or private + add mj@storeresearch.com)
- [ ] Clean commit history (not one giant commit)
- [ ] README with setup instructions, env vars, decisions, limitations
- [ ] Loom video (15-20 min) showing:
  - [ ] App demo (all features)
  - [ ] Architecture decisions explained
  - [ ] Supabase dashboard (tables, RLS)
  - [ ] Claude integration code
  - [ ] What you'd improve with more time
- [ ] Working app on Expo Go
- [ ] Test account credentials in README

---

## Client Folder Reference

Full client documentation at:
`/Volumes/Chocoflan/Documents/FN_Upwork_unlocked/clients/Matt_Sherry_Footprint_Labs/`

Contains:
- `upwork_chat.md` - All Upwork messages
- `activity_log.md` - Time tracking
- `contract_scope.md` - Contract details
- `development/PROJECT_PLAN.md` - Detailed plan with ADRs
