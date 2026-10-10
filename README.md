# Hotel Shyam Residency

Premium website for Hotel Shyam Residency, Joshiyara, Uttarkashi.

## Run locally

1. Put your MongoDB connection string in `backend/.env`:

```
PORT=5000
MONGODB_URI=YOUR_MONGODB_URI
```

If `MONGODB_URI` is still the placeholder, the API starts an in-memory MongoDB so bookings still work on this machine.

2. Backend:

```
cd backend
npm install
npm run dev
```

3. Frontend:

```
cd frontend
npm install
npm run dev
```

The site uses `VITE_API_URL` from `frontend/.env`.
