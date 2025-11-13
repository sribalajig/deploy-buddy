# Deploy Buddy Backend

## Prerequisites

- Node.js 20 or newer
- npm

## Setup

```bash
cd backend
npm install
```

## Environment Variables

Create a `.env` file in `backend/`:

```dotenv
# Optional: fallback port when PORT is unset
PORT=3000

# Comma separated list of allowed origins for CORS
CORS_ORIGINS=http://localhost:5173

# Railway GraphQL API configuration
RAILWAY_API_URL=https://backboard.railway.app/graphql/v2
RAILWAY_TOKEN=your-railway-api-token
DEPLOY_BUDDY_RAILWAY_PROJECT_ID=your-project-id
```

## Useful Scripts

```bash
npm run dev    # Start the Fastify server with ts-node + nodemon
npm run build  # Compile TypeScript to dist/
npm start      # Run the compiled server
npm test       # Run unit tests (Vitest)
npm run lint   # Run ESLint
```

The server listens on the port defined by `PORT` (defaults to `3000`). Update the Railway credentials with values from your Railway workspace before running against production data.

