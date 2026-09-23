# Pink Oaks — editable static site

A port of the original `website/` Webflow export into a plain HTML + CSS + JS project.
No build step, no framework, no npm install. Open a page, edit it, refresh.

**The design, the copy and the animations are unchanged**, apart from two sections that
were added on request (see *Sections built after the port*). Every page was compared
against the original after the port: 29 of 31 pages are identical in visible text, tag
sequence and image list; the two that differ are `index.html` and `apartments.html`, and
they differ only by the added sections. Layout was measured too — the home page at
1265px matched the original exactly across all 43 sections, containers, grids and cards,
down to the 21274px document height.

---

## Running it

**Double-click `start-server.bat`.** It serves this folder at
<http://localhost:8000> and opens your browser. Leave the black window open while you
work; close it to stop. Or run it yourself:

```bash
python -m http.server 8000
```

Opening `index.html` straight off disk (`file://`) also works now — the scripts load as
classic scripts rather than ES modules, which browsers refuse to run over `file://`. Two
things still degrade there, both unavoidable without a server:

- **Page-to-page transitions are off.** Barba has to fetch the next page over the
  network, which `file://` forbids, so links do ordinary full page loads instead. The
  code detects this and steps aside rather than breaking the link.
- **Adobe Typekit fonts may not load**, because web fonts need a real origin. You get the
  fallback faces.

Use the server for anything you want to judge visually.

---

## Layout

```
pinkoaks_new/
├── index.html                  Home
├── apartments.html             Residences index, with the filter + sort UI
├── apartments512b.html         Ground floor + basement  (?type=ground-floor-basement)
├── apartments567f.html         Ground floor            (?type=ground-floor)
├── apartments605b.html         Penthouse duplex        (?type=penthouse-duplex)
├── contact.html                Contact & site visit
├── apartments/                 25 individual unit pages (011 … 224)
├── start-server.bat            Double-click to preview the site locally
└── assets/
    ├── css/
    │   ├── webflow.css         The Webflow design system. ~143KB, machine-generated.
    │   │                       Treat as vendor code — override it, don't edit it.
    │   ├── shared/             Hand-written CSS used by more than one page
    │   ├── pages/              Hand-written CSS used by exactly one page
    │   └── vendor/lenis.css
    ├── js/
    │   ├── app.js              The animation + interaction engine (see below)
    │   ├── site.js             Small page-level scripts (the amenity category filter)
    │   └── vendor/             gsap, ScrollTrigger, SplitText, CustomEase, lenis,
    │                           barba, lottie, jquery, webflow
    ├── fonts/                  Adobe Typekit loader + the Maison Neue Extended webfonts
    ├── plans/                  Unit floor-plan PDFs, 011.pdf … 224.pdf
    └── images/                 All imagery, including units/, flowers/, clouds/, webflow/
```

### The stylesheets

Every `<style>` block that was inlined in the original HTML is now a real `.css` file.
They are linked in the same order they appeared inline, so the cascade is unchanged.

| File | What it holds |
| --- | --- |
| `shared/reset.css`, `shared/reset-quote.css` | CSS reset; the `-quote` variant also carries the white quote-section overrides |
| `shared/tokens.css` | `--dur-s` / `--dur-m` / `--dur-l` and friends |
| `shared/brand.css` | The Pink Oaks palette: `--pink-baby`, `--cream`, `--navy` and the `theme_on-*` mappings. Used by `apartments*.html` and `contact.html` |
| `shared/components.css` | Buttons, cards, nav, form fields |
| `shared/masks.css`, `shared/initials.css` | Clip-path masks and the pre-animation starting states |
| `shared/text-contrast.css` | White-text overrides for sections sitting on photography |
| `shared/enhancements.css` | Later visual tweaks |
| `shared/preloader-state.css` | Flicker prevention and the landscape-orientation cover |
| `shared/selection.css` | Text selection colours |
| `shared/compass-135/150/165.css` | Per-unit compass rotation on the apartment pages |
| `shared/refinements.css` | **Post-port fixes, linked last so it always wins.** Centred circular-button labels; iOS form-zoom fix; larger touch targets; theme-aware floating header/scrollbar. Delete a block to revert it |
| `shared/sections.css` | The two sections built after the port. Every rule is prefixed `.po-`, so it cannot reach the Webflow markup |
| `pages/index.css` | Home-only CSS: the palette again (a longer variant) plus hero badge, lifestyle grid and Instagram archive grid |

