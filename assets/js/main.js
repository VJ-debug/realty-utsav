/* Realty Utsav 2026 — page interactions */
(function () {
  'use strict';

  var header = document.getElementById('site-header');
  var mobileCta = document.getElementById('mobile-cta');
  var hero = document.getElementById('home');
  var register = document.getElementById('register');

  /* ---------- Header shadow + mobile CTA ---------- */
  var toTop = document.getElementById('to-top');
  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  var registerVisible = false;
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 10);
    toTop.classList.toggle('is-visible', y > 500);
    if (mobileCta) {
      mobileCta.classList.toggle('is-visible', y > hero.offsetHeight * 0.8 && !registerVisible);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  if ('IntersectionObserver' in window && register) {
    new IntersectionObserver(function (entries) {
      registerVisible = entries[0].isIntersecting;
      onScroll();
    }, { threshold: 0.15 }).observe(register);
  }
  onScroll();

  /* ---------- Stat counters ---------- */
  var counters = document.querySelectorAll('[data-count]');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var start = null;
    var duration = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window && !reduceMotion) {
    var countObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { c.textContent = '0'; countObs.observe(c); });
  }

  /* ---------- Scroll reveal ---------- */
  // Elements fade in as they enter the viewport and fade out when they leave
  // (both scrolling down and back up). Siblings in the same group are staggered.
  var revealGroups = [
    { sel: '#about .shadow-card', dir: 'up' },
    { sel: '.section-head', dir: 'up' },
    { sel: '.property-card', dir: 'up', stagger: true },
    { sel: '.feature', dir: 'up', stagger: true },
    { sel: '#benefits [data-reveal-block="copy"]', dir: 'left' },
    { sel: '#benefits [data-reveal-block="media"]', dir: 'right' },
    { sel: '.check-item', dir: 'left', stagger: true },
    { sel: '#register > div > div:first-child', dir: 'left' },
    { sel: '#register > div > div:last-child', dir: 'right' },
    { sel: '.faq', dir: 'up', stagger: true },
    { sel: '[data-reveal-block="cta"]', dir: 'up' },
    { sel: 'footer > div', dir: 'up' }
  ];

  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle('in-view', entry.isIntersecting);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealGroups.forEach(function (group) {
      document.querySelectorAll(group.sel).forEach(function (el, i) {
        if (el.classList.contains('reveal')) return;
        el.classList.add('reveal', 'reveal-' + group.dir);
        if (group.stagger) {
          var index = Array.prototype.indexOf.call(el.parentElement.children, el);
          el.style.setProperty('--reveal-delay', (index % 6) * 90 + 'ms');
        }
        revealObs.observe(el);
      });
    });
  }

  /* ---------- Registration forms (bottom form + popup share this logic) ---------- */
  function initRegisterForm(form) {
    var success = form.parentElement.querySelector('[data-form-success]');
    var mobile = form.querySelector('input[name="mobile"]');

    mobile.addEventListener('input', function () {
      mobile.value = mobile.value.replace(/\D/g, '').slice(0, 10);
    });

    function validateField(field) {
      var ok = field.checkValidity() && field.value.trim() !== '';
      field.parentElement.classList.toggle('is-invalid', !ok);
      return ok;
    }

    form.querySelectorAll('[required]').forEach(function (field) {
      var evt = field.tagName === 'SELECT' ? 'change' : 'blur';
      field.addEventListener(evt, function () { validateField(field); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll('[required]').forEach(function (f) { if (!validateField(f)) valid = false; });
      if (!valid) {
        var firstBad = form.querySelector('.is-invalid .form-input');
        if (firstBad) firstBad.focus();
        return;
      }

      // TODO: send the data to your backend / CRM here, e.g.
      // fetch('/api/register', { method: 'POST', body: new FormData(form) })
      var data = Object.fromEntries(new FormData(form).entries());
      console.log('Registration:', data);

      form.classList.add('hidden');
      success.classList.remove('hidden');
    });

    // Used when the popup is reopened
    form.resetForm = function () {
      form.reset();
      form.querySelectorAll('.is-invalid').forEach(function (el) { el.classList.remove('is-invalid'); });
      form.classList.remove('hidden');
      success.classList.add('hidden');
    };
  }
  document.querySelectorAll('[data-register-form]').forEach(initRegisterForm);

  /* ---------- Register popup ---------- */
  var modal = document.getElementById('register-modal');
  var modalForm = modal.querySelector('[data-register-form]');
  var lastFocus = null;

  function openModal() {
    lastFocus = document.activeElement;
    if (modalForm.resetForm && modalForm.classList.contains('hidden')) modalForm.resetForm();
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('modal-open');
    requestAnimationFrame(function () { modal.classList.add('is-open'); });
    setTimeout(function () {
      var first = modal.querySelector('input');
      if (first) first.focus({ preventScroll: true });
    }, 250);
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('modal-open');
    setTimeout(function () { modal.hidden = true; }, 250);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  // Every "Register" link opens the popup instead of jumping down the page
  document.querySelectorAll('a[href="#register"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      openModal();
    });
  });
  modal.querySelectorAll('[data-modal-close]').forEach(function (el) {
    el.addEventListener('click', closeModal);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });
})();
