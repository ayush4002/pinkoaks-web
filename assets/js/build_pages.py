import json, os

# 1. Load apartments data
with open('assets/data/apartments.json', 'r', encoding='utf-8') as f:
    units = json.load(f)

print(f'Loaded {len(units)} units.')

# Generate cards HTML
cards_html = []
for i, u in enumerate(units, start=1):
    unit_id = u['id']
    title = u['title']
    typology = u['typology']
    beds = u['bedrooms']
    area_sqm = u.get('areaM2', 130)
    area_sqft = u.get('areaSqFt', 2240)
    terrace_sqm = u.get('terraceM2', 25)
    floor = u.get('floor', '0')
    block = u.get('block', 'Block B1')
    img_plan = u.get('image', f'assets/images/units/{unit_id}.webp')
    url = u.get('url', f'apartments/{unit_id}.html')
    completion = u.get('completion', 'Q4 2026')

    # Extract floor number for sorting
    floor_num = 0
    if '1' in str(floor): floor_num = 1
    elif '2' in str(floor): floor_num = 2
    elif '3' in str(floor): floor_num = 3
    elif '0' in str(floor) or 'ground' in str(floor).lower(): floor_num = 0
    elif 'penthouse' in str(floor).lower(): floor_num = 4

    card = f'''      <!-- {i}. Unit {unit_id} -->
      <div class="apart-card-item" data-unit="{unit_id}" data-typology="{typology}" data-bedrooms="{beds}" data-area="{area_sqm}" data-floor="{floor_num}">
        <div class="apart-card-head">
          <div class="apart-card-type">{typology.upper()}</div>
          <div class="apart-card-completion">COMPLETION: {completion}</div>
        </div>
        <div class="apart-card-plan-graphic">
          <img class="apart-plan-image" alt="Unit {unit_id} Floor Plan" src="{img_plan}" loading="lazy"/>
        </div>
        <div class="apart-card-footer">
          <div class="apart-card-meta-tag">№ {unit_id} · BLOCK {block} · {floor.upper()} FLOOR</div>
          <div class="apart-card-main-figures"><span class="spec-col"><span class="spec-value">{beds} BED</span></span> | <span class="spec-col"><span class="spec-value">{area_sqm} M²</span> ({area_sqft} SQ.FT)</span></div>
          <div class="apart-card-sub-terrace"><span class="spec-col"><span class="spec-value">+{terrace_sqm} M² TERRACE</span></span></div>
        </div>
      </div>'''
    cards_html.append(card)

    # Interleaved photo cards
    if i == 6:
        cards_html.append('''      <!-- Photo Interleaf 1: Architecture Façade -->
      <div class="apart-photo-card-item">
        <img alt="Pink Oaks Bani Park Architecture" src="assets/images/home/home_showcase_1.webp" loading="lazy"/>
        <div class="apart-photo-caption-overlay">Contemporary Architecture · Bani Park</div>
      </div>''')
    elif i == 10:
        cards_html.append('''      <!-- Photo Interleaf 2: Balcony Living -->
      <div class="apart-photo-card-item">
        <img alt="Pink Oaks Nahargarh Fort Balconies" src="assets/images/lifestyle_balcony_nahargarh.webp" loading="lazy"/>
        <div class="apart-photo-caption-overlay">Nahargarh Fort Vistas · Private Solariums</div>
      </div>''')
    elif i == 15:
        cards_html.append('''      <!-- Photo Interleaf 3: Courtyard Lifestyle -->
      <div class="apart-photo-card-item">
        <img alt="Pink Oaks Courtyard Sanctuary" src="assets/images/footer copy.webp" loading="lazy"/>
        <div class="apart-photo-caption-overlay">Boutique Sanctuary · Pink Oaks</div>
      </div>''')

all_cards_str = '\n\n'.join(cards_html)

# HTML Template for Apartments Pages
def build_apartments_page():
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Apartments — Pink Oaks Luxury Residences, Jaipur</title>
  <meta content="Explore boutique 2, 3 & 4 BHK residences, duplexes and penthouses with private solariums and Nahargarh Fort views in Bani Park, Jaipur." name="description"/>
  <meta content="width=device-width, initial-scale=1, viewport-fit=cover" name="viewport"/>
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,600;1,6..96,400&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Syne:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="assets/fonts/typekit.js" type="text/javascript"></script>
  <script type="text/javascript">try{{Typekit.load();}}catch(e){{}}</script>
  
  <!-- Stylesheets -->
  <link href="assets/css/webflow.css" rel="stylesheet" type="text/css"/>
  <link href="assets/css/shared/tokens.css" rel="stylesheet" type="text/css"/>
  <link href="assets/css/shared/components.css" rel="stylesheet" type="text/css"/>
  <link href="assets/css/vendor/lenis.css" rel="stylesheet" type="text/css"/>
  <link href="assets/css/editorial-lux.css" rel="stylesheet" type="text/css"/>
