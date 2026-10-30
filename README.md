# YouTube Automation Studio (CreatorOS)

A responsive, dark creator workspace with gold accents. Default workspace name: **Ibsan Official**.

## Eight workspaces

1. Script Studio — hook options and structured script drafts.
2. Title & Thumbnail — paired copy review and heuristic checks.
3. Niche Research — save examples and compare channel-relative performance notes.
4. Edit Decision List — transcript scan for potential filler and edit cues.
5. Content Planner — create, track and remove planned uploads.
6. Comment Assistant — triage pasted comments and draft replies.
7. SEO & Chapters — descriptions, search-query ideas, tags and timestamp validation.
8. Shorts & Retention — transcript clip ideas and CSV retention scan.

Projects, drafts, planner items and settings persist in browser localStorage. Use Settings to export/import a JSON backup.

## Run locally

Requirements: Node.js 18+.

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:3000

## Optional YouTube API connection

1. Create a project in Google Cloud Console and enable **YouTube Data API v3**.
2. Configure an OAuth consent screen and add your Google account as a test user if the app is in testing.
3. Create an OAuth 2.0 Web application client.
4. Add `http://localhost:3000/auth/google/callback` as an authorized redirect URI.
5. Put the client ID and secret in `.env` and restart the server.

The integration requests read-only YouTube scopes and can read the connected channel, recent uploads and recent comments. It does not publish, upload, or modify videos. Keep `.env` private and never commit credentials.

## Important limitations

- AI-style drafts in this starter are local heuristic templates, not calls to a hosted language model. Connect your chosen model provider on a secure server before using it for production AI generation.
- Research and edit/retention outputs are decision-support heuristics. Verify against source footage and analytics.
- Browser localStorage is device/browser-specific. Export backups regularly.
- For production deployment, use HTTPS, a persistent session store, CSRF protection, secure secret management, and a proper database.
