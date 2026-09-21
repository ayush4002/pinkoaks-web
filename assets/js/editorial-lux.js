/**
 * editorial-lux.js
 * High-End Creative Motion & Interactive System for Pink Oaks Luxury Residences
 * Features: Lenis Smooth Scrolling, GSAP Live Number Tweens, Closed Custom Dropdowns,
 * Mobile Bottom Sheet Filter, Reactive URL Query Sync, Staggered Card Reveals,
 * and Sliced Strip Parallax.
 */

(function () {
  'use strict';

  // 1. Lenis Smooth Scrolling
  let lenis = null;
  const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;

  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: isMobile ? 0.9 : 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      syncTouch: false,
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

  // 2. Main Initializer
  function initEditorialSystem() {
    initScrollAnimations();
    initMobileMenu();
    initFilterSystem();
    initFloorplanModal();
    initCTABannerParallax();
  }

  // A. GSAP Scroll Animations
  function initScrollAnimations() {
    if (typeof gsap === 'undefined') return;
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    // 1. Page Title Reveal
    const headline = document.querySelector('.apartments-headline');
    if (headline) {
      gsap.fromTo(
        headline,
        { opacity: 0, y: isMobile ? 24 : 45 },
        { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', delay: 0.1 }
      );
    }

    // 2. Filter Bar Entrance
    const filterBar = document.querySelector('.apartments-filter-bar, .mobile-sticky-filter-bar');
    if (filterBar) {
      gsap.fromTo(
        filterBar,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.25 }
      );
    }

    // 3. Staggered Card Entrance
    const apartCards = document.querySelectorAll('.apart-card-item, .apart-photo-card-item');
    if (apartCards.length && typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.batch(apartCards, {
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.06,
              ease: 'power2.out',
              overwrite: 'auto',
            }
          );
        },
        start: 'top 92%',
        once: true,
      });
    }
  }

  // B. Mobile Fullscreen Menu
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
          { opacity: 1, y: 0, duration: 0.45, stagger: 0.06, ease: 'power3.out', delay: 0.1 }
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

  // C. Filter System with Closed Dropdowns, Live Counter & URL Params
  function initFilterSystem() {
    const grid = document.getElementById('apartments-grid');
    const cards = Array.from(document.querySelectorAll('.apart-card-item'));
    const photoCards = Array.from(document.querySelectorAll('.apart-photo-card-item'));
    const countBadge = document.getElementById('apartment-count');
    const resetBtn = document.querySelector('.apartments-reset-btn');
    const emptyState = document.getElementById('apartments-empty-state');
    const emptyResetBtn = document.querySelector('.empty-state-reset-btn');

    // Desktop Dropdown Buttons
    const dropdownWrappers = document.querySelectorAll('.filter-dropdown-wrapper');
    const filterTypologyBtn = document.getElementById('filter-typology-btn');
    const filterBedroomsBtn = document.getElementById('filter-bedrooms-btn');
    const filterSortBtn = document.getElementById('filter-sort-btn');

    // Mobile Sheet
    const mobileSheet = document.getElementById('mobile-filter-sheet');
    const mobileOpenBtn = document.querySelector('.mobile-filter-open-btn');
    const mobileCloseBtn = document.querySelector('.mobile-sheet-close-btn');
    const mobileApplyBtn = document.querySelector('.mobile-sheet-apply-btn');
    const mobileResetLink = document.querySelector('.mobile-sheet-reset-link');
    const gridToggleBtn = document.querySelector('.mobile-grid-toggle-btn');

    let currentTypology = 'all';
    let currentBedrooms = 'all';
    let currentSort = 'relevant';
    let currentCount = cards.length;

    // 1. Initial Live Counter Tween (0 to total count)
    animateCounter(0, cards.length, 1.2);

    // 2. Read URL Search Params on Load
    const params = new URLSearchParams(window.location.search);
    if (params.get('typology')) currentTypology = params.get('typology');
    if (params.get('bedrooms')) currentBedrooms = params.get('bedrooms');
    if (params.get('sort')) currentSort = params.get('sort');

    syncFilterUI();
    applyFilters(false);

    // 3. Dropdown Toggle Logic
    dropdownWrappers.forEach((wrapper) => {
      const btn = wrapper.querySelector('.apartments-filter-btn');
      const menu = wrapper.querySelector('.filter-dropdown-menu');

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = menu.classList.contains('is-open');
        closeAllDropdowns();
        if (!isOpen) {
          menu.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });

      menu.querySelectorAll('.filter-option').forEach((opt) => {
        opt.addEventListener('click', (e) => {
          e.stopPropagation();
          const val = opt.getAttribute('data-value');

          menu.querySelectorAll('.filter-option').forEach((o) => o.classList.remove('is-selected'));
          opt.classList.add('is-selected');

          if (wrapper.contains(filterTypologyBtn)) {
            currentTypology = val;
            updateBtnLabel(filterTypologyBtn, 'TYPOLOGY', opt.textContent);
          } else if (wrapper.contains(filterBedroomsBtn)) {
            currentBedrooms = val;
            updateBtnLabel(filterBedroomsBtn, 'BEDROOMS', opt.textContent);
          } else if (wrapper.contains(filterSortBtn)) {
            currentSort = val;
            updateBtnLabel(filterSortBtn, 'SORT BY', opt.textContent);
          }

          closeAllDropdowns();
          applyFilters(true);
        });
      });
    });

    function closeAllDropdowns() {
      document.querySelectorAll('.filter-dropdown-menu').forEach((m) => m.classList.remove('is-open'));
      document.querySelectorAll('.apartments-filter-btn').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    }

    document.addEventListener('click', closeAllDropdowns);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAllDropdowns();
    });

    function updateBtnLabel(btn, label, text) {
      if (!btn) return;
      const labelSpan = btn.querySelector('.filter-label-txt');
      if (labelSpan) {
        labelSpan.innerHTML = `${label}: <strong class="filter-val-txt">${text.toUpperCase()}</strong>`;
      }
    }

    // 4. Filter and Sort Core Engine
    function applyFilters(animate = true) {
      let visibleCount = 0;
      const isFiltered = currentTypology !== 'all' || currentBedrooms !== 'all' || currentSort !== 'relevant';

      // Update Reset Buttons State
      if (resetBtn) {
        if (isFiltered) {
          resetBtn.classList.add('is-active');
          resetBtn.classList.remove('is-disabled');
        } else {
          resetBtn.classList.remove('is-active');
          resetBtn.classList.add('is-disabled');
        }
      }

      // Sort Cards Array
      let sortedCards = [...cards];
      if (currentSort === 'area-asc') {
        sortedCards.sort((a, b) => parseFloat(a.getAttribute('data-area') || 0) - parseFloat(b.getAttribute('data-area') || 0));
      } else if (currentSort === 'area-desc') {
        sortedCards.sort((a, b) => parseFloat(b.getAttribute('data-area') || 0) - parseFloat(a.getAttribute('data-area') || 0));
      }

      // Re-append sorted cards in DOM if order changed
      if (currentSort !== 'relevant' && grid) {
        sortedCards.forEach((c) => grid.appendChild(c));
      }

      // Filter Visibility
      sortedCards.forEach((card) => {
        const typo = card.getAttribute('data-typology') || '';
        const beds = card.getAttribute('data-bedrooms') || '';

        const matchTypo = currentTypology === 'all' || typo.toLowerCase() === currentTypology.toLowerCase();
        const matchBeds = currentBedrooms === 'all' || beds === currentBedrooms;

        if (matchTypo && matchBeds) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      // Photo Cards Visibility (Only visible when unfiltered)
      photoCards.forEach((pc) => {
        pc.style.display = !isFiltered ? 'flex' : 'none';
      });

      // Empty State
      if (emptyState) {
        emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
      }

      // Live Counter Tween
      animateCounter(currentCount, visibleCount, 0.6);
      currentCount = visibleCount;

      // Update Mobile Sheet Button
      if (mobileApplyBtn) {
        mobileApplyBtn.textContent = `Show ${visibleCount} Apartments`;
      }

      // Sync URL Query
      updateURLParams();

      // Refresh Lenis / ScrollTrigger
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    }

    function animateCounter(startVal, endVal, duration = 0.8) {
      if (!countBadge || typeof gsap === 'undefined') {
        if (countBadge) countBadge.textContent = endVal;
        return;
      }
      const counterObj = { val: startVal };
      gsap.to(counterObj, {
        val: endVal,
        duration: duration,
        ease: 'power2.out',
        onUpdate: () => {
          countBadge.textContent = Math.round(counterObj.val);
        },
      });
    }

    function updateURLParams() {
      const url = new URL(window.location);
      if (currentTypology !== 'all') url.searchParams.set('typology', currentTypology);
      else url.searchParams.delete('typology');

      if (currentBedrooms !== 'all') url.searchParams.set('bedrooms', currentBedrooms);
      else url.searchParams.delete('bedrooms');

      if (currentSort !== 'relevant') url.searchParams.set('sort', currentSort);
      else url.searchParams.delete('sort');

      window.history.replaceState({}, '', url);
    }

    function resetAllFilters() {
      currentTypology = 'all';
      currentBedrooms = 'all';
      currentSort = 'relevant';
      syncFilterUI();
      applyFilters(true);
    }

    function syncFilterUI() {
      // Desktop UI
      updateBtnLabel(filterTypologyBtn, 'TYPOLOGY', currentTypology === 'all' ? 'ALL' : currentTypology);
      updateBtnLabel(filterBedroomsBtn, 'BEDROOMS', currentBedrooms === 'all' ? 'ALL' : `${currentBedrooms} BEDROOMS`);
      updateBtnLabel(filterSortBtn, 'SORT BY', currentSort === 'relevant' ? 'RELEVANT' : currentSort.replace('-', ' '));

      // Desktop Options is-selected
      document.querySelectorAll('.filter-dropdown-menu').forEach((menu) => {
        menu.querySelectorAll('.filter-option').forEach((opt) => {
          const val = opt.getAttribute('data-value');
          if (val === currentTypology || val === currentBedrooms || val === currentSort) {
            opt.classList.add('is-selected');
          } else {
            opt.classList.remove('is-selected');
          }
        });
      });

      // Mobile Chips is-active
      document.querySelectorAll('.mobile-filter-chip').forEach((chip) => {
        const val = chip.getAttribute('data-value');
        if (val === currentTypology || val === currentBedrooms || val === currentSort) {
          chip.classList.add('is-active');
        } else {
          chip.classList.remove('is-active');
        }
      });
    }

    // Reset Listeners
    if (resetBtn) resetBtn.addEventListener('click', resetAllFilters);
    if (emptyResetBtn) emptyResetBtn.addEventListener('click', resetAllFilters);
    if (mobileResetLink) mobileResetLink.addEventListener('click', resetAllFilters);

    // Mobile Sheet Triggers
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
        applyFilters(true);
        closeSheet();
      });

      mobileSheet.addEventListener('click', (e) => {
        if (e.target.classList.contains('mobile-sheet-backdrop')) {
          closeSheet();
        }
      });
    }

    // Mobile Chips Click
    document.querySelectorAll('.mobile-sheet-chips-row').forEach((row) => {
      const type = row.getAttribute('data-filter-type');
      row.querySelectorAll('.mobile-filter-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
          row.querySelectorAll('.mobile-filter-chip').forEach((c) => c.classList.remove('is-active'));
          chip.classList.add('is-active');

          const val = chip.getAttribute('data-value');
          if (type === 'typology') currentTypology = val;
          if (type === 'bedrooms') currentBedrooms = val;
          if (type === 'sort') currentSort = val;

          syncFilterUI();
          applyFilters(true);
        });
      });
    });

    // Mobile Grid View Compact Toggle
    if (gridToggleBtn && grid) {
      gridToggleBtn.addEventListener('click', () => {
        grid.classList.toggle('compact-mode');
        gridToggleBtn.classList.toggle('is-active');
      });
    }
  }

  // D. Floorplan Modal Viewer
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

    function closeModal() {
      modal.classList.remove('is-active');
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
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

  // E. CTA Banner Parallax & Strips Shift
  function initCTABannerParallax() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || isMobile) return;

    const ctaBanner = document.querySelector('.cta-fullbleed-banner');
    const ctaBg = document.querySelector('.cta-banner-bg img');
    const strips = document.querySelectorAll('.cta-strip');

    if (!ctaBanner || !ctaBg) return;

    // Background slow scrub
    gsap.to(ctaBg, {
      y: '14%',
      ease: 'none',
      scrollTrigger: {
        trigger: ctaBanner,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    // Horizontal strips shifting
    if (strips.length) {
      strips.forEach((strip, index) => {
        const offset = (index % 2 === 0 ? 1 : -1) * 20;
        gsap.to(strip, {
          x: `${offset}px`,
          ease: 'none',
          scrollTrigger: {
            trigger: ctaBanner,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEditorialSystem);
  } else {
    initEditorialSystem();
  }
})();
