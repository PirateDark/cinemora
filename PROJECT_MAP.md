# PROJECT_MAP — دراماكسيا (Dramaxia)

## SYSTEM_FLOW

```
User → Header (Nav + Search + Family Mode)
  ├── HomePage → HeroBanner + Sections (Popular/TopRated/Upcoming)
  ├── MoviesPage → TMDB Popular Movies (paginated)
  ├── TvShowsPage → TMDB Popular TV (paginated)
  ├── AsianPage → TMDB Discover TV (KR/JP/CN/TW) — no animation
  ├── AsianMoviesPage → TMDB Discover Movies (KR/JP/CN/TW) — no animation
  ├── TurkishMoviesPage → TMDB Discover (TR Movies)
  ├── TurkishShowsPage → TMDB Discover (TR TV)
  ├── ArabicMoviesPage → TMDB Discover (AR Movies)
  ├── ArabicTvPage → TMDB Discover (AR TV)
  ├── AnimePage (hub) → AniList Trending + links to series/movies
  ├── AnimeSeriesPage → AniList (TV format only)
  ├── AnimeMoviesPage → AniList (MOVIE format only)
  ├── SearchPage → TMDB Multi Search
  ├── MediaDetailPage → Details + Trailer + Cast + Similar + Actions
  ├── WatchPage → Video Player + Episode/Season selector + Custom URL
  ├── FavoritesPage → localStorage favorites
  ├── WatchlistPage → localStorage watchlist
  ├── WatchHistoryPage → localStorage history
  ├── SettingsPage → Family Mode + Account + Display + Data Mgmt
  ├── ContactPage → Contact form (simulated)
  ├── PrivacyPage → Static privacy policy
  └── NotFoundPage → 404
```

## API LAYER
- **TMDB API** (`services/tmdbApi.ts`) — Bilingual (en/ar), cached
- **AniList API** (`services/anilistApi.ts`) — GraphQL, 5 query types
- **Proxy API** (`services/proxyApi.ts`) — Video source discovery with fallback
- **Cache** (`utils/cache.ts`) — localStorage TTL cache

## CONTENT GUARD LAYER (`utils/contentGuard.ts`)
- `isAnimationContent(item)` — checks genre_ids for TMDB genre 16 (Animation)
- `isAnimeContent(item)` — animation + JP origin_country
- `isLiveActionAsianContent(item)` — not animation
- `isArabicContent(item)` — original_language === "ar"
- `filterLiveAction(items)` — strips all animation from TMDB result arrays

### Enforcement Points
| Layer | Method | Files |
|-------|--------|-------|
| API-level | `without_genres=16` on all TMDB discover queries | `tmdbApi.ts` — Asian, Turkish, Arabic endpoints |
| Client-side | `filterLiveAction()` on fetched results before setState | `AsianPage.tsx`, `AsianMoviesPage.tsx` |

Anime content is ONLY served via AniList API. TMDB-based pages never receive anime data at either layer.

## STATE LAYER (all localStorage)
- `useFavorites` — CRUD favorites (MediaItem[])
- `useWatchlist` — CRUD watchlist (MediaItem[])
- `useWatchHistory` — Append history entries
- `useFamilyMode` — Filter blocked/adult content
- `useLocalStorage` — Generic localStorage hook (unused, available)

## COMPONENT TREE
- `App.tsx` → Routes + Header + Footer + BackToTop + Suspense
- `MediaCard` → Card with hover overlay + favorites/watchlist/family filter
- `MediaSkeleton` / `SkeletonGrid` → Loading states
- `LoadingSpinner` / `ErrorState` / `EmptyState` → UX states
- `ui/button`, `ui/input`, `ui/select`, `ui/card` → Reusable UI primitives

---

## COMPLETED (2026-05-08)

### 🐛 Critical Bugfixes
1. **Header.tsx** — Fixed missing `useLocation` import + added `const location = useLocation()` call that was causing ReferenceError at runtime
2. **MediaCard.tsx** — Fixed `title_en`/`name_en` references that don't exist in TMDB response; replaced with `title || name`

### 🗑️ Empty/Dead Files Fixed
3. **`components/ui/card.tsx`** — Implemented `Card` component (was empty)
4. **`utils/helpers.ts`** — Implemented `cn`, `getImageUrl`, `formatDate`, `getTitle` helpers (was empty)

### ⚠️ Type Safety Improvements
5. **`types/index.ts`** — Replaced Jikan-specific `Anime` type with `MediaItem` union type supporting both TMDB and AniList data
6. **`useFavorites.ts`** — Updated to use `MediaItem[]` instead of `Anime[]`
7. **`useWatchlist.ts`** — Updated to use `MediaItem[]` instead of `Anime[]`
8. **`AnimeDetailPage.tsx`** — Fixed `idMal` null-safety with guard `anime.idMal && anime.idMal > 0`

### 🧹 Dead Code Cleanup
9. **`SkeletonGrid.tsx`** — Replaced dead `SkeletonCard` import with `MediaSkeleton`

