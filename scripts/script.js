'use strict';

const STORAGE_KEY = 'eldenRingBossChecklist';
const THEME_KEY = 'eldenRingBossChecklistTheme';
const LANG_KEY = 'eldenRingBossChecklistLang';
const GAME_KEY = 'eldenRingBossChecklistGame';
const CATEGORY_FILTER_KEY = 'eldenRingBossChecklistCategories';

/* Region-level pagination for the accordion — mirrors wiki.js's scheme:
   regions are shown REGION_PAGE_SIZE at a time behind a "Show more" button,
   client-side over data already synced via onSnapshot. Search bypasses
   pagination entirely (all matching regions show at once). */
const REGION_PAGE_SIZE = 5;

/* Boss categories for the category filter. Bosses aren't tagged with these
   yet (that mapping comes later), so matchesCategoryFilter() treats any
   boss without a `categories` array as always visible — the filter is
   wired up and ready, it just has nothing to narrow down until the data
   carries category tags. */
const BOSS_CATEGORIES = ['story', 'hard', 'quest', 'optional'];

/* How many recent completions to keep around for the personal cabinet's
   "Recent activity" feed (profile.js reads this back from
   users/{uid}.history). Newest first; trimmed on every write so the
   Firestore document doesn't grow without bound. */
const HISTORY_LIMIT = 20;


let games = {};
/* Name translations for boss/region names, keyed by language code (ru, kk).
   English uses the names baked into the boss/region data itself, so there
   is no 'en' entry here. */
let nameTranslations = { ru: { regions: {}, bosses: {} }, kk: { regions: {}, bosses: {} } };

/* ==========================================================================
   Account-tied progress
   --------------------------------------------------------------------------
   Progress lives in one of two places depending on whether the visitor is
   signed in:
     - Signed OUT (guest): the classic per-browser localStorage blob
       (STORAGE_KEY) — unchanged behaviour from before accounts existed.
     - Signed IN: Firestore, under users/{uid}.progress (an array of boss
       ids), fetched on login and saved on every change. This is what
       makes progress follow the account rather than the browser.
   Logging out clears the on-screen checklist back to empty rather than
   falling back to whatever guest progress happens to be sitting in
   localStorage — a real account's progress is only ever visible while
   that account is signed in. `authInitialized` distinguishes the very
   first auth callback (page load — could resolve to a guest OR an
   already-logged-in session) from a later transition (an actual
   login/logout while the page is open), since only the latter should
   reset the screen on sign-out. `gameDataLoaded` defers applying an
   auth state that arrives before the boss data has finished loading. */
let gameDataLoaded = false;
let authInitialized = false;
let pendingAuthState = null;
let saveAccountProgressTimer = null;

