// app.js - full file

document.addEventListener('DOMContentLoaded', () => {
  // Fill year (if present)
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Desktop dropdowns
  document.querySelectorAll('[data-dropdown]').forEach(dd => {
    const btn = dd.querySelector('.nav-link');
    const menu = dd.querySelector('.dropdown-menu');
    if (!btn || !menu) return;
    const openMenu = () => { dd.classList.add('show'); btn.setAttribute('aria-expanded','true'); menu.setAttribute('aria-hidden','false'); };
    const closeMenu = () => { dd.classList.remove('show'); btn.setAttribute('aria-expanded','false'); menu.setAttribute('aria-hidden','true'); };

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dd.classList.contains('show');
      if (isOpen) closeMenu(); else openMenu();
    });

    document.addEventListener('click', (ev) => {
      if (!dd.contains(ev.target)) closeMenu();
    });

    dd.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') closeMenu();
    });
  });

  // Mobile menu open/close
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileClose = document.getElementById('mobile-close');

  function openMobileMenu() {
    if (!mobileMenu || !hamburger) return;
    mobileMenu.setAttribute('aria-hidden','false');
    hamburger.setAttribute('aria-expanded','true');
    hamburger.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(()=> mobileClose?.focus(), 120);
  }
  function closeMobileMenu() {
    if (!mobileMenu || !hamburger) return;
    mobileMenu.setAttribute('aria-hidden','true');
    hamburger.setAttribute('aria-expanded','false');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
    hamburger.focus();
  }

  hamburger?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = hamburger.classList.contains('open');
    if (isOpen) closeMobileMenu(); else openMobileMenu();
  });

  mobileClose?.addEventListener('click', (e) => { e.stopPropagation(); closeMobileMenu(); });

  mobileMenu?.addEventListener('click', (e) => {
    if (e.target === mobileMenu) closeMobileMenu();
  });

  // ESC closes mobile and dropdowns
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (mobileMenu && mobileMenu.getAttribute('aria-hidden') === 'false') closeMobileMenu();
      document.querySelectorAll('[data-dropdown]').forEach(dd => dd.classList.remove('show'));
    }
  });

  // Mobile submenu toggles
  document.querySelectorAll('.mobile-dropdown-toggle').forEach(btn => {
    const key = btn.dataset.mobileDropdown;
    const submenu = document.querySelector(`[data-mobile-menu="${key}"]`);
    if (!submenu) return;
    btn.addEventListener('click', () => {
      const open = submenu.style.display === 'block';
      submenu.style.display = open ? 'none' : 'block';
    });
  });
});



/* ===========================
   SERVICES MODULE (REPLACED)
   =========================== */
