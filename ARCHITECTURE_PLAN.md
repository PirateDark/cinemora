# ARCHITECTURE PLAN — Dramaxia

> Generated: 2026-05-08 | Target: Production-grade Netflix-like streaming platform

---

## PROTOCOL 1: Temporal Awareness & Dependency Reliability

### Current Date: May 2026

### Dependency Audit — Installed vs Latest Stable

| Package | Installed | Latest | Action | Risk |
|---------|-----------|--------|--------|------|
| react / react-dom | 18.2.0 | 19.2.6 | ⏳ **Phase 2** | Breaking — concurrent features, dropped legacy APIs |
| react-router-dom | 6.22.0 | 7.15.0 | ⏳ **Phase 2** | Breaking — new data loaders, removed `useNavigate` redirects |
| vite | 5.0.8 | 8.0.11 | ⏳ **Phase 2** | Breaking — Vite 6+ requires CJS interop changes |
| typescript | 5.2.2 | 6.0.3 | ⏳ **Phase 2** | Breaking — new `@` import syntax, removed deprecated |  
| tailwindcss | 3.4.1 | 4.3.0 | ⏳ **Phase 2** | Breaking — CSS-first config, removed `tailwind.config.js` |
| framer-motion | 10.18.0 | 12.38.0 | ⏳ **Phase 2** | Breaking — layout animations API changes |
| lucide-react | 0.309.0 | 1.14.0 | ⏳ **Phase 2** | Breaking — icon size/defaults changed |
| firebase | 12.12.0 | 12.13.0 | ✅ **Phase 1** | Safe minor |
| axios | 1.15.0 | 1.16.0 | ✅ **Phase 1** | Safe minor |
| zod | 4.3.6 | 4.4.3 | ✅ **Phase 1** | Safe minor |
| react-hook-form | 7.72.1 | 7.75.0 | ✅ **Phase 1** | Safe minor |
| hls.js | 1.6.16 | 1.6.16 | ✅ No change | Stable |

### Deprecation Warnings (Current Codebase)
- **`React.FC` / `React.ReactNode`** — Not used; codebase uses explicit `function` components ✅
- **`ReactDOM.render`** — Not used; uses `createRoot` ✅
- **`any` types in 8 pages** — ⚠️ Technical debt. Addressed in architecture.

---

## PROTOCOL 2: Logical Flow & Verifiable Goals (No Feature Creep)

### User Journey — Verifiable Goals

```
                    ┌──────────────────────────────────────────────┐
                    │           HEADER (persistent)                │
                    │  [Logo][Home][Series▼][Movies▼][Anime▼]      │
                    │  [Family Mode][Settings][🔍 Search]          │
                    └──────────────┬───────────────────────────────┘
                                   │
┌──────────────────────────────────┼──────────────────────────────────┐
│                                  ▼                                   │
│  ┌──────────── HOME ──────────┐  ┌─────── ANIME ───────────┐       │
│  │ HeroBanner (auto-rotate)   │  │ Trending / Popular /     │       │
│  │ Popular Movies (6-col grid)│  │ TopRated / Series /Movies│       │
│  │ Popular TV (6-col grid)    │  └──────────────────────────┘       │
│  │ TopRated Movies/TV         │                                      │
│  │ Upcoming Movies            │  ┌─────── DETAIL ──────────┐       │
│  └────────────────────────────┘  │ Backdrop + Poster + Info │       │
│                                  │ Trailer / Watch / Download│       │
│  ┌─────── BROWSE ───────┐       │ Cast Grid / Similar Items│       │
│  │ Movies (paginated)   │       │ ♥ Favorite / ▶ Watchlist │       │
│  │ TV (paginated)       │       └──────────────────────────┘       │
│  │ Asian (country tabs) │                                          │
│  │ Turkish (movies/tv)  │       ┌─────── WATCH ───────────┐       │
│  └──────────────────────┘       │ Custom Video Player     │       │
│                                  │ - Play/Pause/Seek      │       │
│  ┌─────── USER ────────┐       │ - Volume/Fullscreen    │       │
│  │ Favorites           │       │ - Episode/Season Nav   │       │
│  │ Watchlist           │       │ - Custom URL Fallback  │       │
│  │ History             │       └──────────────────────────┘       │
│  │ Settings/Family Mode│                                          │
│  └──────────────────────┘       ┌─────── OTHER ───────────┐       │
│                                  │ Search / 404 / Contact │       │
│                                  │ Privacy / Settings     │       │
│                                  └──────────────────────────┘       │
└──────────────────────────────────────────────────────────────────────┘
```

### Verifiable Goals (Exit Criteria)
1. **Home loads** ≤2s first paint — TMDB API cached, lazy routes
2. **Bilingual data**: Every movie/TV show shows AR overview when available, falls back to EN
3. **Family mode toggle**: Enabling filters out adult/blocked-genre content across ALL pages instantly
4. **Watch page**: Custom player with play/pause/volume/seek/fullscreen + episode navigation
5. **Favorites/Watchlist/History**: Persistent across page reloads (localStorage)
6. **Search**: Debounced (500ms), results filtered to movies/TV only, shows poster

