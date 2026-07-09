# UNIVIBE – University Event Management System

🌐 **Live Demo**: [https://univibe-event-management.onrender.com](https://univibe-event-management.onrender.com)

## 🚀 How to Run

```bash
cd backend
node server.js
# OR
npm run nodeserver
# OR (for live-reload during development)
npm run dev
```

Then open → **http://localhost:5050**

---

## 📁 Project Structure

```
F:\UNIVIBE\
├── backend/                  ← Single entry point: node server.js
│   ├── config/db.js          ← MongoDB connection
│   ├── controllers/          ← Route logic (auth, admin, club, event, student)
│   ├── middleware/error.js   ← Global error handler
│   ├── models/               ← Mongoose models (12 models)
│   ├── routes/               ← Express route definitions
│   ├── scripts/seed.js       ← Database seeder
│   ├── uploads/              ← Local file upload storage
│   ├── public/               ← Frontend (HTML + CSS + JS)
│   │   ├── index.html        ← Event Explorer (home)
│   │   ├── login.html        ← Authentication
│   │   ├── admin.html        ← Super Admin Dashboard
│   │   ├── club.html         ← Club Head Dashboard
│   │   ├── student.html      ← Student Dashboard
│   │   ├── event.html        ← Event Detail Page
│   │   ├── css/styles.css    ← Global styles
│   │   └── js/               ← JavaScript files
│   │       ├── api.js        ← Shared API helper (fetchAPI)
│   │       ├── auth.js       ← Auth + sidebar/navbar renderer
│   │       ├── index.js      ← Home page logic
│   │       ├── admin.js      ← Admin dashboard logic
│   │       ├── club.js       ← Club dashboard logic
│   │       ├── student.js    ← Student dashboard logic
│   │       └── event.js      ← Event detail logic
│   ├── .env                  ← Environment variables
│   ├── package.json
│   └── server.js             ← ✅ Main entry: API + Static file server
├── start.js                  ← Optional root shortcut launcher
└── README.md
```

---

## 🔌 API Endpoints

| Route | Description |
|-------|-------------|
| `GET /` | Home (Event Explorer) |
| `GET /login` | Authentication Page |
| `GET /admin` | Super Admin Dashboard |
| `GET /club` | Club Head Dashboard |
| `GET /student` | Student Dashboard |
| `GET /event?id=<id>` | Event Detail Page |
| `GET/POST /api/auth/*` | Authentication endpoints |
| `GET/POST /api/admin/*` | Admin management |
| `GET/POST /api/clubs/*` | Club operations |
| `GET/POST /api/events/*` | Event CRUD + registrations |
| `GET/POST /api/students/*` | Student dashboard data |
| `GET /health` | Health check |

---

## 🛠️ Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Frontend**: Vanilla HTML + CSS + JavaScript
- **Icons**: Lucide Icons (CDN)
- **Styling**: Tailwind CSS (CDN) + custom CSS
- **Auth**: JWT tokens (stored in localStorage)

---

## ⚙️ Environment Variables (`backend/.env`)

```env
PORT=5050
MONGODB_URI=mongodb://localhost:27017/univibe
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
AUTO_OPEN=true
```
