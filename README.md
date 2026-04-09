# Nexora Frontend

Production React frontend for Nexora SaaS.

## Environment Variables

Create a `.env` file for local development:

```env
VITE_API_URL=https://your-backend.onrender.com
VITE_RAZORPAY_KEY=rzp_test_xxxxxxxxxxxxx
```

Important notes:

- `VITE_API_URL` must be set.
- Do not add a trailing slash.
- Do not include extra spaces.
- Use the deployed backend URL in Vercel.

## API Behavior

- All frontend requests use `src/services/api.js`.
- The frontend sends requests to `/api/...` endpoints.
- Auth token is attached automatically in `src/services/apiClientSetup.js`.
- API request, response, and error logs are printed in browser console.

## Vercel Checklist

- Set `VITE_API_URL` in Vercel project environment variables.
- Redeploy after any env var change.
- Hard refresh browser cache after deployment.
- Verify `GET /api/health` from the UI banner.
- Confirm no frontend call is using `localhost`.

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
