# Traveloop 🌍✈️

**Traveloop** is an intelligent, AI-powered travel planning ecosystem designed to transform how travelers discover, plan, and manage their journeys. Developed for high-performance evaluation, it combines a premium user experience with a cutting-edge generative AI backend.

---

## 🚩 The Problem Statement

Planning a trip today is an exercise in information overload. Travelers spend an average of **10-20 hours** across dozens of static blogs, outdated forums, and rigid booking sites just to draft a single itinerary. 

**The core issues are:**
- **Static Templates**: Most "itinerary builders" just reuse the same top 5 tourist spots regardless of the traveler's budget or personality.
- **Data Fragmentation**: Keeping track of expenses, checklists, and daily schedules usually requires juggling 3-4 different apps.
- **Outdated Information**: Static guides don't account for current travel trends, evolving costs, or real-time travel logic.

## 🌉 The Gap We Fill

Traveloop bridges the massive gap between **passive searching** and **active generation**. 

While existing platforms act as digital brochures, Traveloop acts as a **Digital Concierge**. We replace the "Search-Filter-Read" loop with a **"Generate-Refine-Travel"** workflow. 
- **From Static to Dynamic**: We don't have a database of trips; we have a brain that *creates* them.
- **All-in-One Utility**: By unifying budgeting, checklists, and journaling with AI generation, we eliminate the need for tool-switching.
- **Zero-Template Personalization**: Every trip is unique, generated in real-time to fit the specific constraints of the user.

---

## ✨ Key Features

- **🤖 Live AI Itinerary Engine**: Powered by **Google Gemini 2.5 Flash**, the platform dynamically synthesizes personalized itineraries from scratch. It performs real-time reasoning to suggest authentic activities, precise timing, and local cost estimations.
- **📊 Dynamic Budgeting**: Real-time expense tracking with category-wise breakdowns (flights, hotels, dining, etc.) and intelligent budget alerts to keep you on track.
- **🔐 Secure Authentication**: Robust JWT-based security with password hashing, supporting full user registration, login, and instant **Guest Sessions** for frictionless exploration.
- **📍 Itinerary Management**: Multi-stop trip support with activity reordering, location details, and booking status tracking.
- **📋 Smart Packing Lists**: Apply intelligent checklist templates (Beach, City, Mountain) that adapt to your trip type or create fully custom lists.
- **✍️ Travel Journaling**: A digital memory vault with taggable journal entries and media attachments to preserve your adventures.
- **🔗 Public Sharing**: Generate unique share tokens to showcase your trips or allow others to clone your adventures into their own accounts.

---

## 🛠️ Tech Stack

### Backend & AI
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python) - *Chosen for high performance and async capabilities.*
- **AI Intelligence**: [Google Gemini 2.5 Flash](https://ai.google.dev/) - *Utilized for its rapid reasoning and context windows.*
- **ORM**: [SQLAlchemy](https://www.sqlalchemy.org/) - *Ensures clean, robust data management.*
- **Database**: SQLite (Development) / PostgreSQL Compatible.
- **Security**: JWT (JSON Web Tokens) & `bcrypt` for secure state management.

### Frontend
- **Framework**: React.js
- **Styling**: Tailwind CSS
- **Design Signature**: "Luxury Atlas" aesthetic (Grain textures, Glassmorphism, and 3D tilts) to provide a premium feel.

---

## 🧠 AI-First Architecture (Zero-Template Approach)

Unlike traditional travel apps that store a fixed set of "recommended trips" in a database, Traveloop utilizes an **inference-driven architecture**. When a user requests a trip, the backend triggers a reasoning chain through the Gemini model:
1. **Context Analysis**: Evaluates the destination, duration, and budget.
2. **Resource Allocation**: Splitting the budget logically between flights, accommodation, and activities.
3. **Activity Synthesis**: Generating realistic, geographically-aware activities for morning and afternoon slots.
4. **Validation**: Ensuring the generated JSON structure matches our system schemas for immediate UI rendering.

This ensures that no two Traveloop trips are ever exactly the same.

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
│   ├── routers/        # Modular API route handlers (Auth, Trips, Expenses, etc.)
│   ├── models.py       # SQLAlchemy Database Models
│   ├── schemas.py      # Pydantic validation schemas
│   └── main.py         # App entry point & middleware
├── frontend/           # React Web Application
├── database/           # Schema definitions and database utilities
└── README.md           # Documentation
```

---

<div align="center">
  <sub>Built with ❤️ for the Traveloop Hackathon</sub>
</div>