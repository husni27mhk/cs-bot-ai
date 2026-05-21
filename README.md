<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/7dc91004-b381-4606-b1e7-c9314e369f47

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies: `npm install`
2. Copy [.env.example](.env.example) to `.env.local` and set `N8N_WEBHOOK_URL` (and `HF_ACCESS_TOKEN` if your Hugging Face Space is private)
3. Run the app: `npm run dev`

## Deploy to Cloudflare (GitHub CI)

See [DEPLOY_CLOUDFLARE.md](DEPLOY_CLOUDFLARE.md) for build command, environment variables, and GitHub connection steps.
