# Chaucherita Backend

This is the backend for Chaucherita, built with Node.js, Express, and Supabase.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the `backend` directory:

   ```env
   SUPABASE_URL=your-supabase-url
   SUPABASE_KEY=your-supabase-key
   PORT=5000
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

- `src/config/` - Supabase client config
- `src/routes/` - Express route definitions
- `src/controllers/` - Route logic
- `src/services/` - Business logic and Supabase integration
- `src/middlewares/` - Middleware (error handling, etc.)
- `src/app.js` - Express app setup
- `src/server.js` - Entry point

## API Example

- `GET /api/users` - List all users
- `POST /api/users` - Create a new user

## Auth API

- `POST /api/auth/register` — Register a new user. Body: `{ email, password, name }`. Returns: `{ user, token }`
- `POST /api/auth/login` — Login. Body: `{ email, password }`. Returns: `{ user, token }`
- `GET /api/auth/me` — Get current user info (requires `Authorization: Bearer <token>` header)

- All endpoints return a JWT token for authenticated requests.

## Notes

- Ensure your Supabase project has a `

## Deploying to Render

1. **Environment Variables:**

   - `SUPABASE_URL` — Your Supabase project URL
   - `SUPABASE_KEY` — Your Supabase service role key
   - `PORT` — Set to `10000` (Render default) or leave blank (Render sets it automatically)
   - `JWT_SECRET` — A strong secret for JWT signing

2. **Start Command:**

   - `npm start`

3. **Node Version:**

   - Uses Node.js 18+ (see `package.json`)

4. **CORS:**
   - The backend enables CORS for all origins by default. Adjust in `src/app.js` if needed.

## WatermelonDB Sync Protocol

Chaucherita's backend supports robust offline-first sync with WatermelonDB:

- **Endpoints:**

  - `POST /api/transactions/sync/push` — Accepts local changes from the client (created, updated, deleted transactions in WatermelonDB sync format).
  - `GET /api/transactions/sync/pull` — Returns all changes for the user since the last sync timestamp, in WatermelonDB sync format.

- **How it works:**

  - The client pushes local changes (including deletions) and pulls remote changes in a single sync operation.
  - The backend upserts or deletes transactions as needed, using `updated_at` for conflict resolution.
  - WatermelonDB-only fields (`_changed`, `_status`, `sync_status`, `version`) are ignored on the backend.
  - The `tags` field is converted from a JSON string to a Postgres array as needed.
  - The `transactions` table uses a `text` primary key for `id` to support WatermelonDB IDs.

- **See Also:**
  - `/stores/transaction-sync.ts` in the client for sync logic
  - [WatermelonDB Sync Protocol Docs](https://watermelondb.dev/docs/Sync/#sync-protocol)

---
