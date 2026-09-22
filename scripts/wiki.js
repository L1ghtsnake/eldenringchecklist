'use strict';

/* ==========================================================================
   Boss guide ("Руководство") — list page. Shows every boss from both
   games, grouped by region, as plain links into wiki-boss.html?id=…
   No progress tracking here (that's the checklist's job) — this page is
   purely a reference index. Content for each boss (image + write-up) is
   filled in later, per boss, on the detail page.
   ========================================================================== */

const THEME_KEY = 'eldenRingBossChecklistTheme';
const LANG_KEY = 'eldenRingBossChecklistLang';
const GAME_KEY = 'eldenRingBossChecklistGame';

const i18n = {
  en: {
    docTitle: 'Elden Ring Database — Guide',
    brandEyebrow: 'Guide',
    themeLabel: 'Toggle dark or light theme',
    guideEyebrow: 'Reference',
    guideTitle: 'Boss Guide',
    guideSubtitle: 'Every boss from the base game and Shadow of the Erdtree, region by region. Pick one to open its page.',
    searchPlaceholder: 'Search a boss by name…',
    regionsTitle: 'Regions',
    shown: 'shown',
    bossesCount: 'bosses',
    noneFound: 'Nothing found. Try a different search term.',
    noMatch: 'No bosses match this search.',
    gameEldenRing: 'Elden Ring',
    gameShadowErdtree: 'Shadow of the Erdtree',
    languageLabel: 'Language',
    menuAccountLabel: 'Account',
    menuPrefsLabel: 'Preferences'
  },
  ru: {
    docTitle: 'Elden Ring Database — Руководство',
    brandEyebrow: 'Руководство',
    themeLabel: 'Переключить тёмную или светлую тему',
    guideEyebrow: 'Справочник',
    guideTitle: 'Руководство по боссам',
    guideSubtitle: 'Все боссы основной игры и Shadow of the Erdtree, по регионам. Выберите босса, чтобы открыть его страницу.',
    searchPlaceholder: 'Поиск босса по имени…',
    regionsTitle: 'Регионы',
    shown: 'показано',
    bossesCount: 'боссов',
    noneFound: 'Ничего не найдено. Попробуйте другой запрос.',
    noMatch: 'Нет боссов, подходящих под поиск.',
    gameEldenRing: 'Elden Ring',
    gameShadowErdtree: 'Shadow of the Erdtree',
    languageLabel: 'Язык',
    menuAccountLabel: 'Аккаунт',
    menuPrefsLabel: 'Настройки'
  },
  kk: {
    docTitle: 'Elden Ring Database — Нұсқаулық',
    brandEyebrow: 'Нұсқаулық',
    themeLabel: 'Қараңғы немесе ашық тақырыпты ауыстыру',
    guideEyebrow: 'Анықтамалық',
    guideTitle: 'Боссылар нұсқаулығы',
    guideSubtitle: 'Негізгі ойын мен Shadow of the Erdtree толықтамасының барлық боссы, аймақтар бойынша. Бетін ашу үшін боссты таңдаңыз.',
    searchPlaceholder: 'Боссты аты бойынша іздеу…',
    regionsTitle: 'Аймақтар',
    shown: 'көрсетілген',
    bossesCount: 'босс',
    noneFound: 'Ештеңе табылмады. Басқа сөз бойынша іздеп көріңіз.',
    noMatch: 'Іздеуге сәйкес босс жоқ.',
    gameEldenRing: 'Elden Ring',
    gameShadowErdtree: 'Shadow of the Erdtree',
    languageLabel: 'Тіл',
    menuAccountLabel: 'Аккаунт',
    menuPrefsLabel: 'Баптаулар'
  }
};

let games = {};
let nameTranslations = { ru: { regions: {}, bosses: {} }, kk: { regions: {}, bosses: {} } };

const state = {
  lang: 'en',
  theme: 'dark',
  activeGame: 'eldenring',
  searchTerm: ''
};

const els = {};

function cacheDom() {
  els.html = document.documentElement;
  els.brandEyebrow = document.getElementById('brand-eyebrow');
  els.footerText = document.getElementById('footer-text');
  els.themeToggle = document.getElementById('theme-toggle');
  els.langFilterBtn = document.getElementById('lang-filter-btn');
  els.langFilterPanel = document.getElementById('lang-filter-panel');
  els.langOptions = document.querySelectorAll('.lang-option');
  els.menuAccountLabel = document.getElementById('menu-account-label');
  els.menuPrefsLabel = document.getElementById('menu-prefs-label');
  els.burgerMenu = document.getElementById('burger-menu');
  els.burgerBtn = document.getElementById('burger-btn');
  els.headerControls = document.getElementById('header-controls');

  els.guideEyebrow = document.getElementById('guide-eyebrow');
  els.guideTitle = document.getElementById('guide-title');
  els.guideSubtitle = document.getElementById('guide-subtitle');

  els.gameButtons = document.querySelectorAll('.wiki-tab');
  els.searchInput = document.getElementById('search-input');

  els.regionsTitle = document.getElementById('regions-title');
  els.regionsFoundCount = document.getElementById('regions-found-count');
  els.regionsShownLabel = document.getElementById('regions-shown-label');
  els.accordion = document.getElementById('accordion');
  els.emptyState = document.getElementById('empty-state');
}

