# BurnPast CLI

Developer CLI for BurnPast encrypted secret sharing.

## Install

```bash
npm install -g burnpast
```

Install in a project:

```bash
npm install burnpast
npx burnpast help
```

Use without installing globally:

```bash
npx burnpast help
```

## Usage

```bash
burnpast init
burnpast watch
burnpast send --to @bob --clipboard
burnpast send --to @bob --text "demo-secret-token"
burnpast reveal <message-id>
```

`burnpaste` is kept as a compatibility alias.

## Server

By default, the CLI uses `https://burnpast.enarilab.xyz`. Point it at another BurnPast API with:

```bash
BURNPAST_API_URL=https://your-burnpast.example
```
