# ShopO Backend

Simple Node.js + Express + MongoDB backend with login API.

## Setup

1. Copy `.env.example` to `.env`.
2. Update `MONGODB_URI` to your MongoDB Compass connection string.
3. Install dependencies:
   - `npm install`
4. Run development server:
   - `npm run dev`

## APIs

- `GET /api/health`
- `POST /api/auth/login`

### Login Payload

```json
{
  "email": "admin@shopo.com",
  "password": "Admin@123"
}
```

On first startup, backend auto-creates the admin user from `.env` if it does not exist.