</head>
<body class="editorial-page apartments-page-canvas">

  <!-- Top-Right Hanging Bougainvillea Flowers Cluster -->
  <div class="apart-top-bougainvillea-corner">
    <img alt="Pink Oaks Bougainvillea" src="assets/images/flowers/bougainvillea-flowers_01.avif" loading="eager" />
  </div>

  <!-- Left Side Fixed Rail (Desktop): Logo Badge + Progress Bar + Scroll Indicator (Image 1) -->
  <a aria-label="Home" class="header-logo w-inline-block" href="index.html">
    <div aria-label="Pink Oaks" class="logo_symbol header"
      style="width:72px;height:48px;display:flex;align-items:center;justify-content:center;">
      <div class="logo w-embed"
        style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;"><img
          alt="Pink Oaks" src="assets/images/logo.webp"
          style="width:100%;height:100%;object-fit:contain;background:transparent;border:none;" /></div>
    </div>
    <div class="header-logo_bg b-desk w-embed"><svg fill="none" height="100%" viewbox="0 0 120 120" width="100%"
        xmlns="http://www.w3.org/2000/svg">
        <path d="M 60, 60 m -47, 0 a 47,47 0 1,1 94,0 a 47,47 0 1,1 -94,0" fill="none" id="circle-desk"></path>
        <text fill="currentColor" font-family="'Inter', sans-serif" font-size="7.6" font-weight="700"
          letter-spacing="2.0px">
          <textpath href="#circle-desk" startoffset="0%">RESIDENCE • PINK OAKS • RESIDENCE • PINK OAKS •
          </textpath>
        </text>
      </svg></div>
    <div class="header-logo_bg b-mob w-embed"><svg fill="none" height="100%" viewbox="0 0 80 80" width="100%"
        xmlns="http://www.w3.org/2000/svg">
        <path d="M 40, 40 m -31, 0 a 31,31 0 1,1 62,0 a 31,31 0 1,1 -62,0" fill="none" id="circle-mob"></path>
        <text fill="currentColor" font-family="'Inter', sans-serif" font-size="5.0" font-weight="700"
          letter-spacing="1.3px">
          <textpath href="#circle-mob" startoffset="0%">RESIDENCE • PINK OAKS • RESIDENCE • PINK OAKS •
          </textpath>
        </text>
      </svg></div>
  </a>

  <!-- Scroll Progress Indicator (Image 1) -->
  <div class="s-bar-w" data-theme="">
    <div class="s-bar" data-s-bar="">
      <div class="s-bar_thumb" data-s-bar-thumb="">
        <div class="l1 a-center" data-s-bar-label="">00</div>
      </div>
      <div class="s-bar_fill" data-s-bar-fill=""></div>
      <div class="s-bar_track" data-s-bar-track=""></div>
    </div>
  </div>

  <!-- Scroll Down Button (Image 1) -->
  <div class="s-down" data-theme="">
    <div class="s-down_arrow w-embed"><svg fill="none" height="100%" viewbox="0 0 48 12" width="100%"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M7.36533 3C7.10389 3.54701 6.85117 4.02564 6.60716 4.4359C6.34572 4.84615 6.09299 5.18804 5.84899 5.46154L45 5.46154L45 6.53846L5.84899 6.53846C6.09299 6.82906 6.34572 7.17949 6.60716 7.58974C6.85117 8 7.10389 8.47009 7.36533 9L6.45029 9C5.35226 7.75214 4.20193 6.82906 2.99932 6.23077L2.99932 5.76923C4.20193 5.18804 5.35226 4.26496 6.45029 3L7.36533 3Z"
          fill="currentColor"></path>
      </svg></div>
    <div class="l2">Scroll</div>
  </div>

  <!-- Top Header Nav: Desktop Links (Image 2) & Mobile Menu Button (Image 3) -->
  <div class="header-nav" data-theme="">
    <!-- Mobile Trigger (Image 3) -->
    <div class="header-nav_list f-mob">
      <button type="button" class="top-header-menu-btn" id="open-full-menu-btn" aria-label="Open Navigation Menu" style="background:transparent;border:none;cursor:pointer;display:flex;align-items:center;gap:8px;padding:0;color:var(--color-navy-primary,#122a4d);">
        <span class="menu-btn-label" style="font-size:12px;font-weight:700;letter-spacing:0.18em;">MENU</span>
        <span class="menu-btn-icon" aria-hidden="true" style="display:flex;align-items:center;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <circle cx="12" cy="5" r="1.8"/>
            <circle cx="12" cy="12" r="1.8"/>
            <circle cx="12" cy="19" r="1.8"/>
          </svg>
        </span>
      </button>
    </div>
    
    <!-- Desktop Links (Image 2) -->
    <div class="header-nav_list f-desk">
      <a aria-label="Select an Apartment" class="link w-inline-block is-active" href="apartments.html">
        <div class="link_label">
          <div class="link_label_text">
            <div class="h6 font-didone" hover="text">SELECT <br />AN APARTMENT</div>
          </div>
        </div>
      </a>
      <div class="u-24"></div>
      <a aria-label="Book a call" class="nav-item w-inline-block" data-modal-cta-btn="book-a-call" hover-nav-item-l2="" href="contact.html#book-call">
        <div class="nav-item_label">
          <div class="nav-item_label_text" hover="text">
            <div class="l2">BOOK A CALL</div>
          </div>
        </div>
      </a>
      <div class="u-4"></div>
      <a aria-label="Contact" class="nav-item w-inline-block" hover-nav-item-l2="" href="contact.html">
        <div class="nav-item_label">
          <div class="nav-item_label_text" hover="text">
            <div class="l2">CONTACT</div>
          </div>
        </div>
      </a>
    </div>
  </div>

  <!-- FULL-SCREEN LUXURY MOBILE MENU OVERLAY -->
  <div class="lux-mobile-menu-overlay" aria-hidden="true">
    <div class="mobile-menu-header">
      <div class="mobile-menu-brand-tag">Pink Oaks Residence</div>
      <button class="mobile-menu-close-btn" type="button" aria-label="Close Menu">&times;</button>
    </div>
    <nav class="mobile-menu-nav-links">
      <a href="apartments.html" class="mobile-menu-nav-item">Select an Apartment</a>
      <a href="contact.html#book-call" class="mobile-menu-nav-item">Book a Call</a>
      <a href="contact.html" class="mobile-menu-nav-item">Contact</a>
    </nav>
    <div class="mobile-menu-footer-meta">
      <a class="mobile-menu-contact-line" href="tel:+919829012345">+91 98290 12345</a>
      <a class="mobile-menu-contact-line" href="mailto:sales@pinkoaks.in">sales@pinkoaks.in</a>
      <div class="mobile-menu-social-row">
        <a href="https://instagram.com" target="_blank">Instagram</a>
        <a href="https://facebook.com" target="_blank">Facebook</a>
        <a href="https://youtube.com" target="_blank">YouTube</a>
      </div>
    </div>
  </div>

  <main>
    <!-- SECTION A: HERO & FILTERS -->
    <section class="apartments-hero-section">
      <!-- Mobile Horizontal Breadcrumb -->
      <div class="mobile-horizontal-breadcrumb">
        <a href="index.html">Home</a> / Select an Apartment
      </div>

      <div class="apartments-title-row">
        <h1 class="apartments-headline">Apartments</h1>
        <div class="apartments-count-badge" id="apartment-count">25</div>
      </div>

      <!-- Desktop Filter Controls Row -->
      <div class="apartments-filter-bar">
        <div class="apartments-filter-group">
          <!-- Filter 1: Typology -->
          <div class="filter-dropdown-wrapper">
            <button id="filter-typology-btn" class="apartments-filter-btn" type="button">
              <span>Typology: All</span>
              <svg viewBox="0 0 10 6" fill="currentColor"><path d="M0 0l5 6 5-6z"/></svg>
            </button>
            <div id="filter-typology-menu" class="filter-dropdown-menu">
              <div class="filter-option is-selected" data-value="all">All Typologies</div>
              <div class="filter-option" data-value="Ground Floor + Basement">Ground Floor + Basement</div>
              <div class="filter-option" data-value="Ground Floor">Ground Floor</div>
              <div class="filter-option" data-value="Middle Floors">Middle Floors</div>
              <div class="filter-option" data-value="Penthouse Duplex">Penthouse Duplex</div>
            </div>
          </div>

          <!-- Filter 2: Bedrooms -->
          <div class="filter-dropdown-wrapper">
            <button id="filter-bedrooms-btn" class="apartments-filter-btn" type="button">
              <span>Bedrooms: All</span>
              <svg viewBox="0 0 10 6" fill="currentColor"><path d="M0 0l5 6 5-6z"/></svg>
            </button>
            <div id="filter-bedrooms-menu" class="filter-dropdown-menu">
              <div class="filter-option is-selected" data-value="all">All Bedrooms</div>
              <div class="filter-option" data-value="2">2 Bedrooms</div>
              <div class="filter-option" data-value="3">3 Bedrooms</div>
              <div class="filter-option" data-value="4">4 Bedrooms</div>
            </div>
          </div>

          <!-- Filter 3: Sort -->
          <div class="filter-dropdown-wrapper">
            <button id="filter-sort-btn" class="apartments-filter-btn" type="button">
              <span>Sort by: Relevant</span>
              <svg viewBox="0 0 10 6" fill="currentColor"><path d="M0 0l5 6 5-6z"/></svg>
            </button>
            <div id="filter-sort-menu" class="filter-dropdown-menu">
              <div class="filter-option is-selected" data-value="relevant">Relevant</div>
              <div class="filter-option" data-value="area-asc">Area: Low to High</div>
              <div class="filter-option" data-value="area-desc">Area: High to Low</div>
              <div class="filter-option" data-value="floor">Floor Level</div>
            </div>
          </div>
        </div>

        <button class="apartments-reset-btn" type="button">Reset</button>
      </div>

      <!-- Mobile Sticky Filter Trigger Bar -->
      <div class="mobile-sticky-filter-bar">
        <button class="mobile-filter-open-btn" type="button">
          <span class="filter-badge-dot"></span>
          <span>Filter &amp; Sort</span>
        </button>
        <div style="display:flex;gap:12px;align-items:center;">
          <a href="#" class="mobile-sheet-reset-link" style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(15,31,61,0.6);text-decoration:none;">Reset</a>
          <button class="mobile-grid-toggle-btn" type="button" aria-label="Toggle Grid Layout" title="Toggle Compact Grid">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="1" width="6" height="6" rx="1"/>
              <rect x="9" y="1" width="6" height="6" rx="1"/>
              <rect x="1" y="9" width="6" height="6" rx="1"/>
              <rect x="9" y="9" width="6" height="6" rx="1"/>
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- MOBILE BOTTOM SHEET FILTER MODAL -->
    <div id="mobile-filter-sheet" class="mobile-filter-bottom-sheet" aria-hidden="true">
      <div class="mobile-sheet-backdrop"></div>
      <div class="mobile-sheet-container">
        <div class="mobile-sheet-drag-handle"></div>
        <div class="mobile-sheet-title-row">
          <h3 class="mobile-sheet-title">Filter &amp; Sort</h3>
          <button class="mobile-sheet-close-btn" type="button" style="background:none;border:none;font-size:24px;color:var(--color-navy);cursor:pointer;">&times;</button>
        </div>
        
        <div class="mobile-sheet-group">
          <div class="mobile-sheet-group-label">Typology</div>
          <div class="mobile-sheet-chips-row" data-filter-type="typology">
            <button class="mobile-filter-chip is-active" data-value="all">All Typologies</button>
            <button class="mobile-filter-chip" data-value="Ground Floor + Basement">Ground + Basement</button>
            <button class="mobile-filter-chip" data-value="Ground Floor">Ground Floor</button>
            <button class="mobile-filter-chip" data-value="Middle Floors">Middle Floors</button>
            <button class="mobile-filter-chip" data-value="Penthouse Duplex">Penthouse Duplex</button>
          </div>
        </div>

        <div class="mobile-sheet-group">
          <div class="mobile-sheet-group-label">Bedrooms</div>
          <div class="mobile-sheet-chips-row" data-filter-type="bedrooms">
            <button class="mobile-filter-chip is-active" data-value="all">All Bedrooms</button>
            <button class="mobile-filter-chip" data-value="2">2 BHK</button>
            <button class="mobile-filter-chip" data-value="3">3 BHK</button>
            <button class="mobile-filter-chip" data-value="4">4 BHK</button>
          </div>
        </div>

        <div class="mobile-sheet-group">
          <div class="mobile-sheet-group-label">Sort By</div>
          <div class="mobile-sheet-chips-row" data-filter-type="sort">
            <button class="mobile-filter-chip is-active" data-value="relevant">Relevant</button>
            <button class="mobile-filter-chip" data-value="area-asc">Area: Low to High</button>
            <button class="mobile-filter-chip" data-value="area-desc">Area: High to Low</button>
            <button class="mobile-filter-chip" data-value="floor">Floor Level</button>
          </div>
        </div>

        <button class="mobile-sheet-apply-btn" type="button">Show 25 Apartments</button>
      </div>
    </div>

    <!-- SECTION B: CATALOGUE GRID (Screenshot 2) -->
    <section class="apartments-catalogue-grid" id="apartments-grid">
{all_cards_str}
    </section>

    <!-- SECTION C: FULL-BLEED COURTYARD CTA BANNER -->
    <section class="cta-fullbleed-banner">
      <div class="cta-banner-bg">
        <img alt="Pink Oaks Penthouse Terraces" src="assets/images/icons/6a0f88f3b81e88aabf6874e7_img_cta_1920-p-1600.png" loading="lazy"/>
      </div>
      <div class="cta-banner-overlay"></div>

      <div class="cta-banner-content">
        <p class="cta-banner-paragraph">
          A short conversation is enough to understand which apartment fits your use case — whether it is a family second home, a longer stay, or a place to return to year after year.
        </p>

        <div class="cta-banner-titles">
          <h2 class="cta-banner-headline">Perfect<br/>Nahargarh Views</h2>
          <div class="cta-banner-subheadline">From Rooftop Terraces</div>
        </div>

        <a href="contact.html" class="cta-circle-action-btn">
          Connect with Sales Team
        </a>
      </div>
    </section>
  </main>

  <!-- SECTION D: DEEP BURGUNDY FOOTER -->
  <footer class="editorial-burgundy-footer">
    <div class="footer-emblem-watermark">
      <img alt="Pink Oaks Logo" src="assets/images/logo.webp" style="width:140px;height:140px;object-fit:contain;filter:brightness(0) invert(1);opacity:0.25;"/>
    </div>

    <div class="footer-bottom-grid">
      <div class="footer-left-meta">
        <div class="footer-brand-title">Pink Oaks Residence.</div>
        <div class="footer-copyright">©2026 All Rights Reserved</div>
        <div class="footer-links-row">
          <a href="#" class="footer-legal-link">Privacy Policy</a>
          <a href="#" class="footer-legal-link">Terms of Use</a>
        </div>
      </div>
      <div class="footer-right-credits">
        <div class="footer-made-by">Bani Park, Jaipur</div>
      </div>
    </div>
  </footer>

  <!-- LUXURY FLOORPLAN MODAL VIEWER -->
  <div id="lux-floorplan-modal" class="lux-modal-overlay">
    <div class="lux-modal-backdrop"></div>
    <div class="lux-modal-content">
      <button class="modal-close-trigger" aria-label="Close Modal">&times;</button>
      <div class="modal-plan-preview-wrapper">
        <img class="modal-plan-img" src="" alt="Floor Plan Blueprint"/>
      </div>
      <div class="modal-details-side">
        <h2 class="modal-unit-num">Apartment</h2>
        <div class="modal-specs-grid">
          <div class="modal-spec-item">
            <span class="modal-spec-label">Bedrooms</span>
            <span class="modal-spec-val modal-beds-spec">-</span>
          </div>
          <div class="modal-spec-item">
            <span class="modal-spec-label">Sale Area</span>
            <span class="modal-spec-val modal-area-spec">-</span>
          </div>
          <div class="modal-spec-item">
            <span class="modal-spec-label">Floor</span>
            <span class="modal-spec-val modal-floor-spec">-</span>
          </div>
        </div>
        <p style="font-size:13px;color:rgba(15,31,61,0.7);line-height:1.6;margin:0;">
          Designed with expansive open-plan living, private balconies, and direct views of Nahargarh Fort and Jaipur skyline.
        </p>
        <div style="display:flex;gap:12px;margin-top:8px;">
          <a class="modal-inquiry-btn modal-download-pdf" href="#" target="_blank" download>Download PDF Plan</a>
          <a class="modal-inquiry-btn" href="contact.html" style="background:transparent;color:#0F1F3D;border:1px solid #0F1F3D;box-shadow:none;">Schedule Visit</a>
        </div>
      </div>
    </div>
  </div>

  <!-- Scripts -->
  <script src="assets/js/vendor/jquery.min.js"></script>
  <script src="assets/js/vendor/gsap.min.js"></script>
  <script src="assets/js/vendor/ScrollTrigger.min.js"></script>
  <script src="assets/js/vendor/CustomEase.min.js"></script>
  <script src="assets/js/vendor/lenis.min.js"></script>
  <script src="assets/js/editorial-lux.js"></script>
