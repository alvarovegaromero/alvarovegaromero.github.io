(() => {
  'use strict';

  // ─── i18n ───
  let currentLang = localStorage.getItem('lang') || 'en';
  let esTranslations = null;
  const enSnapshot = {};

  // Capture the original English text from the HTML on first load
  function snapshotEnglish() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      enSnapshot[el.getAttribute('data-i18n')] = el.textContent;
    });
  }

  async function loadSpanish() {
    if (esTranslations) return esTranslations;
    const res = await fetch('i18n/es.json');
    esTranslations = await res.json();
    return esTranslations;
  }

  function applyTranslations(dict) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] != null) el.textContent = dict[key];
    });
    document.documentElement.lang = currentLang;
  }

  function updateToggleButtons() {
    document.querySelectorAll('.lang-toggle button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
  }

  async function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    if (lang === 'es') {
      const dict = await loadSpanish();
      applyTranslations(dict);
    } else {
      applyTranslations(enSnapshot);
    }
    updateToggleButtons();
  }

  // ─── Scroll fade-in ───
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(el => {
      if (el.isIntersecting) el.target.classList.add('visible');
    });
  }, { threshold: 0.08 });

  function observeFadeIns() {
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  }

  // ─── Custom cursor ───
  function initCursor() {
    const dot = document.getElementById('cursorDot');
    if (!dot) return;
    document.addEventListener('mousemove', e => {
      dot.style.left = e.clientX - 3 + 'px';
      dot.style.top  = e.clientY - 3 + 'px';
    });
  }

  // ─── Nav active state ───
  function initNavHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
      let current = '';
      sections.forEach(s => {
        if (window.scrollY >= s.offsetTop - 120) current = s.getAttribute('id');
      });
      navLinks.forEach(a => {
        a.style.color = a.getAttribute('href') === '#' + current ? 'var(--text)' : '';
      });
    });
  }

  // ─── Init ───
  document.addEventListener('DOMContentLoaded', async () => {
    snapshotEnglish();
    observeFadeIns();
    initCursor();
    initNavHighlight();

    // Lang toggle listeners
    document.querySelectorAll('.lang-toggle button').forEach(btn => {
      btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });

    // Apply saved language if not English
    if (currentLang !== 'en') {
      await setLanguage(currentLang);
    }
    updateToggleButtons();
  });
})();