function t(key) {
  return (i18n[state.lang] && i18n[state.lang][key]) || i18n.en[key] || '';
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

async function fetchGameData() {
  const [eldenSnap, shadowSnap, translationsSnap] = await Promise.all([
    db.collection('gameData').doc('eldenring').get(),
    db.collection('gameData').doc('shadowerdtree').get(),
    db.collection('gameData').doc('translations').get()
  ]);

  if (!eldenSnap.exists || !shadowSnap.exists) {
    throw new Error('Boss data not found in Firestore.');
  }

  const translations = translationsSnap.exists ? translationsSnap.data() : {};

  return {
    eldenRingRegions: eldenSnap.data().regions,
    shadowErdtreeRegions: shadowSnap.data().regions,
    nameTranslations: {
      ru: {
        regions: (translations.ru && translations.ru.regions) || {},
        bosses: (translations.ru && translations.ru.bosses) || {}
      },
      kk: {
        regions: (translations.kk && translations.kk.regions) || {},
        bosses: (translations.kk && translations.kk.bosses) || {}
      }
    }
  };
}

function getRegionName(region) {
  const table = nameTranslations[state.lang];
  if (table && table.regions[region.id]) return table.regions[region.id];
  return region.name;
}

function getBossName(boss) {
  const table = nameTranslations[state.lang];
  if (table && table.bosses[boss.id]) return table.bosses[boss.id];
  return boss.name;
}

function getActiveRegions() {
  const game = games[state.activeGame];
  return game ? game.regions : [];
}

function matchesSearch(boss) {
  const term = state.searchTerm.trim().toLowerCase();
  if (!term) return true;
  return getBossName(boss).toLowerCase().includes(term) || boss.name.toLowerCase().includes(term);
}

function buildAccordion() {
  els.accordion.innerHTML = '';
  let visibleRegionCount = 0;
  const hasSearch = state.searchTerm.trim().length > 0;

  getActiveRegions().forEach((region, regionIndex) => {
    const visibleBosses = region.bosses.filter(matchesSearch);
    if (hasSearch && visibleBosses.length === 0) return;
    visibleRegionCount += 1;

    const bossesToRender = hasSearch ? visibleBosses : region.bosses;

    const section = document.createElement('article');
    section.className = 'wiki-region';
    section.style.animationDelay = (regionIndex * 40) + 'ms';

    section.innerHTML = `
      <div class="wiki-region-head">
        <span class="wiki-region-index">${String(regionIndex + 1).padStart(2, '0')}</span>
        <h3 class="wiki-region-name">${getRegionName(region)}</h3>
        <span class="wiki-region-count">${region.bosses.length} <span class="wiki-region-count-label">${t('bossesCount')}</span></span>
      </div>
      <div class="wiki-boss-list"></div>
    `;

    const list = section.querySelector('.wiki-boss-list');

    if (bossesToRender.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'wiki-region-empty';
      empty.textContent = t('noMatch');
      list.appendChild(empty);
    } else {
      bossesToRender.forEach((boss, index) => {
        list.appendChild(createBossTile(boss, index));
      });
    }

    els.accordion.appendChild(section);
  });

  if (els.regionsFoundCount) {
    els.regionsFoundCount.textContent = visibleRegionCount;
  }

  els.emptyState.hidden = visibleRegionCount !== 0;
  els.emptyState.textContent = t('noneFound');
}

function createBossTile(boss, index) {
  const link = document.createElement('a');
  link.className = 'wiki-boss-row';
  link.href = `wiki-boss.html?id=${encodeURIComponent(boss.id)}`;
  link.style.animationDelay = (index * 18) + 'ms';

  link.innerHTML = `
    <span class="wiki-boss-row-index" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
    <span class="wiki-boss-row-name">${getBossName(boss)}</span>
    <svg class="wiki-boss-row-arrow" width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6"/></svg>
  `;

  return link;
}

function applyLanguage(lang) {
  state.lang = lang;
  els.html.setAttribute('lang', lang);
  document.title = t('docTitle');

  if (els.langOptions) {
    els.langOptions.forEach((btn) => {
      const active = btn.dataset.lang === lang;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-checked', String(active));
    });
  }

  if (els.brandEyebrow) els.brandEyebrow.textContent = t('brandEyebrow');
  if (els.guideEyebrow) els.guideEyebrow.textContent = t('guideEyebrow');
  if (els.guideTitle) els.guideTitle.textContent = t('guideTitle');
  if (els.guideSubtitle) els.guideSubtitle.textContent = t('guideSubtitle');
  if (els.searchInput) els.searchInput.placeholder = t('searchPlaceholder');
  if (els.regionsTitle) els.regionsTitle.textContent = t('regionsTitle');
  if (els.regionsShownLabel) els.regionsShownLabel.textContent = t('shown');
  if (els.themeToggle) els.themeToggle.setAttribute('aria-label', t('themeLabel'));
  if (els.menuAccountLabel) els.menuAccountLabel.textContent = t('menuAccountLabel');
  if (els.menuPrefsLabel) els.menuPrefsLabel.textContent = t('menuPrefsLabel');

  els.gameButtons.forEach((btn) => {
    const key = btn.dataset.game === 'shadowerdtree' ? 'gameShadowErdtree' : 'gameEldenRing';
    btn.textContent = t(key);
  });

  buildAccordion();

  if (window.AuthWidget) window.AuthWidget.setLanguage(lang);
}

function applyTheme(theme) {
  state.theme = theme;
  els.html.setAttribute('data-theme', theme);
  if (els.themeToggle) els.themeToggle.setAttribute('aria-pressed', String(theme === 'light'));
  savePreference(THEME_KEY, theme);
}

function setActiveGame(game) {
  state.activeGame = game;
  savePreference(GAME_KEY, game);
  els.gameButtons.forEach((btn) => {
    const active = btn.dataset.game === game;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', String(active));
  });
  buildAccordion();
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

function closeBurgerMenu() {
  if (!els.headerControls) return;
  els.headerControls.classList.remove('mobile-open');
  if (els.burgerBtn) els.burgerBtn.setAttribute('aria-expanded', 'false');
}

function toggleBurgerMenu() {
  if (!els.headerControls) return;
  const willOpen = !els.headerControls.classList.contains('mobile-open');
  els.headerControls.classList.toggle('mobile-open', willOpen);
  if (els.burgerBtn) els.burgerBtn.setAttribute('aria-expanded', String(willOpen));
}

function attachEvents() {
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
  if (els.themeToggle) {
    els.themeToggle.addEventListener('click', () => {
      applyTheme(state.theme === 'light' ? 'dark' : 'light');
    });
  }
  if (els.burgerBtn) {
    els.burgerBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleBurgerMenu();
    });
  }
  if (els.gameButtons) {
    els.gameButtons.forEach((btn) => {
      btn.addEventListener('click', () => setActiveGame(btn.dataset.game));
    });
  }
  if (els.searchInput) {
    els.searchInput.addEventListener('input', (event) => {
      state.searchTerm = event.target.value;
      buildAccordion();
    });
  }

  document.addEventListener('click', (event) => {
    if (els.langFilterPanel && !els.langFilterPanel.hidden) {
      const container = document.getElementById('lang-filter');
      if (container && !container.contains(event.target)) closeLangPanel();
    }
    if (els.headerControls && els.headerControls.classList.contains('mobile-open')) {
      if (els.burgerMenu && !els.burgerMenu.contains(event.target)) closeBurgerMenu();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeLangPanel();
      closeBurgerMenu();
    }
  });
}

