/**
 * editorial-lux.js
 * Mobile-First Responsive Motion & Interactive System for Pink Oaks
 * Features: Lenis Native-Touch Smooth Scroll, Mobile Fullscreen Menu,
 * Mobile Filter Bottom Sheet, Real-time Reactive Filters, Floorplan Lightbox.
 */

(function () {
  'use strict';

  // 1. Initialize Lenis Smooth Scrolling with mobile-safe parameters
  let lenis = null;
  const isMobileDevice = window.innerWidth < 768 || 'ontouchstart' in window;

  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: isMobileDevice ? 0.8 : 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      syncTouch: false, // native feeling touch scrolling on phones
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  }

  // 2. Main Experience Engine
  function initEditorialExperience() {
    // A. GSAP Scroll Animations (Optimized for Mobile Performance)
    if (typeof gsap !== 'undefined') {
      if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
      }

      // 1. Page Title Entrance
      const headline = document.querySelector('.apartments-headline, .contact-page-title');
      if (headline) {
        gsap.fromTo(
          headline,
          { opacity: 0, y: isMobileDevice ? 24 : 40, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 1.0, ease: 'power3.out', delay: 0.1 }
        );
      }

      // 2. Filter Bar & Breadcrumb Reveal
      const filterBar = document.querySelector('.apartments-filter-bar, .mobile-sticky-filter-bar');
      const breadcrumb = document.querySelector('.vertical-breadcrumb, .mobile-horizontal-breadcrumb');
      if (filterBar) {
        gsap.fromTo(
          filterBar,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.25 }
        );
      }
      if (breadcrumb) {
        gsap.fromTo(
          breadcrumb,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.2 }
        );
      }

      // 3. Contact Info Trio Reveal
      const infoBlocks = document.querySelectorAll('.contact-info-block, .contact-location-centered');
      if (infoBlocks.length) {
        gsap.fromTo(
          infoBlocks,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power2.out', delay: 0.2 }
        );
      }

      // 4. Staggered Cards Reveal
      const apartCards = document.querySelectorAll('.apart-card-item, .apart-photo-card-item');
      if (apartCards.length && typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.batch(apartCards, {
          onEnter: (batch) => {
            gsap.fromTo(
              batch,
              { opacity: 0, y: isMobileDevice ? 25 : 45 },
              {
                opacity: 1,
                y: 0,
                duration: 0.75,
                stagger: isMobileDevice ? 0.05 : 0.08,
                ease: 'power2.out',
                overwrite: 'auto'
              }
            );
          },
          start: 'top 94%',
          once: true
        });
      }

      // 5. Fullbleed CTA Banner Parallax
      const ctaBgImg = document.querySelector('.cta-banner-bg img');
      if (ctaBgImg && typeof ScrollTrigger !== 'undefined' && !isMobileDevice) {
        gsap.to(ctaBgImg, {
          y: '16%',
          ease: 'none',
          scrollTrigger: {
            trigger: '.cta-fullbleed-banner',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });
      }
    }

    // B. Mobile Fullscreen Navigation Overlay
    initMobileMenu();

    // C. Mobile Bottom Sheet Filter System + Desktop Dropdowns
    initFilterSystem();

    // D. Floorplan Lightbox Modal
    initFloorplanModal();

    // E. Map Pin Interactivity
    initMapInteractivity();
  }

  // --- MOBILE FULLSCREEN MENU ---
  function initMobileMenu() {
    const trigger = document.querySelector('.mobile-menu-trigger-btn');
    const overlay = document.querySelector('.lux-mobile-menu-overlay');
    const closeBtn = document.querySelector('.mobile-menu-close-btn');

    if (!trigger || !overlay) return;

    function openMenu() {
      overlay.classList.add('is-active');
      document.body.classList.add('menu-open');
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(
          overlay.querySelectorAll('.mobile-menu-nav-item, .mobile-menu-footer-meta'),
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out', delay: 0.15 }
        );
      }
    }

    function closeMenu() {
      overlay.classList.remove('is-active');
      document.body.classList.remove('menu-open');
    }

    trigger.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);

    overlay.querySelectorAll('.mobile-menu-nav-item').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-active')) {
        closeMenu();
      }
    });
  }

  // --- COMPREHENSIVE FILTER SYSTEM ---
  function initFilterSystem() {
    const grid = document.querySelector('.apartments-catalogue-grid');
    const cards = document.querySelectorAll('.apart-card-item');
    const photoCards = document.querySelectorAll('.apart-photo-card-item');
    const countBadge = document.getElementById('apartment-count');
    const resetBtns = document.querySelectorAll('.apartments-reset-btn, .mobile-sheet-reset-link');

    // Desktop Buttons
    const filterTypologyBtn = document.getElementById('filter-typology-btn');
    const filterBedroomsBtn = document.getElementById('filter-bedrooms-btn');
    const filterSortBtn = document.getElementById('filter-sort-btn');

    // Mobile Bottom Sheet Elements
    const mobileSheet = document.getElementById('mobile-filter-sheet');
    const mobileOpenBtn = document.querySelector('.mobile-filter-open-btn');
    const mobileCloseBtn = document.querySelector('.mobile-sheet-close-btn');
    const mobileApplyBtn = document.querySelector('.mobile-sheet-apply-btn');
    const gridToggleBtn = document.querySelector('.mobile-grid-toggle-btn');

    let currentTypology = 'all';
    let currentBedrooms = 'all';
    let currentSort = 'relevant';

    function applyFilters() {
      let visibleCount = 0;

      cards.forEach((card) => {
        const typo = card.getAttribute('data-typology') || '';
        const beds = card.getAttribute('data-bedrooms') || '';

        const matchTypo = currentTypology === 'all' || typo.toLowerCase().includes(currentTypology.toLowerCase());
        const matchBeds = currentBedrooms === 'all' || beds === currentBedrooms;

        if (matchTypo && matchBeds) {
          card.style.display = 'flex';
          visibleCount++;
          card.style.opacity = '1';
        } else {
          card.style.display = 'none';
        }
      });

      photoCards.forEach((pc) => {
        pc.style.display = (currentTypology === 'all' && currentBedrooms === 'all') ? 'flex' : 'none';
      });

      if (countBadge) {
        countBadge.textContent = visibleCount;
      }

      if (mobileApplyBtn) {
        mobileApplyBtn.textContent = `Show ${visibleCount} Apartments`;
      }

      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    }

    // Reset Functionality
    resetBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        currentTypology = 'all';
        currentBedrooms = 'all';
        currentSort = 'relevant';

        if (filterTypologyBtn) filterTypologyBtn.querySelector('span').textContent = 'Typology: All';
        if (filterBedroomsBtn) filterBedroomsBtn.querySelector('span').textContent = 'Bedrooms: All';
        if (filterSortBtn) filterSortBtn.querySelector('span').textContent = 'Sort by: Relevant';

        // Reset Mobile Chips
        document.querySelectorAll('.mobile-filter-chip').forEach((chip) => {
          if (chip.getAttribute('data-value') === 'all' || chip.getAttribute('data-value') === 'relevant') {
            chip.classList.add('is-active');
          } else {
            chip.classList.remove('is-active');
          }
        });

        applyFilters();
      });
    });

    // Mobile Sheet Open/Close
    if (mobileOpenBtn && mobileSheet) {
      mobileOpenBtn.addEventListener('click', () => {
        mobileSheet.classList.add('is-active');
        document.body.classList.add('sheet-open');
      });

      function closeSheet() {
        mobileSheet.classList.remove('is-active');
        document.body.classList.remove('sheet-open');
      }

      if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', closeSheet);
      if (mobileApplyBtn) mobileApplyBtn.addEventListener('click', () => {
        applyFilters();
        closeSheet();
      });

      mobileSheet.addEventListener('click', (e) => {
        if (e.target.classList.contains('mobile-sheet-backdrop')) {
          closeSheet();
        }
      });
    }

    // Mobile Filter Chips Selection
    document.querySelectorAll('.mobile-sheet-chips-row').forEach((row) => {
      const type = row.getAttribute('data-filter-type');
      row.querySelectorAll('.mobile-filter-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
          row.querySelectorAll('.mobile-filter-chip').forEach((c) => c.classList.remove('is-active'));
          chip.classList.add('is-active');

          const val = chip.getAttribute('data-value');
          if (type === 'typology') currentTypology = val;
          if (type === 'bedrooms') currentBedrooms = val;
          if (type === 'sort') {
            currentSort = val;
            sortCards(val);
          }

          applyFilters();
        });
      });
    });

    // Mobile Grid View Toggle (1 Col vs 2 Col Compact)
    if (gridToggleBtn && grid) {
      gridToggleBtn.addEventListener('click', () => {
        grid.classList.toggle('compact-mode');
        gridToggleBtn.classList.toggle('is-active');
      });
    }

    function sortCards(type) {
      if (!grid) return;
      const cardArray = Array.from(cards);

      if (type === 'area-asc') {
        cardArray.sort((a, b) => parseFloat(a.getAttribute('data-area') || 0) - parseFloat(b.getAttribute('data-area') || 0));
      } else if (type === 'area-desc') {
        cardArray.sort((a, b) => parseFloat(b.getAttribute('data-area') || 0) - parseFloat(a.getAttribute('data-area') || 0));
      } else if (type === 'floor') {
        cardArray.sort((a, b) => parseInt(a.getAttribute('data-floor') || 0) - parseInt(b.getAttribute('data-floor') || 0));
      }

      cardArray.forEach((c) => grid.appendChild(c));
    }
  }

  // --- FLOORPLAN MODAL VIEWER ---
  function initFloorplanModal() {
    const modal = document.getElementById('lux-floorplan-modal');
    if (!modal) return;

    const modalImg = modal.querySelector('.modal-plan-img');
    const modalUnit = modal.querySelector('.modal-unit-num');
    const modalArea = modal.querySelector('.modal-area-spec');
    const modalBeds = modal.querySelector('.modal-beds-spec');
    const modalFloor = modal.querySelector('.modal-floor-spec');
    const closeBtn = modal.querySelector('.modal-close-trigger');
    const downloadPdf = modal.querySelector('.modal-download-pdf');

    document.querySelectorAll('.apart-card-item').forEach((card) => {
      card.addEventListener('click', (e) => {
        const unit = card.getAttribute('data-unit') || 'Residence';
        const img = card.querySelector('.apart-plan-image')?.getAttribute('src') || '';
        const area = card.querySelector('.spec-col:nth-child(2) .spec-value')?.textContent.trim() || '';
        const beds = card.querySelector('.spec-col:nth-child(1) .spec-value')?.textContent.trim() || '';
        const floor = card.querySelector('.apart-card-meta-tag')?.textContent.trim() || '';

        if (modalImg) modalImg.setAttribute('src', img);
        if (modalUnit) modalUnit.textContent = `Apartment ${unit}`;
        if (modalArea) modalArea.textContent = area;
        if (modalBeds) modalBeds.textContent = beds;
        if (modalFloor) modalFloor.textContent = floor;
        if (downloadPdf) downloadPdf.setAttribute('href', `assets/plans/${unit.replace(/[^0-9]/g, '')}.pdf`);

        modal.classList.add('is-active');
        document.body.classList.add('modal-open');
      });
    });

    function closeModal() {
      modal.classList.remove('is-active');
      document.body.classList.remove('modal-open');
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target.classList.contains('lux-modal-backdrop') || e.target === modal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-active')) {
        closeModal();
      }
    });
  }

  // --- BOOK A CALL MODAL ---
  function initBookCallModal() {
    const modal = document.getElementById('book-call-modal');
    if (!modal) return;

    const triggers = document.querySelectorAll('.book-call-trigger, a[href="#book-call"]');
    const closeBtn = modal.querySelector('.modal-close-trigger');

    function openModal(e) {
      if (e) e.preventDefault();
      modal.classList.add('is-active');
      document.body.classList.add('modal-open');
    }

    function closeModal() {
      modal.classList.remove('is-active');
      document.body.classList.remove('modal-open');
    }

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', openModal);
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target.classList.contains('lux-modal-backdrop') || e.target === modal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-active')) {
        closeModal();
      }
    });
  }

  // --- MAP INTERACTION ---
  function initMapInteractivity() {
    const pin = document.querySelector('.contact-map-sales-pin');
    if (!pin || isMobileDevice) return;

    pin.addEventListener('mouseenter', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(pin, { scale: 1.05, y: -4, duration: 0.3, ease: 'back.out(2)' });
      }
    });

    pin.addEventListener('mouseleave', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(pin, { scale: 1, y: 0, duration: 0.3, ease: 'power2.out' });
      }
    });
  }

  // --- COOKIE CONSENT BANNER ---
  function initCookieConsent() {
    const banner = document.getElementById('cookie-consent-banner');
    if (!banner) return;

    try {
      const consent = localStorage.getItem('pinkoaks_cookie_consent');
      if (!consent) {
        setTimeout(() => {
          banner.classList.add('is-visible');
        }, 1200);
      }
    } catch (e) {
      // localStorage disabled fallback
      banner.classList.add('is-visible');
    }

    const acceptBtn = banner.querySelector('.cookie-btn-accept');
    const declineBtn = banner.querySelector('.cookie-btn-decline');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        try { localStorage.setItem('pinkoaks_cookie_consent', 'accepted'); } catch (e) {}
        banner.classList.remove('is-visible');
      });
    }

    if (declineBtn) {
      declineBtn.addEventListener('click', () => {
        try { localStorage.setItem('pinkoaks_cookie_consent', 'declined'); } catch (e) {}
        banner.classList.remove('is-visible');
      });
    }
  }

  // --- CTA SMOOTH SCROLL TO LISTING ---
  function initCtaScroll() {
    const ctaScrollLinks = document.querySelectorAll('a[href="#apartments-grid"]');
    ctaScrollLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const target = document.getElementById('apartments-grid');
        if (target) {
          e.preventDefault();
          if (lenis) {
            lenis.scrollTo(target, { offset: -100, duration: 1.2 });
          } else {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  }

  function initAll() {
    initEditorialExperience();
    initBookCallModal();
    initCookieConsent();
    initCtaScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
