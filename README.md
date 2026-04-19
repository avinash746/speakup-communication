# SpeakUp — Communication Intelligence Platform

> AI-powered text analysis and improvement across multiple languages. Deep feedback on clarity, tone, and vocabulary — with explanations that teach you *why* each change makes your writing stronger.

---

## Architecture Overview

```
speakup/
├── backend/                   # Node.js + Express API
│   └── src/
│       ├── config/            # MongoDB connection
│       ├── controllers/       # Route handlers (auth, analysis, history)
│       ├── middleware/        # JWT auth, error handling
│       ├── models/            # Mongoose schemas (User, Analysis)
│       ├── routes/            # Express routers
│       ├── services/          # AI service (Anthropic API)
│       └── index.js           # App entry point
│
└── frontend/                  # React 18 SPA
    └── src/
        ├── components/        # Reusable UI components
        │   └── dashboard/     # AnalysisResult, ScoreRing
        ├── context/           # AuthContext (JWT + user state)
        ├── pages/             # LoginPage, RegisterPage, DashboardPage, HistoryPage
        ├── services/          # Axios API client
        └── App.jsx            # Router + protected routes
```

---

## Prerequisites

- **Node.js** v18+
- **MongoDB** (local or MongoDB Atlas)
- **Groq API Key** — [get one here](https://console.groq.com/)

---

## Quick Start

### 1. Clone & Navigate
```bash
git clone <your-repo-url>
cd speakup
```

### 2. Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your values:
#   MONGODB_URI=mongodb://localhost:27017/speakup
#   JWT_SECRET=<random-secret-string>
#   GROQ_API_KEY=<your-key>
#   FRONTEND_URL=http://localhost:3000

# Start development server
npm run dev
# → Server runs on http://localhost:5000
```

### 3. Setup Frontend
```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env:
#   REACT_APP_API_URL=http://localhost:5000/api

# Start dev server
npm start
# → App runs on http://localhost:3000
```

---

## Install Commands (All Dependencies)

### Backend
```bash
cd backend && npm install bcryptjs cors dotenv express express-rate-limit express-validator helmet jsonwebtoken mongoose morgan node-fetch && npm install --save-dev nodemon
```

### Frontend
```bash
cd frontend && npm install @tanstack/react-query axios framer-motion lucide-react react react-dom react-hot-toast react-router-dom react-scripts recharts
```

---

## Environment Variables

### Backend `.env`
| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | Token expiry (default: 7d) |
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `FRONTEND_URL` | React app URL for CORS |
| `NODE_ENV` | `development` or `production` |

### Frontend `.env`
| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Backend API base URL |

---

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/me` | Yes | Get current user |
| PATCH | `/api/auth/preferences` | Yes | Update language preference |

### Analysis
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/analysis` | Yes | Analyze & improve text |
| GET | `/api/analysis/:id` | Yes | Get analysis by ID |

### History
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/history` | Yes | Paginated history with filters |
| GET | `/api/history/stats` | Yes | Aggregate statistics |
| PATCH | `/api/history/:id/favorite` | Yes | Toggle favorite |
| DELETE | `/api/history/:id` | Yes | Delete analysis |

---

## Database Design

### User Schema
```js
{
  name: String,
  email: String (unique, indexed),
  password: String (bcrypt hashed, hidden from queries),
  preferredLanguage: Enum ['en','es','fr','de','hi','zh','ar','pt','ja','ko'],
  stats: {
    totalAnalyses: Number,
    avgClarityScore: Number,
    totalWordsImproved: Number
  },
  timestamps: true
}
```

### Analysis Schema
```js
{
  userId: ObjectId (ref: User, indexed),
  originalText: String,
  improvedText: String,
  language: String,
  tone: Enum ['professional','casual','academic','persuasive','empathetic','neutral'],
  scores: { clarity, tone, vocabulary, overall: Number 0-100 },
  suggestions: [{
    type: Enum ['clarity','tone','vocabulary','grammar','conciseness','structure'],
    original: String,
    improved: String,
    explanation: String,  // WHY the change makes it better
    impact: Enum ['high','medium','low']
  }],
  summary: String,
  wordCount: { original, improved: Number },
  isFavorited: Boolean,
  tags: [String],
  timestamps: true
}
// Compound index: { userId: 1, createdAt: -1 }
```

---

## Deployment

### Backend (e.g. Render / Railway)
1. Set all environment variables in your hosting dashboard
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Set `NODE_ENV=production`
5. Update `FRONTEND_URL` to your deployed frontend URL

### Frontend (e.g. Vercel / Netlify)
1. Set `REACT_APP_API_URL` to your deployed backend URL
2. Build command: `npm run build`
3. Output directory: `build`

---

## Key Technical Decisions

| Decision | Rationale |
|---|---|
| **Claude Sonnet** for analysis | Best balance of speed and reasoning quality for linguistic tasks |
| **Mongoose** over raw MongoDB driver | Schema validation at application layer prevents bad data |
| **JWT in localStorage** | Simpler for SPA; httpOnly cookies would require CORS config changes |
| **React Query** for data fetching | Automatic caching, deduplication, and background refetching |
| **Rate limiting per-route** | AI endpoint has stricter limit (20/min) vs general API (100/15min) |
| **Compound index** on userId+createdAt | Optimizes the most common query pattern (user's history sorted by date) |
| **Aggregation pipeline** for stats | Efficient server-side computation instead of client-side calculation |
