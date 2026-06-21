# BurnPast - Documentation Technique

Ce document complète le `README.md`. Le `README.md` reste la source courte pour installer, lancer et déployer l'application.

## Etat Actuel

BurnPast fournit deux surfaces autour du même backend Nuxt/Nitro :

- une application web de partage de secrets chiffrés côté navigateur ;
- une CLI développeur avec identités locales, inbox chiffrée et commandes `burnpast init`, `burnpast watch`, `burnpast send`, `burnpast reveal`.

Le serveur ne stocke pas de texte en clair. Il stocke des payloads chiffrés, des métadonnées minimales, des clés publiques développeur et des hash de tokens d'identité.

## Architecture Securite

### Web

1. Le navigateur génère une clé AES-GCM 256 bits.
2. La clé de partage reste dans le fragment d'URL après `#`, donc elle n'est pas envoyée à l'API.
3. Le contenu est chiffré localement avant stockage.
4. Si un mot de passe est défini, PBKDF2 derive un vérificateur serveur et un matériau séparé utilisé pour dériver la clé de contenu.
5. La révélation d'un secret `burnAfterReading` consomme l'entrée de stockage de façon atomique.

### CLI Developpeur

1. `burnpast init` crée une identité locale RSA-OAEP-256.
2. Le serveur reçoit uniquement la clé publique et le hash du token d'authentification.
3. `burnpast send --to @alias` chiffre le message en AES-GCM et enveloppe la clé AES avec la clé publique du destinataire.
4. Les clés privées et tokens restent dans `~/.burnpast/identity.json` avec permissions `0600`.
5. Les contacts sont épinglés par empreinte dans `~/.burnpast/contacts.json` pour détecter un changement de clé publique.

## Backend

Endpoints principaux :

- `POST /api/paste` : crée un secret web chiffré.
- `GET /api/paste/:id` : retourne uniquement les métadonnées publiques.
- `POST /api/paste/:id/reveal` : retourne le payload chiffré et brûle si nécessaire.
- `POST /api/dev/identity` : enregistre une identité développeur.
- `GET /api/dev/identity/:alias` : retourne une identité publique développeur.
- `POST /api/dev/message` : envoie un secret CLI chiffré.
- `GET /api/dev/inbox` : liste les métadonnées d'inbox authentifiée.
- `POST /api/dev/message/:id/reveal` : révèle et brûle un secret CLI si configuré.

## Durcissement Applique

- IDs `nanoid(21)` pour augmenter l'espace de recherche.
- Limite de taille vérifiée même sans `Content-Length`.
- Stockage mémoire interdit en production sauf `ALLOW_MEMORY_STORAGE=true` explicite.
- Consommation atomique des secrets one-time avec Redis `GETDEL` ou équivalent mémoire.
- Enregistrement d'alias développeur atomique avec `NX` côté Redis.
- Validation stricte des alias, IDs, payloads base64url et clés publiques RSA.
- Rate limiting par action avec hash court de l'IP client.
- `TRUST_PROXY=false` par défaut pour éviter le spoofing d'IP via `X-Forwarded-For`.
- Headers `no-store` sur les API sensibles.
- Headers sécurité applicatifs : CSP, frame denial, no-referrer, permissions policy, HSTS.
- CLI bloquée sur HTTP non-local sauf `--allow-insecure`.
- Fichiers locaux sensibles ignorés par Git : `.env`, `.env.*`, `.burnpast/`, `identity.json`, `contacts.json`.

## Variables D'environnement

```env
SITE_URL=https://burnpast.example

UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=

ALLOW_MEMORY_STORAGE=false
TRUST_PROXY=false

MAX_PASTE_SIZE=102400
MAX_REQUEST_BODY_SIZE=262144
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_WINDOW=3600
```

## Checklist VPS

1. Installer Node.js 20+ ou plus récent.
2. Configurer un domaine HTTPS devant l'application.
3. Définir `SITE_URL` avec l'URL HTTPS publique.
4. Définir `UPSTASH_REDIS_URL` et `UPSTASH_REDIS_TOKEN`.
5. Garder `ALLOW_MEMORY_STORAGE=false` en production.
6. Activer `TRUST_PROXY=true` seulement si le reverse proxy réécrit les headers IP.
7. Exécuter `npm audit --omit=dev` et `npm run build` avant déploiement.
8. Lancer `.output/server/index.mjs` avec systemd, PM2 ou un service équivalent.

## Commandes CLI Attendues

```bash
burnpast init
burnpast watch
burnpast send --to @bob --clipboard
burnpast send --to @bob --text "demo-secret-token"
burnpast reveal <message-id>
```

Alias historique aussi disponible : `burnpaste`.

## Verifications Recentes

- `npm run build`
- `npm audit --omit=dev`
- flux API web : création, métadonnées, mauvais mot de passe, révélation, deuxième révélation refusée
- limite de requête chunked sans `Content-Length`
- scénario CLI : `init`, `send`, `watch --once`, `reveal`, deuxième révélation refusée
- fail-closed production sans Redis : HTTP 503