/* UI string dictionary */
const i18n = {
  en: {
    eyebrow: 'Boss Checklist',
    title: 'Elden Ring Boss Checklist',
    reset: 'Reset progress',
    searchPlaceholder: 'Search a boss by name…',
    filterAll: 'All',
    filterRemaining: 'Remaining',
    filterCompleted: 'Completed',
    regionsTitle: 'Regions',
    shown: 'shown',
    defeated: 'bosses defeated',
    cleared: 'cleared',
    remaining: 'remaining',
    gameEldenRing: 'Elden Ring',
    gameShadowErdtree: 'Shadow of the Erdtree',
    selectAll: 'Select All Bosses',
    deselectAll: 'Deselect All Bosses',
    noneFound: 'Nothing found. Try a different search term.',
    noMatch: 'No bosses match this filter.',
    footer: 'Progress is saved automatically in this browser.',
    footerAccount: 'Progress is saved automatically to your account.',
    resetConfirm: 'Reset all boss progress? This cannot be undone.',
    themeToggle: 'Toggle dark or light theme',
    categoryFilterLabel: 'Filter by category',
    categoryStory: 'Story bosses',
    categoryHard: 'Hard bosses',
    categoryQuest: 'Quest bosses',
    categoryOptional: 'Optional bosses',
    languageLabel: 'Language',
    menuAccountLabel: 'Account',
    menuPrefsLabel: 'Preferences',
    sortLabel: 'Sort by',
    sortDefault: 'Default order',
    sortName: 'Name (A–Z)',
    sortBossCount: 'Boss count',
    loadMoreLabel: 'Show more',
  },
  ru: {
    eyebrow: 'Чек-лист боссов',
    title: 'Чек-лист боссов Elden Ring',
    reset: 'Сбросить прогресс',
    searchPlaceholder: 'Поиск босса по имени…',
    filterAll: 'Все',
    filterRemaining: 'Не пройдены',
    filterCompleted: 'Пройдены',
    regionsTitle: 'Регионы',
    shown: 'показано',
    defeated: 'боссов повержено',
    cleared: 'пройдено',
    remaining: 'осталось',
    gameEldenRing: 'Elden Ring',
    gameShadowErdtree: 'Shadows of the Erdtree',
    selectAll: 'Выделить всех боссов',
    deselectAll: 'Снять отметки со всех боссов',
    noneFound: 'Ничего не найдено. Попробуйте другой запрос.',
    noMatch: 'Нет боссов, подходящих под фильтр.',
    footer: 'Прогресс сохраняется автоматически в этом браузере.',
    footerAccount: 'Прогресс сохраняется автоматически в вашем аккаунте.',
    resetConfirm: 'Сбросить весь прогресс по боссам? Это действие необратимо.',
    themeToggle: 'Переключить тёмную или светлую тему',
    categoryFilterLabel: 'Фильтр по категориям',
    categoryStory: 'Сюжетные боссы',
    categoryHard: 'Сложные боссы',
    categoryQuest: 'Квестовые боссы',
    categoryOptional: 'Необязательные боссы',
    languageLabel: 'Язык',
    menuAccountLabel: 'Аккаунт',
    menuPrefsLabel: 'Настройки',
    sortLabel: 'Сортировка',
    sortDefault: 'По умолчанию',
    sortName: 'По имени (А–Я)',
    sortBossCount: 'По числу боссов',
    loadMoreLabel: 'Показать ещё',
  },
  kk: {
    eyebrow: 'Боссы чек-листі',
    title: 'Elden Ring боссы чек-листі',
    reset: 'Прогресті тастау',
    searchPlaceholder: 'Боссты аты бойынша іздеу…',
    filterAll: 'Барлығы',
    filterRemaining: 'Жеңілмеген',
    filterCompleted: 'Жеңілген',
    regionsTitle: 'Аймақтар',
    shown: 'көрсетілген',
    defeated: 'босс жеңілді',
    cleared: 'өтілді',
    remaining: 'қалды',
    gameEldenRing: 'Elden Ring',
    gameShadowErdtree: 'Shadow of the Erdtree',
    selectAll: 'Барлық боссты белгілеу',
    deselectAll: 'Барлық боссынан белгіні алу',
    noneFound: 'Ештеңе табылмады. Басқа сөз бойынша іздеп көріңіз.',
    noMatch: 'Бұл сүзгіге сәйкес босс жоқ.',
    footer: 'Прогресс осы браузерде автоматты түрде сақталады.',
    footerAccount: 'Прогресс аккаунтыңызда автоматты түрде сақталады.',
    resetConfirm: 'Боссылар бойынша барлық прогресті тастау керек пе? Бұл әрекетті болдырмау мүмкін емес.',
    themeToggle: 'Қараңғы немесе ашық тақырыпты ауыстыру',
    categoryFilterLabel: 'Санат бойынша сүзу',
    categoryStory: 'Сюжеттік боссылар',
    categoryHard: 'Қиын боссылар',
    categoryQuest: 'Тапсырма боссылары',
    categoryOptional: 'Міндетті емес боссылар',
    languageLabel: 'Тіл',
    menuAccountLabel: 'Аккаунт',
    menuPrefsLabel: 'Баптаулар',
    sortLabel: 'Сұрыптау',
    sortDefault: 'Әдепкі рет',
    sortName: 'Аты бойынша (А–Я)',
    sortBossCount: 'Босс саны бойынша',
    loadMoreLabel: 'Көбірек көрсету',
  }
};

/* ==========================================================================
   State
   ========================================================================== */

const state = {
  filter: 'all',
  searchTerm: '',
  completed: new Set(),
  /* Account-only: {id, at}[], newest first — see HISTORY_LIMIT above.
     Stays empty for guests (the personal cabinet is login-only, so
     there's nowhere to show it, and no reason to grow localStorage). */
  history: [],
  openRegions: {
    eldenring: new Set(),
    shadowerdtree: new Set()
  },
  lang: 'en',
  theme: 'dark',
  activeGame: 'eldenring',
  categoryFilters: new Set(BOSS_CATEGORIES),
  sortBy: 'default',
  visibleRegions: REGION_PAGE_SIZE
};

const els = {};

function cacheDom() {
  els.html = document.documentElement;
  els.accordion = document.getElementById('accordion');
  els.searchInput = document.getElementById('search-input');
  els.filterButtons = document.querySelectorAll('.filter-btn');
  els.resetBtn = document.getElementById('reset-btn');
  els.resetLabel = document.getElementById('reset-label');
  els.menuAccountLabel = document.getElementById('menu-account-label');
  els.menuPrefsLabel = document.getElementById('menu-prefs-label');
  els.categoryFilterBtn = document.getElementById('category-filter-btn');
  els.categoryFilterPanel = document.getElementById('category-filter-panel');
  els.categoryCheckboxes = document.querySelectorAll('.category-checkbox');
  els.catLabelStory = document.getElementById('cat-label-story');
  els.catLabelHard = document.getElementById('cat-label-hard');
  els.catLabelQuest = document.getElementById('cat-label-quest');
  els.catLabelOptional = document.getElementById('cat-label-optional');
  els.completedCount = document.getElementById('completed-count');
  els.totalCount = document.getElementById('total-count');
  els.overallBar = document.getElementById('overall-bar');
  els.chartFill = document.getElementById('chart-fill');
  els.chartPercent = document.getElementById('chart-percent');
  els.chartCaption = document.getElementById('chart-caption-label');
  els.emptyState = document.getElementById('empty-state');
  els.regionsFoundCount = document.getElementById('regions-found-count');
  els.regionsShownLabel = document.getElementById('regions-shown-label');
  els.regionsTitle = document.getElementById('regions-title');
  els.remainingCount = document.getElementById('remaining-count');
  els.remainingLabel = document.getElementById('remaining-label');
  els.statCaption = document.getElementById('stat-caption');
  els.brandEyebrow = document.getElementById('brand-eyebrow');
  els.brandTitle = document.getElementById('brand-title');
  els.footerText = document.getElementById('footer-text');
  els.themeToggle = document.getElementById('theme-toggle');
  els.langFilterBtn = document.getElementById('lang-filter-btn');
  els.langFilterPanel = document.getElementById('lang-filter-panel');
  els.langOptions = document.querySelectorAll('.lang-option');
  els.gameButtons = document.querySelectorAll('.game-switch-btn');
  els.burgerMenu = document.getElementById('burger-menu');
  els.burgerBtn = document.getElementById('burger-btn');
  els.headerControls = document.getElementById('header-controls');
  els.sortLabel = document.getElementById('sort-label');
  els.sortSelect = document.getElementById('sort-select');
  els.loadMoreBtn = document.getElementById('load-more-btn');
  els.loadMoreLabel = document.getElementById('load-more-label');
}