### ✅ Build Status
- **TypeScript**: 0 errors
- **Vite Build**: Successful (6.16s, 34 chunks, ~225KB gzipped)

---

## COMPLETED (2026-05-08 — Phase 2)

### 🆕 New Pages Added
1. **`ArabicMoviesPage`** — `/movies/arabic` — TMDB Discover with `with_original_language=ar`, bilingual, paginated
2. **`ArabicTvPage`** — `/tv/arabic` — TMDB Discover with `with_original_language=ar`, bilingual, paginated
3. **`AnimeSeriesPage`** — `/anime/series` — AniList TV format only (trending/popular/topRated)
4. **`AnimeMoviesPage`** — `/anime/movies` — AniList MOVIE format only (trending/popular/topRated)

### 🔧 Modified Files
5. **`AnimePage`** — Converted to hub page with card navigation to series/movies + trending preview
6. **`App.tsx`** — Added 4 new lazy routes, Arabic + anime series/movies
7. **`Header.tsx`** — Added Arabic TV/Movies to dropdowns, split anime into 3 items (all/series/movies)
8. **`Footer.tsx`** — Added Arabic and anime series/movies links (10 items total)
9. **`tmdbApi.ts`** — Added `getArabicMovies()` and `getArabicTvShows()` using `with_original_language=ar`

### ✅ Build Status
- **TypeScript**: 0 errors
- **Vite Build**: Successful (9.72s, 40 chunks)

---

## COMPLETED (2026-05-09 — Content Guard)

### 🔒 Content Classification Fix
1. **`utils/contentGuard.ts`** — Created shared classification utilities: `isAnimationContent`, `isAnimeContent`, `isLiveActionAsianContent`, `isArabicContent`, `filterLiveAction`
2. **`tmdbApi.ts`** — Added `without_genres=16` (Animation exclusion) to all 6 discover endpoints: Asian TV, Asian Movies, Turkish Movies, Turkish Shows, Arabic Movies, Arabic TV Shows
3. **`AsianPage.tsx`** — Applied `filterLiveAction()` client-side safety net on fetched results
4. **`AsianMoviesPage.tsx`** — Applied `filterLiveAction()` client-side safety net on fetched results
5. **`AsianMoviesPage.tsx` + route** — New page at `/movies/asian` for Asian live-action movies (was missing, movies dropdown was incorrectly pointing to TV-only `/asian`)
6. **Header.tsx** — Fixed movies dropdown "أفلام آسيوية" link → `/movies/asian`
7. **Footer.tsx** — Added "أفلام آسيوية" link

### ✅ Build Status
- **TypeScript**: 0 errors
- **Vite Build**: Successful (6.23s, 42 chunks)

---

## [ORPHANS & PENDING]

### Low Priority
- `useLocalStorage.ts` — Defined but not imported anywhere (available for future use)
- No Firebase/Firestore integration — All state is localStorage-only; Firebase in deps but no config
- No automated tests — Zero test files

---

## ROUTE MAP (23 routes)
| Route | Page | Source |
|-------|------|--------|
| `/` | HomePage | TMDB Popular/TopRated/Upcoming |
| `/movies` | MoviesPage | TMDB Popular Movies |
| `/tv` | TvShowsPage | TMDB Popular TV |
| `/search?q=` | SearchPage | TMDB Multi Search |
| `/movie/:id` | MediaDetailPage | TMDB Movie Details |
| `/tv/:id` | MediaDetailPage | TMDB TV Details |
| `/watch/movie/:id` | WatchPage | Proxy Video Sources |
| `/watch/tv/:id/:season/:episode` | WatchPage | Proxy Video Sources |
| `/favorites` | FavoritesPage | localStorage |
| `/watchlist` | WatchlistPage | localStorage |
| `/history` | WatchHistoryPage | localStorage |
| `/anime` | AnimePage (hub) | AniList Trending |
| `/anime/series` | AnimeSeriesPage | AniList (TV format) |
| `/anime/movies` | AnimeMoviesPage | AniList (MOVIE format) |
| `/anime/:id` | AnimeDetailPage | AniList Detail |
| `/asian` | AsianPage | TMDB Discover TV (KR/JP/CN/TW) — no animation |
| `/movies/asian` | AsianMoviesPage | TMDB Discover Movies (KR/JP/CN/TW) — no animation |
| `/tv/turkish` | TurkishShowsPage | TMDB Discover TR — no animation |
| `/tv/arabic` | ArabicTvPage | TMDB Discover AR TV — no animation |
| `/movies/turkish` | TurkishMoviesPage | TMDB Discover TR Movies — no animation |
| `/movies/arabic` | ArabicMoviesPage | TMDB Discover AR Movies — no animation |
| `/settings` | SettingsPage | localStorage |
| `/contact` | ContactPage | Form (simulated) |
| `/privacy` | PrivacyPage | Static |
| `*` | NotFoundPage | Static |
