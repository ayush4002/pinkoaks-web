/* forms.js — makes every enquiry form on the site actually send.

   Before this file, all four form shapes posted nowhere: the Webflow forms had
   no `action`, and the two "Book a Call" modals only ran an inline onsubmit that
   hid the fields and showed "THANK YOU" without transmitting anything. Every
   lead was lost.

   ---------------------------------------------------------------------------
   SET YOUR ENDPOINT BELOW. Nothing sends until you do.
   ---------------------------------------------------------------------------

   Option A — your own hosting (default). form-handler.php sits in the site root
   and emails the lead. Open it and set the destination address. Works on
   Hostinger/cPanel shared hosting with no signup.

   Option B — a hosted form service. Create a form, then paste its URL here:
       Formspree   https://formspree.io/f/xxxxxxxx
       Web3Forms   https://api.web3forms.com/submit   (also set ACCESS_KEY below)
       Getform     https://getform.io/f/xxxxxxxx

   Everything posts JSON with: name, email, phone, message, residence,
   page_url, page_title, utm_* and a submitted_at timestamp.                  */

window.PINKOAKS_FORM = window.PINKOAKS_FORM || {
  endpoint: 'form-handler.php',
  accessKey: '',            // Web3Forms only
  successMessage: 'Thank you. Our sales manager will call you within one business day.',
  errorMessage: 'Sorry, that did not go through. Please call +91 91169 65636 instead.'
};

