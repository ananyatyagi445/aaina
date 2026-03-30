# 🪞 Aaina — Indian Skin Tone Color Analysis
**Created by Ananya Tyagi**

---

## Project Structure

```
aaina/
├── backend/
│   └── server.js        ← Node.js API server (NO npm install needed)
├── frontend/
│   └── index.html       ← Frontend web app
└── README.md
```

---

## 🚀 How to Run

### Step 1 — Start the Backend
```bash
cd backend
node server.js
```
You'll see:
```
🪞 AAINA — Backend API Server Running
URL → http://localhost:3000
```

### Step 2 — Open the Frontend
Open `frontend/index.html` in your browser.
*(Just double-click the file — no server needed for frontend)*

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | No | Create account |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/logout` | Yes | Logout |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/preferences` | Yes | Get saved skin tone |
| POST | `/api/preferences` | Yes | Save skin tone preference |
| GET | `/api/colours` | No | List all 4 skin tones |
| GET | `/api/colours/:tone` | Yes | Full colour data for a tone |
| GET | `/api/colours/:tone/clothing` | Yes | Clothing colours |
| GET | `/api/colours/:tone/makeup` | Yes | Makeup shades |
| GET | `/api/colours/:tone/jewelry` | Yes | Jewelry colours |
| GET | `/api/colours/:tone/footwear` | Yes | Footwear colours |
| GET | `/api/colours/:tone/seasonal` | Yes | Seasonal palettes |
| GET | `/api/shopping/:tone` | Yes | Shopping links |
| GET | `/api/health` | No | Server health check |

**:tone** = `fair` | `wheatish` | `dusky` | `deep`

---

## 🗄️ Database
- File: `backend/database.json` (auto-created on first run)
- Stores: users, sessions, preferences
- No external database needed

## ⚙️ Requirements
- Node.js 14+ (built-in modules only — no npm install needed)
- Any modern browser for the frontend
