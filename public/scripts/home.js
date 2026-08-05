/* ============================================================
   SENAVIA — Home page interactions
   - Smooth carousels: pointer-drag, momentum, draggable scrollbar, dots
   - IntersectionObserver scroll reveals
   - Video autoplay booster
   - Seamless marquee duplication
   ============================================================ */

(function () {
  'use strict';

  var REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Injected controls need labels in the page's language, not hardcoded English.
     The switch is client-side (BaseLayout toggles <html lang> and fires
     `languagechange`), so this is read at render time, never captured at load. */
  function T() {
    var es = (document.documentElement.lang || 'en').toLowerCase().indexOf('es') === 0;
    return es
      ? { position: 'Posición del carrusel', goTo: function (n) { return 'Ir a la tarjeta ' + n; } }
      : { position: 'Carousel position',     goTo: function (n) { return 'Go to slide ' + n; } };
  }

  /* ------------------------------------------------------------
     1. Carousel — refined for fluid feel
     ------------------------------------------------------------ */
  function initCarousel(root) {
    var viewport = root.querySelector('.carousel-viewport');
    var track = root.querySelector('.carousel-track');
    var prev = root.querySelector('.carousel-arrow.prev');
    var next = root.querySelector('.carousel-arrow.next');
    var bar = root.querySelector('.carousel-scrollbar');
    var thumb = bar && bar.querySelector('.carousel-scrollbar-thumb');
    if (!track) return;

    /* Build page dots — one per "page" (visible width) */
    var dotsWrap = document.createElement('div');
    dotsWrap.className = 'carousel-dots';
    // ponytail: group, not tablist — there are no tabpanels to point at, so
    // tablist/tab/aria-selected was lying to screen readers.
    dotsWrap.setAttribute('role', 'group');
    (bar ? bar.parentNode.insertBefore(dotsWrap, bar.nextSibling) : root.appendChild(dotsWrap));

    function pageCount() {
      // Each "page" is one card width + gap (scrollable distance per page)
      var first = track.firstElementChild;
      if (!first) return 1;
      var card = first.getBoundingClientRect().width;
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 0);
      var step = card + gap;
      var max = track.scrollWidth - track.clientWidth;
      return Math.max(1, Math.round(max / step) + 1);
    }
    function activePage() {
      var first = track.firstElementChild;
      if (!first) return 0;
      var card = first.getBoundingClientRect().width;
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 0);
      var step = card + gap;
      var max = track.scrollWidth - track.clientWidth;
      if (track.scrollLeft >= max - 1) return pageCount() - 1;
      return Math.round(track.scrollLeft / step);
    }
    function renderDots() {
      var n = pageCount();
      // Cap dots at 8 — beyond that, dots become noise (the scrollbar takes
      // over as the sole mobile indicator via .has-many-pages)
      root.classList.toggle('has-many-pages', n > 8);
      if (n > 8) { dotsWrap.style.display = 'none'; return; }
      dotsWrap.style.display = '';
      if (dotsWrap.children.length !== n) {
        dotsWrap.innerHTML = '';
        for (var i = 0; i < n; i++) {
          var d = document.createElement('button');
          d.type = 'button';
          d.className = 'carousel-dot';
          d.dataset.page = i;
          dotsWrap.appendChild(d);
        }
      }
      var current = activePage();
      var t = T();
      dotsWrap.setAttribute('aria-label', t.position);
      [].forEach.call(dotsWrap.children, function (d, i) {
        d.classList.toggle('is-active', i === current);
        d.setAttribute('aria-label', t.goTo(i + 1));
        if (i === current) d.setAttribute('aria-current', 'true');
        else d.removeAttribute('aria-current');
      });
    }

    function step() {
      var first = track.firstElementChild;
      if (!first) return track.clientWidth * 0.7;
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 0);
      return first.getBoundingClientRect().width + gap;
    }

    function update() {
      var max = Math.max(0, track.scrollWidth - track.clientWidth);
      var atStart = track.scrollLeft <= 1;
      var atEnd   = track.scrollLeft >= max - 1;
      if (prev) prev.toggleAttribute('disabled', atStart);
      if (next) next.toggleAttribute('disabled', atEnd);
      root.classList.toggle('has-prev', !atStart);
      root.classList.toggle('has-next', !atEnd);
      if (thumb && bar) {
        var visibleRatio = track.clientWidth / track.scrollWidth;
        var thumbWidth = Math.max(0.18, Math.min(1, visibleRatio));
        var leftPct = max > 0 ? (track.scrollLeft / max) * (100 - thumbWidth * 100) : 0;
        thumb.style.width = (thumbWidth * 100).toFixed(2) + '%';
        thumb.style.left = leftPct.toFixed(2) + '%';
      }
      renderDots();
    }

    function scrollToX(x) {
      var max = Math.max(0, track.scrollWidth - track.clientWidth);
      track.scrollTo({ left: Math.max(0, Math.min(max, x)), behavior: REDUCE ? 'auto' : 'smooth' });
    }

    /* Move one card. If the leftover after this move would be a sliver, absorb
       it — otherwise the last click travels ~16px and reads as a dead button. */
    function nudge(dir) {
      var s = step();
      var max = Math.max(0, track.scrollWidth - track.clientWidth);
      var target = track.scrollLeft + dir * s;
      if (dir > 0 && max - target < s * 0.25) target = max;
      if (dir < 0 && target < s * 0.25) target = 0;
      scrollToX(target);
    }

    /* Arrow controls — animate to next page (one card step) */
    if (prev) prev.addEventListener('click', function () { nudge(-1); });
    if (next) next.addEventListener('click', function () { nudge(1); });

    /* Dot clicks — jump to that page */
    dotsWrap.addEventListener('click', function (e) {
      var dot = e.target.closest('.carousel-dot');
      if (!dot) return;
      var i = parseInt(dot.dataset.page, 10);
      var first = track.firstElementChild;
      if (!first) return;
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 0);
      var stepWidth = first.getBoundingClientRect().width + gap;
      scrollToX(i * stepWidth);
    });

    /* Keyboard nav when track is focused */
    track.tabIndex = 0;
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); nudge(1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); nudge(-1); }
      if (e.key === 'Home')       { e.preventDefault(); scrollToX(0); }
      if (e.key === 'End')        { e.preventDefault(); scrollToX(track.scrollWidth); }
    });

    /* --- Pointer-based drag with momentum --- */
    var pointer = {
      active: false,
      pointerId: null,
      startX: 0,
      startScroll: 0,
      lastX: 0,
      lastT: 0,
      velocity: 0,
      hasMoved: false
    };
    var DRAG_THRESHOLD = 4; // px before we treat as a drag (so taps still register)
    var rafId = null;

    function onDown(e) {
      // ponytail: mouse only. On touch the browser already pans natively AND
      // fires pointer events, so writing scrollLeft here ran on top of the
      // native pan — measured 1.6-2.1x movement per finger travel, sometimes
      // inverted. Native touch scrolling has better inertia than this RAF anyway.
      if (e.pointerType !== 'mouse') return;
      // Don't hijack if user clicks the scrollbar or arrows
      if (e.target.closest('.carousel-arrow, .carousel-scrollbar, .carousel-dot')) return;
      // Only the primary button
      if (e.button !== 0) return;
      pointer.active = true;
      pointer.pointerId = e.pointerId;
      pointer.startX = e.clientX;
      pointer.startScroll = track.scrollLeft;
      pointer.lastX = e.clientX;
      pointer.lastT = performance.now();
      pointer.velocity = 0;
      pointer.hasMoved = false;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    }
    function onMove(e) {
      if (!pointer.active || e.pointerId !== pointer.pointerId) return;
      var dx = e.clientX - pointer.startX;
      if (!pointer.hasMoved && Math.abs(dx) > DRAG_THRESHOLD) {
        pointer.hasMoved = true;
        track.classList.add('is-dragging');
        // Now capture the pointer so we don't lose it on fast moves
        try { track.setPointerCapture(e.pointerId); } catch (err) {}
      }
      if (!pointer.hasMoved) return;
      e.preventDefault();
      track.scrollLeft = pointer.startScroll - dx;
      // Track velocity for momentum (pixels per ms)
      var now = performance.now();
      var dt = now - pointer.lastT;
      if (dt > 0) pointer.velocity = (e.clientX - pointer.lastX) / dt;
      pointer.lastX = e.clientX;
      pointer.lastT = now;
    }
    function onUp(e) {
      if (!pointer.active || (e.pointerId !== pointer.pointerId && e.type !== 'pointercancel')) return;
      pointer.active = false;
      try { track.releasePointerCapture(pointer.pointerId); } catch (err) {}

      // a tap, no fling, or reduced motion — settle now and let snap take over
      var velocity = pointer.velocity * 1000; // px/sec — scale up
      if (!pointer.hasMoved || REDUCE || Math.abs(velocity) < 50) {
        track.classList.remove('is-dragging');
        return;
      }

      // Momentum: keep scrolling with decay. `is-dragging` (which disables
      // scroll-snap) stays on until the RAF finishes — removing it here let the
      // browser try to snap while this loop was still writing scrollLeft every
      // frame, which is what made it jump on release.
      var decay = 0.94;
      var lastTime = performance.now();
      function frame(t) {
        var dt = (t - lastTime) / 1000;
        lastTime = t;
        var delta = -velocity * dt;
        track.scrollLeft += delta;
        velocity *= Math.pow(decay, dt * 60);
        if (Math.abs(velocity) > 20) {
          rafId = requestAnimationFrame(frame);
        } else {
          rafId = null;
          track.classList.remove('is-dragging'); // snap settles once, at the end
        }
      }
      rafId = requestAnimationFrame(frame);
    }

    track.addEventListener('pointerdown', onDown);
    track.addEventListener('pointermove', onMove);
    track.addEventListener('pointerup', onUp);
    track.addEventListener('pointercancel', onUp);
    track.addEventListener('pointerleave', function (e) { if (pointer.active) onUp(e); });

    /* Prevent click on cards immediately after a drag */
    track.addEventListener('click', function (e) {
      if (pointer.hasMoved) {
        e.preventDefault();
        e.stopPropagation();
        pointer.hasMoved = false;
      }
    }, true);

    /* --- Draggable scrollbar thumb --- */
    if (bar && thumb) {
      var barDrag = { active: false, startX: 0, startScroll: 0 };
      bar.addEventListener('pointerdown', function (e) {
        var rect = bar.getBoundingClientRect();
        var max = track.scrollWidth - track.clientWidth;
        var thumbRect = thumb.getBoundingClientRect();
        var clickedThumb = e.target === thumb;
        if (!clickedThumb) {
          // Clicking the rail jumps to that position
          var pct = (e.clientX - rect.left - thumbRect.width / 2) / (rect.width - thumbRect.width);
          pct = Math.max(0, Math.min(1, pct));
          scrollToX(pct * max);
          return;
        }
        barDrag.active = true;
        barDrag.startX = e.clientX;
        barDrag.startScroll = track.scrollLeft;
        bar.classList.add('is-dragging');
        try { bar.setPointerCapture(e.pointerId); } catch (err) {}
      });
      bar.addEventListener('pointermove', function (e) {
        if (!barDrag.active) return;
        e.preventDefault();
        var rect = bar.getBoundingClientRect();
        var thumbRect = thumb.getBoundingClientRect();
        var max = track.scrollWidth - track.clientWidth;
        var scale = max / (rect.width - thumbRect.width);
        track.scrollLeft = barDrag.startScroll + (e.clientX - barDrag.startX) * scale;
      });
      function endBarDrag(e) {
        if (!barDrag.active) return;
        barDrag.active = false;
        bar.classList.remove('is-dragging');
        try { bar.releasePointerCapture(e.pointerId); } catch (err) {}
      }
      bar.addEventListener('pointerup', endBarDrag);
      bar.addEventListener('pointercancel', endBarDrag);
    }

    /* --- Mouse wheel: convert vertical to horizontal when hovering --- */
    track.addEventListener('wheel', function (e) {
      // Only intercept if user is scrolling vertically (deltaY) more than horizontally
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        var max = track.scrollWidth - track.clientWidth;
        var atStart = track.scrollLeft <= 1 && e.deltaY < 0;
        var atEnd   = track.scrollLeft >= max - 1 && e.deltaY > 0;
        // Let the page take over at the edges
        if (atStart || atEnd) return;
        e.preventDefault();
        track.scrollLeft += e.deltaY;
      }
    }, { passive: false });

    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    window.addEventListener('languagechange', update); // relabel the dots on EN/ES switch
    // Initial render after layout settles
    requestAnimationFrame(update);
    setTimeout(update, 100);
  }

  document.querySelectorAll('.carousel').forEach(initCarousel);

  /* ------------------------------------------------------------
     2. Scroll reveal (IntersectionObserver)
     ------------------------------------------------------------ */
  if ('IntersectionObserver' in window) {
    /* Auto-coverage: house-convention blocks reveal on every page (incl. the
       footer on all of them) without per-template attributes. Elements are
       tagged ONLY when fully below the fold at this moment — hiding them is
       invisible to the user, so there is zero flash / LCP / CLS risk by
       construction. Above-the-fold content simply stays static. Explicit
       data-reveal[-children] attributes always win; nothing inside the hero
       or nav ever auto-animates. */
    var AUTO_SINGLE = '.section-head, .split, .calendly-block, .legal-body .container, .cta .container';
    var AUTO_GROUP = '.grid-3, .reasons-grid, .ideal-grid, .pkg-grid, .faq-list, .portfolio-grid, .footer-top';
    function autoTag(selector, attr) {
      document.querySelectorAll(selector).forEach(function (el) {
        if (el.closest('[data-reveal], [data-reveal-children], .hero, .nav, nav')) return;
        if (el.querySelector('[data-reveal], [data-reveal-children]')) return;
        if (el.getBoundingClientRect().top > window.innerHeight) el.setAttribute(attr, '');
      });
    }
    autoTag(AUTO_SINGLE, 'data-reveal');
    autoTag(AUTO_GROUP, 'data-reveal-children');

    /* Mobile: 15% of a tall stacked card = a lot of thumb-scroll before it
       reveals — trigger earlier so content never arrives late. */
    var revealThreshold = window.matchMedia('(max-width: 640px)').matches ? 0.05 : 0.15;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: revealThreshold, rootMargin: '0px 0px -8% 0px' });

    document.querySelectorAll('[data-reveal], [data-reveal-children]').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        el.classList.add('is-visible');
      } else {
        io.observe(el);
      }
    });

    /* Safety net: nothing ON SCREEN may stay hidden if a reveal stalls.
       Scoped to the viewport on purpose — a blanket reveal here would mark
       every below-fold element visible 3s after load and disable the whole
       scroll-reveal experience for anyone who reads before scrolling. */
    window.addEventListener('load', function () {
      setTimeout(function () {
        document.querySelectorAll('[data-reveal]:not(.is-visible), [data-reveal-children]:not(.is-visible)').forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-visible');
        });
      }, 3000);
    });
  } else {
    document.querySelectorAll('[data-reveal], [data-reveal-children]').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ------------------------------------------------------------
     3. Video autoplay booster + viewport-based play/pause
     ------------------------------------------------------------ */
  function tryPlay(v) {
    if (!v) return;
    if (v.hasAttribute('data-lazy-video') && v.dataset.videoAttached !== 'true') return;
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }
  function tryPlayAll() {
    document.querySelectorAll('video').forEach(tryPlay);
  }

  /* Background-video gating (pairs with the BaseLayout head script that
     detached the <source> elements): on >=768px screens re-attach lazily as
     each video nears the viewport; on phones the poster stays. */
  var videoMQ = window.matchMedia('(min-width: 768px)');
  function attachVideo(v) {
    if (v.dataset.videoAttached === 'true') return;
    var pending = v.querySelectorAll('source[data-src]');
    if (!pending.length) return;
    v.dataset.videoAttached = 'true';
    pending.forEach(function (s) {
      s.setAttribute('src', s.dataset.src);
      s.removeAttribute('data-src');
    });
    v.load();
    tryPlay(v);
  }
  function attachNearViewport() {
    if (!videoMQ.matches) return;
    document.querySelectorAll('video[data-lazy-video]').forEach(function (v) {
      var r = v.getBoundingClientRect();
      if (r.bottom > -600 && r.top < window.innerHeight + 600) attachVideo(v);
    });
  }
  if ('IntersectionObserver' in window) {
    var lazyVidIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && videoMQ.matches) {
          attachVideo(e.target);
          lazyVidIO.unobserve(e.target);
        }
      });
    }, { rootMargin: '600px 0px' });
    document.querySelectorAll('video[data-lazy-video]').forEach(function (v) { lazyVidIO.observe(v); });
  } else {
    attachNearViewport();
  }
  if (videoMQ.addEventListener) videoMQ.addEventListener('change', attachNearViewport);
  // Try to play on every common signal (covers most autoplay-policy gates)
  tryPlayAll();
  window.addEventListener('load', tryPlayAll, { once: true });
  ['click', 'touchstart', 'keydown', 'pointerdown'].forEach(function (ev) {
    window.addEventListener(ev, tryPlayAll, { once: true, passive: true });
  });

  // Per-video IntersectionObserver — keep videos playing when in view, pause
  // them otherwise (saves CPU/battery + bypasses some browser pause heuristics)
  if ('IntersectionObserver' in window) {
    var vidIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          tryPlay(v);
        } else {
          if (!v.paused) v.pause();
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('video').forEach(function (v) { vidIO.observe(v); });
  }

  // Safety net: if a hero video gets paused unexpectedly while visible,
  // re-play it on each scroll tick (cheap idempotent calls).
  var lastScrollPlayCheck = 0;
  window.addEventListener('scroll', function () {
    var now = performance.now();
    if (now - lastScrollPlayCheck < 1000) return;
    lastScrollPlayCheck = now;
    document.querySelectorAll('video').forEach(function (v) {
      var r = v.getBoundingClientRect();
      var visible = r.bottom > 0 && r.top < window.innerHeight;
      if (visible && v.paused && v.readyState >= 2) tryPlay(v);
    });
  }, { passive: true });

  /* ------------------------------------------------------------
     4. Marquee duplication (seamless loop)
     ------------------------------------------------------------ */
  document.querySelectorAll('.marquee-track').forEach(function (track) {
    if (track.dataset.duplicated === 'true') return;
    var children = Array.from(track.children);
    children.forEach(function (c) { track.appendChild(c.cloneNode(true)); });
    track.dataset.duplicated = 'true';
  });

  /* ------------------------------------------------------------
     5. Safety net: force hero text visible (in case animations stall)
     ------------------------------------------------------------ */
  setTimeout(function () {
    document.querySelectorAll('.hero-inner > *').forEach(function (el) {
      // If the entry animation never delivered opacity:1, force it.
      // A running CSS animation beats inline opacity, so kill the animation
      // first and then set the inline final-state styles.
      if (getComputedStyle(el).opacity === '0') {
        el.style.animation = 'none';
        el.style.opacity = '1';
        el.style.transform = 'none';
      }
    });
  }, 2000);

})();
