INTER SPORTS INFRA LLP — WEBSITE (v2: Eleventy + Decap CMS)
=============================================================

This replaces the old flat-HTML export. It looks and performs identically
on the front end, but every heading, paragraph, list, table and image on
every page is now editable through a login page at /admin — no code
editing required for routine updates.

WHY THIS CHANGED
-----------------
The original static HTML had text hardcoded directly into each page.
That meant a CMS could only ever manage the exact spots someone wired up
by hand (which is all the first version did — images only). This version
separates CONTENT (what you edit) from TEMPLATES (how it's displayed):

  content/*.njk       → the actual words, numbers and image paths for
                         each page, as YAML "frontmatter" at the top of
                         each file
  _includes/*.njk      → the HTML/CSS structure, shared header/footer,
                         and the one shared template used by all 5 sport
                         pages (football-turf, pickleball-courts, etc.)
  _data/site.json       → global settings used everywhere: phone, email,
                         address, GSTIN, service areas, certifications

Eleventy reads the content files, drops them into the templates, and
outputs plain static HTML — so the deployed site is exactly as fast as
before. Nothing runs server-side for visitors.

DEPLOY
------
This now needs a build step (the old version didn't).
Netlify build settings:
  Build command:     npm run build
  Publish directory:  _site
These are already set in netlify.toml at the repo root, so Netlify
should pick them up automatically if this repo is connected via Git
(not drag-and-drop — drag-and-drop skips the build step entirely).

Local preview:
  npm install
  npm run build      → outputs to _site/
  npm start           → local dev server with live reload

CONTENT ADMIN (/admin)
-----------------------
Same setup as before: Netlify Identity + Git Gateway. If this is a
brand-new Netlify site (not the same one as the old version), you need
to redo:
  1. Site configuration → Identity → Enable Identity
  2. Identity → Registration → Invite only
  3. Identity → Services → Git Gateway → Enable
  4. Identity → Invite users → your email

Then visit yourdomain.com/admin, log in, and every page's content —
text, lists, tables, images — appears as editable fields grouped by
page. Saving there commits directly to this GitHub repo and Netlify
redeploys automatically within a minute or two.

A few fields are marked "Advanced" with a warning hint (icon SVG path
data, raw HTML blocks in the blog post template) — these are technical
and safe to leave alone; editing them carelessly can visually break
that one element.

FILES
-----
content/index.njk                  Home
content/services.njk               Services overview
content/football-turf.njk          )
content/pickleball-courts.njk      )  each references the shared
content/badminton-courts.njk       )  _includes/sport.njk template —
content/basketball-courts.njk      )  edit content, not layout, here
content/tennis-courts.njk          )
content/projects.njk               Portfolio, filters, before/after, case studies
content/about.njk                  Story, vision, method, materials, team, differentiators
content/maintenance.njk            AMC tiers, routine care, warranty by surface
content/faq.njk                    Accordion FAQ, 4 groups
content/blog.njk                   Resources listing
content/blog-post.njk              Reusable post template
content/contact.njk                Multi-step quote form, contact rail, service area
content/404.njk                    Not found
content/sitemap.njk                Auto-generates sitemap.xml from every page — no manual updates needed
content/identity.njk               Required redirect page for Netlify Identity email links

_includes/base.njk                 Shared header, nav, mobile drawer, footer — used by every page
_includes/sport.njk                Shared template for all 5 sport pages
_data/site.json                    Global settings: phone, email, address, GSTIN, service areas, certifications

src/style.css                      All styling. Brand tokens at the top in :root. (unchanged from v1)
src/script.js                      All behaviour. No dependencies. (unchanged from v1)
src/images/                        Photos — same 46 placeholder files as v1, same filenames
admin/config.yml                   Decap CMS schema — auto-generated to cover every field in every content file
admin/index.html                   CMS login page

BRAND — DO NOT CHANGE THESE
---------------------------
Colours (in src/style.css :root)
  --black  #0B0F0D   Court Black, primary
  --blue   #4D8CD4   Court Blue, accent
  --deep   #1E5B96   Deep Court, small text on white and links
  --chalk  #F1F4EE   Light background
  --grey   #5A6459   Secondary text

Fonts
  Oswald 700         Headings and wordmark, always uppercase
  Archivo 400-700    Body, labels, forms
  IBM Plex Mono      Numbers, dimensions, contact lines

BEFORE GOING LIVE
------------------
Same checklist as before — none of this changed:
1. Replace GSTIN 06XXXXXXXXXXX (now in _data/site.json — one place, used everywhere)
2. Replace every placeholder photo in src/images/ (or via /admin once deployed)
3. Client logo strip, testimonials, team names/photos — all editable via /admin now
4. Contact form: add "netlify" to the <form> tag in content/contact.njk, or point at Formspree
5. Google Map: replace the placeholder text on the Contact page
6. Brochure PDF: replace the href="#" on the download blocks
7. Social links: Instagram and LinkedIn URLs are in _data/site.json

ADDING A NEW PAGE
-------------------
Create content/your-page.njk with frontmatter (layout: base.njk, nav, permalink,
title, description) plus whatever content fields you need, then write the
HTML body using {{ your_field }} to reference them. Add the new field list to
admin/config.yml under collections → pages → files so it's editable via /admin.

ADDING A BLOG POST
--------------------
Currently blog-post.njk is a single reusable template (matches v1 behaviour).
To support multiple real posts, this would need to become an Eleventy
"collection" (a folder of post files instead of one) — ask if you want this
built out once you have several posts ready to publish.
