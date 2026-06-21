# Security Policy

BurnPast handles sensitive data, so security reports are taken seriously.

## Supported Versions

Security fixes target the latest `main` branch until the project starts publishing stable releases. After the first stable release, supported versions will be documented here.

## Reporting a Vulnerability

Use GitHub private vulnerability reporting if it is available on the repository.

If private reporting is not available, open a minimal public issue that says a vulnerability exists, but do not include exploit details, payloads, secrets, or reproduction steps in the public issue. A maintainer will move the discussion to a private channel.

Please include:

- affected commit or version;
- impacted surface: web app, API, CLI, storage, deployment, or docs;
- expected impact;
- safe reproduction steps that do not expose real secrets;
- any suggested fix or mitigation.

## Security Expectations

- Do not submit real API keys, tokens, passwords, private keys, or production data.
- Do not test against a public deployment without permission.
- Do not attempt persistence, data exfiltration, or denial-of-service testing outside your own instance.
- Use controlled local instances for proof-of-concept work.

## Design Boundaries

BurnPast encrypts secret payloads client-side and stores ciphertext server-side. This does not remove all trust requirements. Users still need to trust the served frontend code, their browser/runtime, their local machine, DNS/TLS, and any self-hosted deployment configuration.
