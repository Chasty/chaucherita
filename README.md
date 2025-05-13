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

---

For more details, see the respective `README.md` files in each directory.
