(() => {
  'use strict';

  /* Same storage keys as the other pages, so a language/theme choice
     made anywhere on the site carries over here too. */
  const THEME_KEY = 'eldenRingBossChecklistTheme';
  const LANG_KEY = 'eldenRingBossChecklistLang';

  const i18n = {
    en: {
      docTitle: 'Elden Ring Database — Interactive Map',
      brandEyebrow: 'Interactive Map',
      themeLabel: 'Toggle dark or light theme',
      mapEyebrow: 'Explore',
      mapTitle: 'Interactive Map of the Lands Between',
      mapSubtitle: 'Every region, legacy dungeon and point of interest — pan and zoom to plan your next route. Map data provided by mapgenie.io.',
      mapCredit: 'Map powered by',
      menuAccountLabel: 'Account',
      menuPrefsLabel: 'Preferences',
    },
    ru: {
      docTitle: 'Elden Ring Database — Интерактивная карта',
      brandEyebrow: 'Интерактивная карта',
      themeLabel: 'Переключить тёмную или светлую тему',
      mapEyebrow: 'Исследуйте',
      mapTitle: 'Интерактивная карта Междуземья',
      mapSubtitle: 'Каждый регион, подземелье и точка интереса — двигайте и увеличивайте карту, чтобы спланировать маршрут. Данные карты предоставлены mapgenie.io.',
      mapCredit: 'Карта на основе',
      menuAccountLabel: 'Аккаунт',
      menuPrefsLabel: 'Настройки',
    },
    kk: {
      docTitle: 'Elden Ring Database — Интерактивті карта',
      brandEyebrow: 'Интерактивті карта',
      themeLabel: 'Қараңғы немесе ашық тақырыпты ауыстыру',
      mapEyebrow: 'Зерттеу',
      mapTitle: 'Аралық Жердің интерактивті картасы',
      mapSubtitle: 'Әр аймақ, зындан және қызықты нүкте — келесі бағытыңызды жоспарлау үшін картаны жылжытып, үлкейтіп қараңыз. Карта деректерін mapgenie.io ұсынды.',
      mapCredit: 'Карта негізі',
      menuAccountLabel: 'Аккаунт',
      menuPrefsLabel: 'Баптаулар',
    }
  };

  const els = {};
  let currentLang = 'en';

  function t(key) {
    return (i18n[currentLang] && i18n[currentLang][key]) || i18n.en[key] || '';
  }

  function cacheDom() {
    els.html = document.documentElement;
    els.body = document.body;
    els.brandEyebrow = document.getElementById('brand-eyebrow');
    els.themeToggle = document.getElementById('theme-toggle');
    els.langFilterBtn = document.getElementById('lang-filter-btn');
    els.langFilterPanel = document.getElementById('lang-filter-panel');
    els.langOptions = document.querySelectorAll('.lang-option');
    els.menuAccountLabel = document.getElementById('menu-account-label');
    els.menuPrefsLabel = document.getElementById('menu-prefs-label');
    els.burgerMenu = document.getElementById('burger-menu');
    els.burgerBtn = document.getElementById('burger-btn');
    els.headerControls = document.getElementById('header-controls');

    els.mapEyebrow = document.getElementById('map-eyebrow');
    els.mapTitle = document.getElementById('map-title');
    els.mapSubtitle = document.getElementById('map-subtitle');
    els.mapCreditText = document.getElementById('map-credit-text');
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

  function applyLanguage(lang) {
    currentLang = lang;
    els.html.setAttribute('lang', lang);
    document.title = t('docTitle');

    if (els.langOptions) {
      els.langOptions.forEach((btn) => {
        const active = btn.dataset.lang === lang;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-checked', String(active));
      });
    }
    if (els.langFilterBtn) {
      els.langFilterBtn.setAttribute('aria-label', 'Language');
      els.langFilterBtn.setAttribute('title', 'Language');
    }
    if (els.brandEyebrow) els.brandEyebrow.textContent = t('brandEyebrow');
    if (els.themeToggle) els.themeToggle.setAttribute('aria-label', t('themeLabel'));
    if (els.menuAccountLabel) els.menuAccountLabel.textContent = t('menuAccountLabel');
    if (els.menuPrefsLabel) els.menuPrefsLabel.textContent = t('menuPrefsLabel');

    if (els.mapEyebrow) els.mapEyebrow.textContent = t('mapEyebrow');
    if (els.mapTitle) els.mapTitle.textContent = t('mapTitle');
    if (els.mapSubtitle) els.mapSubtitle.textContent = t('mapSubtitle');
    if (els.mapCreditText) els.mapCreditText.textContent = t('mapCredit');

    if (window.AuthWidget) window.AuthWidget.setLanguage(lang);

    savePreference(LANG_KEY, lang);
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

  function openBurgerMenu() {
    if (!els.headerControls) return;
    els.headerControls.classList.add('mobile-open');
    if (els.burgerBtn) els.burgerBtn.setAttribute('aria-expanded', 'true');
  }

  function closeBurgerMenu() {
    if (!els.headerControls) return;
    els.headerControls.classList.remove('mobile-open');
    if (els.burgerBtn) els.burgerBtn.setAttribute('aria-expanded', 'false');
    closeLangPanel();
  }

  function toggleBurgerMenu() {
    if (!els.headerControls) return;
    if (els.headerControls.classList.contains('mobile-open')) closeBurgerMenu();
    else openBurgerMenu();
  }

  function attachBurgerMenuEvents() {
    if (els.burgerBtn) {
      els.burgerBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleBurgerMenu();
      });
    }
    document.addEventListener('click', (event) => {
      if (!els.headerControls || !els.headerControls.classList.contains('mobile-open')) return;
      if (els.burgerMenu && !els.burgerMenu.contains(event.target)) closeBurgerMenu();
    });
  }

  function openLangPanel() {
    if (!els.langFilterPanel) return;
    els.langFilterPanel.hidden = false;
    if (els.langFilterBtn) els.langFilterBtn.setAttribute('aria-expanded', 'true');
  }

  function closeLangPanel() {
    if (!els.langFilterPanel) return;
    els.langFilterPanel.hidden = true;
    if (els.langFilterBtn) els.langFilterBtn.setAttribute('aria-expanded', 'false');
  }

  function toggleLangPanel() {
    if (!els.langFilterPanel) return;
    if (els.langFilterPanel.hidden) openLangPanel();
    else closeLangPanel();
  }

  function attachLangFilterEvents() {
    if (els.langFilterBtn) {
      els.langFilterBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleLangPanel();
      });
    }
    if (els.langOptions) {
      els.langOptions.forEach((btn) => {
        btn.addEventListener('click', () => {
          applyLanguage(btn.dataset.lang);
          closeLangPanel();
          closeBurgerMenu();
        });
      });
    }
    document.addEventListener('click', (event) => {
      if (!els.langFilterPanel || els.langFilterPanel.hidden) return;
      const container = document.getElementById('lang-filter');
      if (container && !container.contains(event.target)) closeLangPanel();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      if (els.langFilterPanel && !els.langFilterPanel.hidden) closeLangPanel();
      if (els.headerControls && els.headerControls.classList.contains('mobile-open')) closeBurgerMenu();
    });
  }

  function init() {
    cacheDom();

    const theme = loadPreference(THEME_KEY, 'dark', ['dark', 'light']);
    applyTheme(theme);

    const lang = loadPreference(LANG_KEY, 'en', ['en', 'ru', 'kk']);

    if (window.AuthWidget) {
      window.AuthWidget.init(lang, { onBeforeOpen: closeBurgerMenu });
    }

    applyLanguage(lang);
    attachThemeEvents();
    attachLangFilterEvents();
    attachBurgerMenuEvents();

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
