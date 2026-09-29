# EcoVault

A gamified waste-management app — scan waste items to identify their category and earn points, climb a leaderboard, join community cleanup events, and donate toward environmental initiatives.

## Stack

- **client/** — React (Create React App) + Tailwind CSS + MUI
- **server/** — Node.js/Express + MongoDB (Mongoose)
- **model/** — Flask service that classifies scanned images using a local Keras model

All three run as separate processes locally.

## Prerequisites

- Node.js (v18+) and npm
- Python 3.9+
- A MongoDB instance (local `mongod`, or a MongoDB Atlas connection string)

## 1. Server setup

```bash
cd server
npm install
cp .env.example .env
```

Fill in `server/.env`:

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Random secret for signing auth tokens |
| `STRIPE_SECRET_KEY` | Stripe secret key (for donations) |
| `CLIENT_ORIGIN` | The client's URL, e.g. `http://localhost:3000` |
| `ADMIN_SIGNUP_SECRET` | A secret code required to register an admin account at `/admin/signup` |

Run the server:

```bash
npm run dev   # nodemon, auto-restarts on file changes
# or
npm start
```

Server runs on `http://localhost:1337` by default.

## 2. Model service setup

The waste-classification service runs in its own Python virtual environment (kept isolated from your system Python).

```bash
cd model
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
./venv/bin/python app.py
```

Runs on `http://localhost:4000`.

## 3. Client setup

```bash
cd client
npm install
cp .env.example .env
```

Fill in `client/.env`:

| Variable | Description |
|---|---|
| `REACT_APP_GEOAPIFY_API_KEY` | Geoapify API key (used to auto-fill locality on signup) |
| `REACT_APP_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (for donations) |
| `REACT_APP_MODEL_API_URL` | URL of the Flask model service, e.g. `http://localhost:4000` |

Run the client:

```bash
npm start
```

Runs on `http://localhost:3000` and proxies `/api` requests to the server (see `"proxy"` in `client/package.json`).

## Running everything together

Open three terminals:

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd model && ./venv/bin/python app.py

# Terminal 3
cd client && npm start
```

Then visit `http://localhost:3000`.

## Creating an admin account

Regular signups aren't admins by default. Only admins can create events and access the Admin Dashboard (`/admin`) to manage users and events.

1. Set `ADMIN_SIGNUP_SECRET` in `server/.env` to a value only you know.
2. Go to `http://localhost:3000/admin/signup` and register using that code.
3. From then on, that admin can promote/demote other users directly from the Admin Dashboard — no need to reuse the signup code.

## Project structure

```
client/    React frontend
server/    Express API + MongoDB models
model/     Flask waste-classification service
```
