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
    if (n.ok3) { n.ok3.style.display = 'block'; if (n.fields3) n.fields3.style.display = 'none'; return; }
    if (n.ok2) { n.ok2.style.display = 'block'; if (n.err2) n.err2.style.display = 'none'; form.reset(); return; }
    if (n.done) {
      n.done.style.display = 'block';
      if (n.fail) n.fail.style.display = 'none';
      // hide the field list, which may sit outside the <form> element
      var list = scopeOf(form).querySelector('.form_block_list') || form;
      list.style.display = 'none';
      return;
    }
    fallbackBanner(form, CFG.successMessage, false);
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
    e.preventDefault();
    e.stopPropagation();

    var data = collect(form);

    // spam trap: a real person never fills this
    var trap = scopeOf(form).querySelector('input[name="po_website"]');
    if (trap && trap.value) { showSuccess(form); return; }
    delete data.po_website;

    var errors = validate(form, data);
    if (errors.length) { markInvalid(form, errors); return; }
    scopeOf(form).querySelectorAll('.po-field-error').forEach(function (n) { n.remove(); });

    var url = endpointUrl();
    if (!url) {
      showError(form, 'This form is not connected yet. Please call +91 91169 65636.');
      console.error('[forms.js] No endpoint set. Edit window.PINKOAKS_FORM.endpoint in assets/js/forms.js');
      return;
    }

    var payload = Object.assign({}, data, utm(), {
      page_url: location.href,
      page_title: document.title,
      submitted_at: new Date().toISOString()
    });
    if (CFG.accessKey) payload.access_key = CFG.accessKey;

    var btn = buttonOf(form);
    var original = setBusy(btn, true);

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
        if (body && body.success === false) throw new Error(body.message || 'rejected');
        setBusy(btn, false, original);
        showSuccess(form);
      })
      .catch(function (err) {
        setBusy(btn, false, original);
        showError(form);
        console.error('[forms.js] submit failed:', err);
      });
  }

  function bind(form) {
    if (form.dataset.poBound === '1') return;
    form.dataset.poBound = '1';

    // the modal forms shipped with an inline onsubmit that faked a success
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

    form.addEventListener('submit', function (e) { handle(form, e); });

    /* Where the nesting is broken the submit button sits outside the <form>,
       so app.js's `closest('form')` finds nothing and the button does nothing.
       Bind it here as well; the guard stops a double submit. */
    var btn = buttonOf(form);
    if (btn && btn.dataset.poBtnBound !== '1') {
      btn.dataset.poBtnBound = '1';
      btn.addEventListener('click', function (e) {
        if (btn.getAttribute('aria-busy') === 'true') { e.preventDefault(); return; }
        if (form.contains(btn) && btn.type === 'submit') return;  // native path
        handle(form, e);
      });
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