/* ==========================================================================
   Remote data — boss & region names + Russian translations live in Firestore
   ========================================================================== */

/* Live boss data — the admin panel writes straight to these same three
   docs, and onSnapshot means every open checklist tab picks up an edit
   immediately: the FIRST snapshot from each doc resolves `init()`'s
   startup exactly like the old one-time `.get()` did (same shape, same
   error if eldenring/shadowerdtree are missing); every snapshot after
   that just rebuilds the currently-visible accordion in place, without
   touching theme/language/open-region state. */
let latestEldenSnap = null;
let latestShadowSnap = null;
let latestTranslationsSnap = null;
let gameDataFirstLoadDone = false;
let resolveGameDataFirstLoad = null;

function buildGameDataFromSnapshots() {
  const translations = (latestTranslationsSnap && latestTranslationsSnap.exists) ? latestTranslationsSnap.data() : {};
  return {
    eldenRingRegions: latestEldenSnap.data().regions,
    shadowErdtreeRegions: latestShadowSnap.data().regions,
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

function handleGameDataSnapshotUpdate() {
  if (!latestEldenSnap || !latestShadowSnap) return;

  if (!latestEldenSnap.exists || !latestShadowSnap.exists) {
    if (!gameDataFirstLoadDone) {
      gameDataFirstLoadDone = true;
      resolveGameDataFirstLoad({ error: new Error('Boss data not found in Firestore — run seed.html once to upload it.') });
    }
    return;
  }

  const data = buildGameDataFromSnapshots();

  if (!gameDataFirstLoadDone) {
    gameDataFirstLoadDone = true;
    resolveGameDataFirstLoad({ data });
    return;
  }

  games = {
    eldenring: { id: 'eldenring', regions: data.eldenRingRegions },
    shadowerdtree: { id: 'shadowerdtree', regions: data.shadowErdtreeRegions }
  };
  nameTranslations = data.nameTranslations;
  buildAccordion();
  updateProgress();
}

function handleGameDataSnapshotError(err) {
  console.error('Failed to load boss data from Firebase:', err);
  if (!gameDataFirstLoadDone) {
    gameDataFirstLoadDone = true;
    resolveGameDataFirstLoad({ error: err });
  }
}

function subscribeGameData() {
  const firstLoad = new Promise((resolve) => { resolveGameDataFirstLoad = resolve; });
  db.collection('gameData').doc('eldenring').onSnapshot((snap) => {
    latestEldenSnap = snap;
    handleGameDataSnapshotUpdate();
  }, handleGameDataSnapshotError);
  db.collection('gameData').doc('shadowerdtree').onSnapshot((snap) => {
    latestShadowSnap = snap;
    handleGameDataSnapshotUpdate();
  }, handleGameDataSnapshotError);
  db.collection('gameData').doc('translations').onSnapshot((snap) => {
    latestTranslationsSnap = snap;
    handleGameDataSnapshotUpdate();
  }, handleGameDataSnapshotError);
  return firstLoad;
}

/* ==========================================================================
   Authentication — email/password sign in & sign up via Firebase Auth
   ========================================================================== */

/* The auth modal / account modal text itself is refreshed by
   scripts/auth.js (AuthWidget.setLanguage) — this just covers the two
   burger-menu section headers ("Preferences" / "Account"), which are
   plain menu chrome outside auth.js's scope. */
function refreshFooterText() {
  if (!els.footerText) return;
  const loggedIn = !!(window.AuthWidget && window.AuthWidget.isLoggedIn());
  els.footerText.textContent = t(loggedIn ? 'footerAccount' : 'footer');
}

function refreshMenuSectionText() {
  if (els.menuAccountLabel) els.menuAccountLabel.textContent = t('menuAccountLabel');
  if (els.menuPrefsLabel) els.menuPrefsLabel.textContent = t('menuPrefsLabel');
}

function refreshCategoryFilterText() {
  if (els.categoryFilterBtn) els.categoryFilterBtn.setAttribute('aria-label', t('categoryFilterLabel'));
  if (els.catLabelStory) els.catLabelStory.textContent = t('categoryStory');
  if (els.catLabelHard) els.catLabelHard.textContent = t('categoryHard');
  if (els.catLabelQuest) els.catLabelQuest.textContent = t('categoryQuest');
  if (els.catLabelOptional) els.catLabelOptional.textContent = t('categoryOptional');
}

function refreshLangFilterText() {
  if (els.langFilterBtn) {
    els.langFilterBtn.setAttribute('aria-label', t('languageLabel'));
    els.langFilterBtn.setAttribute('title', t('languageLabel'));
  }
}

/* ==========================================================================
   Category filter — dropdown of boss categories (story/hard/quest/optional).
   Bosses aren't tagged with categories yet, so this only narrows the list
   once that data exists; see matchesCategoryFilter() below.
   ========================================================================== */

function loadCategoryFilters() {
  try {
    const raw = localStorage.getItem(CATEGORY_FILTER_KEY);
    if (!raw) return new Set(BOSS_CATEGORIES);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set(BOSS_CATEGORIES);
    const valid = parsed.filter((c) => BOSS_CATEGORIES.includes(c));
    return valid.length ? new Set(valid) : new Set(BOSS_CATEGORIES);
  } catch (err) {
    return new Set(BOSS_CATEGORIES);
  }
}

function saveCategoryFilters() {
  try {
    localStorage.setItem(CATEGORY_FILTER_KEY, JSON.stringify(Array.from(state.categoryFilters)));
  } catch (err) {
    /* storage unavailable */
  }
}

function matchesCategoryFilter(boss) {
  if (!Array.isArray(boss.categories) || boss.categories.length === 0) return true;
  return boss.categories.some((category) => state.categoryFilters.has(category));
}

function refreshCategoryFilterButtonState() {
  if (!els.categoryFilterBtn) return;
  const allSelected = state.categoryFilters.size === BOSS_CATEGORIES.length;
  els.categoryFilterBtn.classList.toggle('has-active-filter', !allSelected);
}

function openCategoryPanel() {
  if (!els.categoryFilterPanel) return;
  els.categoryFilterPanel.hidden = false;
  if (els.categoryFilterBtn) els.categoryFilterBtn.setAttribute('aria-expanded', 'true');
}

function closeCategoryPanel() {
  if (!els.categoryFilterPanel) return;
  els.categoryFilterPanel.hidden = true;
  if (els.categoryFilterBtn) els.categoryFilterBtn.setAttribute('aria-expanded', 'false');
}

function toggleCategoryPanel() {
  if (!els.categoryFilterPanel) return;
  if (els.categoryFilterPanel.hidden) openCategoryPanel();
  else closeCategoryPanel();
}

/* The login/account modals themselves (open/close, form submit, avatar
   upload, sign-out) are all wired up by scripts/auth.js's own
   attachAuthEvents — this just closes the burger menu first when either
   button is the thing that opened them, and handles Escape for the
   controls that are local to this page (auth.js already handles Escape
   for its own modals). */
function attachMenuEvents() {
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (els.categoryFilterPanel && !els.categoryFilterPanel.hidden) closeCategoryPanel();
    if (els.langFilterPanel && !els.langFilterPanel.hidden) closeLangPanel();
    if (els.headerControls && els.headerControls.classList.contains('mobile-open')) closeBurgerMenu();
  });
}

