# VA for BnB website

Next.js 16 site with PostgreSQL and S3-compatible storage, packaged with Docker so it runs the same on any machine.

## Quick start (any device with Docker)

```bash
cp .env.example .env          # Windows PowerShell: Copy-Item .env.example .env
docker compose up --build
```

Open http://localhost:3000. Check http://localhost:3000/api/health: it should report `{"database":"ok","storage":"ok"}`.

`COMPOSE_PROFILES` in `.env` decides what `docker compose up` starts:

| Profile | What runs | Use it for |
|---|---|---|
| `dev` (default in `.env.example`) | database, storage, site with hot reload | working on the site in Docker |
| *(empty)* | database and storage only | running `npm run dev` on your machine (fastest on Windows/macOS) |
| `prod` | database, storage, production build | testing the live build |

Or pick one directly: `npm run docker:dev`, `npm run docker:prod`, `npm run docker:services`, and `npm run docker:down` to stop.

## What's in the stack

| Service | Port | Notes |
|---|---|---|
| `app` / `app-prod` | 3000 | The site. `app` = dev server, `app-prod` = standalone production server |
| `db` | 5432 | PostgreSQL 17. Data persists in the `db-data` volume |
| `storage` | 8333 | SeaweedFS, an S3-compatible stand-in for Cloudflare R2. Data in `storage-data` |
| `storage-init` | – | Creates the bucket, then exits |
| `migrate` | – | Applies database migrations from `/drizzle`, then exits |

Reset all local data: `docker compose down -v`.

## Where things go

| What | Where |
|---|---|
| Premade downloads (spreadsheets, PDFs, templates we provide) | `public/downloads/`, committed to git and served at `/downloads/<file>` |
| Files a tool creates or users upload | S3 bucket, via `src/lib/server/storage.ts` |
| Data a tool saves | PostgreSQL, via `src/lib/server/db.ts` |
| Database tables | `src/db/schema.ts` |

### Building a tool that needs the database or storage

1. Add tables to `src/db/schema.ts`.
2. `npm run db:generate` writes a SQL migration into `/drizzle` (commit it).
3. `docker compose up` (or `docker compose run --rm migrate`) applies it. On your machine: `npm run db:migrate`.
4. Use it from Server Components, Server Functions or Route Handlers:

```ts
import { getDb } from "@/lib/server/db";
import { files } from "@/db/schema";
import { putFile, getDownloadUrl } from "@/lib/server/storage";

await putFile("tools/finance-check/report.xlsx", buffer, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
await getDb().insert(files).values({ key: "tools/finance-check/report.xlsx", filename: "report.xlsx", contentType: "...", size: buffer.length, tool: "finance-check" });
const url = await getDownloadUrl("tools/finance-check/report.xlsx", { filename: "report.xlsx" });
```

`src/lib/server/*` is server-only; importing it into a client component fails the build on purpose.

Storage helpers: `putFile`, `deleteFile`, `getDownloadUrl` (signed, private), `getUploadUrl` (signed browser upload), `getPublicUrl` (only when the bucket is public), `checkStorage`.

`npm run db:studio` opens a browser UI for the database.

## Going live

Only environment variables change. Set them on the server or hosting platform (see `.env.example`):

- **Database:** `DATABASE_URL` pointing at your managed Postgres (add `?sslmode=require` if the provider needs it). Run migrations on deploy with `npm run db:migrate` or the `migrate` service.
- **Cloudflare R2:**
  1. In Cloudflare, create an R2 bucket and an R2 API token with *Object Read & Write*.
  2. Set `S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com`, `S3_REGION=auto`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`. Leave `S3_PUBLIC_ENDPOINT` empty.
  3. Optional: connect a custom domain or enable public access on the bucket and set `S3_PUBLIC_URL`.
  4. If browsers upload directly with `getUploadUrl`, add a CORS rule on the bucket allowing `PUT` from your site's domain.
- **Site URL:** `NEXT_PUBLIC_SITE_URL=https://www.yourdomain.com` (it's baked in at build time, so rebuild after changing it).

With Docker on a server: `docker compose --profile prod up -d --build`. Remove the `db`, `storage` and `storage-init` services there if you use managed Postgres and R2.

## Without Docker

```bash
npm install
docker compose up -d db storage storage-init migrate   # or point .env at your own Postgres/S3
npm run dev
```

## Project layout

- `src/app/(pages)/…`: one folder per page, each with `layout.tsx` (SEO wrapper), `seo.ts`, `content.ts`, `page.tsx`
- `src/config/`: brand, pricing and navigation settings
- `src/components/`: shared UI
- `src/lib/server/`: database, storage and env helpers (server only)
- `src/db/schema.ts`: database tables. `/drizzle`: generated migrations
