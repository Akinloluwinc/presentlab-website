# presentlab.org

The Present Lab website. Plain HTML and CSS, no build step, hosted on Netlify.

## How it works

- Every push to `main` is deployed automatically by Netlify within about a minute.
- Each page is one self-contained HTML file (its styles are inside it), so a page can be
  edited without touching any other page.
- Netlify keeps every previous deploy, so any change can be rolled back from the Netlify
  dashboard without touching the code.

## Pages

| URL | File |
| --- | --- |
| `/` | `index.html` — the entry page ("the gate") |
| `/ai-digital/` | `ai-digital/index.html` |
| `/health-security/` | `health-security/index.html` |
| `/social-economic-justice/` | `social-economic-justice/index.html` |
| `/philanthropy/` | `philanthropy/index.html` |

`assets/` holds the three logo files. `netlify.toml` holds hosting settings (security headers,
caching, redirects).

## Brand

- Ink `#0A0A0A`, paper `#F3F0E7`, rule `#DED8C9`, muted `#6F6A5F`, signal green `#00FF00`.
- Practice accents: AI `#4D5DFF`, Health Security `#00FF00`, Social & Economic Justice `#FF4D1F`,
  Philanthropy `#A855F7`.
- Display type Archivo 800; body Inter. Loaded from Google Fonts.

## Making changes

Changes are made by Claude on request. Describe what should change on which page; the change is
made here, deployed by Netlify, and can be reviewed on the live site or a preview link.
