# NoteSumm — Backend Server

Express.js REST API with JWT authentication and MongoDB Atlas.

---

## Prerequisites

- Node.js v18 or higher
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account

---

## Setup

### 1. Install dependencies

```bash
cd server
npm install
```

### 2. Configure environment variables

```bash
# Copy the example file
copy .env.example .env   # Windows CMD
# or
cp .env.example .env     # Mac / Linux
```

Open `.env` and fill in:

| Variable | Description |
|---|---|
| `MONGO_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long random secret (32+ chars) |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `30d` |
| `PORT` | Server port (default `5000`) |
| `CLIENT_URL` | Frontend origin for CORS (default `http://localhost:5173`) |

**Generate a secure JWT secret:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Get your MongoDB Atlas connection string

1. Log in at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free M0 cluster if you don't have one
3. Click **Connect → Drivers → Node.js**
4. Copy the URI and paste it as `MONGO_URI` in `.env`
5. Replace `<password>` with your Atlas database user password
6. Make sure your IP is whitelisted under **Network Access**

---

## Running the server

```bash
# Development (auto-restarts with nodemon)
npm run dev

# Production
npm start
```

The server starts on `http://localhost:5000` by default.

---

## API Endpoints

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Log in, receive JWT |
| GET | `/api/auth/profile` | Protected | Get current user info |
| POST | `/api/auth/logout` | Protected | Clear auth cookie |

### Users — `/api/users`

| Method | Path | Auth | Description |
|---|---|---|---|
| PUT | `/api/users/profile` | Protected | Update name / email |
| DELETE | `/api/users/profile` | Protected | Delete account |

---

### Example requests

**Signup**
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword"
}
```

**Successful response (201)**
```json
{
  "_id": "64abc...",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "createdAt": "2026-07-12T10:00:00.000Z",
  "token": "<jwt>"
}
```

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "securepassword"
}
```

**Protected route (two options)**
```http
# Option A: HttpOnly cookie (set automatically by browser)
GET /api/auth/profile

# Option B: Authorization header (Postman / testing)
GET /api/auth/profile
Authorization: Bearer <token>
```

---

## Project Structure

```
server/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── authController.js     # signup, login, getProfile, logout
│   └── userController.js     # updateProfile, deleteAccount
├── middleware/
│   ├── authMiddleware.js     # JWT protect middleware
│   ├── errorMiddleware.js    # 404 + global error handler
│   └── validateMiddleware.js # Input validation
├── models/
│   └── User.js               # Mongoose User schema
├── routes/
│   ├── authRoutes.js
│   └── userRoutes.js
├── utils/
│   ├── asyncHandler.js       # Wraps async handlers
│   └── generateToken.js      # Signs JWT + sets cookie
├── .env.example
├── .gitignore
├── package.json
└── server.js                 # Entry point
```
