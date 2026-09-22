/* site.js
   Page behaviour that shipped inline in the original export. */

(function() {
    function initCategoryFilter() {
      var btns = document.querySelectorAll('.cat-btn');
      var items = document.querySelectorAll('.cat-item');
      if (!btns.length || !items.length) return;
      btns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          btns.forEach(function(b) {
            b.classList.remove('is-active');
            b.style.background = 'none';
            b.style.color = '#122a4d';
            b.style.borderColor = 'rgba(18, 42, 77, 0.18)';
          });
          btn.classList.add('is-active');
          btn.style.background = '#122a4d';
          btn.style.color = '#f7f5f0';
          btn.style.borderColor = '#122a4d';
          var cat = btn.getAttribute('data-cat');
          items.forEach(function(item) {
            if (item.getAttribute('data-category') === cat) {
              item.style.display = 'flex';
            } else {
              item.style.display = 'none';
            }
          });
        });
      });
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initCategoryFilter);
    } else {
      initCategoryFilter();
    }
  })();


/* ---------------------------------------------------------------------------
   Floor-plan tabs (.po-tabs / .po-panel on apartments.html)

   Each button carries aria-controls pointing at its panel, so adding a plan is
   just a matter of copying a button and a panel and giving them matching ids —
   no change is needed here. Re-runs safely after a Barba page transition.
   --------------------------------------------------------------------------- */
(function () {
  function initPlanTabs() {
    document.querySelectorAll('.po-tabs').forEach(function (tablist) {
      if (tablist.dataset.poBound === '1') return;
      tablist.dataset.poBound = '1';

      var tabs = Array.prototype.slice.call(tablist.querySelectorAll('.po-tab'));
      if (!tabs.length) return;

      function select(tab) {
        tabs.forEach(function (t) {
          var panel = document.getElementById(t.getAttribute('aria-controls'));
          var on = t === tab;
          t.setAttribute('aria-selected', on ? 'true' : 'false');
          if (panel) panel.hidden = !on;
        });
      }

      tabs.forEach(function (tab, i) {
        tab.addEventListener('click', function () { select(tab); });

        // Left/right arrows move between tabs, as a tablist is expected to.
        tab.addEventListener('keydown', function (e) {
          var step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if (!step) return;
          e.preventDefault();
          var next = tabs[(i + step + tabs.length) % tabs.length];
          select(next);
          next.focus();
        });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlanTabs);
  } else {
    initPlanTabs();
  }
  // Barba swaps the container without reloading, so re-bind afterwards.
  document.addEventListener('barba:after', initPlanTabs);
  window.addEventListener('pageshow', initPlanTabs);
})();

/* ---------------------------------------------------------------------------
   Page Visibility & Transition Safety Guard
   Ensures headers, titles, filters and apartment listings are never stuck
   behind preloader overlays or unrendered animation states.
   --------------------------------------------------------------------------- */
(function () {
  function ensurePageVisible() {
    // 1. Remove all preloader elements immediately
    document.querySelectorAll('[data-master-preloader], [data-preloader], .master-preloader, .preloader').forEach(function (el) {
      el.remove();
    });

    // 2. Ensure all prevent-flicker elements are visible
    document.querySelectorAll('[data-prevent-flicker]').forEach(function (el) {
      el.style.visibility = 'visible';
    });

    // 4. Reveal top content if opacity is zero
    document.querySelectorAll('.apart-s_title, .apart-s_cms_filter, .apart-cms, .apart-s_title h1, .apart-card, .lot-s_info, .contact-s').forEach(function (el) {
      if (window.getComputedStyle(el).opacity === '0') {
        el.style.opacity = '1';
      }
    });

    // 5. Refresh ScrollTrigger calculations
    if (window.ScrollTrigger) {
      setTimeout(function () {
        window.ScrollTrigger.refresh();
      }, 100);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(ensurePageVisible, 50);
    });
  } else {
    setTimeout(ensurePageVisible, 50);
  }

  document.addEventListener('barba:after', ensurePageVisible);
  document.addEventListener('barba:afterEnter', ensurePageVisible);
  window.addEventListener('pageshow', ensurePageVisible);
})();
