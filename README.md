# Chaucherita

Chaucherita is a personal finance tracker featuring:

- **Node.js/Express** backend (with Supabase for database)
- **React Native/Expo** client
- JWT authentication, user management, and transaction tracking

## Monorepo Structure

- `/backend` — Node.js/Express API (Supabase integration)
- `/app` — React Native/Expo client
- `/stores`, `/components`, `/types`, etc. — Shared or client-specific code

## Quick Start

1. **Backend:**
   - See [`/backend/README.md`](./backend/README.md) for setup and API docs.
2. **Client:**
   - Usual Expo workflow (`npm start` or `npx expo start`)

## Features

- User registration/login (JWT)
- Secure transaction CRUD (with optimistic UI)
- Date and summary utilities

## Offline-First Sync with WatermelonDB

Chaucherita uses an **offline-first sync architecture** for transactions:

- **Client:**

  - Uses [WatermelonDB](https://nozbe.github.io/WatermelonDB/) for local/offline storage and sync.
  - All transaction CRUD operations are performed locally and reflected instantly in the UI (optimistic updates).
  - Sync is triggered after every add, update, or delete, and also on network reconnect.
  - Sync uses WatermelonDB's `synchronize` API, which:
    - **pushes** local changes to the backend (`/api/transactions/sync/push`)
    - **pulls** remote changes from the backend (`/api/transactions/sync/pull`)
  - Only the user's own transactions are synced (scoped by JWT auth).

- **Backend:**

  - Exposes `/api/transactions/sync/pull` and `/api/transactions/sync/push` endpoints, implementing the [WatermelonDB sync protocol](https://watermelondb.dev/docs/Sync/#sync-protocol).
  - Handles upserts, deletes, and conflict resolution based on `updated_at`.
  - Ignores WatermelonDB-only fields (`_changed`, `_status`, `sync_status`, `version`).
  - Converts `tags` from JSON string to Postgres array as needed.

- **Schema:**

  - The `transactions` table uses a `text` primary key for `id` (to support WatermelonDB IDs).
  - All timestamps are stored as numbers (milliseconds since epoch).

- **Best Practices:**
  - Never store JWTs or secrets in the repo.
  - Always filter out deleted transactions in the UI for instant feedback.
  - See `/backend/README.md` for backend API details and `/stores/transaction-sync.ts` for sync logic.

---

For more details, see the respective `README.md` files in each directory.
