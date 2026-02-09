# notion-gamedb

A Next.js web app for building a game backlog in Notion. Search or browse games via the RAWG API, select the ones you want, and bulk-add them to a Notion database with metadata (platforms, genres, release date, Metacritic score, cover art, etc.).

## Tech Stack

- **Framework**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4 (dark theme)
- **APIs**: RAWG (game data), Notion SDK v4 (database storage)
- **Deployment**: Vercel (auto-deploys on push to main)

## Project Structure

```
/app
  /api
    /browse/route.ts   # Browse-by-console endpoint (multi-page RAWG fetch)
    /filters/route.ts  # Platforms & genres list
    /notion/route.ts   # Add selected games to Notion DB
    /search/route.ts   # RAWG search proxy
  layout.tsx           # Root layout
  page.tsx             # Main page (all client-side state lives here)
  globals.css
/components
  BrowseFilters.tsx    # Genre/year/sort filters for browse mode
  ConsolePicker.tsx    # Platform grid for browse mode
  GameCard.tsx         # Single game result with selection checkbox
  GameResults.tsx      # Results grid + select all/deselect all
  ModeTabs.tsx         # Search / Browse by Console / Paste List tabs
  Pagination.tsx       # Page navigation
  PasteListInput.tsx   # Textarea for bulk game name input
  SearchFilters.tsx    # Filters for search mode
  StatusMessage.tsx    # Success/error/info banners
/lib
  notion.ts            # Notion client: schema enforcement, duplicate check, page creation
  rawg.ts              # RAWG client: search, platforms, genres, game details
  types.ts             # Shared TypeScript types
```

## Key Features

- **Search**: Free-text search with platform, genre, year range, and sort filters. Paginated results (20/page).
- **Browse by Console**: Pick a platform, then browse its full library with filters. 100 results/page fetched via 3 sequential RAWG calls (40+40+20), deduped server-side.
- **Paste List**: Paste game names (one per line), searches each sequentially with 200ms delay, returns top match per name, all auto-selected.
- **Bulk add to Notion**: Select games across any mode, then add them all at once. Detects duplicates by RAWG ID. Auto-creates missing database properties on first use.

## Development Guidelines

### Notion SDK

- **Must stay on v4.x** (`@notionhq/client@^4.0.2`). v5 uses Notion API `2025-09-03` which removed `databases.query` and is incompatible.
- `ensureDatabaseSchema()` requires a `"properties" in db` type guard because `databases.retrieve()` returns a union type.
- Known type narrowing workarounds: `as Record<string, { type: string }>` on `db.properties`, `as any` on the `properties` param in `databases.update()`.

### Code Style

- Functional components with hooks, `"use client"` directive where needed
- All state lives in the root `page.tsx` and is passed down as props
- API routes are thin wrappers around `/lib` functions
- Dark theme throughout (gray-800/900 backgrounds, gray-100/200/400 text)

### Notion Database Schema

The app auto-creates these properties if missing (see `REQUIRED_SCHEMA` in `lib/notion.ts`):

| Property     | Type         |
|--------------|--------------|
| Name         | title        |
| RAWG ID      | number       |
| Platform     | multi_select |
| Genre        | multi_select |
| Publisher    | rich_text    |
| Release Date | date         |
| Metacritic   | number       |
| Cover Image  | url          |
| Status       | select       |
| RAWG URL     | url          |
| Rating       | number       |
| Added Date   | date         |

### API Integration

- `RAWG_API_KEY` - RAWG API key
- `NOTION_API_KEY` - Notion integration token
- `NOTION_DATABASE_ID` - Target Notion database ID
- All stored in `.env` (gitignored). Never commit env files.

## Common Tasks

### Setup

```bash
npm install
# Create .env with RAWG_API_KEY, NOTION_API_KEY, NOTION_DATABASE_ID
npm run dev
```

### Build & Deploy

```bash
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

Auto-deploys to Vercel on push to main.

## Known Issues & Constraints

- RAWG API has rate limits; Paste List mode uses 200ms delay between requests to stay under the limit
- Notion API has a 100-item compound filter limit; duplicate checks are chunked accordingly
- Browse mode fetches 100 results via 3 RAWG calls because RAWG caps `page_size` at 40

## External Resources

- [RAWG API Docs](https://rawg.io/apidocs)
- [Notion API Docs](https://developers.notion.com/)
- [Notion SDK v4](https://github.com/makenotion/notion-sdk-js)