/* ==========================================================================
   Mobile burger menu — collapses language/theme/account into one menu
   below the responsive breakpoint (see the CSS note by .burger-menu for
   why it needs its own positioning wrapper).
   ========================================================================== */

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

/* ==========================================================================
   Language filter — globe icon dropdown, mirrors the category filter's
   open/close/outside-click pattern.
   ========================================================================== */

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
}

function attachCategoryFilterEvents() {
  if (els.categoryFilterBtn) {
    els.categoryFilterBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleCategoryPanel();
    });
  }
  if (els.categoryCheckboxes) {
    els.categoryCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          state.categoryFilters.add(checkbox.value);
        } else {
          state.categoryFilters.delete(checkbox.value);
        }
        saveCategoryFilters();
        refreshCategoryFilterButtonState();
        buildAccordion();
      });
    });
  }
  document.addEventListener('click', (event) => {
    if (!els.categoryFilterPanel || els.categoryFilterPanel.hidden) return;
    const container = document.getElementById('category-filter');
    if (container && !container.contains(event.target)) closeCategoryPanel();
  });
}

/* ==========================================================================
   Persistence
   ========================================================================== */

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => typeof id === 'string'));
  } catch (err) {
    return new Set();
  }
}

/* Records (or refreshes) a "completed" moment for the personal
   cabinet's Recent activity feed. Newest-first, deduplicated (a boss
   toggled off and back on again just moves back to the top rather
   than appearing twice), capped at HISTORY_LIMIT. Guest state.history
   updates too (harmless — it's simply never persisted or read back
   for a signed-out visitor). */
function recordHistory(bossId) {
  state.history = state.history.filter((entry) => entry.id !== bossId);
  state.history.unshift({ id: bossId, at: Date.now() });
  if (state.history.length > HISTORY_LIMIT) state.history.length = HISTORY_LIMIT;
}

