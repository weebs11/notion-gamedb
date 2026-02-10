# notion-gamedb

A web utility for populating a Notion database with a video game backlog. Search games by platform, genre, publisher, and release year, then add them to your Notion "GamesDB" database with duplicate prevention.

## Tech Stack

- **Next.js** (App Router, TypeScript) — UI + API routes
- **RAWG.io API** — game data (350K+ games)
- **Notion API** — database storage
- **Tailwind CSS** — styling
- **Vercel** — hosting

## Setup

1. Get a RAWG API key from https://rawg.io/apidocs
2. Create a Notion integration at https://www.notion.so/my-integrations
3. Share your GamesDB Notion database with the integration
4. Set environment variables:

```
RAWG_API_KEY=your_rawg_key
NOTION_API_KEY=your_notion_integration_secret
NOTION_DATABASE_ID=your_database_id
```

## Development

```bash
npm install
npm run dev
```

## Deployment

Push to GitHub and connect to Vercel (or just run on localhost). Set the environment variables in the Vercel dashboard.