---

## PROTOCOL 3: Surgical Architecture

### Current Architecture (after Phase 0 fixes)

```
src/
├── App.tsx                    # Routes + Layout (Header/Footer/BackToTop)
├── main.tsx                   # Entry point, BrowserRouter
├── index.css                  # Tailwind + RTL + custom animations
├── types/                     # Shared types
│   ├── index.ts               # MediaItem, NewsItem, Genre
│   └── anilist.ts             # AnilistMedia, PageInfo
├── services/                  # API layer (data access)
│   ├── apiClient.ts           # TMDB axios instance
│   ├── tmdbApi.ts             # All TMDB endpoints (bilingual, cached)
│   ├── anilistApi.ts          # AniList GraphQL queries
│   └── proxyApi.ts            # Video source discovery
├── hooks/                     # State + business logic
│   ├── useFavorites.ts        # localStorage CRUD
│   ├── useWatchlist.ts        # localStorage CRUD
│   ├── useWatchHistory.ts     # Append history
│   ├── useFamilyMode.ts       # Filter settings + toggle
│   ├── useDebounce.ts         # Generic debounce
│   └── useLocalStorage.ts     # Generic localStorage hook
├── utils/                     # Pure utilities
│   ├── cache.ts               # TTL-based localStorage cache
│   └── helpers.ts             # cn(), getImageUrl(), formatDate()
├── components/                # Shared UI
│   ├── ui/                    # Primitives
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   └── card.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── MediaCard.tsx
│   ├── MediaSkeleton.tsx
│   ├── SkeletonGrid.tsx
│   ├── LoadingSpinner.tsx
│   ├── ErrorState.tsx
│   ├── EmptyState.tsx
│   └── BackToTop.tsx
└── pages/                     # Route-level components (lazy)
    ├── HomePage.tsx
    ├── MoviesPage.tsx
    ├── TvShowsPage.tsx
    ├── MediaDetailPage.tsx
    ├── WatchPage.tsx
    ├── AnimePage.tsx
    ├── AnimeDetailPage.tsx
    ├── AsianPage.tsx
    ├── TurkishMoviesPage.tsx
    ├── TurkishShowsPage.tsx
    ├── SearchPage.tsx
    ├── FavoritesPage.tsx
    ├── WatchlistPage.tsx
    ├── WatchHistoryPage.tsx
    ├── SettingsPage.tsx
    ├── ContactPage.tsx
    ├── PrivacyPage.tsx
    └── NotFoundPage.tsx
```

### Target Architecture — Phase 1 (Clean & Modular)

```
src/
├── core/                          # SHARED CORE — only truly repeated logic
│   ├── types/
│   │   ├── media.ts               # TmdbMovie, TmdbTvShow, MediaItem (consolidated)
│   │   ├── anime.ts               # AnilistMedia, AnilistPageInfo
│   │   └── ui.ts                  # Component prop types
│   ├── api/
│   │   ├── tmdb.ts                # All TMDB calls (bilingual merge extracted)
│   │   ├── anilist.ts             # AniList GraphQL
│   │   └── proxy.ts               # Video source discovery
│   ├── hooks/
│   │   ├── useFavorites.ts
│   │   ├── useWatchlist.ts
│   │   ├── useWatchHistory.ts
│   │   ├── useFamilyMode.ts
│   │   └── useDebounce.ts
│   └── utils/
│       ├── cache.ts
│       └── helpers.ts
├── components/                    # UI components only (no data fetching)
│   ├── ui/                        # Primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   └── Card.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── media/
│   │   ├── MediaCard.tsx
│   │   ├── MediaSkeleton.tsx
│   │   └── SkeletonGrid.tsx
│   ├── shared/
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorState.tsx
│   │   ├── EmptyState.tsx
│   │   └── BackToTop.tsx
│   └── video/
│       ├── VideoPlayer.tsx        # Extract from WatchPage
│       └── VideoControls.tsx      # Custom controls (extracted)
├── features/                      # Feature modules (page-level)
│   ├── home/
│   │   ├── HomePage.tsx
│   │   └── HeroBanner.tsx
│   ├── movies/
│   │   └── MoviesPage.tsx
│   ├── tv/
│   │   └── TvShowsPage.tsx
│   ├── detail/
│   │   └── MediaDetailPage.tsx
│   ├── watch/
│   │   └── WatchPage.tsx
│   ├── anime/
│   │   ├── AnimePage.tsx
│   │   ├── AnimeDetailPage.tsx
│   │   └── AnimeCard.tsx
│   ├── asian/
│   │   └── AsianPage.tsx
│   ├── turkish/
│   │   ├── TurkishMoviesPage.tsx
│   │   └── TurkishShowsPage.tsx
│   ├── search/
│   │   └── SearchPage.tsx
│   ├── user/
│   │   ├── FavoritesPage.tsx
│   │   ├── WatchlistPage.tsx
│   │   ├── WatchHistoryPage.tsx
│   │   └── SettingsPage.tsx
│   ├── static/
│   │   ├── ContactPage.tsx
│   │   ├── PrivacyPage.tsx
│   │   └── NotFoundPage.tsx
├── App.tsx
├── main.tsx
└── index.css
```

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Feature-based, not file-type** | Pages → `features/` with their own components; no cross-folder hunting |
| **`core/` not `shared/`** | Only extract to `core/` when used in ≥2 features. MediaCard is shared; AnilistPage is not |
| **No barrel exports** | Explicit imports prevent circular deps and tree-shaking issues |
| **Pages are lazy** | Already done via `React.lazy` — keep this |
| **API layer is thin** | No GraphQL clients, no ORM — just raw axios + types |
| **localStorage only** | No Firebase/Firestore until user auth is required. No premature infra |
| **Bilingual at API layer** | `tmdb.ts` merges EN+AR responses; consumers never deal with language switching |

