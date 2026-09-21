/**
 * editorial-lux.js
 * Comprehensive Luxury Motion & Interactive System for Pink Oaks
 * (GSAP, ScrollTrigger, Lenis Smooth Scroll, Real-time Filters, Interactive Map, Modals)
 */

(function () {
  'use strict';

  // 1. Initialize Lenis Smooth Scrolling if available
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync with GSAP ScrollTrigger
    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  }

  // 2. Main Animation & Interaction Initialization
  function initEditorialExperience() {
    // A. GSAP Scroll Animations
    if (typeof gsap !== 'undefined') {
      if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
      }

      // 1. Page Title & Subtitle Entrance
      const headline = document.querySelector('.apartments-headline, .contact-page-title');
      if (headline) {
        gsap.fromTo(
          headline,
          { opacity: 0, y: 40, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'power3.out', delay: 0.1 }
        );
      }

      // 2. Filter Bar & Breadcrumb Reveal
      const filterBar = document.querySelector('.apartments-filter-bar');
      const breadcrumb = document.querySelector('.vertical-breadcrumb');
      if (filterBar) {
        gsap.fromTo(
          filterBar,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', delay: 0.3 }
        );
      }
      if (breadcrumb) {
        gsap.fromTo(
          breadcrumb,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 1, ease: 'power2.out', delay: 0.4 }
        );
      }

      // 3. Contact Info Trio Reveal
      const infoBlocks = document.querySelectorAll('.contact-info-block, .contact-location-centered');
      if (infoBlocks.length) {
        gsap.fromTo(
          infoBlocks,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power2.out', delay: 0.3 }
        );
      }

      // 4. Map & Social Overlay Reveal
      const mapWrapper = document.querySelector('.contact-map-wrapper');
      if (mapWrapper) {
        gsap.fromTo(
          mapWrapper,
          { opacity: 0, scale: 0.96, y: 30 },
          { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.4 }
        );
      }

      // 5. Staggered ScrollTrigger for Apartment Grid Cards
      const apartCards = document.querySelectorAll('.apart-card-item, .apart-photo-card-item');
      if (apartCards.length && typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.batch(apartCards, {
          onEnter: (batch) => {
            gsap.fromTo(
              batch,
              { opacity: 0, y: 45, scale: 0.98 },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.85,
                stagger: 0.08,
                ease: 'power2.out',
                overwrite: 'auto'
              }
            );
          },
          start: 'top 92%',
          once: true
        });
      }

      // 6. Fullbleed CTA Banner Parallax
      const ctaBgImg = document.querySelector('.cta-banner-bg img');
      if (ctaBgImg && typeof ScrollTrigger !== 'undefined') {
        gsap.to(ctaBgImg, {
          y: '18%',
          ease: 'none',
          scrollTrigger: {
            trigger: '.cta-fullbleed-banner',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });
      }

      // 7. Rotating Badge Speedup on Scroll
      const badgeRing = document.querySelector('.brand-badge-text-ring');
      if (badgeRing && typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.create({
          onUpdate: (self) => {
            const vel = Math.min(Math.abs(self.getVelocity() / 300), 4);
            badgeRing.style.animationDuration = `${Math.max(4, 24 - vel * 4)}s`;
          }
        });
      }
    }

    // B. Interactive Filter System with Animated Counter
    initFilterSystem();

    // C. Interactive Floorplan Modal Viewer
    initFloorplanModal();

    // D. Map Tooltip Interaction
    initMapInteractivity();
  }

  // --- FILTER SYSTEM ---
  function initFilterSystem() {
    const grid = document.querySelector('.apartments-catalogue-grid');
    const cards = document.querySelectorAll('.apart-card-item');
    const photoCards = document.querySelectorAll('.apart-photo-card-item');
    const countBadge = document.getElementById('apartment-count');
    const resetBtn = document.querySelector('.apartments-reset-btn');

    const filterTypologyBtn = document.getElementById('filter-typology-btn');
    const filterBedroomsBtn = document.getElementById('filter-bedrooms-btn');
    const filterSortBtn = document.getElementById('filter-sort-btn');

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
          if (typeof gsap !== 'undefined') {
            gsap.to(card, { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' });
          } else {
            card.style.opacity = '1';
          }
        } else {
          if (typeof gsap !== 'undefined') {
            gsap.to(card, {
              opacity: 0,
              scale: 0.95,
              duration: 0.3,
              ease: 'power2.in',
              onComplete: () => { card.style.display = 'none'; }
            });
          } else {
            card.style.display = 'none';
          }
        }
      });

      // Photo tiles visibility
      photoCards.forEach((pc) => {
        pc.style.display = (currentTypology === 'all' && currentBedrooms === 'all') ? 'flex' : 'none';
      });

      // Animated Count Update
      if (countBadge) {
        animateCounter(parseInt(countBadge.textContent) || 0, visibleCount);
      }

      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    }

    function animateCounter(start, end) {
      if (!countBadge) return;
      if (typeof gsap !== 'undefined') {
        const obj = { val: start };
        gsap.to(obj, {
          val: end,
          duration: 0.6,
          ease: 'power2.out',
          onUpdate: () => {
            countBadge.textContent = Math.round(obj.val);
          }
        });
      } else {
        countBadge.textContent = end;
      }
    }

    // Filter Dropdowns Setup
    setupDropdown('filter-typology-menu', (val, label) => {
      currentTypology = val;
      if (filterTypologyBtn) filterTypologyBtn.querySelector('span').textContent = `Typology: ${label}`;
      applyFilters();
    });

    setupDropdown('filter-bedrooms-menu', (val, label) => {
      currentBedrooms = val;
      if (filterBedroomsBtn) filterBedroomsBtn.querySelector('span').textContent = `Bedrooms: ${label}`;
      applyFilters();
    });

    setupDropdown('filter-sort-menu', (val, label) => {
      currentSort = val;
      if (filterSortBtn) filterSortBtn.querySelector('span').textContent = `Sort by: ${label}`;
      sortCards(val);
    });

    // Reset Button
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        currentTypology = 'all';
        currentBedrooms = 'all';
        currentSort = 'relevant';

        if (filterTypologyBtn) filterTypologyBtn.querySelector('span').textContent = 'Typology: All';
        if (filterBedroomsBtn) filterBedroomsBtn.querySelector('span').textContent = 'Bedrooms: All';
        if (filterSortBtn) filterSortBtn.querySelector('span').textContent = 'Sort by: Relevant';

        cards.forEach((c) => {
          c.style.display = 'flex';
          c.style.opacity = '1';
          c.style.transform = 'translateY(0)';
        });
        photoCards.forEach((pc) => pc.style.display = 'flex');
        if (countBadge) animateCounter(parseInt(countBadge.textContent) || 0, cards.length);
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

  function setupDropdown(menuId, onSelect) {
    const menu = document.getElementById(menuId);
    if (!menu) return;

    const btn = menu.previousElementSibling;
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Close other open dropdowns
        document.querySelectorAll('.filter-dropdown-menu').forEach((m) => {
          if (m !== menu) m.classList.remove('is-open');
        });
        menu.classList.toggle('is-open');
      });
    }

    menu.querySelectorAll('.filter-option').forEach((opt) => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = opt.getAttribute('data-value');
        const label = opt.textContent.trim();
        menu.querySelectorAll('.filter-option').forEach((o) => o.classList.remove('is-selected'));
        opt.classList.add('is-selected');
        menu.classList.remove('is-open');
        onSelect(val, label);
      });
    });

    document.addEventListener('click', () => {
      menu.classList.remove('is-open');
    });
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
        // If clicking inside a direct sub-link, let link operate
        if (e.target.tagName === 'A' && e.target.getAttribute('href') && !e.target.classList.contains('plan-quickview-btn')) return;

        const unit = card.getAttribute('data-unit') || card.querySelector('.apart-card-unit-num')?.textContent.trim() || 'Residence';
        const img = card.querySelector('.apart-plan-image')?.getAttribute('src') || '';
        const area = card.querySelector('.spec-col:nth-child(2) .spec-value')?.textContent.trim() || '';
        const beds = card.querySelector('.spec-col:nth-child(1) .spec-value')?.textContent.trim() || '';
        const floor = card.querySelector('.spec-col:nth-child(3) .spec-value')?.textContent.trim() || '';

        if (modalImg) modalImg.setAttribute('src', img);
        if (modalUnit) modalUnit.textContent = `Apartment ${unit}`;
        if (modalArea) modalArea.textContent = area;
        if (modalBeds) modalBeds.textContent = beds;
        if (modalFloor) modalFloor.textContent = floor;
        if (downloadPdf) downloadPdf.setAttribute('href', `assets/plans/${unit.replace(/[^0-9]/g, '')}.pdf`);

        modal.classList.add('is-active');
        document.body.style.overflow = 'hidden';

        if (typeof gsap !== 'undefined') {
          gsap.fromTo(
            modal.querySelector('.lux-modal-content'),
            { opacity: 0, scale: 0.94, y: 20 },
            { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power3.out' }
          );
        }
      });
    });

    function closeModal() {
      if (!modal.classList.contains('is-active')) return;
      if (typeof gsap !== 'undefined') {
        gsap.to(modal.querySelector('.lux-modal-content'), {
          opacity: 0,
          scale: 0.94,
          duration: 0.25,
          ease: 'power2.in',
          onComplete: () => {
            modal.classList.remove('is-active');
            document.body.style.overflow = '';
          }
        });
      } else {
        modal.classList.remove('is-active');
        document.body.style.overflow = '';
      }
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('lux-modal-backdrop')) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  // --- MAP INTERACTION ---
  function initMapInteractivity() {
    const pin = document.querySelector('.contact-map-sales-pin');
    if (!pin) return;

    pin.addEventListener('mouseenter', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(pin, { scale: 1.06, y: -4, duration: 0.3, ease: 'back.out(2)' });
      }
    });

    pin.addEventListener('mouseleave', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(pin, { scale: 1, y: 0, duration: 0.3, ease: 'power2.out' });
      }
    });
  }

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEditorialExperience);
  } else {
    initEditorialExperience();
  }
})();
