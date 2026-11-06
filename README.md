# presentlab.org

The Present Lab website. A small static site built with [Eleventy](https://www.11ty.dev/) and hosted on
Netlify, with a notes editor at `/admin/` ([Decap CMS](https://decapcms.org/)).

## How it works

- Every push to `main` is built and deployed by Netlify within a couple of minutes. Netlify keeps
  every previous deploy, so any change can be rolled back from the Netlify dashboard.
- Pull requests get a private deploy preview (Netlify team login required). Previews do not use
  the Free plan's monthly credits; each production deploy uses 15.
- The build turns the templates and Markdown files in `src/` into the finished site in `_site/`.

## What lives where

| What | Where |
| --- | --- |
| Home page | `src/index.njk` |
| Notes (events, methods, publications), one file each | `src/notes/*.md` |
| Notes list and the Events, Methods, Publications views | `src/notes.njk`, `src/notes-by-type.njk` |
| Practice pages, one file each | `src/practices/*.md` (file name = address, e.g. `health-security.md` → `/health-security/`) |
| Page layouts and the note row | `src/_includes/` |
| Names, contact details, navigation, practice names and addresses | `src/_data/site.js` |
| Stylesheet, fonts, logos | `src/assets/` |
| Files uploaded through the editor (PDFs) | `src/assets/uploads/` |
| The editor: settings and preview | `src/admin/config.yml`, `src/admin/preview.js` |
| Build settings | `eleventy.config.js`, `netlify.toml` |

## The editor

Open `presentlab.org/admin/` and sign in with GitHub. Anyone who publishes needs a GitHub account with
write access to this repository (repository Settings → Collaborators). Sign-in goes through the GitHub
provider installed on the Netlify project (Project configuration → Security → OAuth).

- **Events, Methods, Publications**: each is a note. Save keeps a draft (off the site); set the status
  to Ready, then Publish. An event stays under "Coming up" until its date has passed, as of the last build.
- **Practice pages**: the edit, introduction, focus areas and home-page description of each practice.
  A practice's name and address are fixed in `src/_data/site.js`.
- The editor is pinned to one Decap CMS version in `src/admin/index.html`. Upgrade on a preview first.

The editor publishes to `main`, so a published note is live a couple of minutes later. Drafts live on
their own `cms/...` branches until they are published.

## Before publishing

- Findings and procedures belong to the institutions we support. Publish them only with their agreement.
- Never publish airport-level scores or other site-level assessment results.
- Practice leads are not named on the site until January 2027.

## Working on it locally

```sh
npm install
npm start          # site at http://localhost:8080, rebuilds on save
npm run cms        # in a second terminal: lets /admin/ edit local files instead of GitHub
npm run build      # one-off build into _site/
```

## Type and colour

Source Serif 4 only, self-hosted (SIL Open Font License; licence in `src/assets/fonts/`). Ink `#000000`,
paper `#FFFFFF`, secondary text `#4B4B47`, struck text `#8C8C87`, rules `#E2E2DD`, signal green `#00FF00`
for insertions and text selection only. The tracked change (struck word, written-in word) appears in
titles only: the home page headline, practice names and section titles, never in running text or notes.