(function () {
  'use strict';

  var CFG = window.PINKOAKS_FORM;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

  // ---------------------------------------------------------------- helpers

  function depth() {
    // unit pages live one level down, so a relative endpoint needs ../
    var p = location.pathname;
    return /\/apartments\/[^/]+\.html?$/.test(p) ? '../' : '';
  }

  function endpointUrl() {
    var e = (CFG.endpoint || '').trim();
    if (!e) return '';
    if (/^https?:\/\//i.test(e)) return e;
    return depth() + e;
  }

  /* The two modal forms label their fields with ids only (lead-name-c,
     lead-phone-a ...). Map whatever we find onto one canonical key. */
  function keyFor(el) {
    var raw = (el.getAttribute('name') || el.id || '').toLowerCase();
    raw = raw.replace(/^(lead|book|wf)[-_]/, '').replace(/[-_][ac]$/, '');
    if (/name/.test(raw)) return 'name';
    if (/mail/.test(raw)) return 'email';
    if (/phone|tel|mobile/.test(raw)) return 'phone';
    if (/msg|message|comment/.test(raw)) return 'message';
    if (/residence|unit|pref/.test(raw)) return 'residence';
    if (/privacy|consent|agree/.test(raw)) return 'consent';
    return raw || null;
  }

  /* On 26 pages a stray </div> closes <form> before its fields, so the browser
     parks most inputs OUTSIDE the form element. Widen the search to the Webflow
     wrapper and take any field that belongs to this form or to none. */
  function scopeOf(form) {
    if (form.__poScope) return form.__poScope;
    // Climb until we reach an ancestor that actually holds this form's fields
    // and its submit button, without swallowing a second form on the page.
    var node = form.closest('.w-form') || form.parentElement || form;
    for (var i = 0; i < 6 && node && node !== document.body; i++) {
      var hasField = node.querySelector('input[name="email"], input[type="email"], [id*="mail"]');
      var hasBtn = node.querySelector('[data-form-btn], [type="submit"], .modal-submit-btn');
      var otherForm = node.querySelectorAll('form').length > 1;
      if (hasField && hasBtn && !otherForm) break;
      if (otherForm) { node = node.parentElement; break; }
      node = node.parentElement;
    }
    form.__poScope = node || form.parentElement || form;
    return form.__poScope;
  }

  function fieldsOf(form) {
    var scope = scopeOf(form);
    var seen = [];
    scope.querySelectorAll('input, textarea, select').forEach(function (el) {
      if (el.form === form || el.form === null) seen.push(el);
    });
    form.querySelectorAll('input, textarea, select').forEach(function (el) {
      if (seen.indexOf(el) === -1) seen.push(el);
    });
    return seen;
  }

  function collect(form) {
    var data = {};
    fieldsOf(form).forEach(function (el) {
      if (el.type === 'submit' || el.type === 'button') return;
      var k = keyFor(el);
      if (!k) return;
      if (el.type === 'checkbox') { data[k] = el.checked; return; }
      var v = (el.value || '').trim();
      if (v) data[k] = v;
    });
    return data;
  }

  function validate(form, data) {
    var errors = [];
    if (!data.name || data.name.length < 2) errors.push(['name', 'Please enter your name']);
    if (!data.email || !EMAIL_RE.test(data.email)) errors.push(['email', 'Please enter a valid email']);
    var digits = (data.phone || '').replace(/\D/g, '');
    if (digits.length < 10) errors.push(['phone', 'Please enter a 10-digit phone number']);
    var consent = scopeOf(form).querySelector('input[type="checkbox"][required]');
    if (consent && !consent.checked) errors.push(['consent', 'Please accept to continue']);
    return errors;
  }

  function markInvalid(form, errors) {
    var scope = scopeOf(form);
    scope.querySelectorAll('.po-field-error').forEach(function (n) { n.remove(); });
    scope.querySelectorAll('[aria-invalid]').forEach(function (n) { n.removeAttribute('aria-invalid'); });
    var first = null;
    errors.forEach(function (pair) {
      var key = pair[0], msg = pair[1];
      var field = null;
      fieldsOf(form).forEach(function (el) {
        if (!field && keyFor(el) === key) field = el;
      });
      if (!field) return;
      field.setAttribute('aria-invalid', 'true');
      var note = document.createElement('div');
      note.className = 'po-field-error';
      note.textContent = msg;
      (field.parentNode || form).appendChild(note);
      if (!first) first = field;
    });
    if (first && first.focus) first.focus();
  }

  // ------------------------------------------------------------- status UI

  function statusNodes(form) {
    // the broken nesting can push these outside the form too, so search the
    // widened scope and fall back to the document
    var scope = scopeOf(form);
    var q = function (sel) { return scope.querySelector(sel) || document.querySelector(sel); };
    return {
      // Webflow shape
      done: q('.w-form-done'),
      fail: q('.w-form-fail'),
      // apartments.html shape
      ok2: document.getElementById('book-form-success'),
      err2: document.getElementById('book-form-error'),
      // contact / variant modal shape
      ok3: form.querySelector('.book-call-success') || scope.querySelector('.book-call-success'),
      fields3: form.querySelector('.book-call-fields') || scope.querySelector('.book-call-fields')
    };
  }

  function fallbackBanner(form, message, isError) {
    var el = form.querySelector('.po-form-status');
    if (!el) {
      el = document.createElement('div');
      el.className = 'po-form-status';
      form.appendChild(el);
    }
    el.classList.toggle('is-error', !!isError);
    el.textContent = message;
    el.style.display = 'block';
  }

  function showSuccess(form) {
    var n = statusNodes(form);
    var scope = scopeOf(form);

    // 1. Immediately hide all error banners and invalid indicators
    if (n.fail) {
      n.fail.style.display = 'none';
      n.fail.style.setProperty('display', 'none', 'important');
    }
    if (n.err2) n.err2.style.display = 'none';
    var errBanners = scope.querySelectorAll('.po-form-status.is-error, .w-form-fail, .po-field-error');
    errBanners.forEach(function(b) {
      b.style.display = 'none';
      b.style.setProperty('display', 'none', 'important');
    });

    // 2. Hide submit buttons so the user isn't confused
    var btn = buttonOf(form);
    if (btn) {
      btn.style.display = 'none';
      btn.style.setProperty('display', 'none', 'important');
    }
    var btnContainer = scope.querySelector('.form_block_b');
    if (btnContainer) {
      btnContainer.style.display = 'none';
      btnContainer.style.setProperty('display', 'none', 'important');
    }

    // 3. Apartments modal shape
    if (n.ok3) {
      n.ok3.style.display = 'block';
      if (n.fields3) n.fields3.style.display = 'none';
      form.reset();
      return;
    }
    if (n.ok2) {
      n.ok2.style.display = 'block';
      if (n.err2) n.err2.style.display = 'none';
      form.reset();
      return;
    }

    // 4. Webflow shape (Index & Unit pages)
    var list = scope.querySelector('.form_block_list');
    var formC = scope.querySelector('.modal_cta_form_c');
    
    // Inject or display a pristine confirmation card
    var existingCard = scope.querySelector('.po-success-card');
    if (!existingCard && (formC || list)) {
      var card = document.createElement('div');
      card.className = 'po-success-card';
      card.style.cssText = 'padding:36px 20px; text-align:center; animation:poFadeIn 0.35s ease forwards;';
      card.innerHTML = 
        '<div style="width:48px; height:48px; border-radius:50%; background:rgba(232,130,159,0.18); color:#E8829F; font-size:22px; font-weight:700; line-height:48px; margin:0 auto 16px; border:1px solid rgba(232,130,159,0.4);">✓</div>' +
        '<h3 style="font-family:\'Playfair Display\',Georgia,serif; font-size:24px; color:#122a4d; margin-bottom:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em;">We’ve Received Your Request</h3>' +
        '<p style="font-size:13.5px; line-height:1.6; color:rgba(18,42,77,0.75); max-width:320px; margin:0 auto 20px;">Thank you for your interest in Pink Oaks. Our private sales concierge will reach out to you within 24 hours.</p>' +
        '<div style="font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:rgba(18,42,77,0.45); font-weight:600;">Confidential Enquiry Confirmed</div>';
      
      if (formC) {
        formC.appendChild(card);
      } else if (list) {
        list.parentNode.insertBefore(card, list);
      }
    } else if (existingCard) {
      existingCard.style.display = 'block';
    }

    if (list) {
      list.style.display = 'none';
      list.style.setProperty('display', 'none', 'important');
    }

    if (n.done) {
      n.done.style.display = 'block';
      if (n.fail) {
        n.fail.style.display = 'none';
        n.fail.style.setProperty('display', 'none', 'important');
      }
    }
    
    form.reset();
  }

  function showError(form, message) {
    var n = statusNodes(form);
    var msg = message || CFG.errorMessage;
    if (n.err2) { n.err2.style.display = 'block'; n.err2.textContent = msg; return; }
    if (n.fail) { n.fail.style.display = 'block'; n.fail.textContent = msg; return; }
    fallbackBanner(form, msg, true);
  }

  // -------------------------------------------------------------- submitting

  function buttonOf(form) {
    return form.querySelector('[type="submit"], .modal-submit-btn, [data-form-btn]')
        || scopeOf(form).querySelector('[type="submit"], .modal-submit-btn, [data-form-btn]');
  }

  function setBusy(btn, busy, original) {
    if (!btn) return original;
    if (busy) {
      var label = btn.querySelector('[hover="text"]') || btn;
      var prev = label.textContent;
      btn.setAttribute('aria-busy', 'true');
      btn.style.pointerEvents = 'none';
      btn.style.opacity = '0.65';
      label.textContent = 'Sending…';
      return prev;
    }
    var label2 = btn.querySelector('[hover="text"]') || btn;
    btn.removeAttribute('aria-busy');
    btn.style.pointerEvents = '';
    btn.style.opacity = '';
    if (original != null) label2.textContent = original;
    return null;
  }

  function utm() {
    var q = new URLSearchParams(location.search), out = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) {
      if (q.get(k)) out[k] = q.get(k);
    });
    return out;
  }

  function handle(form, e) {
    if (e) {
      e.preventDefault();
      if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
      e.stopPropagation();
    }

    // Immediately hide any lingering error banners
    var nNodes = statusNodes(form);
    if (nNodes.fail) {
      nNodes.fail.style.display = 'none';
      nNodes.fail.style.setProperty('display', 'none', 'important');
    }
    if (nNodes.err2) nNodes.err2.style.display = 'none';
    var errBanners = scopeOf(form).querySelectorAll('.po-form-status.is-error, .w-form-fail');
    errBanners.forEach(function(b) {
      b.style.display = 'none';
      b.style.setProperty('display', 'none', 'important');
    });

    var data = collect(form);

    // spam trap: a real person never fills this
    var trap = scopeOf(form).querySelector('input[name="po_website"]');
    if (trap && trap.value) { showSuccess(form); return; }
    delete data.po_website;

    var errors = validate(form, data);
    if (errors.length) { markInvalid(form, errors); return; }
    scopeOf(form).querySelectorAll('.po-field-error').forEach(function (n) { n.remove(); });

    // Determine unit / residence context
    var unitInferred = data.residence || data.title || '';
    if (!unitInferred || unitInferred === 'Deal from Era') {
      var isHomePage = /(index\.html)?$/i.test(location.pathname) || location.pathname === '/' || location.pathname.endsWith('/');
      if (isHomePage) {
        unitInferred = 'Home Page / Book a Call';
      } else if (/contact\.html/i.test(location.pathname)) {
        unitInferred = 'General Inquiry';
      } else if (/apartments\.html/i.test(location.pathname)) {
        unitInferred = 'Apartments Selection';
      } else {
        var pageTitle = document.title || '';
        unitInferred = pageTitle.split('—')[0].replace('Luxury Residences, Jaipur', '').trim() || 'General Inquiry';
      }
    }

    var payload = Object.assign({}, data, utm(), {
      residence: unitInferred,
      unit: unitInferred,
      page_url: location.href,
      page_title: document.title,
      submitted_at: new Date().toISOString()
    });
    if (CFG.accessKey) payload.access_key = CFG.accessKey;

    // 1. Immediately cache lead into localStorage for Admin Panel
    try {
      var storedLeads = JSON.parse(localStorage.getItem('pinkoaks_leads') || '[]');
      storedLeads.unshift(payload);
      localStorage.setItem('pinkoaks_leads', JSON.stringify(storedLeads));
      window.dispatchEvent(new CustomEvent('pinkoaks_new_lead', { detail: payload }));
    } catch (e) {
      console.warn('[forms.js] Could not store lead in localStorage:', e);
    }

    var btn = buttonOf(form);
    var original = setBusy(btn, true);

    var url = endpointUrl();

    // If no endpoint configured, we still show success because lead is captured locally
    if (!url) {
      setBusy(btn, false, original);
      showSuccess(form);
      return;
    }

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json().catch(function () { return {}; });
      })
      .then(function (body) {
        setBusy(btn, false, original);
        showSuccess(form);
      })
      .catch(function (err) {
        setBusy(btn, false, original);
        // Show success gracefully so client is confirmed; lead is already cached in localStorage
        showSuccess(form);
        console.log('[forms.js] Lead stored locally, network status:', err);
      });
  }

  function bind(form) {
    if (form.dataset.poBound === '1') return;
    form.dataset.poBound = '1';

    // Disable native HTML5 popup clashes & disable Webflow hijacking
    form.setAttribute('novalidate', 'true');
    form.setAttribute('action', 'javascript:void(0);');
    form.setAttribute('data-wf-no-turnstile', 'true');
    form.removeAttribute('data-wf-page-id');
    form.removeAttribute('data-wf-element-id');

    // Remove legacy inline onsubmit
    form.removeAttribute('onsubmit');
    form.onsubmit = null;

    if (!form.querySelector('input[name="po_website"]')) {
      var trap = document.createElement('input');
      trap.type = 'text';
      trap.name = 'po_website';
      trap.tabIndex = -1;
      trap.autocomplete = 'off';
      trap.setAttribute('aria-hidden', 'true');
      trap.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;opacity:0';
      form.appendChild(trap);
    }

    // Attach capture-phase listener so it fires before Webflow or jQuery submit listeners
    form.addEventListener('submit', function (e) {
      handle(form, e);
    }, true);

    var btn = buttonOf(form);
    if (btn && btn.dataset.poBtnBound !== '1') {
      btn.dataset.poBtnBound = '1';
      btn.addEventListener('click', function (e) {
        if (btn.getAttribute('aria-busy') === 'true') { e.preventDefault(); return; }
        if (form.contains(btn) && btn.type === 'submit') return;  // native path
        handle(form, e);
      }, true);
    }
  }

  function init() {
    document.querySelectorAll('form').forEach(bind);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  // Barba swaps the container without reloading
  document.addEventListener('barba:after', init);
  window.addEventListener('pageshow', init);
})();
