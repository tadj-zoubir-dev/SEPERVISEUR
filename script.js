(() => {
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');

  navToggle?.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });

  document.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => nav.classList.remove('is-open'));
  });

  // Back to top button
  const toTop = document.getElementById('toTop');
  const onScroll = () => {
    toTop.classList.toggle('is-visible', window.scrollY > 500);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Count-up stats
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // Scroll reveal + triggers for skill bars / stats
  const revealEls = document.querySelectorAll('[data-reveal]');
  const skillFills = document.querySelectorAll('.skill__fill');
  const statNums = document.querySelectorAll('.stat__num');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  revealEls.forEach(el => io.observe(el));

  const skillIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      skillIO.unobserve(entry.target);
    });
  }, { threshold: 0.4 });
  skillFills.forEach(el => skillIO.observe(el));

  const statIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCount(entry.target);
      statIO.unobserve(entry.target);
    });
  }, { threshold: 0.5 });
  statNums.forEach(el => statIO.observe(el));

  // Contact form (client-side only — no backend wired up)
  const contactForm = document.getElementById('contactForm');
  const contactStatus = document.getElementById('contactStatus');

  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const required = contactForm.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      if (!field.value.trim()) valid = false;
    });

    if (!valid) {
      contactStatus.textContent = 'Please fill in your name, email, and message.';
      contactStatus.classList.add('is-error');
      return;
    }

    contactStatus.classList.remove('is-error');
    contactStatus.textContent = "Thanks! Your message has been received — we'll be in touch soon.";
    contactForm.reset();
  });

  // FAQ accordion (contact page)
  document.querySelectorAll('.faq-item__q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-item__a');
      const isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.faq-item.is-open').forEach(open => {
        if (open !== item) {
          open.classList.remove('is-open');
          open.querySelector('.faq-item__a').style.maxHeight = null;
        }
      });
      item.classList.toggle('is-open', !isOpen);
      answer.style.maxHeight = !isOpen ? answer.scrollHeight + 'px' : null;
    });
  });
  // set initial open state height (the FAQ item marked is-open by default)
  document.querySelectorAll('.faq-item.is-open .faq-item__a').forEach(a => {
    a.style.maxHeight = a.scrollHeight + 'px';
  });

  // Newsletter form (contact page + footer)
  document.querySelectorAll('.newsletter__form, .footer__newsletter form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const status = form.parentElement.querySelector('#newsletterStatus');
      if (!input.value.trim() || !input.checkValidity()) {
        if (status) { status.textContent = 'Please enter a valid email address.'; status.classList.add('is-error'); }
        return;
      }
      if (status) { status.textContent = "Thanks for subscribing!"; status.classList.remove('is-error'); }
      form.reset();
    });
  });

  // Load More buttons (services / projects pages) — stub for now
  document.querySelectorAll('#loadMoreServices, #loadMoreWork').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.textContent = 'No more results';
      btn.disabled = true;
      btn.style.opacity = '0.6';
      btn.style.cursor = 'default';
    });
  });

  // Language switch (EN default / AR translation)
  (() => {
    const STORAGE_KEY = 'novaLang';
    const switchEl = document.getElementById('langSwitch');
    const originals = new Map(); // element -> original english text/attr value
    const currentPage = location.pathname.split('/').pop() || 'index.html';

    const collectOriginals = () => {
      document.querySelectorAll('[data-i18n]').forEach(el => {
        if (!originals.has(el)) originals.set(el, el.textContent);
      });
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        if (!originals.has(el)) originals.set(el, el.getAttribute('placeholder'));
      });
      document.querySelectorAll('[data-i18n-aria]').forEach(el => {
        if (!originals.has(el)) originals.set(el, el.getAttribute('aria-label'));
      });
    };

    const applyLang = (lang) => {
      const isAr = lang === 'ar';
      document.documentElement.setAttribute('lang', isAr ? 'ar' : 'en');
      document.documentElement.setAttribute('dir', isAr ? 'rtl' : 'ltr');

      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = isAr ? (I18N_AR[key] || originals.get(el)) : originals.get(el);
      });
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.setAttribute('placeholder', isAr ? (I18N_AR[key] || originals.get(el)) : originals.get(el));
      });
      document.querySelectorAll('[data-i18n-aria]').forEach(el => {
        const key = el.getAttribute('data-i18n-aria');
        el.setAttribute('aria-label', isAr ? (I18N_AR[key] || originals.get(el)) : originals.get(el));
      });

      const titleKey = (typeof I18N_PAGE_TITLE_KEY !== 'undefined') ? I18N_PAGE_TITLE_KEY[currentPage] : null;
      if (titleKey) {
        if (isAr) {
          if (!document.title.__enOriginal) document.title.__enOriginal = document.title;
          document.title = I18N_AR[titleKey] || document.title;
        } else if (originals.get('__title__')) {
          document.title = originals.get('__title__');
        }
      }

      if (switchEl) {
        switchEl.querySelectorAll('.lang-switch__btn').forEach(btn => {
          btn.classList.toggle('is-active', btn.dataset.lang === lang);
        });
      }
      try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    };

    collectOriginals();
    originals.set('__title__', document.title);

    if (switchEl) {
      switchEl.querySelectorAll('.lang-switch__btn').forEach(btn => {
        btn.addEventListener('click', () => applyLang(btn.dataset.lang));
      });
    }

    let saved = 'en';
    try { saved = localStorage.getItem(STORAGE_KEY) || 'en'; } catch (e) {}
    if (saved === 'ar') applyLang('ar');
  })();

  // Horizontal media showcase — a reusable "row" component used for
  // the Reels teaser on the homepage, and the Reels + Designs rows
  // on the Works page. Each call to initShowcase() is one independent
  // row: its own items, media type, direction and speed.
  (() => {
    const initShowcase = ({
      trackId,        // id of the empty <div> that will hold the strip
      items,          // array of file paths (videos or images) — same array can feed multiple rows
      mediaType,       // 'video' | 'image'
      direction = 1,   // 1 = right→left,  -1 = left→right
      duration = 35,   // seconds for ONE full loop of the item set — lower = faster
      resumeDelay = 1200 // ms of idle time after a drag/swipe before auto-scroll resumes
    }) => {
      const track = document.getElementById(trackId);
      if (!track || !items || !items.length) return;

      const itemClass = 'showcase-item ' + (mediaType === 'video' ? 'showcase-item--reel' : 'showcase-item--design');

      const buildSet = () => items.map((src, i) => {
        const item = document.createElement('div');
        item.className = itemClass;
        if (mediaType === 'video') {
          item.setAttribute('aria-label', `Reel video ${i + 1}`);
          item.setAttribute('role', 'img');
          const video = document.createElement('video');
          video.src = src;
          video.muted = true;
          video.loop = true;
          video.playsInline = true;
          video.setAttribute('playsinline', '');
          video.preload = 'none';
          video.tabIndex = -1;
          item.appendChild(video);
        } else {
          const img = document.createElement('img');
          img.src = src;
          img.loading = 'lazy';
          img.decoding = 'async';
          img.alt = `Design work sample ${i + 1}`;
          item.appendChild(img);
        }
        return item;
      });

      // Duplicate the set once (internally only — no extra files needed)
      // so the strip can wrap from the last item back to the first with
      // no visible jump.
      buildSet().forEach(el => track.appendChild(el));
      buildSet().forEach(el => track.appendChild(el));

      const els = Array.from(track.children);

      // Videos: only decode/play the ones near/within the visible area,
      // so off-screen rows and off-screen items don't burn CPU/GPU.
      if (mediaType === 'video') {
        const playIO = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            const video = entry.target.querySelector('video');
            if (!video) return;
            if (entry.isIntersecting) {
              if (video.preload === 'none') video.preload = 'auto';
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          });
        }, { root: null, rootMargin: '0px 250px', threshold: 0.15 });
        els.forEach(el => playIO.observe(el));
      }

      let position = 0;
      let dragging = false;
      let paused = false;
      let startX = 0;
      let startPosition = 0;
      let resumeTimer = null;
      let lastTime = null;

      // Half the track's width = the width of ONE (non-duplicated) set —
      // that's the distance one full loop travels.
      const halfWidth = () => track.scrollWidth / 2;
      const wrap = (val) => {
        const half = halfWidth();
        if (half <= 0) return 0;
        let v = val % half;
        if (v < 0) v += half;
        return v;
      };

      // translate3d keeps this on the GPU compositor instead of
      // triggering layout/paint on every frame.
      const render = () => { track.style.transform = `translate3d(${-position}px,0,0)`; };

      const tick = (time) => {
        if (lastTime === null) lastTime = time;
        const dt = time - lastTime;
        lastTime = time;
        if (!dragging && !paused) {
          const half = halfWidth();
          if (half > 0 && duration > 0) {
            const pxPerMs = half / (duration * 1000);
            position = wrap(position + pxPerMs * dt * direction);
            render();
          }
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);

      const onPointerDown = (e) => {
        dragging = true;
        paused = true;
        clearTimeout(resumeTimer);
        startX = e.clientX;
        startPosition = position;
        track.classList.add('is-dragging');
        track.setPointerCapture?.(e.pointerId);
      };
      const onPointerMove = (e) => {
        if (!dragging) return;
        const delta = e.clientX - startX;
        // Once horizontal intent is clear, take over from native scroll
        // (touch-action: pan-y on the track still lets vertical page
        // scroll pass through until this fires).
        if (Math.abs(delta) > 4) e.preventDefault();
        position = wrap(startPosition - delta);
        render();
      };
      const endDrag = () => {
        if (!dragging) return;
        dragging = false;
        track.classList.remove('is-dragging');
        clearTimeout(resumeTimer);
        // Resume with this row's own original automatic direction —
        // "direction" never changes, only "paused" does.
        resumeTimer = setTimeout(() => { paused = false; }, resumeDelay);
      };

      track.addEventListener('pointerdown', onPointerDown);
      track.addEventListener('pointermove', onPointerMove, { passive: false });
      track.addEventListener('pointerup', endDrag);
      track.addEventListener('pointercancel', endDrag);
      track.addEventListener('pointerleave', endDrag);
      track.addEventListener('dragstart', (e) => e.preventDefault());
    };

    // ---- EDIT THESE LISTS to add/remove media ----
    // Reel videos live in a "videos" folder next to index.html.
    // The SAME list feeds every Reels row — no duplicate files needed.
    const reels = [
      'videos/reel-1.mp4',
      'videos/reel-2.mp4',
      'videos/reel-3.mp4',
      'videos/reel-4.mp4',
      'videos/reel-5.mp4',
      'videos/reel-6.mp4',
      'videos/reel-7.mp4',
      'videos/reel-8.mp4',
      'videos/reel-9.mp4',
      'videos/reel-10.mp4',
      'videos/reel-11.mp4',
      'videos/reel-12.mp4',
      'videos/reel-13.mp4',
      'videos/reel-14.mp4'

    ];

    // Design images live in a "designs" folder next to index.html.
    // The SAME list feeds every Designs row — no duplicate files needed.
    const designs = [
      'designs/ChatGPT Image Aug 7, 2026, 10_36_55 PM.png',
      'designs/ChatGPT Image Aug 7, 2026, 10_38_50 PM.png',
      'designs/ChatGPT Image Aug 9, 2026, 03_47_35 PM.png',
      'designs/ChatGPT Image Aug 9, 2026, 03_52_07 PM.png',
      'designs/ChatGPT Image Aug 11, 2026, 04_41_25 PM.png',
      'designs/mockup_chocolat_A4_300dpi.jpg',
      'designs/ChatGPT Image Aug 8, 2026, 10_30_46 AM.png',
      'designs/ChatGPT Image Aug 8, 2026, 10_32_07 AM.png',
      'designs/ChatGPT Image Aug 8, 2026, 10_59_33 AM.png',
      'designs/ChatGPT Image Aug 8, 2026, 11_46_14 AM.png',
      'designs/ChatGPT Image Aug 8, 2026, 11_55_47 AM.png',
      'designs/ChatGPT Image Aug 8, 2026, 04_36_13 PM.png',
      'designs/ChatGPT Image Aug 7, 2026, 11_21_59 PM.png'
    ];

    // ---- Central speed/direction config ----
    // direction: 1 = right → left, -1 = left → right
    // duration: seconds for one full loop — lower number = faster row
    // Keys are named by their VISUAL position on the Works page
    // (row1 = first row on the page, and so on).
    const ROW_CONFIG = {
      homeTeaser: { direction: 1,  duration: 32 },
      row1:       { direction: 1,  duration: 35 }, // videos — right → left
      row2:       { direction: -1, duration: 38 }, // designs — left → right
      row3:       { direction: 1,  duration: 35 }, // videos — right → left
      row4:       { direction: -1, duration: 38 }  // designs — left → right
    };

    // Homepage "Our Work" teaser strip
    initShowcase({ trackId: 'reelTrack', items: reels, mediaType: 'video', ...ROW_CONFIG.homeTeaser });

    // Works page — 4 rows, in visual order: video, design, video, design
    initShowcase({ trackId: 'reelsTrackRow1',   items: reels,   mediaType: 'video', ...ROW_CONFIG.row1 });
    initShowcase({ trackId: 'designsTrackRow1', items: designs, mediaType: 'image', ...ROW_CONFIG.row2 });
    initShowcase({ trackId: 'reelsTrackRow2',   items: reels,   mediaType: 'video', ...ROW_CONFIG.row3 });
    initShowcase({ trackId: 'designsTrackRow2', items: designs, mediaType: 'image', ...ROW_CONFIG.row4 });
  })();

  // Interactive Services list (Services page — accordion-style reveal)
  (() => {
    const container = document.getElementById('servicesInteractive');
    if (!container) return;

    // ---- EDIT THIS LIST to add, remove, or edit services ----
    // "image" points to a file inside the images/services/ folder.
    // If an image is missing, the layout simply stays clean (no broken icon).
    const services = [
      {
        number: '01.',
        icon: '📷',
        title: 'Photography',
        description: 'Professional photography that captures your products, spaces and brand moments with striking clarity.',
        image: 'images/services/01_photography.jpg'
      },
      {
        number: '02.',
        icon: '🎨',
        title: 'Graphic Design',
        description: 'Creative visual designs for brands, social media, advertising and business communication.',
        image: 'images/services/02_graphic_design.png'
      },
      {
        number: '03.',
        icon: '📱',
        title: 'Social Media',
        description: 'Creative social media visuals and short-form content designed to attract attention and increase engagement.',
        image: 'images/services/03_social_media.jpg'
      },
      {
        number: '04.',
        icon: '🎥',
        title: 'Videography',
        description: 'Professional video production and filming that brings your brand story to life on screen.',
        image: 'images/services/04_videography.jpg'
      },
      {
        number: '05.',
        icon: '🖨️',
        title: 'Printing',
        description: 'High-quality printed materials, from business cards to large-format displays, produced with precision.',
        image: 'images/services/05_printing.png'
      },
      {
        number: '06.',
        icon: '✨',
        title: 'Branding',
        description: 'Distinctive brand identities, logos and visual systems that make your business memorable.',
        image: 'images/services/06_branding.jpg'
      }
    ];

    services.forEach((service) => {
      const row = document.createElement('article');
      row.className = 'service-row';

      const visual = document.createElement('div');
      visual.className = 'service-row__visual';

      const num = document.createElement('span');
      num.className = 'service-row__num';
      num.textContent = service.number;

      const imgWrap = document.createElement('div');
      imgWrap.className = 'service-row__img';
      const img = document.createElement('img');
      img.src = service.image;
      img.alt = service.title;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.onerror = () => { imgWrap.style.display = 'none'; };
      imgWrap.appendChild(img);

      visual.appendChild(num);
      visual.appendChild(imgWrap);

      const body = document.createElement('div');
      body.className = 'service-row__body';

      const titleRow = document.createElement('div');
      titleRow.className = 'service-row__title-row';
      titleRow.innerHTML = `
        <span class="service-row__icon">${service.icon}</span>
        <h3 class="service-row__title">${service.title}</h3>
      `;

      const desc = document.createElement('p');
      desc.className = 'service-row__desc';
      desc.textContent = service.description;

      body.appendChild(titleRow);
      body.appendChild(desc);

      row.appendChild(visual);
      row.appendChild(body);
      container.appendChild(row);
    });

    const rows = Array.from(container.querySelectorAll('.service-row'));
    const setActive = (row) => {
      rows.forEach(r => r.classList.toggle('is-active', r === row));
    };

    const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    rows.forEach((row) => {
      if (hasHover) {
        row.addEventListener('mouseenter', () => setActive(row));
        row.addEventListener('mouseleave', () => setActive(null));
        row.addEventListener('focus', () => setActive(row));
        row.addEventListener('blur', () => setActive(null));
      } else {
        row.addEventListener('click', () => {
          setActive(row.classList.contains('is-active') ? null : row);
        });
      }
    });
  })();

  // Active nav link on scroll
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav__link');
  const navIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach(link => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
      });
    });
  }, { threshold: 0.5 });
  sections.forEach(sec => navIO.observe(sec));
})();