---

## PROTOCOL 4: Safe Logging Strategy

### Logger Design — Minimal, Async, Non-blocking

```typescript
// core/utils/logger.ts
type Level = 'debug' | 'info' | 'warn' | 'error';
const levels: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };

const currentLevel: Level =
  (import.meta.env.VITE_LOG_LEVEL as Level) || 'warn';

export const logger = {
  debug: (msg: string, data?: unknown) => log('debug', msg, data),
  info:  (msg: string, data?: unknown) => log('info',  msg, data),
  warn:  (msg: string, data?: unknown) => log('warn',  msg, data),
  error: (msg: string, data?: unknown) => log('error', msg, data),
};

function log(level: Level, msg: string, data?: unknown) {
  if (levels[level] < levels[currentLevel]) return;
  // Use requestIdleCallback or queueMicrotask to avoid blocking renders
  queueMicrotask(() => {
    const prefix = `[Dramaxia:${level}]`;
    if (data) console[level](prefix, msg, data);
    else console[level](prefix, msg);
  });
}
```

**Implementation rules:**
1. No `console.log` in production code — use `logger.info`/`logger.debug`
2. `logger.debug` for trace-level events (API calls, cache hits)
3. `logger.info` for user actions (navigated, favorited, watched)
4. `logger.warn` for recoverable failures (fallback source used)
5. `logger.error` for crashes with error data
6. `VITE_LOG_LEVEL` env var controls output (default: `warn` in prod)

---

## PROTOCOL 5: Memory Establishment — PROJECT_MAP.md

PROJECT_MAP.md already created and updated. It contains:
- **SYSTEM_FLOW**: Complete user journey graph
- **TECH_STACK**: Current + planned dependency versions
- **ARCHITECTURE**: Directory structure + design decisions
- **ORPHANS & PENDING**: Tracking remaining technical debt

---

## MILESTONES & VERIFIABLE GOALS

### Phase 1 — Stabilize & Restructure (this execution)
| Goal | Verification |
|------|-------------|
| ✅ Critical bugs fixed | `tsc --noEmit` = 0 errors, `vite build` = success |
| ✅ Empty files populated | `card.tsx` + `helpers.ts` have implementations |
| ✅ Type safety improved | `MediaItem` type replaces `Anime` in hooks |
| ✅ PROJECT_MAP.md created | Document exists with all sections |

### Phase 2 — Architecture Restructuring
| Goal | Verification |
|------|-------------|
| Restructure to `core/` + `components/` + `features/` | All imports resolve, `npm run build` succeeds |
| Extract `VideoPlayer.tsx` + `VideoControls.tsx` from `WatchPage` | No regression in watch functionality |
| Migrate `useLocalStorage` into actual use (or remove) | No orphan files in `core/hooks/` |
| Add `logger.ts` utility | All `console.log` replaced by `logger.*` calls |

### Phase 3 — Dependency & Performance
| Goal | Verification |
|------|-------------|
| Upgrade firebase, axios, zod, react-hook-form to latest minors | `npm run build` succeeds |
| Code-split large pages (WatchPage at 14KB, SettingsPage at 9KB) with `React.lazy` | Already done except verify all chunks |
| Add image lazy loading with blur placeholder | Lighthouse "Defer offscreen images" score improves |
| Implement TMDB response caching with TTL | Cache hit reduces API calls in Network tab |

### Phase 4 — Production Polish
| Goal | Verification |
|------|-------------|
| Tailwind v4 + React 19 + Vite 6 upgrade | Migration guide followed, all features pass QA |
| Remove all `any` types from pages | `tsc --noEmit --strict` passes |
| Add error boundary at App.tsx level | Simulated crash shows fallback UI |
| Responsive testing: mobile (375px), tablet (768px), desktop (1440px) | All layouts render without overflow |
| Add PWA manifest + service worker | Lighthouse PWA badge ≥ 80 |
