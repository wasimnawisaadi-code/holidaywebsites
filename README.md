# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Deploying to Vercel

The Nitro build defaults to a Cloudflare target, so the Vercel preset has to be
selected explicitly. `vercel.json` does this via the build command:

```
NITRO_PRESET=vercel npm run build   →  .vercel/output
```

Import the repo in Vercel and it will pick that up; no framework preset needs to
be chosen (`"framework": null`).

### Environment

| Variable   | Purpose |
| ---------- | ------- |
| `SITE_URL` | Canonical origin used for `rel=canonical`, `og:` tags and every `sitemap.xml` entry. Set this to the custom domain once it is attached. Without it the site falls back to Vercel's deployment hostname, then to `https://www.nawisaadi.com`. |
| `GOOGLE_SITE_VERIFICATION` | Token from Google Search Console → *HTML tag* verification. Emits `<meta name="google-site-verification">`. Omit and no tag is rendered. |
| `BING_SITE_VERIFICATION` | Token from Bing Webmaster Tools. Emits `<meta name="msvalidate.01">`. |
| `PLAUSIBLE_DOMAIN` | Enables cookieless Plausible analytics for that domain. Omit and the site loads no third-party scripts at all. |

### After the first deploy

1. Add the property in [Google Search Console](https://search.google.com/search-console)
   and [Bing Webmaster Tools](https://www.bing.com/webmasters), verify with the
   env vars above, then submit `https://<domain>/sitemap.xml` in both.
2. Confirm the sitemap resolves to the live domain — it is generated from
   `SITE_URL`, so an unset variable produces the fallback domain instead.

Static assets under `/images`, `/frames` and `/videos` are content-hashed by
filename and served immutable for a year.
