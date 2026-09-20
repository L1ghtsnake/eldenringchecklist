(() => {
  'use strict';

  /* Same storage keys as scripts/script.js, so a language/theme choice
     made on either page carries over to the other. */
  const THEME_KEY = 'eldenRingBossChecklistTheme';
  const LANG_KEY = 'eldenRingBossChecklistLang';

  const i18n = {
    en: {
      docTitle: 'Elden Ring Database — Welcome',
      brandEyebrow: 'Database',
      brandTitle: 'Elden Ring Database',
      navChecklist: 'Checklist',
      langLabel: 'Language',
      themeLabel: 'Toggle dark or light theme',
      heroEyebrow: 'Database',
      heroTitle: 'Welcome to the Lands Between',
      heroSubtitle: 'A companion site for Elden Ring — a place to keep track of the Lands Between as you explore them, starting with every boss across the base game and Shadow of the Erdtree.',
      scrollHint: 'Scroll',
      aboutEyebrow: 'The World',
      aboutTitle: 'About the Game',
      aboutBody: 'Elden Ring is an open-world action role-playing game built around exploration, punishing combat and a fractured world worth piecing back together. Ride across the Lands Between on horseback, uncover forgotten legends in crumbling castles and sunken caves, and test yourself against demigods who once ruled as Elden Lords. Shadow of the Erdtree carries the journey further still, into the realm beyond the tree itself.',
      chip1: 'Open world',
      chip2: 'Souls-like combat',
      chip3: 'Base game + Shadow of the Erdtree',
      featuresEyebrow: 'Inside',
      featuresTitle: "What You'll Find Here",
      f1Title: 'Structured & Searchable',
      f1Text: 'Every region, legacy dungeon and boss laid out clearly, with quick search and filters to match.',
      f2Title: 'Boss Checklist',
      f2Text: 'Mark every boss as defeated and watch your progress fill in, region by region.',
      f2Link: 'Open the checklist',
      f3Title: 'Progress That Follows You',
      f3Text: 'Create an account to sync your checklist across every device you play on.',
      f4Title: 'In Your Language',
      f4Text: 'Switch freely between English and Russian at any time.',
      ctaTitle: 'A Growing Project',
      ctaBody: 'This started as a boss checklist and keeps growing from there — more tools for the Lands Between are on the way.',
      ctaLink: 'See the checklist',
      footer: 'Made by Elden Ring fans, for fellow Tarnished. Not affiliated with FromSoftware or Bandai Namco.',
    },
    ru: {
      docTitle: 'Elden Ring Database — Добро пожаловать',
      brandEyebrow: 'База данных',
      brandTitle: 'Elden Ring Database',
      navChecklist: 'Чек-лист',
      langLabel: 'Язык',
      themeLabel: 'Переключить тёмную или светлую тему',
      heroEyebrow: 'База данных',
      heroTitle: 'Добро пожаловать в Междуземье',
      heroSubtitle: 'Сайт-спутник для Elden Ring — место, где удобно следить за Междуземьем по мере его исследования. Начинаем с полного чек-листа боссов основной игры и Shadow of the Erdtree.',
      scrollHint: 'Листайте',
      aboutEyebrow: 'Мир игры',
      aboutTitle: 'Об игре',
      aboutBody: 'Elden Ring — это масштабная ролевая игра с открытым миром, построенная на исследовании, беспощадных сражениях и истории разрушенного королевства, которое предстоит собрать по кусочкам. Скачите верхом через Междуземье, находите забытые легенды в разрушенных замках и затонувших пещерах и бросайте вызов полубогам, некогда правившим как Повелители Элдена. Дополнение Shadow of the Erdtree продолжает историю за пределами самого Эрдтри.',
      chip1: 'Открытый мир',
      chip2: 'Souls-like боёвка',
      chip3: 'Основная игра + Shadow of the Erdtree',
      featuresEyebrow: 'Что внутри',
      featuresTitle: 'Что здесь есть',
      f1Title: 'Структура и поиск',
      f1Text: 'Каждый регион, подземелье и босс разложены по полочкам, с быстрым поиском и фильтрами.',
      f2Title: 'Чек-лист боссов',
      f2Text: 'Отмечайте побеждённых боссов и следите за прогрессом по каждому региону.',
      f2Link: 'Открыть чек-лист',
      f3Title: 'Прогресс, который не теряется',
      f3Text: 'Создайте аккаунт, чтобы синхронизировать чек-лист на всех своих устройствах.',
      f4Title: 'На вашем языке',
      f4Text: 'Переключайтесь между английским и русским в любой момент.',
      ctaTitle: 'Проект растёт',
      ctaBody: 'Всё начиналось с чек-листа боссов — и на этом сайт не останавливается. Скоро здесь появятся другие инструменты для Междуземья.',
      ctaLink: 'Смотреть чек-лист',
      footer: 'Сделано фанатами Elden Ring для таких же путников. Проект не связан с FromSoftware или Bandai Namco.',
    },
  };

  const els = {};

  function cacheDom() {
    els.html = document.documentElement;
    els.body = document.body;
    els.brandEyebrow = document.getElementById('brand-eyebrow');
    els.brandTitle = document.getElementById('brand-title');
    els.navChecklistLabel = document.getElementById('nav-checklist-label');
    els.themeToggle = document.getElementById('theme-toggle');
    els.langFilterBtn = document.getElementById('lang-filter-btn');
    els.langFilterBtnLabel = document.getElementById('lang-filter-btn-label');
    els.langFilterPanel = document.getElementById('lang-filter-panel');
    els.langOptions = document.querySelectorAll('.lang-option');
    els.heroEyebrow = document.getElementById('hero-eyebrow');
    els.heroTitle = document.getElementById('hero-title');
    els.heroSubtitle = document.getElementById('hero-subtitle');
    els.scrollHint = document.getElementById('scroll-hint-label');
    els.aboutEyebrow = document.getElementById('about-eyebrow');
    els.aboutTitle = document.getElementById('about-title');
    els.aboutBody = document.getElementById('about-body');
    els.chip1 = document.getElementById('chip-1');
    els.chip2 = document.getElementById('chip-2');
    els.chip3 = document.getElementById('chip-3');
    els.featuresEyebrow = document.getElementById('features-eyebrow');
    els.featuresTitle = document.getElementById('features-title');
    els.f1Title = document.getElementById('f1-title');
    els.f1Text = document.getElementById('f1-text');
    els.f2Title = document.getElementById('f2-title');
    els.f2Text = document.getElementById('f2-text');
    els.f2Link = document.getElementById('f2-link-label');
    els.f3Title = document.getElementById('f3-title');
    els.f3Text = document.getElementById('f3-text');
    els.f4Title = document.getElementById('f4-title');
    els.f4Text = document.getElementById('f4-text');
    els.ctaTitle = document.getElementById('cta-title');
    els.ctaBody = document.getElementById('cta-body');
    els.ctaLink = document.getElementById('cta-link-label');
    els.footerText = document.getElementById('landing-footer-text');
  }

  function loadPreference(key, fallback, validValues) {
    try {
      const value = localStorage.getItem(key);
      if (value && validValues.includes(value)) return value;
    } catch (err) {
      /* storage unavailable */
    }
    return fallback;
  }

  function savePreference(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      /* storage unavailable */
    }
  }

  function t(lang, key) {
    return i18n[lang][key];
  }

  let currentLang = 'en';

  function applyLanguage(lang) {
    currentLang = lang;
    els.html.setAttribute('lang', lang);
    document.title = t(lang, 'docTitle');

    if (els.langOptions) {
      els.langOptions.forEach((btn) => {
        const active = btn.dataset.lang === lang;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-checked', String(active));
      });
    }
    if (els.langFilterBtnLabel) els.langFilterBtnLabel.textContent = t(lang, 'langLabel');
    if (els.langFilterBtn) els.langFilterBtn.setAttribute('aria-label', t(lang, 'langLabel'));

    if (els.brandEyebrow) els.brandEyebrow.textContent = t(lang, 'brandEyebrow');
    if (els.brandTitle) els.brandTitle.textContent = t(lang, 'brandTitle');
    if (els.navChecklistLabel) els.navChecklistLabel.textContent = t(lang, 'navChecklist');
    if (els.themeToggle) els.themeToggle.setAttribute('aria-label', t(lang, 'themeLabel'));

    if (els.heroEyebrow) els.heroEyebrow.textContent = t(lang, 'heroEyebrow');
    if (els.heroTitle) els.heroTitle.textContent = t(lang, 'heroTitle');
    if (els.heroSubtitle) els.heroSubtitle.textContent = t(lang, 'heroSubtitle');
    if (els.scrollHint) els.scrollHint.textContent = t(lang, 'scrollHint');

    if (els.aboutEyebrow) els.aboutEyebrow.textContent = t(lang, 'aboutEyebrow');
    if (els.aboutTitle) els.aboutTitle.textContent = t(lang, 'aboutTitle');
    if (els.aboutBody) els.aboutBody.textContent = t(lang, 'aboutBody');
    if (els.chip1) els.chip1.textContent = t(lang, 'chip1');
    if (els.chip2) els.chip2.textContent = t(lang, 'chip2');
    if (els.chip3) els.chip3.textContent = t(lang, 'chip3');

    if (els.featuresEyebrow) els.featuresEyebrow.textContent = t(lang, 'featuresEyebrow');
    if (els.featuresTitle) els.featuresTitle.textContent = t(lang, 'featuresTitle');
    if (els.f1Title) els.f1Title.textContent = t(lang, 'f1Title');
    if (els.f1Text) els.f1Text.textContent = t(lang, 'f1Text');
    if (els.f2Title) els.f2Title.textContent = t(lang, 'f2Title');
    if (els.f2Text) els.f2Text.textContent = t(lang, 'f2Text');
    if (els.f2Link) els.f2Link.textContent = t(lang, 'f2Link');
    if (els.f3Title) els.f3Title.textContent = t(lang, 'f3Title');
    if (els.f3Text) els.f3Text.textContent = t(lang, 'f3Text');
    if (els.f4Title) els.f4Title.textContent = t(lang, 'f4Title');
    if (els.f4Text) els.f4Text.textContent = t(lang, 'f4Text');

    if (els.ctaTitle) els.ctaTitle.textContent = t(lang, 'ctaTitle');
    if (els.ctaBody) els.ctaBody.textContent = t(lang, 'ctaBody');
    if (els.ctaLink) els.ctaLink.textContent = t(lang, 'ctaLink');

    if (els.footerText) els.footerText.textContent = t(lang, 'footer');
  }

  function closeLangPanel() {
    if (!els.langFilterPanel) return;
    els.langFilterPanel.hidden = true;
    if (els.langFilterBtn) els.langFilterBtn.setAttribute('aria-expanded', 'false');
  }

  function toggleLangPanel() {
    if (!els.langFilterPanel) return;
    const willOpen = els.langFilterPanel.hidden;
    els.langFilterPanel.hidden = !willOpen;
    if (els.langFilterBtn) els.langFilterBtn.setAttribute('aria-expanded', String(willOpen));
  }

  function attachLangEvents() {
    if (els.langFilterBtn) {
      els.langFilterBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleLangPanel();
      });
    }
    if (els.langOptions) {
      els.langOptions.forEach((btn) => {
        btn.addEventListener('click', () => {
          savePreference(LANG_KEY, btn.dataset.lang);
          applyLanguage(btn.dataset.lang);
          closeLangPanel();
        });
      });
    }
    document.addEventListener('click', (event) => {
      if (!els.langFilterPanel || els.langFilterPanel.hidden) return;
      const container = document.getElementById('lang-filter');
      if (container && !container.contains(event.target)) closeLangPanel();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeLangPanel();
    });
  }

  function applyTheme(theme) {
    els.html.setAttribute('data-theme', theme);
    if (els.themeToggle) els.themeToggle.setAttribute('aria-pressed', String(theme === 'light'));
    savePreference(THEME_KEY, theme);
  }

  function attachThemeEvents() {
    if (!els.themeToggle) return;
    els.themeToggle.addEventListener('click', () => {
      const isLight = els.html.getAttribute('data-theme') === 'light';
      applyTheme(isLight ? 'dark' : 'light');
    });
  }

  function attachReveal() {
    const targets = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window) || !targets.length) {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    targets.forEach((el) => observer.observe(el));
  }

  function attachHeaderScroll() {
    const header = document.getElementById('landing-header');
    if (!header) return;
    let ticking = false;
    const update = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 40);
      ticking = false;
    };
    update();
    window.addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      },
      { passive: true }
    );
  }

  function attachParallax() {
    const bg = document.querySelector('.hero-bg');
    if (!bg) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let ticking = false;
    window.addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const offset = Math.min(window.scrollY * 0.18, 120);
          bg.style.transform = `translateY(${offset}px)`;
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  function init() {
    cacheDom();

    const theme = loadPreference(THEME_KEY, 'dark', ['dark', 'light']);
    applyTheme(theme);

    const lang = loadPreference(LANG_KEY, 'en', ['en', 'ru']);
    applyLanguage(lang);

    attachLangEvents();
    attachThemeEvents();
    attachReveal();
    attachParallax();
    attachHeaderScroll();

    requestAnimationFrame(() => {
      els.body.classList.add('is-ready');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
