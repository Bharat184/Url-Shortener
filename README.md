## 📌 README.md — URL Shortener Service

```md
# 🔗 URL Shortener with Expiry, Reusable Keys & Analytics

A full-stack URL Shortener application built using **Node.js**, **Express**, **MongoDB**, and **EJS** with **TailwindCSS** UI.

Supports:
- 🔐 User Registration / Login (Local + Google OAuth)
- ✂️ Short URL Generation
- 📊 Click Analytics tracking
- ⏳ URL Expiry functionality
- ♻️ Reusable short codes via cooldown workers
- 📜 Full user-wise URL history
- ☁️ Cloud-ready modular architecture

---

## 🚀 Features

| Feature | Status |
|--------|:-----:|
| Create short URLs | ✔️ |
| User Authentication (Local + Google OAuth) | ✔️ |
| Expiry date selection | ✔️ |
| Reusable key pool with cooldown | ✔️ |
| Dashboard showing all user URLs | ✔️ |
| Click analytics | ✔️ |
| Copy short link button | ✔️ |
| Modern UI using TailwindCSS + EJS | ✔️ |

---

## 🧱 Tech Stack

**Backend**
- Node.js, Express.js
- MongoDB + Mongoose
- Redis (optional future caching)

**Auth**
- Passport.js
- JWT + Cookies
- Google OAuth2

**Frontend**
- EJS Templates
- TailwindCSS

**Workers**
- Node Cron workers to:
  - Mark URLs expired
  - Release short codes back to pool

---

## 📂 Folder Structure

```

src/
├ controllers/
├ routes/
├ models/
├ services/
├ workers/
├ middleware/
├ utils/
├ views/ (EJS + Tailwind UI)
└ config/

```

Worker Jobs:
```

src/workers/expiryWorker.ts     // active → expired → cooldown
src/workers/cooldownWorker.ts   // cooldown → free

```

---

## 🗄️ Database Collections

### 🔐 Users
Stores registered users

### 🔑 ShortCodes (key pool)
```

code: string
status: "free" | "active" | "cooldown"
activeHistoryId: ObjectId (UrlHistory mapping)
cooldownUntil: Date

```

### 📜 UrlHistory
```

userId: ObjectId (User)
shortCode: string
longUrl: string
clickCount: number
status: "active" | "expired"
expiresAt: Date | null

````

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repo
```bash
git clone https://github.com/yourusername/url-shortener.git
cd url-shortener
````

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Create `.env` File

```env
MONGO_URI=mongodb://127.0.0.1:27017/urlshortener
JWT_SECRET=replace_me
GOOGLE_CLIENT_ID=replace_me
GOOGLE_CLIENT_SECRET=replace_me
BASE_URL=http://localhost:3000
```

### 4️⃣ Build + Run Dev Server

```bash
npm run dev
```

Server default:

```
http://localhost:3000
```

---

## 🏃 Worker Processes

Workers handle expiry + cooldown automation.

Run workers separately:

```bash
npm run start:expiry
npm run start:cooldown
```

Or combined:

```bash
npm run workers
```

---

## 🧪 API Endpoints

| Method | Endpoint       | Auth | Description              |
| ------ | -------------- | ---- | ------------------------ |
| POST   | `/url/shorten` | ✔️   | Create short link        |
| GET    | `/:code`       | ❌    | Redirect using shortcode |
| GET    | `/dashboard`   | ✔️   | User dashboard           |

---

## 🎯 Future Enhancements

* ⏱️ Countdown badges on dashboard (`Expires in 2 days`)
* 📈 Analytics charts per URL
* 🔳 QR Code generation
* 🚀 Redis caching for ultra-fast redirects
* 🌑 Dark Mode UI toggle
* 📦 Docker support

---

If you like this project, feel free to ⭐ the repo or contribute!