/* Un-completing a boss drops it from the feed too — "recent activity"
   should only ever list bosses that are still marked defeated. */
function removeHistory(bossId) {
  state.history = state.history.filter((entry) => entry.id !== bossId);
}

function saveProgress() {
  if (window.AuthWidget && window.AuthWidget.isLoggedIn()) {
    saveAccountProgress();
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(state.completed)));
  } catch (err) {
    /* storage unavailable */
  }
}

/* Debounced so rapid-fire changes (select-all on a big region) don't
   fire a Firestore write per checkbox. */
function saveAccountProgress() {
  const user = window.AuthWidget.getUser();
  if (!user) return;
  if (saveAccountProgressTimer) window.clearTimeout(saveAccountProgressTimer);
  saveAccountProgressTimer = window.setTimeout(() => {
    db.collection('users').doc(user.uid).set(
      { progress: Array.from(state.completed), history: state.history },
      { merge: true }
    ).catch((err) => console.error('Failed to save progress to account:', err));
  }, 400);
}

async function loadAccountProgress(uid) {
  try {
    const snap = await db.collection('users').doc(uid).get();
    const data = snap.exists ? snap.data() : null;
    const list = data && Array.isArray(data.progress) ? data.progress : [];
    const historyList = data && Array.isArray(data.history) ? data.history : [];
    const completed = new Set(list.filter((id) => typeof id === 'string'));
    const history = historyList.filter((entry) => entry && typeof entry.id === 'string' && typeof entry.at === 'number');
    return { completed, history };
  } catch (err) {
    console.error('Failed to load account progress:', err);
    return { completed: new Set(), history: [] };
  }
}

/* Called by AuthWidget every time sign-in state changes (including once,
   asynchronously, right after page load). See the block comment above
   `gameDataLoaded` for the full reasoning. */
function handleAuthChange(user, profile) {
  const isFirstCall = !authInitialized;
  authInitialized = true;

  if (!gameDataLoaded) {
    pendingAuthState = { user, isFirstCall };
    return;
  }
  applyAuthState(user, isFirstCall);
}

async function applyAuthState(user, isFirstCall) {
  if (user) {
    const data = await loadAccountProgress(user.uid);
    state.completed = data.completed;
    state.history = data.history;
  } else if (!isFirstCall) {
    /* A real sign-out while the page is open: the checklist resets to
       empty rather than exposing whatever guest progress is stored
       locally — the account's own progress isn't meant to leak into a
       signed-out view once it's been shown. */
    state.completed = new Set();
    state.history = [];
  }
  /* (no user, isFirstCall) — a guest on page load — is left untouched;
     `state.completed` already holds whatever loadProgress() read from
     localStorage during init(). */
  refreshFooterText();
  buildAccordion();
  updateProgress();
}

