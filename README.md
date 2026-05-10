# Traveloop 🌍✈️

**Traveloop** is an intelligent, AI-powered travel planning ecosystem designed to transform how travelers discover, plan, and manage their journeys. Developed for a high-stakes hackathon, it combines a sleek user experience with a cutting-edge backend architecture.

---

## ✨ Key Features

- **🤖 Live AI Itinerary Engine**: Powered by **Google Gemini 2.5 Flash**, the platform dynamically synthesizes personalized, multi-day itineraries from scratch. Unlike traditional apps that rely on hardcoded templates, Traveloop's engine performs real-time reasoning to suggest authentic activities, precise timing, and local cost estimations based on your unique destination and budget.
- **🔐 Secure Authentication**: Robust JWT-based security with password hashing, supporting full user registration, login, and instant **Guest Sessions**.
- **📊 Dynamic Budgeting**: Real-time expense tracking with category breakdowns (flights, hotels, dining, etc.) and intelligent budget alerts.
- **📍 Itinerary Management**: Multi-stop trip support with activity reordering and booking status tracking.
- **📋 Smart Packing Lists**: Apply pre-built checklist templates (Beach, City, Mountain) or create custom lists.
- **✍️ Travel Journaling**: Capture memories with taggable journal entries and media attachments.
- **🔗 Public Sharing**: Generate unique share tokens to showcase your trips or allow others to clone your adventures.

---

## 🛠️ Tech Stack

### Backend & AI
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **AI Intelligence**: [Google Gemini 2.5 Flash](https://ai.google.dev/) (Direct API Integration)
- **ORM**: [SQLAlchemy](https://www.sqlalchemy.org/)
- **Database**: SQLite (Local) / PostgreSQL (NeonDB Compatible)
- **Security**: JWT & `bcrypt`

---

## 🧠 AI-First Architecture

Traveloop stands apart by using a **Zero-Template Approach**. Every activity, cost estimate, and schedule generated is the result of active inference by the Gemini model. This ensures that the data is always fresh, context-aware, and specifically tailored to the traveler's financial constraints and geographic location.

### Frontend
- **Framework**: React.js
- **Styling**: Tailwind CSS
- **Design Signature**: "Luxury Atlas" aesthetic (Glassmorphism, 3D tilts, grain textures)

---

## ⚙️ Quick Start

### 1. Prerequisites
- Python 3.9+
- Node.js & npm

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r ../requirements.txt
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Running the Ecosystem
```bash
# Start Backend (on port 8000)
uvicorn backend.main:app --reload

# Start Frontend (in a new terminal)
cd frontend
npm install
npm run dev
```

---

## 📖 API Documentation

The backend provides interactive documentation out of the box:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 📂 Project Structure

```text
├── backend/            # Python FastAPI Service
│   ├── routers/        # Modular API route handlers
│   ├── models.py       # SQLAlchemy Database Models
│   ├── schemas.py      # Pydantic validation schemas
│   └── main.py         # App entry point & middleware
├── frontend/           # React Web Application
├── database/           # Historical migration scripts
└── README.md           # You are here
```

---

<div align="center">
  <sub>Built with ❤️ for the Traveloop Hackathon</sub>
</div>