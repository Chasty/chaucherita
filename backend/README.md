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
