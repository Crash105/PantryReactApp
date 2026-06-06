# Mealwise

A full-stack web application that lets users manage their pantry inventory and generate AI-powered recipe suggestions based on the ingredients they have on hand.


## Features

- **Google Authentication** — secure sign-in via Firebase Auth with Google OAuth
- **Pantry Management** — add, remove, and track ingredient quantities in real time
- **AI Recipe Generation** — sends pantry contents to OpenAI's GPT-4o Mini and returns personalised recipe suggestions
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
- **Firebase Firestore** for per-user pantry data with real-time reads on every pantry mutation
- **React hooks** (`useState`, `useEffect`) and `react-firebase-hooks` for auth state management
- **Environment variables** split between `NEXT_PUBLIC_*` (client-safe Firebase config) and server-only secrets (OpenAI key)

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
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
OPENAI_API_KEY=
```

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
│       └── route.js       # Server-side OpenAI API handler
├── components/
│   └── Login.js           # Google OAuth sign-in component
├── page.js                # Main pantry and recipe UI
├── layout.js              # Root layout and metadata
firebase.js                # Firebase initialisation
```

## Key Engineering Decisions

- **Server-side API route for OpenAI** — the API key never reaches the browser; all AI requests are proxied through Next.js
- **Firestore document-per-item model** — each pantry item is its own document keyed by name, making count increments and deletes simple atomic operations
- **Optimistic UI cleared on error** — pantry errors surface to the user rather than failing silently
