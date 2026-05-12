# Sponsored Transactions Setup Guide

## What Changed
Your app now uses **sponsored transactions** — the backend pays gas fees for users. Users no longer need to get faucet tokens. Your contract remains unchanged.

## ✅ What You Need to Do

### Step 1: Generate a Sponsor Account
You need a wallet with testnet tokens to sponsor all user transactions:

```bash
# Generate a new private key for the sponsor account
node -e "const crypto = require('crypto'); const pk = '0x' + crypto.randomBytes(32).toString('hex'); console.log('Private Key:', pk); const acc = require('genlayer-js').createAccount(pk); console.log('Address:', acc.address);"
```

Copy the output **Private Key** and **Address**.

### Step 2: Fund the Sponsor Account
1. Go to [GenLayer Bradbury Faucet](https://faucet.genlayer.com)
2. Paste the sponsor **Address** from Step 1
3. Request tokens (enough for all your users' analyses)

### Step 3: Add Sponsor Key to .env
Edit `.env` and replace the placeholder:

```env
SPONSOR_PRIVATE_KEY=0x<your-generated-private-key-from-step-1>
VITE_API_URL=http://localhost:3001
```

### Step 4: Install Dependencies
```bash
npm install
```

### Step 5: Run Locally
Open 2 terminal windows:

**Terminal 1 (Backend):**
```bash
npm run server
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

Visit `http://localhost:3000` — users can now analyze without getting faucet tokens!

---

## 🚀 Deployment

### For Production
Update `.env` with production URLs:

```env
VITE_API_URL=https://your-backend-domain.com
```

### Option A: Deploy Backend + Frontend Together (Simplest)
1. Deploy to **Vercel** (handles both Node + React)
   - Push to GitHub
   - Connect to Vercel
   - Set env variables in Vercel dashboard
   - Done ✓

### Option B: Deploy Separately
- **Frontend**: Vercel, Netlify, or any static host
- **Backend**: Railway, Render, Fly.io, or Heroku
- Update `VITE_API_URL` to your backend URL

---

## 🔒 Security Notes
- Keep `SPONSOR_PRIVATE_KEY` secret (never commit to git)
- Add `.env` to `.gitignore` if not already
- Monitor sponsor account balance
- Consider adding rate limits to `/api/analyze` for production

## 📊 Monitoring
- Sponsor address: Check transaction history at [Bradbury Explorer](https://bradbury.genlayer.com)
- Backend health: `curl http://localhost:3001/api/health`

## ✨ That's it!
Users now just write a tweet and click analyze. No faucet needed.
