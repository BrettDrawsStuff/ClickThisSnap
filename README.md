# Click This — Farcaster Snap

A minimal two-screen Farcaster Snap. Screen 1 shows a "testing" button. Clicking it reveals `image.png`.

## Setup

```bash
npm install
```

## Add your image

Place your square PNG at:

```
public/image.png
```

## Local dev

```bash
SKIP_JFS_VERIFICATION=1 npm run dev
```

Then test at: https://farcaster.xyz/~/developers/snaps
Enter: `http://localhost:3003`

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the repo in Vercel
3. Set the environment variable:
   - `SNAP_PUBLIC_BASE_URL` = `https://your-deployment.vercel.app`
4. Deploy

After deploying, verify it works:

```bash
curl -sS -H 'Accept: application/vnd.farcaster.snap+json' https://your-deployment.vercel.app/
```
