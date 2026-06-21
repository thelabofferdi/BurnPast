# Contributing

Thanks for helping improve BurnPast. This project is security-sensitive, so small, focused changes are preferred.

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`.

For CLI testing without installing globally:

```bash
PATH="$PWD/bin:$PATH"
burnpast help
```

## Before Opening a Pull Request

Run these checks locally:

```bash
npm run build
npm audit --omit=dev
```

For security-sensitive changes, also test the relevant flow manually:

```bash
burnpast init
burnpast watch --once
burnpast send --to @alias --text "demo-secret"
burnpast reveal <message-id>
```

## Development Rules

- Keep plaintext secrets out of server storage, logs, errors, and tests.
- Keep private keys and auth tokens local to `BURNPAST_HOME` or `~/.burnpast`.
- Do not weaken request size limits, TTL limits, ID entropy, or burn-after-reveal semantics without explaining the tradeoff.
- Prefer small pull requests with clear risk notes.
- Update docs when changing CLI commands, environment variables, API behavior, or deployment requirements.

## Commit Scope

Good pull requests usually fit one of these scopes:

- `web`: browser encryption or UI flows;
- `api`: Nuxt/Nitro API handlers;
- `cli`: developer terminal workflow;
- `storage`: Redis or in-memory storage behavior;
- `security`: hardening, headers, validation, crypto, rate limiting;
- `docs`: README, deployment, security policy.

## Vulnerabilities

Do not open a public pull request with exploit details for an unpatched vulnerability. Follow `SECURITY.md` first.