**Where to change colours:** the `:root` block at the top of `shared/brand.css` *and* the
one at the top of `pages/index.css`. The original carried two near-identical copies of the
palette — the home page uses its own. Changing one without the other will split the theme.
Merging them into a single file is a good first cleanup.

### The JavaScript

`assets/js/app.js` is the whole site: preloader, Barba page transitions, Lenis smooth
scroll, every GSAP/ScrollTrigger reveal, the sliders, filters, modals and lightbox.

In the original it was **not** in the repo — each page fetched it from
`https://assets.slater.app/slater/20164.js` at runtime, so the site did not work
offline and the behaviour could change without the code changing. It now ships locally.

It is beautified build output: function names and DOM hooks are intact, but variables
inside each function are single letters. The header comment at the top of the file maps
out the sections. The numbers that retime the entire site live near the bottom (line ~2900):

```js
durS = .4, durM = .8, durL = 1.2, stagger = .1, delayReveal = .3, breakPoint = 992
```

`initScripts()` (line 265) lists everything that boots on page load *and* after
each Barba transition. Add your own init function to that list.

---

## Sections built after the port

Two sections were added on request. Both are self-contained: the markup sits in the page,
the styling is all in `assets/css/shared/sections.css` under the `.po-` prefix, and the
only script is the tab handler at the bottom of `assets/js/site.js`. Removing a section is
a matter of deleting its `<section>` block.

### Amenities — `index.html`, `#amenities`

Sits between the architecture section and the Instagram archive. Pink ground, navy type,
28 provisions in four columns that collapse to two below 1100px and one below 640px.

Editing it is plain HTML: each column is a `.po-amen-col` with an `<h3>` and a `<ul>`, and
an item is one `<li>`. The "28 Provisions" count in the eyebrow is written into the markup,
so update it if you add or remove items.

### Floor plans — `apartments.html`, `#floor-plans`

Sits above the closing call-to-action. Cream ground, a tab per unit type, and a card
showing the plan drawing beside its areas and room counts. Below 1100px the card stacks
the drawing above the details.

The three plans use the areas already quoted on the rest of that page — Plan A, 3 BHK,
2321 sq.ft.; Plan B, 4 BHK, 2680 sq.ft.; Plan C, 3 BHK, 2240 sq.ft. **The bathroom and
balcony counts are placeholders** taken from reading the drawings; check them against the
architect's set before this goes live.

The drawings are the 3D cutaways in `assets/images/apartments/`. If you have the 2D floor
plates, replace those files and nothing else needs to change.

To add a fourth plan, copy one `<button class="po-tab">` and its matching
`<div class="po-panel">`, give both a new matching id pair (`po-tab-d` / `po-panel-d`),
and point the button's `aria-controls` at the panel. The script wires up whatever it finds.

---

## Colour and contrast

White text was being painted on the pink and cream sections, where it is close to
invisible. Two separate causes, both fixed:

- **40 inline `color:#FFFFFF`** in `index.html` across the lifestyle, locality, Instagram
  and amenities sections. Those sections sit on flat pink or cream, so they are now navy.
  The 12 that remain are all in the hero, which sits on a photograph — white is correct
  there and they were left alone.
- **The floating header, scroll bar and "Scroll" indicator** are forced white with a dark
  shadow by `text-contrast.css`, which suits the hero photo and the dark footer but not the
  light sections in between. `app.js` already retags them `theme_on-light` as you scroll,
  driven by each section's `data-bg`; block 5 of `refinements.css` now honours that and
  turns them navy. The sections that were missing `data-bg` (lifestyle, Instagram,
  amenities, floor plans) have it now, so the switch actually fires.

If you add a section on a light ground, give it `data-bg="light"` or the header will keep
whatever colour the previous section set.

## External dependencies

The site loads **no assets from external hosts**. 68 files that used to come from the old
Webflow CDN — the brand typeface, 25 unit photos, all 25 floor-plan PDFs, the parallax
clouds and the social-share image — were downloaded into `assets/` and the markup
repointed. Google Tag Manager was removed, and the Facebook Pixel, Google Analytics and
DoubleClick calls it was injecting went with it.

