# BurnPast

Encrypted, expiring secret links built with Nuxt 4. The server stores only encrypted payloads; the AES key stays in the URL fragment and is never sent to the API.

## Current Flow

1. The browser generates an AES-GCM key.
2. If a password is set, the browser derives extra key material with PBKDF2 and uses it to derive the content key.
3. The secret is encrypted locally.
4. The API stores encrypted content with a TTL.
5. The share link contains the base key after `#`.
6. The viewer loads metadata first, then reveals the encrypted payload on demand.
7. If burn-after-reveal is enabled, the API atomically consumes the payload during reveal.

## Requirements

- Node.js 20+
- npm
- Upstash Redis for production storage

## Development

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`.

Without `UPSTASH_REDIS_URL` and `UPSTASH_REDIS_TOKEN`, development uses in-memory storage. Secrets disappear when the server restarts. Production fails closed with HTTP 503 unless persistent storage is configured or `ALLOW_MEMORY_STORAGE=true` is explicitly set.

## Environment

```env
SITE_URL=http://localhost:3000

UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=

ALLOW_MEMORY_STORAGE=false
TRUST_PROXY=false

MAX_PASTE_SIZE=102400
MAX_REQUEST_BODY_SIZE=262144
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_WINDOW=3600
```

## Security Model

- Web secrets are encrypted in the browser with AES-GCM. The URL fragment key is not sent to the API.
- Password-protected web secrets use PBKDF2-derived material for both the server reveal gate and the local content key derivation.
- Developer CLI messages use RSA-OAEP-256 to wrap a per-message AES-GCM key. Private keys and auth tokens stay in `~/.burnpast/identity.json` with `0600` permissions.
- Developer contacts are trusted on first use and pinned by public key fingerprint in `~/.burnpast/contacts.json`.
- Burn-after-reveal uses atomic consume operations in storage, so two concurrent reveals cannot both succeed.
- API responses carrying secret metadata or ciphertext are marked `no-store`, and production pages ship with security headers including CSP, frame denial, no-referrer, and HSTS.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run cli -- help
```

## Developer CLI

BurnPast also ships a terminal workflow for developer-to-developer secrets. Each developer creates a local RSA-OAEP keypair. The server stores only public keys and encrypted inbox payloads; private keys stay in `~/.burnpast/identity.json`.

During local development, expose the command once:

```bash
npm link
```

The package exposes `burnpast` as the primary command. `burnpaste` remains available as a compatibility alias.

Create identities:

```bash
burnpast init
```

`init` prompts for an alias when the terminal is interactive. In scripts it falls back to the OS username. You can still force the value when needed:

```bash
burnpast init --alias @alice --server http://localhost:3000
```

Keep the receiver terminal open:

```bash
burnpast watch
```

Send a secret:

```bash
burnpast send --to @bob --clipboard
burnpast send --to @bob --text "demo-secret-token"
burnpast send --to @bob .env
```

Receive secrets:

```bash
burnpast inbox
burnpast reveal <message-id>
burnpast reveal <message-id> --copy
```

Useful environment variables:

```env
BURNPAST_HOME=/path/to/local/identity-dir
BURNPAST_API_URL=http://localhost:3000
```

Legacy `BURNPASTE_HOME` and `BURNPASTE_API_URL` variables are still accepted.

The CLI refuses non-local plain HTTP by default. Use HTTPS in production. `--allow-insecure` is only for controlled local tests.

## Production VPS Checklist

1. Set `SITE_URL=https://your-domain.tld`.
2. Set `UPSTASH_REDIS_URL` and `UPSTASH_REDIS_TOKEN`; keep `ALLOW_MEMORY_STORAGE=false`.
3. Put the app behind HTTPS before public use.
4. Set `TRUST_PROXY=true` only if the reverse proxy overwrites `X-Forwarded-For` and `X-Real-IP`.
5. Keep `.env`, `.env.*`, `.burnpast/`, `identity.json`, and `contacts.json` out of Git.
6. Run `npm audit --omit=dev` and `npm run build` before deploying.
7. Run the built server with `node .output/server/index.mjs` or a process manager such as systemd/PM2.

## API

- `POST /api/paste` creates a secret.
- `GET /api/paste/:id` returns public metadata only.
- `POST /api/paste/:id/reveal` returns encrypted content and burns one-time secrets.
- `POST /api/dev/identity` registers a developer alias and public key.
- `GET /api/dev/identity/:alias` returns a developer public key.
- `POST /api/dev/message` sends an encrypted inbox secret.
- `GET /api/dev/inbox` lists authenticated inbox metadata.
- `POST /api/dev/message/:id/reveal` reveals and optionally burns an inbox secret.

## Notes

- Password protection uses client-side PBKDF2 with a per-secret salt.
- Rate-limit keys store a short SHA-256 hash of the client IP, not the raw IP.
- Production deployments must configure Upstash Redis or another persistent store.
