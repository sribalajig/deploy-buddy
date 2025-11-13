# Deploy Buddy Frontend

## Prerequisites

- Node.js 20 or newer
- npm

## Setup

```bash
cd frontend
npm install
```

## Environment Variables

To point the UI at a specific backend, create `.env.local` (or `.env`) in `frontend/`:

```dotenv
VITE_BACKEND_URL=http://localhost:3000
```

If no value is provided, the app falls back to `http://localhost:12345` during development and the production default specified in `src/utils/config.ts`.

## Useful Scripts

```bash
npm run dev      # Start Vite dev server
npm run build    # Type-check and build for production
npm run preview  # Preview the production build
npm run lint     # Run ESLint
```

Open `http://localhost:5173` (default) once `npm run dev` is running. Adjust `VITE_BACKEND_URL` if your backend runs elsewhere.