What still reaches the network: Adobe Typekit and Google Fonts, because they serve the
webfonts. Self-host those if you want total independence.

18 videos on `assets.pinkoaks.in` / `.com` could not be saved — that host does not resolve
at all. Their `<source>` tags were removed so each `<video>` falls back to its local poster
image instead of firing failed requests.

`EXTERNAL-URLS.md` has the full account, including three images that need your eye.

## Post-migration fixes (23 Sep)

After the rebuild was migrated back in, these were found and fixed:

1. **`initScripts()` ran twice**, doubling every ScrollTrigger (358 on the home page)
   and double-binding the menu, so the overlay opened and then never closed. It is now
   guarded on the container element in `app.js`; the home page is back to 186 triggers
   and the menu toggles cleanly.
2. **The mobile menu had no CSS at all.** The markup and `initMobileMenu()` existed but
   not one class was defined anywhere, so the overlay could not work. Added as
   `assets/css/shared/mobile-menu.css`.
3. **The Book-a-Call modal had no CSS either** — its inputs rendered at 58x9px with
   3.75px text on four pages. Added as `assets/css/shared/book-call-modal.css`.
4. **`apartments.html` never loaded `editorial-lux.js`**, only its stylesheet, so the
   menu, filters, floorplan modal and booking modal were all dead on that page.
5. **`refinements.css` was not linked** on `contact.html` or the three apartment
   variants, so none of the earlier accessibility and mobile fixes reached them.
6. **Horizontal scroll**: `contact.html` and the variants overflowed on a phone (413px
   in a 375px viewport) from unclamped display headings; the home page scrolled 8px
   sideways on desktop from a `100vw` full-bleed section. Fixed with a mobile type clamp
   and `overflow-x: clip` (not `hidden`, which would break the five `position: sticky`
   elements driving the pinned animations).
7. **`build_pages.py` had drifted** from the shipped pages — it emits 25 cards with
   `data-unit` attributes while `apartments.html` carries 18 hand-refined ones. Moved to
   `tools/` (it was being served publicly from `assets/js/`) and it now refuses to run
   without `--force`.
8. Dead `assets/video/` sources removed, the empty `<img src="">` dropped, the dangling
   "you agree to our ." sentence completed, one phone number sitewide
   (`+91 91169 65636`), and the Spain-era LinkedIn (`pinkoaksestepona`) plus placeholder
   social links replaced with the real handles.

**Still open, needing your decision:** the forms post nowhere (the modal only shows a
success message via inline `onsubmit`); the copy still says 18 residences while
`apartments.json` holds 25 units; and "sea views", "Mediterranean" and
"Bani Park, Jaipur, Malaga, Jaipur" remain in the copy.

## Forms — now connected

All 31 pages submit through `assets/js/forms.js`, which handles the four different
form shapes on the site. Before this, none of them sent anything: the Webflow forms had
no `action`, and the two modal forms ran an inline `onsubmit` that hid the fields and
showed "THANK YOU" without transmitting a thing.

**You must set the destination before going live.** Two options:

1. **Your own hosting (default).** `form-handler.php` sits in the site root. Open it and
   set `$TO` to the address that should receive leads. Works on Hostinger/cPanel with no
   signup. It emails the lead *and* appends it to `leads.csv` as a backup, so nothing is
   lost if the mail server hiccups. Until `$TO` is set it refuses submissions loudly
   rather than dropping them silently.
2. **A hosted service.** Put the URL in `window.PINKOAKS_FORM.endpoint` at the top of
   `assets/js/forms.js` — Formspree, Web3Forms and Getform all accept the JSON it posts.

Every submission carries: name, email, phone, message, residence, `page_url`,
`page_title`, any `utm_*` in the query string, and a timestamp.

Also included: client-side validation with inline messages, a "Sending…" state, a
honeypot spam trap, and a genuine error path — if the endpoint fails the form shows the
error and keeps the user's input instead of pretending it worked.

### One thing to be aware of

On the 26 Webflow pages a stray `</div>` closes `<form>` before its own fields, so the
browser parks 11 of the 12 inputs — and the submit button — *outside* the form element.
That is why the button did nothing at all on those pages: `app.js` looks for
`closest('form')` and finds none. `forms.js` works around it by searching the surrounding
container and binding the orphaned button directly. Repairing that nesting is still worth
doing; see the known issues below.

