# Deployment

Production setup and the workflow for changing things afterwards.

---

## The architecture, and why

| Layer | Where | Why not somewhere else |
| --- | --- | --- |
| Site (SSR + static) | **Vercel** | Nitro has a first-class Vercel preset, and Vercel's CDN serves the 183MB of photography with immutable caching at no egress charge. |
| Event log, admin data | **Supabase Postgres** | Row Level Security lets the browser write events with a public key while being unable to read a single row back. |
| Images shipped with the site | **In the repo, served by Vercel** | Already optimised and content-addressed. Free to serve. |
| Images added after launch | **Supabase Storage** | Lets a new photograph go live without a code deploy. |

**On putting all the images in Supabase Storage:** it is possible, and
`scripts/upload-media.mjs` will do it, but it is a downgrade for this site.
Supabase's free tier allows 5GB of egress a month; an image-heavy travel site
clears that in roughly a thousand visits and then it bills. Vercel is already
serving the same files from a CDN closer to the visitor, for nothing. Storage
earns its place for uploads, not for the static library.

---

## First deploy — in order

### 1. Rotate the service role key

Do this before anything else if the key has ever been pasted into a chat, an
email, or a screenshot. It bypasses Row Level Security completely: anyone
holding it can read and delete every customer enquiry.

`Supabase → Project Settings → API → Service Role → Reset`

The **anon** key is public by design and does not need rotating.

### 2. Create the database objects

`Supabase → SQL Editor → New query`, then run each file in order:

1. `supabase/migrations/0001_analytics.sql` — events table, indexes, RLS, views
2. `supabase/migrations/0002_storage.sql` — media bucket and index table
3. `supabase/migrations/0003_leads.sql` — subscribers and enquiry pipeline

Verify: the events table should exist and reject reads from the anon key.

```
curl "$SUPABASE_URL/rest/v1/events?select=id&limit=1" -H "apikey: $ANON_KEY"
```

An empty array `[]` means the table exists and RLS is doing its job — anon can
insert but sees nothing. `PGRST205` means the migration has not run.

### 3. Set environment variables in Vercel

`Project → Settings → Environment Variables`. Apply to Production **and**
Preview so preview deploys behave the same.

| Variable | Value | Exposed to browser |
| --- | --- | --- |
| `SITE_URL` | `https://www.nawisaadiholidays.com` | no |
| `VITE_SUPABASE_URL` | project URL | **yes** |
| `VITE_SUPABASE_ANON_KEY` | anon / publishable key | **yes** |
| `SUPABASE_URL` | same project URL | no |
| `SUPABASE_SERVICE_ROLE_KEY` | the **rotated** key | no |
| `ADMIN_PASSWORD` | long random string | no |
| `GOOGLE_SITE_VERIFICATION` | optional — a token is already committed | no |
| `GTM_ID` | optional — `GTM-5S3DM439` is already committed | no |
| `BING_SITE_VERIFICATION` | token from Bing Webmaster | no |
| `PLAUSIBLE_DOMAIN` | optional, e.g. `nawisaadiholidays.com` | no |

Anything prefixed `VITE_` is compiled into the JavaScript bundle and is public.
Never give a `VITE_` name to the service role key.

### 4. Deploy

Import the repo in Vercel. `vercel.json` already sets the build command
(`NITRO_PRESET=vercel npm run build`), the output directory, and immutable
caching for `/images`, `/frames` and `/videos`. No framework preset is needed.

### 5. Point the domain

`Vercel → Settings → Domains → Add`. Then confirm `SITE_URL` matches, because
the sitemap, canonicals and `og:` tags are all generated from it.

### 6. Submit to search engines

- [Google Search Console](https://search.google.com/search-console) — verify
  with `GOOGLE_SITE_VERIFICATION`, then submit `/sitemap.xml`
- [Bing Webmaster Tools](https://www.bing.com/webmasters) — same with
  `BING_SITE_VERIFICATION`

### 7. Confirm it is live

- `/` loads and the hero video plays
- `/admin` asks for a password, and the password works
- Click a WhatsApp button, then reload `/admin` — the click should appear
- `/sitemap.xml` shows your real domain, not the fallback
- `/robots.txt` ends with a `Sitemap:` line

---

## Everyday workflow

### Changing the site

```
git checkout -b some-change
# edit
node scripts/preflight.mjs      # the whole gate in one command
git commit && git push
```

Vercel builds a preview for the branch. Merge to `main` to go live.

`preflight.mjs` runs: secret scan, ESLint, unresolved-component check, the
production build, all 11 routes on desktop and mobile, every internal link and
subresource, gallery cross-contamination, SEO on a sample of each route type,
sitemap, robots, `/admin` gating, and the Supabase connection. It exits
non-zero if anything blocking fails, so it can gate a deploy.

### Adding a holiday package

Edit `src/data/catalogue.ts`. The package page, sitemap entry, structured data
and internal links are all generated from it — nothing else to touch.

Put the photograph in `public/images/destinations/` named after its country
(`turkey-05.jpg`). That naming is load-bearing: `scripts/audit-galleries.mjs`
uses it to catch an image filed under the wrong country, which is how a
Mount Bromo photograph was found sitting on the Uzbekistan card.

### Adding a photograph without deploying

```
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
  node scripts/upload-media.mjs ./new-photo.jpg --prefix packages
```

Re-encodes to 1600px, uploads, and records dimensions and size. Prints the
public URL to paste wherever you need it.

### Replacing the scroll film

Drop the clip in `source-media/`, then:

```
node scripts/extract-frames.mjs 120 journey your-clip.mp4
```

Source clips stay out of `public/` so they are never deployed; the extractor
copies one in for the run and removes it afterwards.

### Re-optimising images

After adding a batch of photographs:

```
node scripts/optimize-images.mjs
```

Re-encodes in place, skips anything already small, and never writes a file
larger than the original.

---

## The scripts

| Script | What it answers |
| --- | --- |
| `preflight.mjs` | Is this safe to deploy? |
| `verify-site.mjs` | Does every route render, desktop and mobile? |
| `verify-assets.mjs` | Does everything *inside* the pages resolve? |
| `verify-imports.mjs` | Any component used but never imported? |
| `audit-galleries.mjs` | Is any photograph filed under two countries? |
| `audit-content.mjs` | Missing prices, thin copy, hot-linked images? |
| `audit-darkness.mjs` | Has a section drifted away from the light design? |
| `optimize-images.mjs` | Re-encode photography in place |
| `extract-frames.mjs` | Turn a video into a scroll sequence |
| `upload-media.mjs` | Push an image to Supabase Storage |
| `scrape-live-brand.mjs` | Re-read the brand palette from the live site |

---

## If something breaks

**Images 404 after a deploy** — a filename changed but a reference did not.
`node scripts/verify-assets.mjs` names the exact file and the page it is on.

**`/admin` says Supabase is not configured** — `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY` or `ADMIN_PASSWORD` is missing in Vercel. The
message lists which.

**Events are not being recorded** — check `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` are set for the environment you are testing, and that
`0001_analytics.sql` has run. Tracking fails silently on purpose: analytics
should never break the site for a visitor.

**Sitemap shows the wrong domain** — `SITE_URL` is unset, so it fell back to
`https://www.nawisaadiholidays.com`.
