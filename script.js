(() => {
  'use strict';
  const root = document.documentElement;
  const themeButton = document.querySelector('.theme-toggle');
  const menuButton = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const filters = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('[data-categories]')];
  const storageKey = 'zin-portfolio-theme';
  const preferredDark = window.matchMedia('(prefers-color-scheme: dark)');
  let savedTheme = null;
  try { savedTheme = localStorage.getItem(storageKey); } catch (_) {}
  function setTheme(theme, persist = false) {
    root.dataset.theme = theme;
    if (themeButton) {
      themeButton.textContent = theme === 'dark' ? '☼' : '☾';
      themeButton.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' theme');
      themeButton.setAttribute('aria-pressed', String(theme === 'dark'));
    }
    if (persist) { try { localStorage.setItem(storageKey, theme); } catch (_) {} }
  }
  setTheme(savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : 'light');
  themeButton?.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true));
  function closeMenu() { navLinks?.classList.remove('open'); menuButton?.setAttribute('aria-expanded', 'false'); menuButton?.setAttribute('aria-label', 'Open navigation'); }
  menuButton?.addEventListener('click', () => {
    const open = navLinks?.classList.toggle('open') ?? false;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  navLinks?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 900) closeMenu(); });
  filters.forEach(button => button.addEventListener('click', () => {
    const selected = button.dataset.filter;
    filters.forEach(b => { const active = b === button; b.classList.toggle('is-active', active); b.setAttribute('aria-pressed', String(active)); });
    cards.forEach(card => { card.hidden = selected !== 'all' && !card.dataset.categories.split(' ').includes(selected); });
  }));
  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); obs.unobserve(entry.target); } });
    }, { threshold: 0.08 });
    document.querySelectorAll('.section-top, .section-intro, .project-card, .skill-card, .timeline-item, .education-grid article').forEach(el => { el.classList.add('reveal'); observer.observe(el); });
  }
})();
