(() => {
  'use strict';

  /* Same storage keys as the other pages, so a language/theme choice
     made anywhere on the site carries over here too. */
  const THEME_KEY = 'eldenRingBossChecklistTheme';
  const LANG_KEY = 'eldenRingBossChecklistLang';

  const i18n = {
    en: {
      docTitle: 'Elden Ring Database — Personal Cabinet',
      brandEyebrow: 'Personal Cabinet',
      themeLabel: 'Toggle dark or light theme',
      guardTitle: 'Personal Cabinet',
      guardText: 'Log in to see your profile, your saved details, and your recent activity.',
      guardLogin: 'Log in',
      memberSince: 'Member since',
      infoTitle: 'Account information',
      infoEmailLabel: 'Email',
      infoDateLabel: 'Member since',
      actionsTitle: 'Quick actions',
      actionChecklist: 'Go to checklist',
      actionLogout: 'Log out',
      recentTitle: 'Recent',
      recentEmpty: 'Your recent activity will appear here once you start using the site.',
      menuAccountLabel: 'Account',
      menuPrefsLabel: 'Preferences'
    },
    ru: {
      docTitle: 'Elden Ring Database — Личный кабинет',
      brandEyebrow: 'Личный кабинет',
      themeLabel: 'Переключить тёмную или светлую тему',
      guardTitle: 'Личный кабинет',
      guardText: 'Войдите в аккаунт, чтобы увидеть свой профиль, сохранённые данные и недавнюю активность.',
      guardLogin: 'Войти',
      memberSince: 'Регистрация:',
      infoTitle: 'Информация об аккаунте',
      infoEmailLabel: 'Email',
      infoDateLabel: 'Регистрация',
      actionsTitle: 'Быстрые действия',
      actionChecklist: 'Перейти к чек-листу',
      actionLogout: 'Выйти',
      recentTitle: 'Недавнее',
      recentEmpty: 'Здесь появится ваша недавняя активность, как только вы начнёте пользоваться сайтом.',
      menuAccountLabel: 'Аккаунт',
      menuPrefsLabel: 'Настройки'
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

    els.guard = document.getElementById('profile-guard');
    els.guardTitle = document.getElementById('profile-guard-title');
    els.guardText = document.getElementById('profile-guard-text');
    els.guardLoginBtn = document.getElementById('profile-guard-login-btn');
    els.guardLoginLabel = document.getElementById('profile-guard-login-label');

    els.content = document.getElementById('profile-content');
    els.heroAvatarImg = document.getElementById('profile-hero-avatar-img');
    els.heroAvatarFallback = document.getElementById('profile-hero-avatar-fallback');
    els.heroName = document.getElementById('profile-hero-name');
    els.heroEmail = document.getElementById('profile-hero-email');
    els.heroDate = document.getElementById('profile-hero-date');

    els.infoTitle = document.getElementById('profile-info-title');
    els.infoEmailLabel = document.getElementById('profile-info-email-label');
    els.infoDateLabel = document.getElementById('profile-info-date-label');
    els.actionsTitle = document.getElementById('profile-actions-title');
    els.actionChecklist = document.getElementById('profile-action-checklist');
    els.actionLogoutBtn = document.getElementById('profile-action-logout');
    els.actionLogoutLabel = document.getElementById('profile-action-logout-label');

    els.recentTitle = document.getElementById('profile-recent-title');
    els.recentEmpty = document.getElementById('profile-recent-empty');
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

  function formatMemberSince(dateInput) {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return '';
    try {
      return new Intl.DateTimeFormat(currentLang === 'ru' ? 'ru-RU' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (err) {
      return '';
    }
  }

  /* Mirrors AuthWidget's own renderAvatarInto — kept as a small local
     copy rather than reaching into auth.js's internals, since the
     profile hero avatar is a display of its own, separate from the
     header's account button avatar. */
  function renderAvatar(dataUrl) {
    if (!els.heroAvatarImg || !els.heroAvatarFallback) return;
    if (dataUrl) {
      els.heroAvatarImg.src = dataUrl;
      els.heroAvatarImg.hidden = false;
      els.heroAvatarFallback.hidden = true;
    } else {
      els.heroAvatarImg.hidden = true;
      els.heroAvatarImg.removeAttribute('src');
      els.heroAvatarFallback.hidden = false;
    }
  }

  function renderProfile(user, profile) {
    const loggedIn = !!user;
    if (els.guard) els.guard.hidden = loggedIn;
    if (els.content) els.content.hidden = !loggedIn;
    if (!loggedIn) return;

    const nickname = user.displayName || (profile && profile.nickname) || user.email || '';
    if (els.heroName) els.heroName.textContent = nickname;
    if (els.heroEmail) els.heroEmail.textContent = user.email || '';
    if (els.heroDate) {
      const formatted = formatMemberSince(user.metadata && user.metadata.creationTime);
      els.heroDate.textContent = formatted || '';
    }
    renderAvatar(profile && profile.avatarDataUrl);
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

    if (els.guardTitle) els.guardTitle.textContent = t('guardTitle');
    if (els.guardText) els.guardText.textContent = t('guardText');
    if (els.guardLoginLabel) els.guardLoginLabel.textContent = t('guardLogin');

    if (els.infoTitle) els.infoTitle.textContent = t('infoTitle');
    if (els.infoEmailLabel) els.infoEmailLabel.textContent = t('infoEmailLabel');
    if (els.infoDateLabel) els.infoDateLabel.textContent = t('infoDateLabel');
    if (els.actionsTitle) els.actionsTitle.textContent = t('actionsTitle');
    if (els.actionChecklist) els.actionChecklist.textContent = t('actionChecklist');
    if (els.actionLogoutLabel) els.actionLogoutLabel.textContent = t('actionLogout');

    if (els.recentTitle) els.recentTitle.textContent = t('recentTitle');
    if (els.recentEmpty) els.recentEmpty.textContent = t('recentEmpty');

    if (window.AuthWidget) {
      window.AuthWidget.setLanguage(lang);
      renderProfile(window.AuthWidget.getUser(), window.AuthWidget.getProfile());
    }

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

    const lang = loadPreference(LANG_KEY, 'en', ['en', 'ru']);

    if (window.AuthWidget) {
      window.AuthWidget.init(lang, {
        onBeforeOpen: closeBurgerMenu,
        onAuthChange: renderProfile
      });
    }

    applyLanguage(lang);
    attachThemeEvents();
    attachLangFilterEvents();
    attachBurgerMenuEvents();

    if (els.guardLoginBtn) {
      els.guardLoginBtn.addEventListener('click', () => {
        if (window.AuthWidget) window.AuthWidget.openAuthModal('login');
      });
    }

    /* Reuses the same sign-out flow as the account modal's "Log out"
       button (#logout-btn, wired inside auth.js) rather than duplicating
       it — this quick action just triggers that button. */
    if (els.actionLogoutBtn) {
      els.actionLogoutBtn.addEventListener('click', () => {
        const modalLogoutBtn = document.getElementById('logout-btn');
        if (modalLogoutBtn) modalLogoutBtn.click();
      });
    }

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