function loadPreference(key, fallback, validValues) {
  try {
    const value = localStorage.getItem(key);
    if (value && validValues.includes(value)) return value;
  } catch (err) {
    /* ignore */
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

/* ==========================================================================
   Localization helpers
   ========================================================================== */

function t(key) {
  return i18n[state.lang][key];
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

/* ==========================================================================
   Data helpers
   ========================================================================== */

function getActiveRegions() {
  return games[state.activeGame].regions;
}

function getAllBosses(gameId) {
  const list = [];
  games[gameId || state.activeGame].regions.forEach((region) => {
    region.bosses.forEach((boss) => list.push({ ...boss, regionId: region.id, regionName: region.name }));
  });
  return list;
}

function getTotals(bossArray) {
  const total = bossArray.length;
  const done = bossArray.filter((b) => state.completed.has(b.id)).length;
  return { total, done };
}

function matchesFilter(boss) {
  if (state.filter === 'completed') return state.completed.has(boss.id);
  if (state.filter === 'remaining') return !state.completed.has(boss.id);
  return true;
}

function matchesSearch(boss) {
  const term = state.searchTerm.trim().toLowerCase();
  if (!term) return true;
  return getBossName(boss).toLowerCase().includes(term);
}

/* Client-side sort + pagination over the regions already synced via
   onSnapshot — see the REGION_PAGE_SIZE comment near the top of this
   file for why this stays client-side rather than moving to Firestore
   .orderBy()/.limit() queries. */
function getSortedRegions(regions) {
  const sorted = regions.slice();
  if (state.sortBy === 'name') {
    sorted.sort((a, b) => getRegionName(a).localeCompare(getRegionName(b), state.lang));
  } else if (state.sortBy === 'bossCount') {
    sorted.sort((a, b) => b.bosses.length - a.bosses.length);
  }
  return sorted;
}

/* ==========================================================================
   Rendering — accordion
   ========================================================================== */

function buildAccordion() {
  els.accordion.innerHTML = '';
  let visibleRegionCount = 0;
  const openRegions = state.openRegions[state.activeGame];
  const isSearching = state.searchTerm.trim().length > 0;
  const allRegions = getSortedRegions(getActiveRegions());
  const pagedRegions = isSearching ? allRegions : allRegions.slice(0, state.visibleRegions);

  pagedRegions.forEach((region, regionIndex) => {
    const { total, done } = getTotals(region.bosses);
    const pct = total ? Math.round((done / total) * 100) : 0;
    const visibleBosses = region.bosses.filter((b) => matchesSearch(b) && matchesFilter(b) && matchesCategoryFilter(b));
    const hasSearch = state.searchTerm.trim().length > 0;

    if (hasSearch && visibleBosses.length === 0) return;
    visibleRegionCount += 1;

    const isOpen = hasSearch ? true : openRegions.has(region.id);
    const finished = total > 0 && done === total;

    const item = document.createElement('article');
    item.className = 'accordion-item' + (finished ? ' is-finished' : '');
    item.style.animationDelay = (regionIndex * 40) + 'ms';

    const headerId = 'header-' + region.id;
    const panelId = 'panel-' + region.id;
    const allDoneInRegion = total > 0 && done === total;
    const selectAllLabel = allDoneInRegion ? t('deselectAll') : t('selectAll');

    item.innerHTML = `
      <h3 class="accordion-heading">
        <button type="button" class="accordion-trigger" id="${headerId}" aria-expanded="${isOpen}" aria-controls="${panelId}" data-region-id="${region.id}">
          <span class="trigger-main">
            <span class="region-dot" aria-hidden="true"></span>
            <span class="region-name">${getRegionName(region)}</span>
          </span>
          <span class="trigger-meta">
            ${finished ? '<span class="region-complete-badge" aria-hidden="true"><svg width="10" height="8" viewBox="0 0 13 10"><path d="M1 5.2 4.6 8.5 12 1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' : ''}
            <span class="region-count">${done}<span class="count-sep">/</span>${total}</span>
            <span class="region-mini-bar"><span class="region-mini-fill" style="width:${pct}%"></span></span>
            <svg class="chevron" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6"/></svg>
          </span>
        </button>
      </h3>
      <div class="accordion-content ${isOpen ? 'is-open' : ''}" id="${panelId}" role="region" aria-labelledby="${headerId}">
        <div class="accordion-inner">
          <div class="accordion-toolbar">
            <button type="button" class="select-all-btn" data-region-id="${region.id}" aria-pressed="${allDoneInRegion}">
              <svg class="select-all-icon" width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="m7.5 12.5 3 3 6-6.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span class="select-all-label">${selectAllLabel}</span>
            </button>
          </div>
          <ol class="boss-list"></ol>
        </div>
      </div>
    `;

    const list = item.querySelector('.boss-list');
    const bossesToRender = hasSearch ? visibleBosses : region.bosses.filter((b) => matchesFilter(b) && matchesCategoryFilter(b));

    if (bossesToRender.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'boss-empty';
      empty.textContent = t('noMatch');
      list.appendChild(empty);
    } else {
      bossesToRender.forEach((boss, index) => {
        list.appendChild(createBossRow(boss, index));
      });
    }

    const trigger = item.querySelector('.accordion-trigger');
    trigger.addEventListener('click', () => toggleRegion(region.id));

    const selectAllBtn = item.querySelector('.select-all-btn');
    selectAllBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleSelectAll(region.id);
    });

    els.accordion.appendChild(item);
  });

  if (els.regionsFoundCount) {
    els.regionsFoundCount.textContent = visibleRegionCount;
  }

  els.emptyState.hidden = visibleRegionCount !== 0;
  els.emptyState.textContent = t('noneFound');

  if (els.loadMoreBtn) {
    els.loadMoreBtn.hidden = isSearching || state.visibleRegions >= allRegions.length;
  }
}

function createBossRow(boss, index) {
  const isDone = state.completed.has(boss.id);
  const li = document.createElement('li');
  li.className = 'boss-row' + (isDone ? ' completed' : '');
  li.style.animationDelay = (index * 22) + 'ms';

  li.innerHTML = `
    <label class="boss-label" for="chk-${boss.id}">
      <span class="boss-number" aria-hidden="true">${index + 1}</span>
      <span class="boss-checkbox-wrap">
        <input type="checkbox" id="chk-${boss.id}" class="boss-checkbox" ${isDone ? 'checked' : ''} />
        <span class="boss-checkbox-visual" aria-hidden="true">
          <svg width="13" height="10" viewBox="0 0 13 10"><path d="M1 5.2 4.6 8.5 12 1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
      </span>
      <span class="boss-name-wrap">
        <span class="boss-name">${getBossName(boss)}</span>
      </span>
    </label>
  `;

  const checkbox = li.querySelector('input');
  checkbox.addEventListener('change', () => toggleBoss(boss.id, li));

  return li;
}

/* ==========================================================================
   Actions
   ========================================================================== */

function toggleBoss(bossId, rowEl) {
  const nowDone = !state.completed.has(bossId);
  if (nowDone) {
    state.completed.add(bossId);
    recordHistory(bossId);
  } else {
    state.completed.delete(bossId);
    removeHistory(bossId);
  }

  if (rowEl) {
    rowEl.classList.toggle('completed', nowDone);
    rowEl.classList.add('just-toggled');
    window.setTimeout(() => rowEl.classList.remove('just-toggled'), 420);
  }

  saveProgress();

  if (state.filter !== 'all') {
    buildAccordion();
  } else {
    refreshRegionMeta();
  }
  updateProgress();
}

function toggleSelectAll(regionId) {
  const region = getActiveRegions().find((r) => r.id === regionId);
  if (!region) return;

  const { total, done } = getTotals(region.bosses);
  const shouldSelectAll = done < total;

  region.bosses.forEach((boss) => {
    if (shouldSelectAll) {
      state.completed.add(boss.id);
      recordHistory(boss.id);
    } else {
      state.completed.delete(boss.id);
      removeHistory(boss.id);
    }
  });

  saveProgress();
  buildAccordion();
  updateProgress();
}

function refreshRegionMeta() {
  getActiveRegions().forEach((region) => {
    const { total, done } = getTotals(region.bosses);
    const pct = total ? Math.round((done / total) * 100) : 0;
    const trigger = document.querySelector(`.accordion-trigger[data-region-id="${region.id}"]`);
    if (!trigger) return;
    const countEl = trigger.querySelector('.region-count');
    const fillEl = trigger.querySelector('.region-mini-fill');
    const itemEl = trigger.closest('.accordion-item');
    const allDone = total > 0 && done === total;

    if (countEl) countEl.innerHTML = `${done}<span class="count-sep">/</span>${total}`;
    if (fillEl) fillEl.style.width = pct + '%';
    if (itemEl) itemEl.classList.toggle('is-finished', allDone);

    let badge = trigger.querySelector('.region-complete-badge');
    if (allDone && !badge) {
      badge = document.createElement('span');
      badge.className = 'region-complete-badge';
      badge.setAttribute('aria-hidden', 'true');
      badge.innerHTML = '<svg width="10" height="8" viewBox="0 0 13 10"><path d="M1 5.2 4.6 8.5 12 1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      const metaEl = trigger.querySelector('.trigger-meta');
      if (metaEl) metaEl.insertBefore(badge, metaEl.firstChild);
    } else if (!allDone && badge) {
      badge.remove();
    }

    const selectAllBtn = document.querySelector(`.select-all-btn[data-region-id="${region.id}"]`);
    if (selectAllBtn) {
      const labelEl = selectAllBtn.querySelector('.select-all-label');
      if (labelEl) labelEl.textContent = allDone ? t('deselectAll') : t('selectAll');
      selectAllBtn.setAttribute('aria-pressed', String(allDone));
    }
  });
}

function toggleRegion(regionId) {
  if (state.searchTerm.trim()) return;
  const openRegions = state.openRegions[state.activeGame];
  if (openRegions.has(regionId)) {
    openRegions.delete(regionId);
  } else {
    openRegions.add(regionId);
  }
  const trigger = document.querySelector(`.accordion-trigger[data-region-id="${regionId}"]`);
  const panel = document.getElementById('panel-' + regionId);
  if (trigger && panel) {
    const isOpen = openRegions.has(regionId);
    trigger.setAttribute('aria-expanded', String(isOpen));
    panel.classList.toggle('is-open', isOpen);
  }
}

function setFilter(filter) {
  state.filter = filter;
  els.filterButtons.forEach((btn) => {
    const active = btn.dataset.filter === filter;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
  buildAccordion();
}

function handleSearch(term) {
  state.searchTerm = term;
  buildAccordion();
}

function resetProgress() {
  const confirmed = confirm(t('resetConfirm'));
  if (!confirmed) return;
  state.completed = new Set();
  state.history = [];
  saveProgress();
  buildAccordion();
  updateProgress();
}

/* ==========================================================================
   Progress display
   ========================================================================== */

function updateProgress() {
  const allBosses = getAllBosses();
  const { total, done } = getTotals(allBosses);
  const pct = total ? Math.round((done / total) * 100) : 0;

  els.completedCount.textContent = done;
  els.totalCount.textContent = total;
  els.remainingCount.textContent = total - done;
  els.overallBar.style.width = pct + '%';
  updateChart(pct);
}

function updateChart(pct) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (pct / 100) * circumference;
  els.chartFill.style.strokeDasharray = `${circumference}`;
  els.chartFill.style.strokeDashoffset = `${offset}`;
  els.chartPercent.textContent = pct + '%';
}

/* ==========================================================================
   Theme system
   ========================================================================== */

function applyTheme(theme) {
  state.theme = theme;
  els.html.setAttribute('data-theme', theme);
  if (els.themeToggle) {
    els.themeToggle.setAttribute('aria-pressed', String(theme === 'light'));
  }
  savePreference(THEME_KEY, theme);
}

function toggleTheme() {
  applyTheme(state.theme === 'dark' ? 'light' : 'dark');
}

/* ==========================================================================
   Game switch — Elden Ring / Shadow of the Erdtree
   ========================================================================== */

function applyGame(gameId) {
  state.activeGame = gameId;
  state.visibleRegions = REGION_PAGE_SIZE;

  els.gameButtons.forEach((btn) => {
    const active = btn.dataset.game === gameId;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', String(active));
  });

  savePreference(GAME_KEY, gameId);
  buildAccordion();
  updateProgress();
}

/* ==========================================================================
   Language system
   ========================================================================== */

function applyLanguage(lang) {
  state.lang = lang;
  els.html.setAttribute('lang', lang);

  if (els.langOptions) {
    els.langOptions.forEach((btn) => {
      const active = btn.dataset.lang === lang;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-checked', String(active));
    });
  }
  refreshLangFilterText();

  els.brandEyebrow.textContent = t('eyebrow');
  els.brandTitle.textContent = t('title');
  document.title = t('title');
  els.resetLabel.textContent = t('reset');
  els.searchInput.setAttribute('placeholder', t('searchPlaceholder'));
  els.chartCaption.textContent = t('cleared');
  els.statCaption.textContent = t('defeated');
  els.remainingLabel.textContent = t('remaining');
  els.regionsTitle.textContent = t('regionsTitle');
  els.regionsShownLabel.textContent = t('shown');
  refreshFooterText();
  els.themeToggle.setAttribute('aria-label', t('themeToggle'));

  els.gameButtons.forEach((btn) => {
    const key = btn.dataset.game === 'eldenring' ? 'gameEldenRing' : 'gameShadowErdtree';
    btn.textContent = t(key);
  });

  els.filterButtons.forEach((btn) => {
    const key = btn.dataset.filter;
    if (key === 'all') btn.textContent = t('filterAll');
    if (key === 'remaining') btn.textContent = t('filterRemaining');
    if (key === 'completed') btn.textContent = t('filterCompleted');
  });

  if (els.sortLabel) els.sortLabel.textContent = t('sortLabel');
  if (els.sortSelect) {
    const opts = els.sortSelect.options;
    if (opts[0]) opts[0].textContent = t('sortDefault');
    if (opts[1]) opts[1].textContent = t('sortName');
    if (opts[2]) opts[2].textContent = t('sortBossCount');
  }
  if (els.loadMoreLabel) els.loadMoreLabel.textContent = t('loadMoreLabel');

  refreshMenuSectionText();
  refreshCategoryFilterText();
  if (window.AuthWidget) window.AuthWidget.setLanguage(lang);

  savePreference(LANG_KEY, lang);
  buildAccordion();
  updateProgress();
}

/* ==========================================================================
   Events & init
   ========================================================================== */

function attachEvents() {
  els.searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
  els.filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });
  els.resetBtn.addEventListener('click', resetProgress);
  els.themeToggle.addEventListener('click', toggleTheme);
  els.gameButtons.forEach((btn) => {
    btn.addEventListener('click', () => applyGame(btn.dataset.game));
  });
  attachCategoryFilterEvents();
  attachLangFilterEvents();
  attachBurgerMenuEvents();
  attachMenuEvents();

  if (els.sortSelect) {
    els.sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      state.visibleRegions = REGION_PAGE_SIZE;
      buildAccordion();
    });
  }
  if (els.loadMoreBtn) {
    els.loadMoreBtn.addEventListener('click', () => {
      state.visibleRegions += REGION_PAGE_SIZE;
      buildAccordion();
    });
  }
}

