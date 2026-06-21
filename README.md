# Mealwise

A full-stack web application that lets users manage their pantry inventory and generate AI-powered recipe suggestions based on the ingredients they have on hand.


## Features

- **Google Authentication** — secure sign-in via Firebase Auth with Google OAuth
- **Guest Mode** — try the app anonymously without creating an account
- **Pantry Management** — add, remove, and track ingredient quantities in real time
- **Input Validation** — item names are capped at 50 characters and may not contain `/`
- **AI Recipe Generation** — sends pantry contents to OpenAI's GPT-4o Mini and returns personalised recipe suggestions (Google sign-in required)
- **Rate Limiting** — recipe generation is capped at 5 requests per user per hour
- **Live Search** — filter pantry items instantly as you type
- **Persistent Storage** — pantry data stored per user in Firestore and synced across sessions


## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI Library | Material UI (MUI) v5 |
| Authentication | Firebase Auth (Google OAuth) |
| Database | Cloud Firestore |
| AI | OpenAI API (GPT-4o Mini) |
| Hosting | Vercel |
| Language | JavaScript (React 18) |

## Architecture Highlights

- **Next.js App Router** with a dedicated `/api/openai` server-side route to keep the OpenAI API key off the client
- **Firebase Admin SDK** used server-side to verify ID tokens and enforce that anonymous users cannot generate recipes
- **Firebase Firestore** for per-user pantry data with real-time reads on every pantry mutation
- **React hooks** (`useState`, `useEffect`, `useCallback`) and `react-firebase-hooks` for auth state management
- **Environment variables** split between `NEXT_PUBLIC_*` (client-safe Firebase config) and server-only secrets (OpenAI key, Firebase Admin credentials)

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project with Firestore and Google Auth enabled
- An OpenAI API key

### Installation

```bash
git clone https://github.com/Crash105/PantryReactApp.git
cd PantryReactApp
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Firebase client-side config (safe to expose to the browser)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# OpenAI (server-side only — never expose to the browser)
OPENAI_API_KEY=

# Firebase Admin SDK (server-side only — never expose to the browser)
# Obtain from Firebase Console → Project Settings → Service Accounts → Generate new private key
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

> The three `FIREBASE_ADMIN_*` variables are required for the `/api/openai` route to verify auth tokens. The app will crash on startup if they are missing.

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
├── api/
│   └── openai/
│       └── route.js        # Server-side OpenAI API handler (auth, rate limiting, AI call)
├── components/
│   └── Login.js            # Google OAuth + guest sign-in component
├── dashboard/
│   └── page.js             # Main pantry and recipe UI (protected — requires auth)
├── page.js                 # Public landing page
├── layout.js               # Root layout and metadata
firebase.js                 # Firebase client SDK initialisation
firebaseAdmin.js            # Firebase Admin SDK initialisation (server-side only)
```

## API Reference

### `POST /api/openai`

Generates recipe suggestions from the user's pantry contents.

**Authentication:** Requires a Firebase ID token in the `Authorization` header. Anonymous users are rejected with `403`.

**Request**
```
Authorization: Bearer <firebase-id-token>
Content-Type: application/json

{
  "pantryItems": [{ "name": "Chicken" }, { "name": "Garlic" }]
}
```

**Response — 200 OK**
```json
{
  "result": [
    { "name": "Recipe Name", "description": "Short description" },
    { "name": "Recipe Name", "description": "Short description" }
  ]
}
```

**Error responses**

| Status | Meaning |
|---|---|
| `400` | Missing or invalid `pantryItems` array |
| `401` | Missing or invalid auth token |
| `403` | Authenticated as an anonymous (guest) user |
| `429` | Rate limit exceeded (5 requests per hour per user) |
| `500` | OpenAI request failed |

---

## Key Engineering Decisions

- **Server-side API route for OpenAI** — the API key never reaches the browser; all AI requests are proxied through Next.js
- **Firebase Admin SDK for token verification** — the server independently verifies the user's identity and rejects anonymous users before touching OpenAI
- **Firestore document-per-item model** — each pantry item is its own document keyed by normalized name (lowercase, first letter capitalized), preventing duplicates like `"apple"` and `"Apple"`
- **Input validation on item names** — names over 50 characters or containing `/` are rejected client-side before any Firestore write
- **Rate limiting per user** — a `rateLimit` field on each user's Firestore document tracks request count and window start time
- **Pantry loading state scoped to initial load** — `pantryLoading` only shows a spinner when the pantry is empty, preventing layout jank on add/delete refreshes
- **Optimistic UI cleared on error** — pantry errors surface to the user rather than failing silently