async function init() {
  cacheDom();
  attachEvents();

  const savedTheme = loadPreference(THEME_KEY, 'dark', ['dark', 'light']);
  applyTheme(savedTheme);

  state.activeGame = loadPreference(GAME_KEY, 'eldenring', ['eldenring', 'shadowerdtree']);
  els.gameButtons.forEach((btn) => {
    const active = btn.dataset.game === state.activeGame;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', String(active));
  });

  const savedLang = loadPreference(LANG_KEY, 'en', ['en', 'ru', 'kk']);

  if (window.AuthWidget) {
    window.AuthWidget.init('en', { onBeforeOpen: closeBurgerMenu, onAuthChange: null });
  }

  try {
    const data = await fetchGameData();
    games = {
      eldenring: { id: 'eldenring', regions: data.eldenRingRegions },
      shadowerdtree: { id: 'shadowerdtree', regions: data.shadowErdtreeRegions }
    };
    nameTranslations = data.nameTranslations;
  } catch (err) {
    console.error('Failed to load boss data from Firebase:', err);
    if (els.accordion) {
      els.accordion.innerHTML = '<p class="no-results">Could not load boss data from the database. Check your connection and reload the page.</p>';
    }
    applyLanguage(savedLang);
    requestAnimationFrame(() => document.body.classList.add('is-ready'));
    return;
  }

  applyLanguage(savedLang);
  requestAnimationFrame(() => document.body.classList.add('is-ready'));
}

document.addEventListener('DOMContentLoaded', init);
