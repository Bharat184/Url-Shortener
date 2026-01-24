```md
# 🔗 URL Shortener

A production-ready URL shortener with:  

- User authentication (local + Google OAuth)  
- Short URL generation with reusable key pool  
- Optional expiry date per link  
- Automatic expiry and cooldown workers  
- Dashboard with link history, click counts, status  
- EJS + TailwindCSS based frontend  

---

## 🧰 Features

| ✅ | Feature |
|:--:|---------|
| 🔐 | User login / signup (email & Google) |
| ✂️ | Short URL creation (unique key) |
| ♻️ | Reusable short-code pool with cooldown logic |
| 📄 | View history: long URL, short code, clicks, status, expiry |
| 🛠️ | Worker jobs for expiry & code recycling |
| 📦 | Modern modular architecture |

---

## 📦 Tech Stack

- **Backend**: Node.js, Express.js, TypeScript  
- **Database**: MongoDB + Mongoose  
- **Authentication**: Passport.js, JWT, Cookies  
- **Frontend**: EJS templating + TailwindCSS  
- **Workers**: Node Cron jobs for expiry & cooldown  

---
## 🏗️ System Architecture (with Caching)


                         ┌─────────────────────────┐
                         │        Browser / User    │
                         └──────────────┬───────────┘
                                        │
                                        │ HTTP Request
                                        ▼
                          ┌─────────────────────────┐
                          │      Express Server     │
                          └──────────┬──────────────┘
                                     │
                      ┌──────────────┴───────────────┐
                      │                              │
                      │                              │
                      ▼                              ▼
           ┌─────────────────────┐         ┌───────────────────┐
           │   Redis Cache       │         │  MongoDB Database  │
           │ (GET shortcode hit) │         │ (URL + Key Pool)  │
           └─────────┬──────────┘         └──────────┬────────┘
                     │  HIT                               │ MISS (or write)
                     │                                    │
                     │                                    ▼
                     │                        ┌──────────────────────┐
                     │                        │ ShortCodes Collection │
                     │                        │  - free / active     │
                     │                        │  - cooldown          │
                     │                        └─────────┬────────────┘
                     │                                    │
                     │                                    ▼
                     │                        ┌──────────────────────┐
                     │                        │ UrlHistory Collection │
                     │                        │ - longUrl            │
                     │                        │ - expiresAt          │
                     │                        │ - clickCount         │
                     │                        └─────────┬────────────┘
                     │                                    │
                     └────────────────────────────────────┘
                                        │
                             Update click counts
                                        │
                                        ▼
                           Send redirect response
                                   (302 Redirect)

## 🔁 Worker Processes

                             ┌─────────────────┐
                             │ Expiry Worker   │
                             └───────┬─────────┘
                                     │
                                     ▼
                active URLs → expired → cooldown stage
                                     │
                                     ▼
                             ┌─────────────────┐
                             │Cooldown Worker  │
                             └───────┬─────────┘
                                     │
                                     ▼
                             Return code to free pool


````

---

## ⚙️ Installation

### Steps

```bash
git clone https://github.com/Bharat184/Url-Shortener.git
cd Url-Shortener
pnpm install
````

Create `.env` file in project root:

```env
MONGO_URI=mongodb://127.0.0.1:27017/urlshortener
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret
BASE_URL=http://localhost:3000
```

Build the project:

```bash
pnpm build
```

---

## 🚀 Running the App & Workers

### Start the web server

```bash
pnpm start
```

Open in browser: `http://localhost:3000`

---

### Start Worker Jobs

Worker jobs manage:

* Expiry of old URLs
* Recycling of short-codes after cooldown

Run in separate terminals:

```bash
pnpm start:expiry
pnpm start:cooldown
```

Alternatively run both with a combined script:

```bash
pnpm workers
```

---

## 🔄 Short-Code Lifecycle

```text
FREE → ACTIVE → EXPIRED → COOLDOWN → FREE
```

* **FREE** — Key is in pool, unused
* **ACTIVE** — Assigned to an active URL
* **EXPIRED** — URL expired, no longer valid
* **COOLDOWN** — Short code blocked for a short window to avoid cached redirects
* **FREE** — Code returned to pool for reuse

---

## 🔗 Main Endpoints & Routes

| Method | Path           | Auth required | Description                   |
| ------ | -------------- | ------------- | ----------------------------- |
| POST   | `/shorten`     | ✅             | Create a new short URL        |
| GET    | `/:code`       | ⛔             | Redirect to original long URL |
| GET    | `/dashboard`   | ✅             | Show user’s URL history       |
| GET    | `/login`       | ⛔             | Login page                    |
| POST   | `/login`       | ⛔             | Authenticate user             |
| GET    | `/register`    | ⛔             | Sign-up page                  |
| POST   | `/register`    | ⛔             | Create a new user             |


---

## 📈 What Next / Future Enhancements

* 📊 Click analytics graph (daily/weekly/monthly)
* 🔳 QR code generation per short link
* 🕒 Extend / renew expiry from dashboard
* 🌑 Rate Limiter
* 📦 Docker / Kubernetes deployment config

---
