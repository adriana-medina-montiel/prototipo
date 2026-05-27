(function () {
  const STORAGE_KEY = 'softura-lang';
  const DEFAULT_LANG = 'es';
  const CONTACT_EMAIL = 'contacto@softura.com.mx';

  function getLang() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'en' || saved === 'es' ? saved : DEFAULT_LANG;
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    applyTranslations(lang);
    updateLangToggle(lang);
  }

  function applyTranslations(lang) {
    const dict = window.SofturaI18n && window.SofturaI18n[lang];
    if (!dict) return;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const text = dict[key];
      if (text === undefined) return;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = text;
      } else if (el.hasAttribute('data-i18n-html')) {
        el.innerHTML = text;
      } else {
        el.textContent = text;
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      const text = dict[key];
      if (text !== undefined) el.placeholder = text;
    });
  }

  function updateLangToggle(lang) {
    document.querySelectorAll('.lang-option[data-lang]').forEach((btn) => {
      const isActive = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
    const dict = window.SofturaI18n && window.SofturaI18n[lang];
    if (dict && dict['nav.lang']) {
      document.querySelectorAll('.lang-switch').forEach((el) => {
        el.setAttribute('aria-label', dict['nav.lang']);
      });
    }
  }

  function initLanguage() {
    const lang = getLang();
    setLang(lang);

    document.querySelectorAll('.lang-option[data-lang]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        setLang(btn.getAttribute('data-lang'));
      });
    });
  }

  function initCursor() {
    const cur = document.getElementById('cur');
    const curR = document.getElementById('cur-r');
    if (!cur || !curR) return;

    let mx = 0;
    let my = 0;
    let rx = 0;
    let ry = 0;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      cur.style.left = mx - 5 + 'px';
      cur.style.top = my - 5 + 'px';
    });

    (function animRing() {
      rx += (mx - rx - 18) * 0.12;
      ry += (my - ry - 18) * 0.12;
      curR.style.left = rx + 'px';
      curR.style.top = ry + 'px';
      requestAnimationFrame(animRing);
    })();

    document.querySelectorAll('a, button, .svc, .stack-tag, .value-card, .p-card, .cn-pillar, .cn-quote, .cn-tabs button, .cn-btn-primary, .cn-btn-outline, .cn-logos img, .cn-scroll-hint, .cn-diff-points li').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cur.style.transform = 'scale(2.5)';
        curR.style.transform = 'scale(1.4)';
        curR.style.borderColor = 'rgba(26,79,255,.6)';
      });
      el.addEventListener('mouseleave', () => {
        cur.style.transform = 'scale(1)';
        curR.style.transform = 'scale(1)';
        curR.style.borderColor = 'rgba(26,79,255,.35)';
      });
    });
  }

  function initReveal() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targets = document.querySelectorAll('.rev, .blog-reveal');

    if (!targets.length) return;

    if (reduced) {
      targets.forEach((el) => el.classList.add('vis'));
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('vis');

          e.target.querySelectorAll('.stat-n').forEach((el) => {
            if (el.classList.contains('counted')) return;
            el.classList.add('counted');
            const target = parseInt(el.getAttribute('data-target'), 10) || 0;
            const suffix = el.getAttribute('data-suffix') || '';
            let current = 0;
            const increment = target / 40;
            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                current = target;
                clearInterval(timer);
              }
              el.textContent = Math.floor(current) + suffix;
            }, 25);
          });
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach((el) => obs.observe(el));
  }

  function initBlog() {
    const heroBg = document.querySelector('.blog-hero-banner__bg');
    if (!heroBg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ticking = false;
    const updateParallax = () => {
      const offset = Math.min(window.scrollY * 0.22, 120);
      heroBg.style.transform = 'translate3d(0, ' + offset + 'px, 0) scale(1.08)';
      ticking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(updateParallax);
      },
      { passive: true }
    );
    updateParallax();
  }

  function initActiveNav() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href === '#' || href.startsWith('mailto')) return;
      const target = href.split('/').pop();
      if (target === page) link.classList.add('nav-active');
    });
  }

  function showFormMessage(form, type, message) {
    let box = form.querySelector('.form-message');
    if (!box) {
      box = document.createElement('p');
      box.className = 'form-message';
      form.appendChild(box);
    }
    box.textContent = message;
    box.className = 'form-message ' + type;
    box.setAttribute('role', 'alert');
  }

  function initContactForms() {
    document.querySelectorAll('form[data-contact]').forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const lang = getLang();
        const dict = window.SofturaI18n[lang];

        const name = form.querySelector('[name="nombre"]');
        const email = form.querySelector('[name="email"]');
        const message = form.querySelector('[name="mensaje"]');

        if (!name?.value.trim() || !email?.value.trim() || !message?.value.trim()) {
          showFormMessage(form, 'error', dict['contact.error']);
          return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
          showFormMessage(form, 'error', dict['contact.error']);
          return;
        }

        const empresa = form.querySelector('[name="empresa"]')?.value.trim() || '';
        const telefono = form.querySelector('[name="telefono"]')?.value.trim() || '';

        const isTalent = form.hasAttribute('data-contact-talent') || form.closest('.cn-talent');
        const mailTo = form.getAttribute('data-contact-email') || CONTACT_EMAIL;
        const subjectLabel = isTalent ? 'Talento Softura' : 'Contacto Softura Solutions';
        const subject = encodeURIComponent(subjectLabel + ' - ' + name.value.trim());
        const body = encodeURIComponent(
          'Nombre: ' + name.value.trim() +
            '\nEmpresa: ' + (empresa || 'N/A') +
            '\nCorreo: ' + email.value.trim() +
            '\nTeléfono: ' + (telefono || 'N/A') +
            '\n\nMensaje:\n' + message.value.trim()
        );

        showFormMessage(form, 'success', dict['contact.success']);
        window.location.href = 'mailto:' + mailTo + '?subject=' + subject + '&body=' + body;
        form.reset();
      });
    });
  }

  function initCarousel(container, slideSelector, dotsEl, options) {
    if (!container) return null;
    const slides = container.querySelectorAll(slideSelector);
    if (!slides.length) return null;
    let index = 0;
    let timer;
    const opts = options || {};

    function show(i) {
      const n = ((i % slides.length) + slides.length) % slides.length;
      slides.forEach((s, idx) => s.classList.toggle('active', idx === n));
      dotsEl?.querySelectorAll('button').forEach((dot, idx) => {
        dot.classList.toggle('active', idx === n);
      });
      if (opts.tabs) {
        opts.tabs.forEach((tab, idx) => tab.classList.toggle('active', idx === n));
      }
      index = n;
      if (opts.onChange) opts.onChange(n);
    }

    function next() {
      show(index + 1);
    }

    if (dotsEl && slides.length > 1) {
      dotsEl.innerHTML = '';
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', 'Slide ' + (i + 1));
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => show(i));
        dotsEl.appendChild(dot);
      });
    }

    const prev = container.querySelector('.cn-carousel-prev');
    const nextBtn = container.querySelector('.cn-carousel-next');
    prev?.addEventListener('click', () => show(index - 1));
    nextBtn?.addEventListener('click', () => show(index + 1));

    if (opts.autoplay && slides.length > 1) {
      const start = () => {
        clearInterval(timer);
        timer = setInterval(next, opts.interval || 20000);
      };
      start();
      container.addEventListener('mouseenter', () => clearInterval(timer));
      container.addEventListener('mouseleave', start);
    }

    return show;
  }

  function initTalentEmailForm() {
    const form = document.querySelector('.page-conocenos [data-emailjs]');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const lang = getLang();
      const dict = window.SofturaI18n[lang];
      const msgEl = document.getElementById('cn-form-msg');
      const loader = document.getElementById('cn-loader');
      const btn = document.getElementById('enviarCorreo');

      const nombre = form.querySelector('#nombre')?.value.trim();
      const email = form.querySelector('#email')?.value.trim();
      const telefono = form.querySelector('#telefono')?.value.trim();
      const comentario = form.querySelector('#comentario')?.value.trim();

      if (!nombre || !email || !comentario || !telefono) {
        if (msgEl) {
          msgEl.hidden = false;
          msgEl.textContent = dict['contact.error'];
          msgEl.className = 'cn-form-message error';
        }
        return;
      }

      const templateParams = {
        from_email: email,
        from_name: nombre,
        from_phone: telefono,
        message: comentario
      };

      const showMsg = (text, type) => {
        if (!msgEl) return;
        msgEl.hidden = false;
        msgEl.textContent = text;
        msgEl.className = 'cn-form-message ' + type;
      };

      if (typeof emailjs === 'undefined') {
        const subject = encodeURIComponent('Talento Softura - ' + nombre);
        const body = encodeURIComponent(
          'Nombre: ' + nombre + '\nCorreo: ' + email + '\nTeléfono: ' + telefono + '\n\n' + comentario
        );
        window.location.href = 'mailto:info@softura.com.mx?subject=' + subject + '&body=' + body;
        showMsg(dict['contact.success'], 'success');
        form.reset();
        return;
      }

      try {
        loader?.classList.add('visible');
        if (btn) btn.disabled = true;
        await emailjs.send('service_lwv1mcl', 'template_uoxxrqb', templateParams);
        showMsg(dict['cn.form.success'], 'success');
        form.reset();
      } catch (err) {
        showMsg(dict['cn.form.error'], 'error');
      } finally {
        loader?.classList.remove('visible');
        if (btn) btn.disabled = false;
      }
    });
  }

  function initConocenos() {
    if (!document.body.classList.contains('page-conocenos')) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const sectorTabs = document.querySelectorAll('#sector-tabs button');
    const showClients = initCarousel(
      document.getElementById('clients-carousel'),
      '.cn-carousel-item',
      document.getElementById('clients-dots'),
      { tabs: sectorTabs, autoplay: true, interval: 8000 }
    );
    sectorTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const i = parseInt(tab.getAttribute('data-sector'), 10);
        if (showClients) showClients(i);
      });
    });

    initTalentEmailForm();

    const scrollTop = document.getElementById('scroll-top');
    if (scrollTop) {
      window.addEventListener('scroll', () => {
        scrollTop.classList.toggle('visible', window.scrollY > 400);
      });
      scrollTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    document.querySelectorAll('a[href="#form_correo"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('form_correo')?.scrollIntoView({ behavior: 'smooth' });
      });
    });

    document.querySelector('.cn-scroll-hint')?.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('diferenciadores')?.scrollIntoView({ behavior: 'smooth' });
    });

    document.querySelectorAll('[data-cn-stagger]').forEach((group) => {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            group.querySelectorAll('.cn-stagger-item').forEach((item, i) => {
              if (reduced) {
                item.classList.add('cn-visible');
                return;
              }
              item.style.transitionDelay = i * 0.08 + 's';
              item.classList.add('cn-visible');
            });
            obs.unobserve(group);
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );
      obs.observe(group);
    });

    const steps = document.querySelector('.cn-steps');
    const fill = document.getElementById('cn-timeline-fill');
    if (steps && fill) {
      const updateTimeline = () => {
        const rect = steps.getBoundingClientRect();
        const vh = window.innerHeight;
        const start = vh * 0.85;
        const end = vh * 0.25;
        const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
        fill.style.height = progress * 100 + '%';
        steps.querySelectorAll('li').forEach((li, i) => {
          const threshold = (i + 1) / steps.querySelectorAll('li').length;
          li.classList.toggle('cn-step-active', progress >= threshold - 0.15);
        });
      };
      updateTimeline();
      window.addEventListener('scroll', updateTimeline, { passive: true });
    }

    const photo = document.querySelector('.cn-accompany-photo');
    if (photo && !reduced) {
      window.addEventListener(
        'scroll',
        () => {
          const rect = photo.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          const offset = (center - window.innerHeight / 2) * 0.035;
          photo.style.transform = 'translateY(' + offset + 'px)';
        },
        { passive: true }
      );
    }

    const wrap = document.getElementById('testimonial-carousel');
    if (wrap) {
      const slides = wrap.querySelectorAll('.cn-quote');
      const dotsEl = document.getElementById('testimonial-dots');
      let index = 0;
      let startX = 0;

      const showTestimonial = (n) => {
        index = (n + slides.length) % slides.length;
        slides.forEach((s, i) => s.classList.toggle('cn-quote-active', i === index));
        dotsEl?.querySelectorAll('button').forEach((d, i) => {
          d.classList.toggle('active', i === index);
        });
      };

      if (dotsEl && window.matchMedia('(max-width: 700px)').matches && slides.length > 1) {
        dotsEl.innerHTML = '';
        dotsEl.style.display = 'flex';
        slides.forEach((_, i) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.setAttribute('aria-label', 'Testimonio ' + (i + 1));
          if (i === 0) dot.classList.add('active');
          dot.addEventListener('click', () => showTestimonial(i));
          dotsEl.appendChild(dot);
        });
        showTestimonial(0);
      }

      wrap.addEventListener(
        'touchstart',
        (e) => {
          startX = e.changedTouches[0].screenX;
        },
        { passive: true }
      );

      wrap.addEventListener(
        'touchend',
        (e) => {
          if (!window.matchMedia('(max-width: 700px)').matches) return;
          const diff = e.changedTouches[0].screenX - startX;
          if (Math.abs(diff) < 50) return;
          showTestimonial(diff < 0 ? index + 1 : index - 1);
        },
        { passive: true }
      );
    }

    const form = document.querySelector('.page-conocenos [data-emailjs]');
    form?.addEventListener('submit', () => {
      setTimeout(() => {
        const msg = document.getElementById('cn-form-msg');
        if (msg && !msg.hidden && msg.classList.contains('success')) {
          form.classList.add('cn-form-sent');
        }
      }, 100);
    });
  }

  function loadEmailJs() {
    if (!document.querySelector('[data-emailjs]')) return;
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    s.onload = () => {
      if (typeof emailjs !== 'undefined') {
        emailjs.init('user_0RIT1RUfych7Ew2GVdgj1');
      }
    };
    document.body.appendChild(s);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
    initCursor();
    initReveal();
    initBlog();
    initActiveNav();
    initContactForms();
    initConocenos();
    loadEmailJs();
  });
})();