(function () {
  // Utilities
  const selectAll = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* 1) Reveal cards on scroll with IntersectionObserver + stagger */
  const cards = selectAll('.svcCard');
  if ('IntersectionObserver' in window && cards.length) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const idx = cards.indexOf(el);
          setTimeout(() => el.classList.add('is-visible'), idx * 120);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.14 });

    cards.forEach(c => io.observe(c));
  } else {
    cards.forEach(c => c.classList.add('is-visible'));
  }

  /* 2) SVG icon stroke animation on hover (draw effect) */
  const svgs = selectAll('.svcIcon');
  svgs.forEach(svg => {
    const strokes = svg.querySelectorAll('path, rect, circle, line, polyline, polygon');
    strokes.forEach((shape) => {
      const length = (shape.getTotalLength && shape.getTotalLength()) || 120;
      shape.style.transition = 'stroke-dashoffset 520ms cubic-bezier(.2,.85,.25,1), fill 320ms ease';
      shape.style.strokeDasharray = length;
      shape.style.strokeDashoffset = length;
      shape.style.fillOpacity = shape.getAttribute('fill') ? 0 : 0;
    });

    const parentCard = svg.closest('.svcCard');
    if (!parentCard) return;
    const enter = () => strokes.forEach(s => { s.style.strokeDashoffset = '0'; if (s.getAttribute('fill')) s.style.fillOpacity = 1; });
    const leave = () => strokes.forEach(s => { const L = (s.getTotalLength && s.getTotalLength()) || 120; s.style.strokeDashoffset = L; if (s.getAttribute('fill')) s.style.fillOpacity = 0; });

    parentCard.addEventListener('mouseenter', enter);
    parentCard.addEventListener('focusin', enter);
    parentCard.addEventListener('mouseleave', leave);
    parentCard.addEventListener('focusout', leave);
  });

  /* 3) Accordion panels — wiring + smooth height animation */
  const toggles = selectAll('.svcCard-more');
  const panels = selectAll('.svcPanel');

  // initialize attributes & styles
  toggles.forEach(btn => {
    const pid = btn.getAttribute('aria-controls');
    const panel = pid ? document.getElementById(pid) : btn.closest('.svcCard')?.querySelector('.svcPanel');
    if (!panel) return;
    if (!btn.hasAttribute('aria-expanded')) btn.setAttribute('aria-expanded','false');
    if (!panel.hasAttribute('aria-hidden')) panel.setAttribute('aria-hidden','true');
    panel.classList.remove('open');
    panel.style.display = 'block';
    panel.style.height = '0px';
    panel.style.overflow = 'hidden';
  });

  // protect panels while animating
  const animating = new WeakSet();

  function getPanelFullHeight(panel) {
    const prev = panel.style.height;
    panel.style.height = 'auto';
    const h = panel.getBoundingClientRect().height;
    panel.style.height = prev;
    return h;
  }

  function openPanel(button, panel) {
    if (!button || !panel || animating.has(panel)) return;
    animating.add(panel);
    panel.style.display = 'block';
    panel.style.overflow = 'hidden';
    const full = getPanelFullHeight(panel);
    panel.style.height = '0px';
    requestAnimationFrame(() => {
      panel.classList.add('open');
      panel.style.height = full + 'px';
      button.setAttribute('aria-expanded', 'true');
      panel.setAttribute('aria-hidden', 'false');
    });
    function onEnd(e) {
      if (e.propertyName !== 'height') return;
      panel.style.height = '';
      animating.delete(panel);
      panel.removeEventListener('transitionend', onEnd);
    }
    panel.addEventListener('transitionend', onEnd);
  }

  function closePanel(button, panel) {
    if (!button || !panel || animating.has(panel)) return;
    animating.add(panel);
    const start = panel.getBoundingClientRect().height;
    panel.style.height = start + 'px';
    requestAnimationFrame(() => {
      panel.classList.remove('open');
      panel.style.height = '0px';
      button.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');
    });
    function onEnd(e) {
      if (e.propertyName !== 'height') return;
      panel.style.height = '0px';
      animating.delete(panel);
      panel.removeEventListener('transitionend', onEnd);
    }
    panel.addEventListener('transitionend', onEnd);
  }

  function togglePanel(button, panel) {
    if (!button || !panel) return;
    const isOpen = button.getAttribute('aria-expanded') === 'true';
    if (isOpen) closePanel(button, panel);
    else {
      // close other panels (optional behavior)
      panels.forEach(p => {
        if (p === panel) return;
        if (p.classList.contains('open')) {
          const ctrl = document.querySelector(`[aria-controls="${p.id}"]`);
          if (ctrl) closePanel(ctrl, p);
        }
      });
      openPanel(button, panel);
    }
  }

  // attach handlers to buttons
  toggles.forEach(btn => {
    const pid = btn.getAttribute('aria-controls');
    const panel = pid ? document.getElementById(pid) : btn.closest('.svcCard')?.querySelector('.svcPanel');
    if (!panel) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePanel(btn, panel);
    });
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        togglePanel(btn, panel);
      }
    });
  });

  // allow Enter on card to open
  cards.forEach(card => {
    card.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        const btn = card.querySelector('.svcCard-more');
        if (btn) btn.click();
      }
    });
  });

  // click outside to close
  document.addEventListener('click', (e) => {
    if (e.target.closest('.svcCard')) return;
    panels.forEach(p => {
      if (p.classList.contains('open')) {
        const ctrl = document.querySelector(`[aria-controls="${p.id}"]`);
        if (ctrl) closePanel(ctrl, p);
      }
    });
  });

  // Esc to close all
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      panels.forEach(p => {
        if (p.classList.contains('open')) {
          const ctrl = document.querySelector(`[aria-controls="${p.id}"]`);
          if (ctrl) closePanel(ctrl, p);
        }
      });
    }
  });

  /* 4) Animated counters — start when visible */
  const counters = selectAll('.svcStat-number');
  if ('IntersectionObserver' in window && counters.length) {
    const counterIo = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });

    counters.forEach(c => counterIo.observe(c));
  } else {
    counters.forEach(c => animateCounter(c));
  }

  function animateCounter(el) {
    if (el.__animStarted) return;
    el.__animStarted = true;
    const targetRaw = el.getAttribute('data-target') || el.textContent.trim();
    const target = parseFloat(targetRaw.replace(/[^0-9.]/g, '')) || 0;
    const duration = 1300;
    const start = performance.now();

    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = easeOutCubic(t);
      const current = target * eased;
      const decimals = (targetRaw.indexOf('.') >= 0) ? 2 : (target > 999 ? 0 : 0);
      el.textContent = formatNumber(current, decimals, targetRaw);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = postFormat(targetRaw);
    }
    requestAnimationFrame(step);
  }

  function formatNumber(val, decimals, original) {
    const rounded = (decimals === 0) ? Math.round(val) : val.toFixed(decimals);
    if ((original + '').includes(',')) return Number(rounded).toLocaleString();
    if (!original.includes('.') && Number(original) >= 1000) return Math.round(Number(rounded)).toLocaleString();
    return rounded;
  }

  function postFormat(original) {
    if ((original + '').indexOf('.') >= 0) return original;
    if (Number(original) >= 1000) return Number(original).toLocaleString();
    return original;
  }

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

})();



