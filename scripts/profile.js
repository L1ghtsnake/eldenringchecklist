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
      recentTitle: 'Recent activity',
      recentSummary: '{done} / {total} bosses defeated',
      recentEmpty: 'Your recent activity will appear here once you start using the site.',
      recentContinue: 'Continue the checklist',
      gameElden: 'Elden Ring',
      gameShadow: 'Shadow of the Erdtree',
      timeJustNow: 'Just now',
      timeMinutes: '{n}m ago',
      timeHours: '{n}h ago',
      timeDays: '{n}d ago',
      menuAccountLabel: 'Account',
      menuPrefsLabel: 'Preferences',
      avatarEditLabel: 'Change avatar',
      nicknameEditLabel: 'Edit nickname',
      nicknameSave: 'Save',
      nicknameCancel: 'Cancel'
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
      recentTitle: 'Недавняя активность',
      recentSummary: '{done} / {total} боссов побеждено',
      recentEmpty: 'Здесь появится ваша недавняя активность, как только вы начнёте пользоваться сайтом.',
      recentContinue: 'Продолжить чек-лист',
      gameElden: 'Elden Ring',
      gameShadow: 'Shadow of the Erdtree',
      timeJustNow: 'Только что',
      timeMinutes: '{n} мин. назад',
      timeHours: '{n} ч. назад',
      timeDays: '{n} дн. назад',
      menuAccountLabel: 'Аккаунт',
      menuPrefsLabel: 'Настройки',
      avatarEditLabel: 'Изменить аватар',
      nicknameEditLabel: 'Изменить никнейм',
      nicknameSave: 'Сохранить',
      nicknameCancel: 'Отмена'
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
    els.heroAvatarEditBtn = document.getElementById('profile-hero-avatar-edit');
    els.heroAvatarInput = document.getElementById('profile-hero-avatar-input');
    els.heroAvatarError = document.getElementById('profile-hero-avatar-error');
    els.heroNameRow = document.getElementById('profile-hero-name-row');
    els.heroName = document.getElementById('profile-hero-name');
    els.heroNameEditBtn = document.getElementById('profile-hero-name-edit');
    els.heroNameForm = document.getElementById('profile-hero-name-form');
    els.heroNameInput = document.getElementById('profile-hero-name-input');
    els.heroNameSaveLabel = document.getElementById('profile-hero-name-save-label');
    els.heroNameCancelBtn = document.getElementById('profile-hero-name-cancel');
    els.heroNameCancelLabel = document.getElementById('profile-hero-name-cancel-label');
    els.heroNameError = document.getElementById('profile-hero-name-error');
    els.heroEmail = document.getElementById('profile-hero-email');
    els.heroDate = document.getElementById('profile-hero-date');

    els.infoTitle = document.getElementById('profile-info-title');
    els.infoEmailLabel = document.getElementById('profile-info-email-label');
    els.infoDateLabel = document.getElementById('profile-info-date-label');

    els.recentTitle = document.getElementById('profile-recent-title');
    els.recentSummary = document.getElementById('profile-recent-summary');
    els.recentList = document.getElementById('profile-recent-list');
    els.recentEmptyState = document.getElementById('profile-recent-empty-state');
    els.recentEmpty = document.getElementById('profile-recent-empty');
    els.recentContinueLabel = document.getElementById('profile-action-checklist');
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
    closeNicknameForm();
    if (!loggedIn) {
      /* Clear any previous account's cached recent-activity data so it
         can't briefly flash on screen if a different account logs in
         later without a full page reload. */
      cachedProgressData = null;
      return;
    }

    const nickname = user.displayName || (profile && profile.nickname) || user.email || '';
    if (els.heroName) els.heroName.textContent = nickname;
    if (els.heroEmail) els.heroEmail.textContent = user.email || '';
    if (els.heroDate) {
      const formatted = formatMemberSince(user.metadata && user.metadata.creationTime);
      els.heroDate.textContent = formatted || '';
    }
    renderAvatar(profile && profile.avatarDataUrl);
    loadAndRenderRecent(user.uid);
  }

  /* ==========================================================================
     Recent activity — replaces the old "Your progress" bar-chart cards
     (and the placeholder "Recent" section that sat empty below them)
     with one real feed: the last few bosses this account has defeated,
     pulled from users/{uid}.history (written by the checklist page
     every time a boss flips to completed — see recordHistory in
     script.js), plus a compact one-line overall total. Boss/region
     names and totals come from the same gameData docs the checklist
     itself reads, so this stays correct without duplicating any data.
     ========================================================================== */

  let cachedProgressData = null;

  function buildBossIndexAndTotals(eldenRegions, shadowRegions, progressSet) {
    const bossIndex = {};
    let total = 0;
    let done = 0;
    const addGame = (regions, game) => {
      (regions || []).forEach((region) => {
        (region.bosses || []).forEach((boss) => {
          bossIndex[boss.id] = { name: boss.name, regionId: region.id, regionName: region.name, game };
          total += 1;
          if (progressSet.has(boss.id)) done += 1;
        });
      });
    };
    addGame(eldenRegions, 'eldenring');
    addGame(shadowRegions, 'shadowerdtree');
    return { bossIndex, total, done };
  }

  function formatRelativeTime(at) {
    const diff = Math.max(0, Date.now() - at);
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return t('timeJustNow');
    const min = Math.floor(sec / 60);
    if (min < 60) return t('timeMinutes').replace('{n}', min);
    const hr = Math.floor(min / 60);
    if (hr < 24) return t('timeHours').replace('{n}', hr);
    const day = Math.floor(hr / 24);
    if (day < 7) return t('timeDays').replace('{n}', day);
    try {
      return new Intl.DateTimeFormat(currentLang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short' }).format(new Date(at));
    } catch (err) {
      return '';
    }
  }

  function renderRecentSection() {
    if (els.recentSummary) {
      const total = cachedProgressData ? cachedProgressData.total : 0;
      const done = cachedProgressData ? cachedProgressData.done : 0;
      els.recentSummary.textContent = t('recentSummary').replace('{done}', done).replace('{total}', total);
    }

    const history = cachedProgressData ? cachedProgressData.history : [];
    const entries = history.slice(0, 8);

    if (!entries.length) {
      if (els.recentList) els.recentList.hidden = true;
      if (els.recentEmptyState) els.recentEmptyState.hidden = false;
      return;
    }
    if (els.recentEmptyState) els.recentEmptyState.hidden = true;
    if (!els.recentList) return;

    const { bossIndex, translations } = cachedProgressData;
    els.recentList.hidden = false;
    els.recentList.innerHTML = '';

    entries.forEach((entry) => {
      const info = bossIndex[entry.id];
      if (!info) return;
      const bossName = (currentLang === 'ru' && translations.bosses[entry.id]) || info.name;
      const regionName = (currentLang === 'ru' && translations.regions[info.regionId]) || info.regionName;
      const gameLabel = info.game === 'shadowerdtree' ? t('gameShadow') : t('gameElden');

      const li = document.createElement('li');
      li.className = 'profile-recent-item';

      const icon = document.createElement('span');
      icon.className = 'profile-recent-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M20 6 9 17l-5-5"/></svg>';

      const text = document.createElement('span');
      text.className = 'profile-recent-text';
      const nameEl = document.createElement('span');
      nameEl.className = 'profile-recent-name';
      nameEl.textContent = bossName;
      const metaEl = document.createElement('span');
      metaEl.className = 'profile-recent-meta';
      metaEl.textContent = `${regionName} · ${gameLabel}`;
      text.appendChild(nameEl);
      text.appendChild(metaEl);

      const timeEl = document.createElement('span');
      timeEl.className = 'profile-recent-time';
      timeEl.textContent = formatRelativeTime(entry.at);

      li.appendChild(icon);
      li.appendChild(text);
      li.appendChild(timeEl);
      els.recentList.appendChild(li);
    });
  }

  async function loadAndRenderRecent(uid) {
    try {
      const [eldenSnap, shadowSnap, translationsSnap, userSnap] = await Promise.all([
        db.collection('gameData').doc('eldenring').get(),
        db.collection('gameData').doc('shadowerdtree').get(),
        db.collection('gameData').doc('translations').get(),
        db.collection('users').doc(uid).get()
      ]);
      const eldenRegions = eldenSnap.exists ? eldenSnap.data().regions : [];
      const shadowRegions = shadowSnap.exists ? shadowSnap.data().regions : [];
      const translationsData = translationsSnap.exists ? translationsSnap.data() : {};
      const userData = userSnap.exists ? userSnap.data() : {};

      const progressList = Array.isArray(userData.progress) ? userData.progress : [];
      const progressSet = new Set(progressList.filter((id) => typeof id === 'string'));
      const historyList = Array.isArray(userData.history) ? userData.history : [];
      const history = historyList.filter((entry) => entry && typeof entry.id === 'string' && typeof entry.at === 'number');

      const { bossIndex, total, done } = buildBossIndexAndTotals(eldenRegions, shadowRegions, progressSet);

      cachedProgressData = {
        bossIndex,
        translations: {
          regions: (translationsData && translationsData.regions) || {},
          bosses: (translationsData && translationsData.bosses) || {}
        },
        history,
        total,
        done
      };
      renderRecentSection();
    } catch (err) {
      console.error('Failed to load recent activity:', err);
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

    if (els.guardTitle) els.guardTitle.textContent = t('guardTitle');
    if (els.guardText) els.guardText.textContent = t('guardText');
    if (els.guardLoginLabel) els.guardLoginLabel.textContent = t('guardLogin');

    if (els.infoTitle) els.infoTitle.textContent = t('infoTitle');
    if (els.infoEmailLabel) els.infoEmailLabel.textContent = t('infoEmailLabel');
    if (els.infoDateLabel) els.infoDateLabel.textContent = t('infoDateLabel');

    if (els.heroAvatarEditBtn) {
      els.heroAvatarEditBtn.setAttribute('aria-label', t('avatarEditLabel'));
      els.heroAvatarEditBtn.setAttribute('title', t('avatarEditLabel'));
    }
    if (els.heroNameEditBtn) {
      els.heroNameEditBtn.setAttribute('aria-label', t('nicknameEditLabel'));
      els.heroNameEditBtn.setAttribute('title', t('nicknameEditLabel'));
    }
    if (els.heroNameSaveLabel) els.heroNameSaveLabel.textContent = t('nicknameSave');
    if (els.heroNameCancelLabel) els.heroNameCancelLabel.textContent = t('nicknameCancel');

    if (els.recentTitle) els.recentTitle.textContent = t('recentTitle');
    if (els.recentEmpty) els.recentEmpty.textContent = t('recentEmpty');
    if (els.recentContinueLabel) els.recentContinueLabel.textContent = t('recentContinue');

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

  /* ==========================================================================
     Avatar & nickname editing — moved here from the account modal, which
     now only displays them read-only. Both delegate the actual Firebase
     Auth / Firestore work to AuthWidget.changeAvatar / changeNickname so
     the resize/compress logic and error strings stay in one place.
     ========================================================================== */

  function showHeroAvatarError(message) {
    if (!els.heroAvatarError) return;
    els.heroAvatarError.textContent = message;
    els.heroAvatarError.hidden = false;
  }

  function hideHeroAvatarError() {
    if (!els.heroAvatarError) return;
    els.heroAvatarError.hidden = true;
    els.heroAvatarError.textContent = '';
  }

  async function handleHeroAvatarChange(event) {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!file || !window.AuthWidget) return;

    hideHeroAvatarError();
    const result = await window.AuthWidget.changeAvatar(file);
    if (!result.ok) showHeroAvatarError(result.message);
  }

  function showHeroNameError(message) {
    if (!els.heroNameError) return;
    els.heroNameError.textContent = message;
    els.heroNameError.hidden = false;
  }

  function hideHeroNameError() {
    if (!els.heroNameError) return;
    els.heroNameError.hidden = true;
    els.heroNameError.textContent = '';
  }

  function openNicknameForm() {
    if (!els.heroNameForm) return;
    hideHeroNameError();
    if (els.heroNameRow) els.heroNameRow.hidden = true;
    if (els.heroNameInput) els.heroNameInput.value = els.heroName ? els.heroName.textContent : '';
    els.heroNameForm.hidden = false;
    if (els.heroNameInput) {
      els.heroNameInput.focus();
      els.heroNameInput.select();
    }
  }

  function closeNicknameForm() {
    if (!els.heroNameForm) return;
    els.heroNameForm.hidden = true;
    if (els.heroNameRow) els.heroNameRow.hidden = false;
    hideHeroNameError();
  }

  async function handleNicknameSubmit(event) {
    event.preventDefault();
    if (!window.AuthWidget || !els.heroNameInput) return;
    const result = await window.AuthWidget.changeNickname(els.heroNameInput.value);
    if (!result.ok) {
      showHeroNameError(result.message);
      return;
    }
    closeNicknameForm();
  }

  function attachProfileEditEvents() {
    if (els.heroAvatarEditBtn && els.heroAvatarInput) {
      els.heroAvatarEditBtn.addEventListener('click', () => els.heroAvatarInput.click());
    }
    if (els.heroAvatarInput) els.heroAvatarInput.addEventListener('change', handleHeroAvatarChange);
    if (els.heroNameEditBtn) els.heroNameEditBtn.addEventListener('click', openNicknameForm);
    if (els.heroNameCancelBtn) els.heroNameCancelBtn.addEventListener('click', closeNicknameForm);
    if (els.heroNameForm) els.heroNameForm.addEventListener('submit', handleNicknameSubmit);
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
    attachProfileEditEvents();

    if (els.guardLoginBtn) {
      els.guardLoginBtn.addEventListener('click', () => {
        if (window.AuthWidget) window.AuthWidget.openAuthModal('login');
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