## Known issues carried over from the original

0. **Encoded CDN URLs in dead Webflow CMS templates.** The 25 unit pages each carry two
   `<script type="text/x-wf-template">` blocks holding URL-encoded markup that still
   points at `cdn.prod.website-files.com`. They are inert — verified at runtime: zero
   requests reach that host and zero images come from it — because nothing decodes or
   injects them. They survived the asset localisation only because the URLs are
   percent-encoded (`%3A%2F%2F`), so the rewriter never matched them. Harmless today,
   but worth deleting as dead weight.

These were in the source export. They are **not** fixed here, so that this port stays a
faithful copy — each one is a deliberate decision waiting on you.

1. ~~External assets on remote hosts~~ — **fixed**, see *External dependencies* above.
   (My earlier claim that the Webflow CDN was dead was wrong: 68 of its 71 URLs were
   serving fine. An ad blocker in my test browser made them look like failures. Everything
   reachable has been pulled local.)
2. **A stray `</div>` closes `<main>` early** on every page except `index.html`. The
   browser's parser then pushes the footer and modals outside the Barba container.
   Transitions still work, but this should be repaired.
3. **Privacy Policy and Terms of Use have been removed** from every footer at your
   request, along with the form's "By submitting, you agree to our…" line, which pointed
   at them. If you publish real policies later, both need adding back.
4. **The contact form does not submit anywhere.** It is a Webflow form with no `action`,
   so outside Webflow's hosting it posts to the current page. It needs a real endpoint.
5. **Phone number mismatch.** The footer shows `+91 91169 65636` but the link is
   `tel:+919829012345`.
6. **Leftover copy from the template's original project** (an Andalusian development
   called Era Residence). The meta description reads "near Jaipur and Jaipur"; a heading
   reads "Between Jaipur and Jaipur"; the location paragraph promises beaches and golf
   courses; a CTA promises "Perfect sea views"; the sales-office address ends
   "Bani Park, Jaipur, Málaga, Jaipur"; the legal PDFs are the Spanish project's; and
   the hidden form field `title` is filled with `"Deal from Era"`.
7. **`data-barba-namespace="contact"`** on every page except `index.html`, including the
   apartment pages.
8. **The 25 unit pages never load the Pink Oaks palette.** They link neither
   `shared/brand.css` nor `pages/index.css`, so they still render in the base Webflow
   theme's colours rather than pink and navy. Adding one `<link>` fixes it.
9. **Taxonomy drift.** The home page calls the types "Ground floor + basement / Ground
   Floor / Penthouse duplex" with areas in m²; `apartments.html` calls the same three
   "Unit Plan A (3 BHK) – 2321 Sq.Ft." and so on.
10. **Google Tag Manager** (`GTM-WMDRV3P6`) pointed at a local file that does not exist in
   the export. This is the one thing the port did change: the URL is back to
   `googletagmanager.com`, so the container actually loads.

## What else changed in the port

Packaging only, nothing visual:

- Inline `<style>` blocks became linked stylesheets, in the same order.
- The inline amenity-filter script became `assets/js/site.js`.
- The remote Slater bundle became local `assets/js/app.js`. It is wrapped in an IIFE and
  loaded as a classic script, not an ES module, so the pages also open straight off disk;
  the wrapper keeps its ~60 top-level names out of the global scope either way. It boots
  on `DOMContentLoaded`, which is when the module version used to run.
- Asset URLs were repointed at the tidy `assets/` tree; the `cdn.prod.website-files.com/`
  mirror folder is gone, its 34 referenced files now resolve inside `assets/images/`.
- The HTML is indented. A line break is only ever inserted between two block-level
  elements separated by nothing but whitespace — never next to a text node, an inline
  element, an `<img>`, or anything carrying `w-inline-block`, because a space in those
  positions renders. That is why a handful of `<span>` and `<img>` lines inside the hero
  and the badges sit flush at column 0: indenting them would visibly shift the layout.
- The now-empty `.style-css` wrappers were dropped (they were `display:none`).
- `assets/css/shared/refinements.css` was added and linked last on every page. It is the
  only file that changes how anything looks; see the stylesheet table above.
- `index_before_redesign.html` and the unreferenced `new/` and `photo/` image folders
  were not carried over. They are still in the original `website/` folder.