async function init() {
  cacheDom();
  if (window.AuthWidget) {
    window.AuthWidget.init('en', { onBeforeOpen: closeBurgerMenu, onAuthChange: handleAuthChange });
  }
  refreshMenuSectionText();

  state.categoryFilters = loadCategoryFilters();
  if (els.categoryCheckboxes) {
    els.categoryCheckboxes.forEach((checkbox) => {
      checkbox.checked = state.categoryFilters.has(checkbox.value);
    });
  }
  refreshCategoryFilterButtonState();
  refreshCategoryFilterText();
  refreshLangFilterText();

  const gameDataResult = await subscribeGameData();
  if (gameDataResult.error) {
    console.error('Failed to load boss data from Firebase:', gameDataResult.error);
    if (els.accordion) {
      els.accordion.innerHTML = '<p class="no-results">Could not load boss data from the database. Check your connection and reload the page.</p>';
    }
    return;
  }
  games = {
    eldenring: { id: 'eldenring', regions: gameDataResult.data.eldenRingRegions },
    shadowerdtree: { id: 'shadowerdtree', regions: gameDataResult.data.shadowErdtreeRegions }
  };
  nameTranslations = gameDataResult.data.nameTranslations;
  /* Regions all start collapsed — no location is force-opened on
     load anymore (the first one used to be pinned open by default,
     which read as a stray/buggy pre-expanded dropdown). */

  state.completed = loadProgress();

  gameDataLoaded = true;
  if (pendingAuthState) {
    const { user, isFirstCall } = pendingAuthState;
    pendingAuthState = null;
    await applyAuthState(user, isFirstCall);
  }

  const savedTheme = loadPreference(THEME_KEY, 'dark', ['dark', 'light']);
  const savedLang = loadPreference(LANG_KEY, 'en', ['en', 'ru', 'kk']);
  const savedGame = loadPreference(GAME_KEY, 'eldenring', ['eldenring', 'shadowerdtree']);

  attachEvents();
  applyTheme(savedTheme);
  applyGame(savedGame);
  applyLanguage(savedLang);
  requestAnimationFrame(() => document.body.classList.add('is-ready'));
}

document.addEventListener('DOMContentLoaded', init);