</body>
</html>'''

# Write to all variants
pages = ['apartments.html', 'apartments512b.html', 'apartments567f.html', 'apartments605b.html']
for p in pages:
    with open(p, 'w', encoding='utf-8') as f:
        f.write(build_apartments_page())
    print(f'Wrote {p}')

# HTML Template for Contact Page
def build_contact_page():
    return '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Contact Us — Pink Oaks Luxury Residences, Jaipur</title>
  <meta content="Contact sales office and explore the master location map for Pink Oaks residences in Bani Park, Jaipur." name="description"/>
  <meta content="width=device-width, initial-scale=1, viewport-fit=cover" name="viewport"/>
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,600;1,6..96,400&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Syne:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="assets/fonts/typekit.js" type="text/javascript"></script>
  <script type="text/javascript">try{Typekit.load();}catch(e){}</script>
  
  <!-- Stylesheets -->
  <link href="assets/css/webflow.css" rel="stylesheet" type="text/css"/>
  <link href="assets/css/shared/tokens.css" rel="stylesheet" type="text/css"/>
  <link href="assets/css/shared/components.css" rel="stylesheet" type="text/css"/>
  <link href="assets/css/vendor/lenis.css" rel="stylesheet" type="text/css"/>
  <link href="assets/css/editorial-lux.css" rel="stylesheet" type="text/css"/>
</head>
<body class="editorial-page contact-page-canvas">

  <!-- GLOBAL ELEMENT 1: Left Vertical Breadcrumb (Desktop) -->
  <div class="vertical-breadcrumb b-desk">
    <div class="vertical-breadcrumb-line"></div>
    <div class="vertical-breadcrumb-text">
      <a href="index.html" style="color:inherit;text-decoration:none;"><span class="faded">HOME</span></a> / CONTACT
    </div>
  </div>

  <!-- GLOBAL ELEMENT 2: Top Header Bar (Logo + Desktop Nav + Mobile Button) -->
  <header class="top-header-bar">
    <!-- Top-Left Rotating Badge Logo -->
    <a href="index.html" class="brand-badge-logo" aria-label="Pink Oaks Home">
      <div class="brand-badge-emblem">
        <img alt="Pink Oaks" src="assets/images/pink-oaks-leaf.webp"/>
      </div>
      <div class="brand-badge-text-ring">
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <path id="badge-text-path" d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" fill="none"/>
          <text fill="#0F1F3D" font-family="'Syne', 'Inter', sans-serif" font-size="6.6" font-weight="700" letter-spacing="2.0px">
            <textPath href="#badge-text-path" startOffset="0%">RESIDENCE • PINK OAKS • RESIDENCE • PINK OAKS • </textPath>
          </text>
        </svg>
      </div>
    </a>

    <!-- Top-Right Navigation (Desktop) -->
    <nav class="top-right-nav">
      <a href="apartments.html" class="top-nav-primary">Select an Apartment</a>
      <div class="top-nav-secondary-row">
        <a href="#book-call" class="top-nav-secondary-link">Book a Call</a>
        <a href="contact.html" class="top-nav-secondary-link" style="opacity:1;text-decoration:underline;text-underline-offset:3px;">Contact</a>
      </div>
    </nav>

    <!-- Mobile Menu Trigger Button (<768px) -->
    <button class="mobile-menu-trigger-btn" type="button" aria-label="Open Navigation Menu">
      <div class="mobile-menu-burger-lines">
        <span></span>
        <span></span>
      </div>
      <span>Menu</span>
    </button>
  </header>

  <!-- FULL-SCREEN LUXURY MOBILE MENU OVERLAY -->
  <div class="lux-mobile-menu-overlay" aria-hidden="true">
    <div class="mobile-menu-header">
      <div class="mobile-menu-brand-tag">Pink Oaks Residence</div>
      <button class="mobile-menu-close-btn" type="button" aria-label="Close Menu">&times;</button>
    </div>
    <nav class="mobile-menu-nav-links">
      <a href="apartments.html" class="mobile-menu-nav-item">Select an Apartment</a>
      <a href="#book-call" class="mobile-menu-nav-item">Book a Call</a>
      <a href="contact.html" class="mobile-menu-nav-item">Contact</a>
    </nav>
    <div class="mobile-menu-footer-meta">
      <a class="mobile-menu-contact-line" href="tel:+919829012345">+91 98290 12345</a>
      <a class="mobile-menu-contact-line" href="mailto:sales@pinkoaks.in">sales@pinkoaks.in</a>
      <div class="mobile-menu-social-row">
        <a href="https://instagram.com" target="_blank">Instagram</a>
        <a href="https://facebook.com" target="_blank">Facebook</a>
        <a href="https://youtube.com" target="_blank">YouTube</a>
      </div>
    </div>
  </div>

  <!-- SECTION A: HERO & MAP (Screenshot 1) -->
  <main>
    <section class="contact-hero-section">
      <!-- Mobile Horizontal Breadcrumb -->
      <div class="mobile-horizontal-breadcrumb">
        <a href="index.html">Home</a> / Contact
      </div>

      <!-- Centered Huge Title -->
      <h1 class="contact-page-title">Contact Us</h1>

      <!-- 3-Column Information Row -->
      <div class="contact-info-trio">
        <!-- Col 1: Write Us -->
        <div class="contact-info-block">
          <div class="contact-info-label">Write Us</div>
          <a class="contact-info-value" href="mailto:sales@pinkoaks.in">sales@pinkoaks.in</a>
        </div>

        <!-- Col 2: Sales Office -->
        <div class="contact-info-block">
          <div class="contact-info-label">Sales Gallery</div>
          <div class="contact-info-value">D-169, Bhrigu Marg, Bani Park<br/>Jaipur, Rajasthan 302016</div>
        </div>

        <!-- Col 3: Talk to Us -->
        <div class="contact-info-block">
          <div class="contact-info-label">Talk to Us</div>
          <a class="contact-info-value" href="tel:+919829012345">+91 98290 12345</a>
          <a class="contact-info-label" href="https://wa.me/919829012345" target="_blank" style="text-decoration:underline; margin-top:2px; color:var(--color-navy);">WhatsApp</a>
        </div>
      </div>

      <!-- Location Centered Line -->
      <div class="contact-location-centered">
        <div class="contact-info-label">Location</div>
        <div class="contact-info-value">Bani Park, Jaipur<br/>Rajasthan, India</div>
      </div>

      <!-- ARCHITECTURAL VECTOR MAP (Exact Replica of Reference Screenshot 1) -->
      <div class="contact-map-wrapper">
        <svg class="contact-map-svg-canvas" viewBox="0 0 800 480" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Compass Rose (Top Left) -->
          <g transform="translate(60, 45)">
            <circle cx="20" cy="20" r="18" stroke="#0F1F3D" stroke-width="0.8" opacity="0.35"/>
            <line x1="20" y1="2" x2="20" y2="38" stroke="#0F1F3D" stroke-width="0.8" opacity="0.4"/>
            <line x1="2" y1="20" x2="38" y2="20" stroke="#0F1F3D" stroke-width="0.8" opacity="0.4"/>
            <polygon points="20,4 23,20 20,17 17,20" fill="#0F1F3D"/>
            <polygon points="20,36 23,20 20,23 17,20" fill="#0F1F3D" opacity="0.3"/>
            <text x="20" y="-3" font-family="'Syne', 'Inter', sans-serif" font-size="8" font-weight="700" fill="#0F1F3D" text-anchor="middle">N</text>
          </g>

          <!-- Top-Right City Labels -->
          <text x="740" y="50" font-family="'Syne', 'Inter', sans-serif" font-size="10" font-weight="700" letter-spacing="1.5px" fill="#0F1F3D" text-anchor="end" opacity="0.75">NAHARGARH FORT</text>
          <text x="740" y="66" font-family="'Syne', 'Inter', sans-serif" font-size="8.5" font-weight="500" letter-spacing="0.5px" fill="#0F1F3D" text-anchor="end" opacity="0.5">4.2 KM</text>

          <!-- Architectural Vector Grid & Roads -->
          <path d="M 0 110 Q 240 100 480 130 T 800 115" stroke="#8FA5B5" stroke-width="1.2" fill="none"/>
          <path d="M 0 180 Q 200 200 400 170 T 800 190" stroke="#8FA5B5" stroke-width="1.5" fill="none"/>
          <path d="M 0 240 Q 300 220 520 250 T 800 230" stroke="#8FA5B5" stroke-width="1.8" fill="none"/>
          <path d="M 0 310 Q 260 330 500 300 T 800 320" stroke="#8FA5B5" stroke-width="1.2" fill="none"/>

          <!-- Diagonal & Cross Avenues -->
          <path d="M 120 40 L 190 440" stroke="#8FA5B5" stroke-width="1.2" fill="none"/>
          <path d="M 260 30 L 330 450" stroke="#8FA5B5" stroke-width="1.2" fill="none"/>
          <path d="M 410 20 L 410 460" stroke="#8FA5B5" stroke-width="2.0" stroke-dasharray="6 4" fill="none"/>
          <path d="M 540 30 L 510 450" stroke="#8FA5B5" stroke-width="1.2" fill="none"/>
          <path d="M 680 40 L 640 440" stroke="#8FA5B5" stroke-width="1.2" fill="none"/>

          <!-- Curved Topography & Garden Zones -->
          <path d="M 50 260 C 140 220 200 300 290 270" stroke="#8FA5B5" stroke-width="0.8" fill="none" opacity="0.6"/>
          <path d="M 450 140 C 530 180 620 120 720 160" stroke="#8FA5B5" stroke-width="0.8" fill="none" opacity="0.6"/>
          
          <!-- Bani Park Sanctuary Area -->
          <rect x="360" y="190" width="100" height="90" rx="4" stroke="#0F1F3D" stroke-width="1" stroke-dasharray="3 3" fill="rgba(15, 31, 61, 0.04)"/>
          <text x="410" y="282" font-family="'Syne', 'Inter', sans-serif" font-size="8" font-weight="700" letter-spacing="1px" fill="#0F1F3D" text-anchor="middle" opacity="0.7">BANI PARK SANCTUARY</text>

          <!-- Bottom Water / Garden Arc -->
          <path d="M 0 390 Q 200 420 400 395 T 800 410 L 800 480 L 0 480 Z" fill="#CBDFE9" opacity="0.85"/>
          <text x="740" y="450" font-family="'Syne', 'Inter', sans-serif" font-size="10" font-weight="700" letter-spacing="2px" fill="#0F1F3D" text-anchor="end" opacity="0.55">CENTRAL PARK · JAIPUR</text>
        </svg>

        <!-- Floating Sales Office Tooltip Pin -->
        <div class="contact-map-sales-pin">
          <div class="contact-map-sales-pin-icon">
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
              <path d="M8 1.5C5.2 1.5 3 3.7 3 6.5C3 10.2 8 14.5 8 14.5C8 14.5 13 10.2 13 6.5C13 3.7 10.8 1.5 8 1.5Z" fill="#FFFFFF"/>
              <circle cx="8" cy="6.5" r="2" fill="#0F1F3D"/>
            </svg>
          </div>
          <div class="contact-map-sales-pin-text">
            <div class="contact-map-sales-pin-title">Pink Oaks Sales Gallery</div>
            <div class="contact-map-sales-pin-hours">MON–SAT 10:00 — 19:00</div>
          </div>
        </div>

        <!-- Floating Social Media Box (Bottom-Left) -->
        <div class="contact-map-social-box">
          <a class="contact-social-link" href="https://instagram.com" target="_blank" aria-label="Instagram">Instagram</a>
          <a class="contact-social-link" href="https://facebook.com" target="_blank" aria-label="Facebook">Facebook</a>
          <a class="contact-social-link" href="https://youtube.com" target="_blank" aria-label="YouTube">YouTube</a>
        </div>

        <!-- Floating Circular CTA (Bottom-Right) -->
        <div class="contact-map-circle-cta">
          <a href="https://maps.google.com" target="_blank" class="contact-circle-cta-link" aria-label="Open in Google Maps">
            <svg viewBox="0 0 100 100" class="contact-circle-svg">
              <circle cx="50" cy="50" r="46" fill="none" stroke="#0F1F3D" stroke-width="1.2"/>
              <path id="contact-cta-ring-path" d="M 50, 50 m -34, 0 a 34,34 0 1,1 68,0 a 34,34 0 1,1 -68,0" fill="none"/>
              <text fill="#0F1F3D" font-family="'Syne', 'Inter', sans-serif" font-size="7" font-weight="700" letter-spacing="1.6px">
                <textPath href="#contact-cta-ring-path" startOffset="0%">OPEN GOOGLE MAPS • OPEN MAPS • </textPath>
              </text>
            </svg>
            <div class="contact-circle-arrow">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
                <path d="M4 12L12 4M12 4H6M12 4V10" stroke="#0F1F3D" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </a>
        </div>
      </div>
    </section>

    <!-- SECTION B: FULL-BLEED COURTYARD BANNER (Screenshot 1 Bottom) -->
    <section class="cta-fullbleed-banner">
      <div class="cta-banner-bg">
        <img alt="Pink Oaks Courtyard & Bougainvillea" src="assets/images/icons/6a0f88f3b81e88aabf6874e7_img_cta_1920-p-1600.png" loading="eager"/>
      </div>
      <div class="cta-banner-overlay"></div>

      <div class="cta-banner-content">
        <!-- Top Paragraph -->
        <p class="cta-banner-paragraph">
          A short conversation is enough to understand which apartment fits your use case — whether it is a family second home, a longer stay, or a place to return to year after year.
        </p>

        <!-- Big Headline Group -->
        <div class="cta-banner-titles">
          <h2 class="cta-banner-headline">Perfect<br/>Sea Views</h2>
          <div class="cta-banner-subheadline">From Rooftop Terraces</div>
        </div>

        <!-- Center Circular Action Button -->
        <a href="apartments.html" class="cta-circle-action-btn">
          View Available Apartments
        </a>
      </div>
    </section>
  </main>

  <!-- SECTION C: DEEP BURGUNDY FOOTER (Screenshot 1 Footer) -->
  <footer class="editorial-burgundy-footer">
    <!-- Center Watermark Flower -->
    <div class="footer-emblem-watermark">
      <img alt="Pink Oaks Logo" src="assets/images/logo.webp" style="width:140px;height:140px;object-fit:contain;filter:brightness(0) invert(1);opacity:0.25;"/>
    </div>

    <!-- Bottom Metadata Grid -->
    <div class="footer-bottom-grid">
      <div class="footer-left-meta">
        <div class="footer-brand-title">Pink Oaks Residence.</div>
        <div class="footer-copyright">©2026 All Rights Reserved</div>
        <div class="footer-links-row">
          <a href="#" class="footer-legal-link">Privacy Policy</a>
          <a href="#" class="footer-legal-link">Terms of Use</a>
        </div>
      </div>
      <div class="footer-right-credits">
        <div class="footer-made-by">Bani Park, Jaipur</div>
      </div>
    </div>
  </footer>

  <!-- Scripts -->
  <script src="assets/js/vendor/jquery.min.js"></script>
  <script src="assets/js/vendor/gsap.min.js"></script>
  <script src="assets/js/vendor/ScrollTrigger.min.js"></script>
  <script src="assets/js/vendor/CustomEase.min.js"></script>
  <script src="assets/js/vendor/lenis.min.js"></script>
  <script src="assets/js/editorial-lux.js"></script>
</body>
</html>'''

with open('contact.html', 'w', encoding='utf-8') as f:
    f.write(build_contact_page())
print('Wrote contact.html')
