# BurnPast

Encrypted, expiring secret sharing for the web and terminal.

BurnPast stores ciphertext, not plaintext. Web links keep the AES key in the URL fragment, and the developer CLI encrypts messages for a recipient public key before sending them to the API.

## Features

- Web app for encrypted one-time secret links
- Developer CLI for terminal-to-terminal secret sharing
- Client-side AES-GCM encryption
- Optional password protection
- Burn-after-reveal and timed expiry
- Redis-backed storage for shared deployments

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`.

## CLI

Expose the command locally:

```bash
npm link
```

Create an identity:

```bash
burnpast init
```

Watch your inbox:

```bash
burnpast watch
```

Send a secret:

```bash
burnpast send --to @bob --clipboard
burnpast send --to @bob --text "demo-secret-token"
burnpast send --to @bob .env
```

Reveal a secret:

```bash
burnpast reveal <message-id>
```

`burnpaste` is kept as a compatibility alias.

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

Local development can use memory storage. Shared deployments should use Redis and HTTPS.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run cli -- help
```

## Security

- The server never needs plaintext secret content.
- URL fragment keys are not sent to the API.
- CLI private keys stay local under `~/.burnpast`.
- One-time secrets are consumed atomically on reveal.

See [SECURITY.md](SECURITY.md) for vulnerability reporting.
