# College Companion

An AI-powered college companion app for managing courses, assignments, and notes with built-in AI tools for summarization, flashcards, quizzes, a RAG-based document Q&A system, study planning, and a multi-agent assistant.

Built as a learning project to go from zero to a full-stack AI application: FastAPI + PostgreSQL backend, React frontend, LLM integration via OpenRouter, and a Chroma vector store for retrieval-augmented generation.

## Features

- **Auth** - JWT-based registration/login, per-user data scoping, login lockout after repeated failures, forgot/reset password, "log out everywhere," account settings
- **Courses, Assignments, Notes** - full CRUD, assignments linked to courses, notes searchable by course
- **Dashboard & Calendar** - upcoming assignments, today's tasks, a unified event view
- **AI Study Tools** - note summarization, flashcard generation (from notes or uploaded documents), quiz generation with interactive answer-checking, and "explain this concept" at any level
- **RAG over documents** - upload PDFs, ask natural-language questions, get answers grounded in your own materials with cited sources
- **Study Planner** - AI-generated day-by-day study plans based on real assignments
- **Focus Timer** - Pomodoro-style timer that logs study sessions
- **Analytics** - study hours over time (chart), assignment completion rate, deadline risk warning
- **Multi-Agent Assistant** - one chat interface that routes requests to the right specialist (tutor, planner, research, quiz, writing, or career agent)
- **Quick Note Capture** - fast, mobile-friendly note-jotting
- **Clean, color-coded UI** - sidebar navigation, course color-tabbing on cards throughout the app, responsive down to mobile

## Security

- Passwords hashed with bcrypt; JWT auth with configurable expiry and a `token_version` field enabling "log out everywhere"
- Per-user data scoping on every resource (IDOR protection), one user can never read or modify another's data
- Login lockout after 5 failed attempts (15-minute cooldown)
- Rate limiting on auth and AI endpoints (`slowapi`)
- Minimum password length enforced at signup
- File upload validation (PDF-only, 10MB max)
- Basic content-moderation keyword filter on AI-input endpoints
- Audit log of logins and delete actions
- Environment-driven CORS origins and HTTPS enforcement (activates automatically in production)
- Generic error responses in production; full tracebacks only in development
- Secrets loaded from `.env`, never committed to source control

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | FastAPI |
| Database | PostgreSQL + SQLAlchemy + Alembic (migrations) |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| AI | OpenRouter (OpenAI-compatible API) |
| RAG | ChromaDB + sentence-transformers (local embeddings) |
| Charts | Recharts |
| Rate limiting | slowapi |
| Deployment | Docker + docker-compose |

## Project Structure

```
AI Code Companian/
├── backend/
│   ├── main.py          # FastAPI routes
│   ├── models.py         # SQLAlchemy tables
│   ├── schemas.py        # Pydantic request/response models
│   ├── crud.py           # Database operations
│   ├── auth.py           # JWT auth + password hashing
│   ├── ai.py              # LLM calls (summarize, flashcards, quiz, explain, planner)
│   ├── rag.py             # Chunking, embeddings, vector search, document Q&A
│   ├── agents.py          # Multi-agent intent routing
│   ├── database.py        # DB connection setup
│   ├── alembic/           # Database migrations
│   └── requirements.txt
├── frontend_fixed/
│   ├── src/
│   │   ├── pages/         # One component per feature/route
│   │   ├── components/    # Sidebar nav, quiz question item, shared UI
│   │   ├── context/       # Auth context
│   │   ├── utils/          # Course color-tagging helper
│   │   └── api.js         # All backend API calls
│   └── package.json
├── docker-compose.yml
├── start.bat / stop.bat   # One-click local dev launcher (Windows)
└── README.md
```

## Setup

### Prerequisites

- Python 3.12+
- Node.js + npm
- PostgreSQL
- An [OpenRouter](https://openrouter.ai/) API key (free tier available)

### Backend

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:

```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/college_companion
SECRET_KEY=your-random-secret-key
OPENROUTER_API_KEY=your-openrouter-key
ENVIRONMENT=development
ALLOWED_ORIGINS=http://localhost:5173
```

> Special characters in `DATABASE_URL`'s password (like `@` or `:`) must be percent-encoded e.g. `@` becomes `%40`.

Create the database, then run migrations:

```powershell
psql -U postgres -c "CREATE DATABASE college_companion;"
alembic upgrade head
```

Start the server:

```powershell
uvicorn main:app --reload
```

Backend runs at `http://127.0.0.1:8000`. Interactive API docs at `http://127.0.0.1:8000/docs`.

### Frontend

```powershell
cd frontend_fixed
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and opens automatically.

### One-click start (Windows)

From the project root:

```powershell
.\start.bat
```

Starts both servers in separate terminal windows and opens the app in your browser. Use `.\stop.bat` to shut everything down.

### Docker (alternative)

```powershell
docker compose up --build
```

Requires a `.env` file at the project root (sibling to `docker-compose.yml`) with `SECRET_KEY` and `OPENROUTER_API_KEY` set.

## Database Migrations

Schema changes are managed with Alembic, never edit the database by hand. After changing a model in `models.py`:

```powershell
alembic revision --autogenerate -m "describe the change"
alembic upgrade head
```

If a new column is `nullable=False` and the table already has rows, add `server_default=` to that column in the generated migration file before running `upgrade head`, or Postgres will reject it for existing rows.

## Notes on the AI Model

The app uses OpenRouter, which supports many interchangeable models. The model in use is set once in `ai.py` (`MODEL = "..."`). Free-tier models on OpenRouter occasionally get rate-limited or deprecated. If AI features start failing with a 404 or 429, check [openrouter.ai/models](https://openrouter.ai/models) for a current free model and update that one constant. `rag.py` imports the same `MODEL` constant from `ai.py`, so both stay in sync.

## Design System

The UI uses a small, consistent token system (`index.css`): a warm paper background, ink-navy text, and an amber accent, with Space Grotesk for headings, Inter for body text, and JetBrains Mono for numbers. The signature visual device is **course color-tabbing**. Every assignment, note, and document card shows a colored left border tied to its course (`utils/courseColor.js`), so you can visually scan what belongs to what, the same way color-coded binders or highlighted tabs work in a real notebook.

## Status

All planned phases are implemented: auth & core CRUD, AI study tools, RAG, productivity features (timer/analytics/planner), the multi-agent assistant, a security hardening pass, a full UI redesign, and Docker packaging. This was built end-to-end as a learning project, a few intentional simplifications remain (e.g. due dates are stored as strings rather than native date types, and the quick-capture flow defaults notes to the first available course) as good next steps for further iteration.