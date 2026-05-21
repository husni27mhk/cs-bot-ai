# Deploy ke Cloudflare (GitHub CI)

## Environment variables (Cloudflare Dashboard)

Set di **Workers & Pages** → proyek → **Settings** → **Variables** (Production + Preview):

| Name | Description |
|------|-------------|
| `N8N_WEBHOOK_URL` | `https://husni27k-snayy-spaces.hf.space/webhook/v1/chat-cs` |
| `HF_ACCESS_TOKEN` | Token HF (Read repo) — wajib jika Space **private** |

Jangan gunakan prefix `NEXT_PUBLIC_` untuk token.

## Connect GitHub

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Connect to Git**
2. Pilih repository ini
3. Build settings:

| Setting | Value |
|---------|--------|
| Production branch | `main` |
| Build command | `npx opennextjs-cloudflare build` |
| Root directory | `/` |
| Node.js version | **20** |

4. Tambahkan environment variables di atas
5. Deploy — URL: `https://chatbot-cs.<subdomain>.workers.dev` (atau custom domain)

## Local preview (Workers runtime)

```bash
# Isi HF_ACCESS_TOKEN di .dev.vars jika Space private
npm run preview:cf
```

## Local development (Node)

```bash
npm run dev
```

Uses `.env.local` for `N8N_WEBHOOK_URL` and `HF_ACCESS_TOKEN`.

## Manual deploy (CLI)

```bash
npm run deploy:cf
```

Requires `wrangler login` and secrets configured in Cloudflare.
