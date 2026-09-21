# External URLs

**The site no longer loads any asset from an external host.** Everything that could be
downloaded now lives in `assets/`, and the markup points at the local copy.

Two webfont providers remain, because that is how webfonts work:

| host | what | pages |
| --- | --- | --- |
| `use.typekit.net` + `p.typekit.net` | Adobe Fonts kit `pig8glj` — the display faces | all 31 |
| `fonts.googleapis.com` + `fonts.gstatic.com` | Playfair Display | 30 (not `index.html`) |

Self-host those too if you want the site fully independent.

---

## What was brought in

68 files, 15 MB.

| folder | files | size | what |
| --- | --- | --- | --- |
| `assets/plans/` | 25 | 11 MB | Unit floor-plan PDFs, named `011.pdf` … `224.pdf` |
| `assets/images/units/` | 25 | 2.4 MB | Unit photos, named `011.webp` … `224.webp` |
| `assets/images/webflow/` | 5 | 909 KB | Open-graph image, preloader arch, landscape cover, gated-community photo, Unreal logo |
| `assets/images/flowers/` | 7 | 656 KB | Bougainvillea video posters |
| `assets/images/clouds/` | 4 | 172 KB | Parallax cloud layers |
| `assets/fonts/` | 2 | 116 KB | **Maison Neue Extended** Book + Bold — the brand typeface |

The hashed Webflow filenames were stripped, so `6a3526a9f0bb965967883ea1_011apt_compressed.pdf`
is now simply `assets/plans/011.pdf`.

## What could not be brought in

**18 video files — the host does not resolve.** `assets.pinkoaks.in` and
`assets.pinkoaks.com` fail DNS entirely, so there was nothing to download:

- 14 bougainvillea clips (7 scenes × `.webm` + `.mov`)
- `open-graph.mp4`, the social share video

Handled as follows, so nothing is left broken:

- The `<source>` tags were removed from all 8 `<video>` elements. Each one keeps its
  **poster image, now local**, so the section still shows the flowers as a still frame and
  the page stops firing 32 failed requests on every load.
- The `og:video` meta tags were removed. A dead `og:video` stops some platforms rendering
  any preview at all.

If you still have those video files, drop them in `assets/video/` and put the `<source>`
tags back.

## Three images needing a check

The CDN returns **403 Forbidden** for these, so they were repointed at the equivalent
photo already in `assets/images/renders/`:

| was | now | confidence |
| --- | --- | --- |
| `pinkoaks-terrace.webp` (12 pages) | `…_era-residence-terrace-p-1080.png` | **certain** — same CDN hash `6a15153b797c328a9f2f5964` |
| `pinkoaks-landscaping.webp` (7 pages) | `…_era-residence-landscaping-p-1080.png` | likely — same subject, different hash |
| `pinkoaks-ground-floor-basement.webp` (6 pages) | `…_era-residence-ground-floor-2-p-1080.png` | likely — same subject, different hash |

**Please eyeball the bottom two.** If they are the wrong photo, swap the path.

## One quirk worth knowing

`img_clouds_33-p-500.avif` was never AVIF. The CDN sends `Content-Type: image/avif` but
the bytes are WebP. It is saved as `img_clouds_33-p-500.webp` and the `<source type>`
corrected to match.

## Before you go live

`og:image` and `twitter:image` are now **relative paths**. Social scrapers need absolute
URLs, so at launch change them to `https://pinkoaks.in/assets/images/webflow/open-graph.webp`
(or whatever the final domain is).
