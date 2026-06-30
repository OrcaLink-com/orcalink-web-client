# orca-link-client

App do **Cliente** do OrcaLink — **vertical slice de Orçamentos** (criar + listar).

Stack: React 18 · Vite · Tailwind (tokens de `@orcalink/design-tokens`) · TanStack Query · React Router · Capacitor.

## Pré-requisitos
- Node 20+ e o **backend `api/` rodando** (http://localhost:3000).

## Setup
```bash
cp .env.example .env          # (Windows: copy .env.example .env)
npm install                   # instala deps + design-tokens (file:../design-tokens)
npm run dev                   # http://localhost:5173
```

## Telas
- **/** — "Meus orçamentos" (lista, com badge de status colorido por token).
- **/novo** — Novo orçamento (categoria + descrição + foto opcional).

## Tipos da API (OpenAPI)
Com o backend rodando e o `openapi.json` gerado (`npm run openapi:export` no `api/`):
```bash
npm run gen:api               # gera src/lib/api-schema.d.ts a partir de ../api/openapi.json
```
> Hoje a UI usa tipos em `src/lib/types.ts` (espelham os DTOs). O schema gerado serve como
> contrato autoritativo para evoluir esses tipos sem duplicação.

## Rebranding (prova)
Edite `design-tokens/src/themes/orcalink.css` (ex.: `--color-brand-primary`) e recarregue:
a UI muda sem tocar em nenhum componente.

## Mobile (Capacitor) — passo posterior
```bash
npm run build
npx cap add android
npx cap sync
```
A slice roda primeiro como web app (`npm run dev`).