(function () {
  const carousel = document.querySelector('.tbCarousel');
  if (!carousel) return;

  const slides = Array.from(carousel.querySelectorAll('.tbSlide'));
  const prevBtn = carousel.querySelector('.tbPrevBtn');
  const nextBtn = carousel.querySelector('.tbNextBtn');
  const dots = Array.from(carousel.querySelectorAll('.tbDot'));
  const autoplay = carousel.getAttribute('data-autoplay') === 'true';
  const interval = parseInt(carousel.getAttribute('data-interval'), 10) || 5000;

  let current = 0;
  let timer = null;
  let isPaused = false;

  // initialize accessibility attributes & ids
  slides.forEach((s, i) => {
    s.setAttribute('data-index', i);
    s.setAttribute('id', 'slide-' + i);
    s.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
  });

  // helper: show slide
  function show(index, opts = {}) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    current = index;

    slides.forEach((s, i) => {
      s.setAttribute('aria-hidden', i === current ? 'false' : 'true');
      // for focus management: move tabindex of contents
      s.tabIndex = i === current ? 0 : -1;
    });

    dots.forEach((d, i) => {
      if (i === current) {
        d.classList.add('is-active');
        d.setAttribute('aria-selected', 'true');
        d.tabIndex = 0;
      } else {
        d.classList.remove('is-active');
        d.setAttribute('aria-selected', 'false');
        d.tabIndex = -1;
      }
    });

    // announce change for screen readers (optional live region creation)
    if (!opts.silent) {
      announceSlide(current);
    }
  }

  // announce slide change via ARIA live region
  function announceSlide(index) {
    let region = carousel.querySelector('.tbLiveRegion');
    if (!region) {
      region = document.createElement('div');
      region.className = 'tbLiveRegion';
      region.setAttribute('aria-live', 'polite');
      region.style.position = 'absolute';
      region.style.left = '-9999px';
      carousel.appendChild(region);
    }
    const name = slides[index].querySelector('.tbName')?.textContent || ('Testimonial ' + (index + 1));
    region.textContent = 'Showing testimonial by ' + name;
  }

  // navigation handlers
  function prev() { show(current - 1); }
  function next() { show(current + 1); }

  prevBtn && prevBtn.addEventListener('click', () => { prev(); resetTimer(); });
  nextBtn && nextBtn.addEventListener('click', () => { next(); resetTimer(); });

  dots.forEach((dot) => {
    dot.addEventListener('click', (e) => {
      const idx = parseInt(dot.getAttribute('data-target'), 10);
      show(idx);
      resetTimer();
    });
    dot.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        dot.click();
      }
    });
  });

  // autoplay timer
  function startTimer() {
    if (!autoplay) return;
    stopTimer();
    timer = setInterval(() => {
      if (!isPaused) next();
    }, interval);
  }
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
  function resetTimer() { stopTimer(); startTimer(); }

  // pause on hover/focus
  carousel.addEventListener('mouseenter', () => { isPaused = true; });
  carousel.addEventListener('mouseleave', () => { isPaused = false; });
  carousel.addEventListener('focusin', () => { isPaused = true; });
  carousel.addEventListener('focusout', () => { isPaused = false; });

  // keyboard left/right navigation
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { prev(); resetTimer(); }
    if (e.key === 'ArrowRight') { next(); resetTimer(); }
  });

  // touch support (swipe)
  let touchStartX = 0;
  let touchEndX = 0;
  carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, {passive: true});
  carousel.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const dx = touchEndX - touchStartX;
    if (Math.abs(dx) > 40) {
      if (dx < 0) { next(); } else { prev(); }
      resetTimer();
    }
  });

  // initialize
  show(0, { silent: true });
  startTimer();

  // expose for debugging (optional)
  carousel._tb = { show, next, prev, startTimer, stopTimer };

})();



(function () {
  const items = document.querySelectorAll('.faqItem');

  items.forEach(item => {
    const button = item.querySelector('.faqQuestion');
    const answer = item.querySelector('.faqAnswer');

    button.addEventListener('click', () => toggleFAQ(button, answer));
    button.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleFAQ(button, answer);
      }
    });
  });

  function toggleFAQ(btn, panel) {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';

    if (isOpen) {
      // Close
      const fullHeight = panel.scrollHeight;
      panel.style.height = fullHeight + 'px';
      requestAnimationFrame(() => {
        panel.style.height = '0px';
      });
      panel.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');
    } else {
      // Open
      panel.classList.add('open');
      panel.style.height = 'auto';
      const fullHeight = panel.scrollHeight;
      panel.style.height = '0px';
      requestAnimationFrame(() => {
        panel.style.height = fullHeight + 'px';
      });
      btn.setAttribute('aria-expanded', 'true');
      panel.setAttribute('aria-hidden', 'false');
    }

    // After animation ends, remove fixed height
    panel.addEventListener('transitionend', function end() {
      if (btn.getAttribute('aria-expanded') === 'true') {
        panel.style.height = 'auto';
      }
      panel.removeEventListener('transitionend', end);
    });
  }
})();


