<div align="center">

# 🌍 TRAVELOOP

### *The AI-Powered Digital Concierge for Modern Explorers*

> **Generate. Refine. Travel.**

[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-Frontend-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![Gemini AI](https://img.shields.io/badge/Gemini_2.5_Flash-AI_Engine-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/gemini)
[![MIT License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)

<br/>

**Traveloop** is a next-generation, AI-first travel planning platform that replaces hours of fragmented research with a single intelligent experience. Powered by **Google Gemini 2.5 Flash**, it generates hyper-personalized itineraries, manages budgets, curates packing lists, and captures journey memories — all in one cinematic, luxury interface.

<br/>

---

</div>

## 📌 Table of Contents

- [The Problem](#-the-problem)
- [Our Solution](#-our-solution)
- [Core Features](#-core-features)
- [AI Architecture](#-ai-first-architecture)
- [Tech Stack](#️-tech-stack)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [What Makes Us Different](#-what-makes-traveloop-different)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)

---

## 🚨 The Problem

Modern travel planning is **broken**.

Travelers spend **6–10 hours** switching between blogs, booking platforms, spreadsheets, maps, and packing apps just to organize a single trip. The result is decision fatigue, generic plans, and missed experiences.

| Pain Point | Current Reality |
|---|---|
| 🔍 Research overload | Dozens of tabs, outdated blogs, conflicting advice |
| 📋 Generic templates | One-size-fits-all itineraries that ignore personality |
| 💸 Budget guesswork | No real-time tracking or intelligent cost estimation |
| 🧩 Fragmented tools | Separate apps for every single task |
| 🤖 Zero personalization | No platform truly understands your travel style |

> The industry offers search engines. We offer intelligence.

---

## 💡 Our Solution

Traveloop replaces the outdated **Search → Filter → Read → Repeat** loop with:

```
Generate → Refine → Travel
```

We built an **AI Digital Concierge** that understands you — your budget, style, group size, and preferences — and crafts a complete, unique journey in seconds. No templates. No recycled plans. No static recommendations.

---

## ✨ Core Features

### 🤖 AI Itinerary Generation
Powered by **Gemini 2.5 Flash**, every itinerary is generated in real time with:
- Day-wise schedules with realistic timing
- Geographically logical activity sequencing
- Smart local recommendations
- Context-aware cost estimation per destination

### 💸 Smart Budget Management
- Real-time expense tracking against your budget
- Category-wise visual analytics (accommodation, food, transport, activities)
- Intelligent over-budget alerts with animated warnings
- Estimated vs. actual spending comparisons

### 📍 Multi-Stop Trip Planning
- Multi-city itinerary support with drag-to-reorder stops
- Activity timeline management per destination
- Booking status tracking (booked / pending)
- Location-aware scheduling logic

### 📋 Intelligent Packing Lists
AI-generated checklists adapted to:
- Weather and climate of destination
- Trip duration and activity type
- Travel category (beach, mountain, urban, business)
- Personal preferences

### ✍️ Digital Travel Journal
- Rich entry creation with date and stop tagging
- Media attachment support
- Timeline history of all memories
- Publicly shareable journal entries

### 🌍 Public Trip Sharing
- One-click public itinerary sharing
- Unique share tokens per trip
- Clone any shared itinerary to your own account
- Beautiful read-only public view with Traveloop branding

### 🔐 Secure Authentication
- JWT-based authentication
- bcrypt password hashing
- Secure session management
- Guest traveler access for quick demo

### 📊 Analytics Dashboard
- Personal travel footprint visualization
- Top cities, total distance, days abroad
- Expense breakdown charts (pure SVG)
- Journey milestones and achievements

---

## 🧠 AI-First Architecture

Unlike traditional apps that serve static content from a database, Traveloop uses an **inference-driven architecture** — every recommendation is generated fresh for every user.

```
┌─────────────────────────────────────────────────────┐
│                   USER INPUT                        │
│  Destination · Budget · Duration · Preferences      │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              CONTEXT ANALYSIS LAYER                 │
│  Evaluate intent · Parse constraints · Score style  │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│           GEMINI 2.5 FLASH — AI ENGINE              │
│  Generate itinerary · Allocate budget · Sequence    │
│  activities · Estimate costs · Add local context    │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              VALIDATION LAYER                       │
│  Schema check · UI compatibility · Structured JSON  │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│            PERSONALIZED JOURNEY OUTPUT              │
│  Day-wise itinerary · Budget plan · Packing list    │
└─────────────────────────────────────────────────────┘
```

### AI Workflow Steps

**1. Context Analysis** — AI evaluates destination, duration, budget, group type, and travel style.

**2. Budget Allocation** — Intelligently distributes spend across flights, accommodation, food, transport, and activities.

**3. Activity Synthesis** — Generates morning, afternoon, and evening experiences with local context and logical routing.

**4. Validation** — All output is validated against internal schemas for reliable, structured rendering in the UI.

---

## 🛠️ Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| **FastAPI** | High-performance async Python backend |
| **Google Gemini 2.5 Flash** | Real-time AI itinerary generation |
| **SQLAlchemy** | ORM and database management |
| **JWT** | Secure token-based authentication |
| **bcrypt** | Password hashing and security |
| **SQLite / PostgreSQL** | Flexible database layer |
| **Uvicorn** | ASGI server for production |

### Frontend

| Technology | Purpose |
|---|---|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first responsive styling |
| **Framer Motion** | Smooth cinematic animations |
| **Glassmorphism UI** | Premium luxury visual identity |
| **Pure SVG Charts** | Custom analytics visualizations |
| **Leaflet.js** | Interactive travel map |
| **localStorage** | Client-side data persistence |

---

## ⚡ Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- Google Gemini API key → [Get one here](https://aistudio.google.com)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/traveloop.git
cd traveloop
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r ../requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend/` folder:

```env
JWT_SECRET=your_super_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=sqlite:///./traveloop.db
```

### 4. Start the Backend

```bash
uvicorn backend.main:app --reload
```

Backend runs at → `http://localhost:8000`

### 5. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at → `http://localhost:3000`

### 6. Open the App

Visit `http://localhost:3000` and click **Start Exploring** to begin your journey. ✈️

---

## 📖 API Documentation

FastAPI auto-generates interactive documentation once the backend is running:

| Type | Path |
|---|---|
| **Swagger UI** | `/docs` |
| **ReDoc** | `/redoc` |

### Key Endpoints

```
POST   /auth/signup          → Register new user
POST   /auth/login           → Authenticate and get JWT token

GET    /trips                → Get all trips for current user
POST   /trips                → Create a new trip
GET    /trips/{id}           → Get trip details
DELETE /trips/{id}           → Delete a trip

POST   /trips/{id}/generate  → AI-generate itinerary for trip
GET    /trips/{id}/stops     → Get all stops for a trip
POST   /trips/{id}/stops     → Add a stop

POST   /expenses             → Log an expense
GET    /expenses/{trip_id}   → Get expenses for a trip

GET    /shared/{token}       → Get public shared itinerary
```

---

## 📂 Project Structure

```
traveloop/
│
├── backend/                    # FastAPI backend
│   ├── routers/
│   │   ├── auth.py             # Authentication endpoints
│   │   ├── trips.py            # Trip CRUD operations
│   │   ├── stops.py            # Stop management
│   │   ├── activities.py       # Activity management
│   │   ├── expenses.py         # Budget tracking
│   │   └── ai.py               # Gemini AI integration
│   ├── models.py               # SQLAlchemy database models
│   ├── schemas.py              # Pydantic request/response schemas
│   ├── services/
│   │   └── gemini.py           # AI generation service
│   └── main.py                 # FastAPI app entry point
│
├── frontend/                   # Next.js frontend
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   ├── login/              # Screen 1: Auth
│   │   └── (app)/
│   │       ├── layout.tsx      # Shared sidebar layout
│   │       ├── dashboard/      # Screen 2: Dashboard
│   │       ├── trips/          # Screens 3, 4, 5, 6
│   │       ├── explore/        # Screens 7, 8
│   │       ├── budget/         # Screen 9
│   │       ├── checklist/      # Screen 10
│   │       ├── shared/         # Screen 11
│   │       ├── profile/        # Screen 12
│   │       ├── journal/        # Screen 13
│   │       └── analytics/      # Screen 14
│   ├── components/
│   │   ├── HeroSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── GlobeSection.tsx
│   │   ├── CustomCursor.tsx
│   │   └── ...
│   ├── hooks/
│   │   └── hooks.ts            # useTrips, useAuth, useExpenses...
│   └── lib/
│       └── design-tokens.ts    # Shared color/font variables
│
├── requirements.txt            # Python dependencies
├── README.md
└── .env.example                # Environment variable template
```

---

## 🏆 What Makes Traveloop Different?

| Traditional Travel Apps | ✈️ Traveloop |
|---|---|
| Static, recycled itineraries | AI-generated unique journeys every time |
| Generic one-size-fits-all suggestions | Hyper-personalized to your style and budget |
| 5+ separate apps needed | One unified intelligent ecosystem |
| Manual, exhausting planning | Instant AI-assisted generation |
| Search-based, passive experience | Generation-based, intelligent experience |
| No learning or adaptation | Context-aware recommendations |

---

## 🔮 Roadmap

- [ ] 🌐 Real-time flight price integration
- [ ] 🤖 AI travel assistant chatbot
- [ ] 📸 AI-generated trip memory highlights
- [ ] 🏨 Smart hotel recommendation engine
- [ ] ✈️ Intelligent multi-stop route optimization
- [ ] 📱 Native mobile app (iOS + Android)
- [ ] 🌦️ Live weather-aware daily planning
- [ ] 🛰️ Interactive 3D globe visualization
- [ ] 👥 Group trip collaboration features
- [ ] 🔔 Real-time booking price alerts

---

## 🤝 Contributing

We welcome contributions from developers, designers, and AI enthusiasts.

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/amazing-feature

# 3. Commit your changes
git commit -m "Add amazing feature"

# 4. Push to your branch
git push origin feature/amazing-feature

# 5. Open a Pull Request
```

Please read our contributing guidelines before submitting a PR.

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

<br/>

## 🌍 TRAVELOOP

### *Redefining Intelligent Travel Planning*

*Built with ❤️ using AI, FastAPI, Next.js, and Google Gemini 2.5 Flash*

<br/>

**[🐛 Report a Bug](https://github.com/your-username/traveloop/issues)**

<br/>

> *"The world is yours to explore — let AI plan the way."*

</div>
