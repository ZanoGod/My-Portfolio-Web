(() => {
  const root = document.documentElement;
  const light = document.querySelector('.cursor-spotlight');
  const allowed = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Start the entrance only after the existing loader releases the page.
  const enter = () => {
    if (root.classList.contains('is-loading')) return;
    observer.disconnect();
    if (!reduced.matches) root.classList.add('intro-ready');
  };
  const observer = new MutationObserver(enter);
  observer.observe(root, { attributes: true, attributeFilter: ['class'] });
  enter();
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) root.classList.remove('intro-ready');
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) root.classList.remove('intro-ready');
  });
  if (!light) return;

  let frame = 0;
  let x = 0, y = 0, targetX = 0, targetY = 0;
  let active = false;
  let previous = 0;
  const place = () => {
    light.style.transform = `translate3d(${x - 300}px, ${y - 300}px, 0)`;
  };
  const stop = () => {
    active = false;
    light.classList.remove('is-active');
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
  };
  const tick = (time) => {
    frame = 0;
    if (!active || !allowed.matches || document.hidden) return stop();
    const dt = previous ? Math.min(time - previous, 64) : 16;
    previous = time;
    const ease = 1 - Math.exp(-dt / 65);
    x += (targetX - x) * ease;
    y += (targetY - y) * ease;
    place();
    if (Math.abs(targetX - x) + Math.abs(targetY - y) > .2) {
      frame = requestAnimationFrame(tick);
    } else {
      previous = 0;
    }
  };
  document.addEventListener('pointermove', (event) => {
    if (!allowed.matches || event.pointerType !== 'mouse' || document.hidden) return;
    targetX = event.clientX;
    targetY = event.clientY;
    if (!active) {
      x = targetX;
      y = targetY;
      place();
      active = true;
      light.classList.add('is-active');
    }
    if (!frame) frame = requestAnimationFrame(tick);
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', stop);
  document.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'mouse') stop();
  }, { passive: true });
  window.addEventListener('blur', stop);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  allowed.addEventListener('change', stop);
})();
