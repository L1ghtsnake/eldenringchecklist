'use strict';

/* ==========================================================================
   Boss guide — single boss page. Reads ?id=<bossId> from the URL, looks
   the boss up in the same Firestore data the checklist/guide use, and
   renders its name + region + game. The image and write-up are
   placeholders for now — filled in later per boss once the images and
   copy are ready; nothing here needs to change structurally for that,
   just the placeholder blocks get replaced with real content.
   ========================================================================== */

const THEME_KEY = 'eldenRingBossChecklistTheme';
const LANG_KEY = 'eldenRingBossChecklistLang';
/* Same key/shape script.js uses for guest (signed-out) progress, and
   the same users/{uid}.progress + .history fields it uses for signed-in
   accounts — the "Mark as defeated" button below reads/writes exactly
   that shared state, so toggling a boss here shows up on the checklist
   page (and vice versa) without anything special. */
const STORAGE_KEY = 'eldenRingBossChecklist';
const HISTORY_LIMIT = 20;

const i18n = {
  en: {
    docTitlePrefix: 'Elden Ring Database — ',
    brandEyebrow: 'Guide',
    themeLabel: 'Toggle dark or light theme',
    backToGuide: 'Back to guide',
    imagePlaceholder: 'Image coming soon',
    contentPlaceholder: 'The write-up for this boss is coming soon.',
    prevBoss: 'Previous',
    nextBoss: 'Next',
    gameEldenRing: 'Elden Ring',
    gameShadowErdtree: 'Shadow of the Erdtree',
    notFoundTitle: 'Boss not found',
    notFoundText: "This boss doesn't exist or the link is broken.",
    notFoundBack: 'Back to the guide',
    menuAccountLabel: 'Account',
    menuPrefsLabel: 'Preferences',
    markDefeated: 'Mark as defeated',
    markDefeatedDone: 'Defeated',
    relatedBossesTitle: 'Related bosses',
    hpLabel: 'HP',
    runesLabel: 'Runes',
    descriptionTitle: 'Description',
    locationTitle: 'Location',
    resistancesTitle: 'Defenses',
    resistanceEffectHeader: 'Effect',
    resistanceValueHeader: 'Resistance',
    damageTypeHeader: 'Damage type',
    damageValueHeader: 'Negation',
    attacksTitle: 'Attacks',
    tacticsTitle: 'Tactics',
    lootTitle: 'Items',
    lootNameHeader: 'Name',
    lootChanceHeader: 'Drop chance',
    notesTitle: 'Notes',
    triviaTitle: 'Trivia',
    commentsTitle: 'Comments',
    commentsEmpty: 'No comments yet — be the first to leave one.',
    commentLabel: 'Add a comment',
    commentSubmit: 'Post comment',
    commentSubmitting: 'Posting…',
    commentLoginPrompt: 'Log in',
    commentLoginPromptText: ' to leave a comment.',
    commentErrorRequired: 'Write something before posting.',
    commentErrorTooLong: 'Comments can be at most 500 characters.',
    commentErrorGeneric: 'Could not post the comment. Please try again.',
    commentDeleteLabel: 'Delete comment',
    commentDeleteConfirm: 'Delete this comment?',
    commentDeleteError: 'Could not delete the comment. Please try again.',
    commentJustNow: 'Just now'
  },
  ru: {
    docTitlePrefix: 'Elden Ring Database — ',
    brandEyebrow: 'Руководство',
    themeLabel: 'Переключить тёмную или светлую тему',
    backToGuide: 'Назад к руководству',
    imagePlaceholder: 'Изображение скоро появится',
    contentPlaceholder: 'Описание этого босса скоро появится.',
    prevBoss: 'Предыдущий',
    nextBoss: 'Следующий',
    gameEldenRing: 'Elden Ring',
    gameShadowErdtree: 'Shadow of the Erdtree',
    notFoundTitle: 'Босс не найден',
    notFoundText: 'Такого босса не существует, или ссылка повреждена.',
    notFoundBack: 'Вернуться в руководство',
    menuAccountLabel: 'Аккаунт',
    menuPrefsLabel: 'Настройки',
    markDefeated: 'Отметить как побеждённого',
    markDefeatedDone: 'Побеждён',
    relatedBossesTitle: 'Похожие боссы',
    hpLabel: 'Здоровье',
    runesLabel: 'Руны',
    descriptionTitle: 'Описание',
    locationTitle: 'Местонахождение',
    resistancesTitle: 'Защита',
    resistanceEffectHeader: 'Эффект',
    resistanceValueHeader: 'Сопротивляемость',
    damageTypeHeader: 'Тип урона',
    damageValueHeader: 'Сопротивление',
    attacksTitle: 'Атаки',
    tacticsTitle: 'Тактика',
    lootTitle: 'Предметы',
    lootNameHeader: 'Название',
    lootChanceHeader: 'Шанс выпадения',
    notesTitle: 'Примечания',
    triviaTitle: 'Интересные факты',
    commentsTitle: 'Комментарии',
    commentsEmpty: 'Пока нет комментариев — оставьте первый.',
    commentLabel: 'Оставить комментарий',
    commentSubmit: 'Отправить',
    commentSubmitting: 'Отправка…',
    commentLoginPrompt: 'Войдите',
    commentLoginPromptText: ', чтобы оставить комментарий.',
    commentErrorRequired: 'Напишите что-нибудь перед отправкой.',
    commentErrorTooLong: 'Комментарий может содержать не более 500 символов.',
    commentErrorGeneric: 'Не удалось отправить комментарий. Попробуйте ещё раз.',
    commentDeleteLabel: 'Удалить комментарий',
    commentDeleteConfirm: 'Удалить этот комментарий?',
    commentDeleteError: 'Не удалось удалить комментарий. Попробуйте ещё раз.',
    commentJustNow: 'Только что'
  },
  kk: {
    docTitlePrefix: 'Elden Ring Database — ',
    brandEyebrow: 'Нұсқаулық',
    themeLabel: 'Қараңғы немесе ашық тақырыпты ауыстыру',
    backToGuide: 'Нұсқаулыққа оралу',
    imagePlaceholder: 'Сурет жақында қосылады',
    contentPlaceholder: 'Бұл боссқа сипаттама жақында қосылады.',
    prevBoss: 'Алдыңғы',
    nextBoss: 'Келесі',
    gameEldenRing: 'Elden Ring',
    gameShadowErdtree: 'Shadow of the Erdtree',
    notFoundTitle: 'Босс табылмады',
    notFoundText: 'Мұндай босс жоқ, немесе сілтеме бұзылған.',
    notFoundBack: 'Нұсқаулыққа оралу',
    menuAccountLabel: 'Аккаунт',
    menuPrefsLabel: 'Баптаулар',
    markDefeated: 'Жеңілген деп белгілеу',
    markDefeatedDone: 'Жеңілді',
    relatedBossesTitle: 'Ұқсас боссылар',
    hpLabel: 'HP',
    runesLabel: 'Рундар',
    descriptionTitle: 'Сипаттама',
    locationTitle: 'Орналасқан жері',
    resistancesTitle: 'Қорғаныс',
    resistanceEffectHeader: 'Әсер',
    resistanceValueHeader: 'Төзімділік',
    damageTypeHeader: 'Зақым түрі',
    damageValueHeader: 'Кему',
    attacksTitle: 'Шабуылдар',
    tacticsTitle: 'Тактика',
    lootTitle: 'Заттар',
    lootNameHeader: 'Атауы',
    lootChanceHeader: 'Түсу мүмкіндігі',
    notesTitle: 'Ескертпелер',
    triviaTitle: 'Қызықты деректер',
    commentsTitle: 'Пікірлер',
    commentsEmpty: 'Әзірге пікір жоқ — бірінші болып қалдырыңыз.',
    commentLabel: 'Пікір қалдыру',
    commentSubmit: 'Жіберу',
    commentSubmitting: 'Жіберілуде…',
    commentLoginPrompt: 'Кіріңіз',
    commentLoginPromptText: ', пікір қалдыру үшін.',
    commentErrorRequired: 'Жібермес бұрын бірдеңе жазыңыз.',
    commentErrorTooLong: 'Пікір 500 таңбадан аспауы керек.',
    commentErrorGeneric: 'Пікірді жіберу мүмкін болмады. Қайталап көріңіз.',
    commentDeleteLabel: 'Пікірді жою',
    commentDeleteConfirm: 'Бұл пікірді жою керек пе?',
    commentDeleteError: 'Пікірді жою мүмкін болмады. Қайталап көріңіз.',
    commentJustNow: 'Жаңа ғана'
  }
};

let nameTranslations = { ru: { regions: {}, bosses: {} }, kk: { regions: {}, bosses: {} } };
let flatBosses = []; // [{ id, name, regionId, regionName, game, categories }], in canonical order
let bossDetails = {}; // { [bossId]: { hp, runes, ru: {...} } }

const state = {
  lang: 'en',
  theme: 'dark',
  currentBoss: null,
  /* Same shape as script.js's progress state — a guest's Set is loaded
     straight from STORAGE_KEY, an account's from users/{uid} via a
     real-time listener (see subscribeUserProgress below). history stays
     empty for guests (the personal cabinet's feed is login-only). */
  completed: new Set(),
  history: [],
  comments: []
};

const els = {};

function cacheDom() {
  els.html = document.documentElement;
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

  els.backLink = document.getElementById('wiki-boss-back-link');
  els.backLinkLabel = document.getElementById('wiki-boss-back-label');

  els.bossView = document.getElementById('wiki-boss-view');
  els.bossName = document.getElementById('wiki-boss-name');
  els.bossRegion = document.getElementById('wiki-boss-region');
  els.bossGame = document.getElementById('wiki-boss-game');
  els.imagePlaceholderText = document.getElementById('wiki-boss-image-placeholder-text');
  els.mediaBox = document.getElementById('wiki-boss-media');
  els.mediaIcon = document.getElementById('wiki-boss-media-icon');
  els.photo = document.getElementById('wiki-boss-photo');
  els.contentPlaceholderText = document.getElementById('wiki-boss-content-placeholder');
  els.tagline = document.getElementById('wiki-boss-tagline');
  els.stats = document.getElementById('wiki-boss-stats');
  els.hpLabel = document.getElementById('wiki-boss-hp-label');
  els.hpValue = document.getElementById('wiki-boss-hp-value');
  els.runesLabel = document.getElementById('wiki-boss-runes-label');
  els.runesValue = document.getElementById('wiki-boss-runes-value');
  els.sections = document.getElementById('wiki-boss-sections');

  els.prevLink = document.getElementById('wiki-boss-prev');
  els.prevDir = document.getElementById('wiki-boss-prev-dir');
  els.prevLabel = document.getElementById('wiki-boss-prev-label');
  els.nextLink = document.getElementById('wiki-boss-next');
  els.nextDir = document.getElementById('wiki-boss-next-dir');
  els.nextLabel = document.getElementById('wiki-boss-next-label');

  els.notFoundView = document.getElementById('wiki-boss-not-found');
  els.notFoundTitle = document.getElementById('wiki-not-found-title');
  els.notFoundText = document.getElementById('wiki-not-found-text');
  els.notFoundBackLink = document.getElementById('wiki-not-found-back');
  els.notFoundBackLabel = document.getElementById('wiki-not-found-back-label');

  els.defeatBtn = document.getElementById('wiki-boss-defeat-btn');
  els.defeatLabel = document.getElementById('wiki-boss-defeat-label');

  els.related = document.getElementById('wiki-boss-related');
  els.relatedTitle = document.getElementById('wiki-boss-related-title');
  els.relatedList = document.getElementById('wiki-boss-related-list');

  els.commentsTitle = document.getElementById('wiki-boss-comments-title');
  els.commentsList = document.getElementById('wiki-boss-comments-list');
  els.commentsEmpty = document.getElementById('wiki-boss-comments-empty');
  els.commentForm = document.getElementById('wiki-boss-comment-form');
  els.commentLabel = document.getElementById('wiki-boss-comment-label');
  els.commentInput = document.getElementById('wiki-boss-comment-input');
  els.commentError = document.getElementById('wiki-boss-comment-error');
  els.commentSubmit = document.getElementById('wiki-boss-comment-submit');
  els.commentSubmitLabel = document.getElementById('wiki-boss-comment-submit-label');
  els.commentGuestNote = document.getElementById('wiki-boss-comment-guest-note');
  els.commentLoginLink = document.getElementById('wiki-boss-comment-login-link');
  els.commentGuestText = document.getElementById('wiki-boss-comment-guest-text');
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

/* Live boss data — same rationale as the identical block in
   scripts/script.js. The four docs (including bossDetails, which this
   page alone needs) each get their own onSnapshot listener; the first
   time all four have reported in, `init()`'s startup resolves exactly
   like the old one-time `.get()` did, and every snapshot after that
   just re-renders the boss currently on screen — so an admin edit to
   THIS boss (or a rename/re-categorize elsewhere) shows up live. */
let latestEldenSnap = null;
let latestShadowSnap = null;
let latestTranslationsSnap = null;
let latestDetailsSnap = null;
let gameDataFirstLoadDone = false;
let resolveGameDataFirstLoad = null;

function buildGameDataFromSnapshots() {
  const translations = (latestTranslationsSnap && latestTranslationsSnap.exists) ? latestTranslationsSnap.data() : {};
  return {
    eldenRingRegions: latestEldenSnap.exists ? latestEldenSnap.data().regions : [],
    shadowErdtreeRegions: latestShadowSnap.exists ? latestShadowSnap.data().regions : [],
    nameTranslations: {
      ru: {
        regions: (translations.ru && translations.ru.regions) || {},
        bosses: (translations.ru && translations.ru.bosses) || {}
      },
      kk: {
        regions: (translations.kk && translations.kk.regions) || {},
        bosses: (translations.kk && translations.kk.bosses) || {}
      }
    },
    bossDetails: (latestDetailsSnap && latestDetailsSnap.exists) ? latestDetailsSnap.data() : {}
  };
}

function handleGameDataSnapshotUpdate() {
  if (!latestEldenSnap || !latestShadowSnap || !latestTranslationsSnap || !latestDetailsSnap) return;

  const data = buildGameDataFromSnapshots();

  if (!gameDataFirstLoadDone) {
    gameDataFirstLoadDone = true;
    resolveGameDataFirstLoad({ data });
    return;
  }

  flatBosses = buildFlatList(data.eldenRingRegions, data.shadowErdtreeRegions);
  nameTranslations = data.nameTranslations;
  bossDetails = data.bossDetails || {};
  renderBoss();
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
  db.collection('gameData').doc('bossDetails').onSnapshot((snap) => {
    latestDetailsSnap = snap;
    handleGameDataSnapshotUpdate();
  }, handleGameDataSnapshotError);
  return firstLoad;
}

function localizedRegionName(region) {
  const table = nameTranslations[state.lang];
  if (table && table.regions[region.id]) return table.regions[region.id];
  return region.name;
}

function localizedBossName(boss) {
  const table = nameTranslations[state.lang];
  if (table && table.bosses[boss.id]) return table.bosses[boss.id];
  return boss.name;
}

function buildFlatList(eldenRegions, shadowRegions) {
  const list = [];
  eldenRegions.forEach((region) => {
    region.bosses.forEach((boss) => {
      list.push({ id: boss.id, name: boss.name, regionId: region.id, regionName: region.name, game: 'eldenring', categories: Array.isArray(boss.categories) ? boss.categories : [] });
    });
  });
  shadowRegions.forEach((region) => {
    region.bosses.forEach((boss) => {
      list.push({ id: boss.id, name: boss.name, regionId: region.id, regionName: region.name, game: 'shadowerdtree', categories: Array.isArray(boss.categories) ? boss.categories : [] });
    });
  });
  return list;
}

/* ==========================================================================
   Progress — "Mark as defeated" + the shared account/guest state it reads
   and writes. Mirrors script.js's contract exactly (same STORAGE_KEY for
   guests, same users/{uid}.progress/.history shape for accounts) so a
   boss toggled here is reflected on the checklist page and vice versa.
   ========================================================================== */

function loadGuestProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => typeof id === 'string'));
  } catch (err) {
    return new Set();
  }
}

function saveGuestProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(state.completed)));
  } catch (err) {
    /* storage unavailable */
  }
}

/* Real-time users/{uid} listener — kept separate from the game-data
   listeners above since it only exists while someone is signed in. */
let unsubUserProgress = null;

function teardownUserProgress() {
  if (unsubUserProgress) {
    unsubUserProgress();
    unsubUserProgress = null;
  }
}

function subscribeUserProgress(uid) {
  teardownUserProgress();
  unsubUserProgress = db.collection('users').doc(uid).onSnapshot((snap) => {
    const data = snap.exists ? snap.data() : {};
    const progressList = Array.isArray(data.progress) ? data.progress : [];
    const historyList = Array.isArray(data.history) ? data.history : [];
    state.completed = new Set(progressList.filter((id) => typeof id === 'string'));
    state.history = historyList.filter((entry) => entry && typeof entry.id === 'string' && typeof entry.at === 'number');
    updateMarkDefeatedUI();
  }, (err) => console.error('Failed to load account progress:', err));
}

/* AuthWidget's onAuthChange callback — fires once on load (guest or
   already-logged-in) and again on every later sign-in/sign-out. Mirrors
   script.js's handleAuthChange/applyAuthState exactly: a real sign-out
   mid-session resets to empty rather than exposing guest localStorage
   progress, while a guest on page load keeps whatever loadGuestProgress()
   already put in state.completed during init(). */
let progressAuthInitialized = false;

function handleAuthChangeForProgress(user) {
  const isFirstCall = !progressAuthInitialized;
  progressAuthInitialized = true;

  if (user) {
    subscribeUserProgress(user.uid);
    updateCommentComposeUI();
    renderComments();
    return;
  }

  teardownUserProgress();
  if (!isFirstCall) {
    state.completed = new Set();
    state.history = [];
  }
  updateMarkDefeatedUI();
  updateCommentComposeUI();
  renderComments();
}

function updateMarkDefeatedUI() {
  if (!els.defeatBtn || !state.currentBoss) return;
  const isDone = state.completed.has(state.currentBoss.id);
  els.defeatBtn.setAttribute('aria-pressed', String(isDone));
  if (els.defeatLabel) els.defeatLabel.textContent = isDone ? t('markDefeatedDone') : t('markDefeated');
}

function toggleDefeated() {
  const boss = state.currentBoss;
  if (!boss) return;

  const nowDone = !state.completed.has(boss.id);
  if (nowDone) {
    state.completed.add(boss.id);
  } else {
    state.completed.delete(boss.id);
  }

  if (window.AuthWidget && window.AuthWidget.isLoggedIn()) {
    const user = window.AuthWidget.getUser();
    if (nowDone) {
      state.history = state.history.filter((entry) => entry.id !== boss.id);
      state.history.unshift({ id: boss.id, at: Date.now() });
      if (state.history.length > HISTORY_LIMIT) state.history.length = HISTORY_LIMIT;
    } else {
      state.history = state.history.filter((entry) => entry.id !== boss.id);
    }
    db.collection('users').doc(user.uid).set(
      { progress: Array.from(state.completed), history: state.history },
      { merge: true }
    ).catch((err) => console.error('Failed to save progress to account:', err));
  } else {
    saveGuestProgress();
  }

  updateMarkDefeatedUI();
}

/* ==========================================================================
   Related bosses — same region first (same game), then same category,
   deduplicated, capped at 6. Purely derived from data already loaded by
   subscribeGameData(), so this needs no extra Firestore reads. */

function getRelatedBosses(boss) {
  const sameRegion = flatBosses.filter((b) => b.id !== boss.id && b.game === boss.game && b.regionId === boss.regionId);
  const categories = Array.isArray(boss.categories) ? boss.categories : [];
  const sameCategory = categories.length
    ? flatBosses.filter((b) => b.id !== boss.id && !(b.game === boss.game && b.regionId === boss.regionId) && b.categories.some((c) => categories.includes(c)))
    : [];

  const seen = new Set();
  const result = [];
  sameRegion.concat(sameCategory).forEach((b) => {
    if (seen.has(b.id) || result.length >= 6) return;
    seen.add(b.id);
    result.push(b);
  });
  return result;
}

function renderRelatedBosses(boss) {
  if (!els.related || !els.relatedList) return;
  const related = getRelatedBosses(boss);

  if (!related.length) {
    els.related.hidden = true;
    els.relatedList.innerHTML = '';
    return;
  }

  els.related.hidden = false;
  if (els.relatedTitle) els.relatedTitle.textContent = t('relatedBossesTitle');
  els.relatedList.innerHTML = '';

  related.forEach((b) => {
    const link = document.createElement('a');
    link.className = 'wiki-boss-related-link';
    link.href = `wiki-boss.html?id=${encodeURIComponent(b.id)}`;

    const name = document.createElement('span');
    name.className = 'wiki-boss-related-name';
    name.textContent = localizedBossName(b);

    const region = document.createElement('span');
    region.className = 'wiki-boss-related-region';
    region.textContent = localizedRegionName({ id: b.regionId, name: b.regionName });

    link.appendChild(name);
    link.appendChild(region);
    els.relatedList.appendChild(link);
  });
}

/* ==========================================================================
   Boss comments — one Firestore doc per comment in the top-level
   `comments` collection ({ bossId, game, uid, nickname, text, createdAt }),
   read with a single equality filter (`where('bossId', '==', …)`) so no
   composite index is needed, sorted newest-first client-side. Mirrors the
   users/{uid} onSnapshot pattern used everywhere else on this page: an
   admin (or the author, from another tab) deleting a comment shows up
   here live, same as an edit anywhere else in this codebase. */

let unsubComments = null;
let subscribedCommentsBossId = null;

function teardownComments() {
  if (unsubComments) {
    unsubComments();
    unsubComments = null;
  }
  subscribedCommentsBossId = null;
}

function subscribeComments(bossId) {
  if (subscribedCommentsBossId === bossId) return;
  teardownComments();
  subscribedCommentsBossId = bossId;

  unsubComments = db.collection('comments').where('bossId', '==', bossId).onSnapshot((snap) => {
    const list = [];
    snap.forEach((doc) => {
      const data = doc.data();
      if (typeof data.text !== 'string' || typeof data.uid !== 'string') return;
      // A comment just posted from this tab shows up in this same
      // snapshot before the server has assigned its serverTimestamp()
      // — createdAt reads as null for that brief window, not a Date.
      const createdAt = data.createdAt && typeof data.createdAt.toMillis === 'function' ? data.createdAt.toMillis() : null;
      list.push({
        id: doc.id,
        uid: data.uid,
        nickname: (typeof data.nickname === 'string' && data.nickname) || '—',
        text: data.text,
        createdAt
      });
    });
    // Newest first; a pending (createdAt === null) comment sorts to the
    // very top so it doesn't jump once the real timestamp arrives.
    list.sort((a, b) => (b.createdAt == null ? Infinity : b.createdAt) - (a.createdAt == null ? Infinity : a.createdAt));
    state.comments = list;
    renderComments();
  }, (err) => console.error('Failed to load comments:', err));
}

function formatCommentDate(ms) {
  if (ms == null) return t('commentJustNow');
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return '';
  const locale = state.lang === 'ru' ? 'ru-RU' : state.lang === 'kk' ? 'kk-KZ' : 'en-US';
  try {
    return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
  } catch (err) {
    return date.toLocaleString();
  }
}

function renderComments() {
  if (!els.commentsList || !els.commentsEmpty) return;
  const comments = state.comments || [];

  if (!comments.length) {
    els.commentsList.hidden = true;
    els.commentsList.innerHTML = '';
    els.commentsEmpty.hidden = false;
    return;
  }

  els.commentsEmpty.hidden = true;
  els.commentsList.hidden = false;
  els.commentsList.innerHTML = '';

  const loggedIn = !!(window.AuthWidget && window.AuthWidget.isLoggedIn());
  const currentUid = loggedIn ? window.AuthWidget.getUser().uid : null;
  const isAdmin = loggedIn && window.AuthWidget.isAdmin ? window.AuthWidget.isAdmin() : false;

  comments.forEach((comment) => {
    const li = document.createElement('li');
    li.className = 'wiki-boss-comment-item';

    const head = document.createElement('div');
    head.className = 'wiki-boss-comment-head';

    const author = document.createElement('span');
    author.className = 'wiki-boss-comment-author';
    author.textContent = comment.nickname;
    head.appendChild(author);

    const date = document.createElement('span');
    date.className = 'wiki-boss-comment-date';
    date.textContent = formatCommentDate(comment.createdAt);
    head.appendChild(date);

    if (currentUid && (currentUid === comment.uid || isAdmin)) {
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'wiki-boss-comment-delete';
      deleteBtn.setAttribute('aria-label', t('commentDeleteLabel'));
      deleteBtn.title = t('commentDeleteLabel');
      deleteBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z"/></svg>';
      deleteBtn.addEventListener('click', () => deleteComment(comment.id));
      head.appendChild(deleteBtn);
    }

    li.appendChild(head);

    // textContent, never innerHTML — this is arbitrary user-submitted
    // text and must never be parsed as markup.
    const textEl = document.createElement('p');
    textEl.className = 'wiki-boss-comment-text';
    textEl.textContent = comment.text;
    li.appendChild(textEl);

    els.commentsList.appendChild(li);
  });
}

function deleteComment(commentId) {
  if (!confirm(t('commentDeleteConfirm'))) return;
  db.collection('comments').doc(commentId).delete().catch((err) => {
    console.error('Failed to delete comment:', err);
    alert(t('commentDeleteError'));
  });
}

function showCommentError(message) {
  if (!els.commentError) return;
  els.commentError.textContent = message;
  els.commentError.hidden = false;
}

function hideCommentError() {
  if (!els.commentError) return;
  els.commentError.hidden = true;
  els.commentError.textContent = '';
}

/* Shows the compose form to a signed-in visitor, the "log in to comment"
   note to everyone else. Defaults to the guest note in the markup (see
   the comment there) so there's no flash of a compose box a guest can't
   actually use before AuthWidget resolves. */
function updateCommentComposeUI() {
  const loggedIn = !!(window.AuthWidget && window.AuthWidget.isLoggedIn());
  if (els.commentForm) els.commentForm.hidden = !loggedIn;
  if (els.commentGuestNote) els.commentGuestNote.hidden = loggedIn;
}

async function handleCommentSubmit(event) {
  event.preventDefault();
  hideCommentError();

  if (!window.AuthWidget || !window.AuthWidget.isLoggedIn()) return;
  const boss = state.currentBoss;
  if (!boss) return;

  const text = els.commentInput ? els.commentInput.value.trim() : '';
  if (!text) {
    showCommentError(t('commentErrorRequired'));
    return;
  }
  if (text.length > 500) {
    showCommentError(t('commentErrorTooLong'));
    return;
  }

  const user = window.AuthWidget.getUser();
  const profile = window.AuthWidget.getProfile();
  const nickname = user.displayName || (profile && profile.nickname) || user.email || '—';

  if (els.commentSubmit) els.commentSubmit.disabled = true;
  const originalLabel = els.commentSubmitLabel ? els.commentSubmitLabel.textContent : '';
  if (els.commentSubmitLabel) els.commentSubmitLabel.textContent = t('commentSubmitting');

  try {
    await db.collection('comments').add({
      bossId: boss.id,
      game: boss.game,
      uid: user.uid,
      nickname,
      text,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    if (els.commentForm) els.commentForm.reset();
  } catch (err) {
    console.error('Failed to post comment:', err);
    showCommentError(t('commentErrorGeneric'));
  } finally {
    if (els.commentSubmit) els.commentSubmit.disabled = false;
    if (els.commentSubmitLabel) els.commentSubmitLabel.textContent = originalLabel;
  }
}

function getBossId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id') || '';
}

function createTextBlock(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  el.textContent = text;
  return el;
}

// Parses simple `[label](https://...)` markdown-style links inside a plain
// text string and renders them as real, clickable anchor tags, leaving
// everything else as plain text. Used for the few fields (description,
// location, tactics, notes intro, trivia) where a boss entry needs to point
// the reader at another page instead of repeating its full content.
function createRichTextBlock(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  let lastIndex = 0;
  let match;
  while ((match = linkPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      el.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
    }
    const a = document.createElement('a');
    a.href = match[2];
    a.textContent = match[1];
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'wiki-inline-link';
    el.appendChild(a);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    el.appendChild(document.createTextNode(text.slice(lastIndex)));
  }
  return el;
}

function createSectionHeading(titleText) {
  const heading = document.createElement('h2');
  heading.className = 'wiki-section-title';
  heading.textContent = titleText;
  return heading;
}

function createBulletList(items) {
  // Each item is either a plain string, or { text, sub: [strings] } for a
  // one-level-nested sub-bullet (used by tactics lists that call out an
  // alternative approach under one of the main points).
  const ul = document.createElement('ul');
  ul.className = 'wiki-bullet-list';
  items.forEach((item) => {
    const li = document.createElement('li');
    if (typeof item === 'string') {
      li.textContent = item;
    } else {
      li.textContent = item.text;
      if (item.sub && item.sub.length) {
        li.appendChild(createBulletList(item.sub));
      }
    }
    ul.appendChild(li);
  });
  return ul;
}

// Effect/damage icons are matched to each row by position, not by name —
// the resistances arrays are always written in this fixed order (see the
// bossDetails schema notes), so index 0 of `effects` is always Balance,
// index 0 of `damage` is always Standard, and so on.
const EFFECT_ICONS = [
  'effect-balance', 'effect-poison', 'effect-scarlet-rot', 'effect-bleed',
  'effect-frostbite', 'effect-sleep', 'effect-madness', 'effect-death'
];
const DAMAGE_ICONS = [
  'damage-standard', 'damage-strike', 'damage-slash', 'damage-pierce',
  'damage-magic', 'damage-fire', 'damage-lightning', 'damage-holy'
];

function createResistanceGroup(groupLabel, rows, icons) {
  const wrap = document.createElement('div');
  wrap.className = 'wiki-resist-group';

  wrap.appendChild(createTextBlock('p', 'wiki-resist-group-label', groupLabel));

  const grid = document.createElement('div');
  grid.className = 'wiki-resist-grid';

  rows.forEach((row, i) => {
    const cell = document.createElement('div');
    cell.className = 'wiki-resist-cell';

    const iconFile = icons && icons[i];
    if (iconFile) {
      const iconWrap = document.createElement('span');
      iconWrap.className = 'wiki-resist-cell-icon';
      const img = document.createElement('img');
      img.className = 'wiki-resist-icon';
      img.src = `../img/icons/${iconFile}.webp`;
      img.alt = row.label;
      img.title = row.label;
      img.loading = 'lazy';
      iconWrap.appendChild(img);
      cell.appendChild(iconWrap);
    } else {
      cell.appendChild(createTextBlock('span', 'wiki-resist-cell-label', row.label));
    }

    cell.appendChild(createTextBlock('span', 'wiki-resist-cell-value', row.value));
    grid.appendChild(cell);
  });

  wrap.appendChild(grid);
  return wrap;
}

function createLootTable(nameHeader, chanceHeader, items) {
  const wrap = document.createElement('div');
  wrap.className = 'wiki-table-scroll';

  const table = document.createElement('table');
  table.className = 'wiki-table wiki-table--loot';

  const headRow = document.createElement('tr');
  headRow.appendChild(createTextBlock('th', '', nameHeader));
  headRow.appendChild(createTextBlock('th', 'wiki-table-num', chanceHeader));
  table.appendChild(headRow);

  items.forEach((item) => {
    const tr = document.createElement('tr');
    tr.appendChild(createTextBlock('td', '', item.name));
    tr.appendChild(createTextBlock('td', 'wiki-table-num', item.chance || '—'));
    table.appendChild(tr);
  });

  wrap.appendChild(table);
  return wrap;
}

function renderSections(detail) {
  if (!els.sections) return;
  els.sections.innerHTML = '';

  const hasContent = !!(detail && detail.ru && state.lang === 'ru');

  if (els.contentPlaceholderText) els.contentPlaceholderText.hidden = hasContent;
  if (els.tagline) els.tagline.hidden = true;
  if (els.stats) els.stats.classList.remove('is-visible');

  if (!hasContent) return;

  const d = detail.ru;

  if (d.tagline && els.tagline) {
    els.tagline.textContent = d.tagline;
    els.tagline.hidden = false;
  }

  if (els.stats && (detail.hp != null || detail.runes != null)) {
    els.stats.classList.add('is-visible');
    if (els.hpValue) els.hpValue.textContent = detail.hp != null ? detail.hp : '—';
    if (els.runesValue) els.runesValue.textContent = detail.runes != null ? detail.runes : '—';
  }

  if (d.quote && d.quote.text) {
    const quoteBlock = document.createElement('blockquote');
    quoteBlock.className = 'wiki-quote';

    const quoteText = document.createElement('p');
    quoteText.className = 'wiki-quote-text';
    quoteText.textContent = d.quote.text;
    quoteBlock.appendChild(quoteText);

    if (d.quote.author) {
      const quoteAuthor = document.createElement('footer');
      quoteAuthor.className = 'wiki-quote-author';
      quoteAuthor.textContent = `~ ${d.quote.author}`;
      quoteBlock.appendChild(quoteAuthor);
    }

    els.sections.appendChild(quoteBlock);
  }

  if (d.description) {
    els.sections.appendChild(createSectionHeading(t('descriptionTitle')));
    d.description.split('\n').filter(Boolean).forEach((para) => {
      els.sections.appendChild(createRichTextBlock('p', 'wiki-section-text', para));
    });
    if (d.descriptionList && d.descriptionList.length) {
      els.sections.appendChild(createBulletList(d.descriptionList));
    }
  }

  if (d.location) {
    els.sections.appendChild(createSectionHeading(t('locationTitle')));
    els.sections.appendChild(createRichTextBlock('p', 'wiki-section-text', d.location));
    if (d.locationExtra && d.locationExtra.length) {
      els.sections.appendChild(createBulletList(d.locationExtra));
    }
  }

  if (d.resistances) {
    els.sections.appendChild(createSectionHeading(t('resistancesTitle')));
    if (d.resistances.effects && d.resistances.effects.length) {
      els.sections.appendChild(createResistanceGroup(t('resistanceValueHeader'), d.resistances.effects, EFFECT_ICONS));
    }
    if (d.resistances.damage && d.resistances.damage.length) {
      els.sections.appendChild(createResistanceGroup(t('damageValueHeader'), d.resistances.damage, DAMAGE_ICONS));
    }
  }

  if (d.attackPhases && d.attackPhases.length) {
    els.sections.appendChild(createSectionHeading(t('attacksTitle')));
    d.attackPhases.forEach((phase) => {
      if (phase.heading) {
        els.sections.appendChild(createTextBlock('h3', 'wiki-phase-heading', phase.heading));
      }
      if (phase.intro) els.sections.appendChild(createRichTextBlock('p', 'wiki-section-text', phase.intro));
      if (phase.items && phase.items.length) els.sections.appendChild(createBulletList(phase.items));
    });
  } else if (d.attacks && d.attacks.length) {
    els.sections.appendChild(createSectionHeading(t('attacksTitle')));
    if (d.attacksIntro) els.sections.appendChild(createRichTextBlock('p', 'wiki-section-text', d.attacksIntro));
    els.sections.appendChild(createBulletList(d.attacks));
  }

  if (d.tactics || (d.tacticsList && d.tacticsList.length)) {
    els.sections.appendChild(createSectionHeading(t('tacticsTitle')));
    if (d.tactics) {
      d.tactics.split('\n').filter(Boolean).forEach((para) => {
        els.sections.appendChild(createRichTextBlock('p', 'wiki-section-text', para));
      });
    }
    if (d.tacticsList && d.tacticsList.length) {
      els.sections.appendChild(createBulletList(d.tacticsList));
    }
  }

  if (d.loot && d.loot.length) {
    els.sections.appendChild(createSectionHeading(t('lootTitle')));
    els.sections.appendChild(createLootTable(t('lootNameHeader'), t('lootChanceHeader'), d.loot));
  }

  if (d.notes && d.notes.length) {
    els.sections.appendChild(createSectionHeading(t('notesTitle')));
    if (d.notesIntro) els.sections.appendChild(createRichTextBlock('p', 'wiki-section-text', d.notesIntro));
    els.sections.appendChild(createBulletList(d.notes));
  }

  if (d.trivia) {
    els.sections.appendChild(createSectionHeading(t('triviaTitle')));
    els.sections.appendChild(createRichTextBlock('p', 'wiki-section-text', d.trivia));
  }
}

function loadBossPhoto(bossId) {
  if (!els.photo) return;

  // Visibility of the photo vs. the placeholder icon/text is driven by
  // the .has-photo class alone (see wiki.css) — never by toggling each
  // element's own `hidden` attribute, which some browsers don't apply
  // reliably to inline SVG.
  if (els.mediaBox) els.mediaBox.classList.remove('has-photo');
  els.photo.removeAttribute('src');

  els.photo.onload = () => {
    if (els.mediaBox) els.mediaBox.classList.add('has-photo');
  };
  els.photo.onerror = () => {
    if (els.mediaBox) els.mediaBox.classList.remove('has-photo');
  };

  els.photo.src = `../img/bosses/${encodeURIComponent(bossId)}.webp`;
}

function renderBoss() {
  const id = getBossId();
  const index = flatBosses.findIndex((b) => b.id === id);

  if (index === -1) {
    if (els.bossView) els.bossView.hidden = true;
    if (els.notFoundView) els.notFoundView.hidden = false;
    document.title = t('docTitlePrefix') + t('notFoundTitle');
    teardownComments();
    return;
  }

  const boss = flatBosses[index];
  state.currentBoss = boss;

  if (els.notFoundView) els.notFoundView.hidden = true;
  if (els.bossView) els.bossView.hidden = false;

  const bossNameLocalized = localizedBossName(boss);
  const regionNameLocalized = localizedRegionName({ id: boss.regionId, name: boss.regionName });
  const gameLabel = boss.game === 'shadowerdtree' ? t('gameShadowErdtree') : t('gameEldenRing');

  document.title = t('docTitlePrefix') + bossNameLocalized;
  if (els.bossName) els.bossName.textContent = bossNameLocalized;
  if (els.bossRegion) els.bossRegion.textContent = regionNameLocalized;
  if (els.bossGame) els.bossGame.textContent = gameLabel;

  if (state.loadedPhotoId !== boss.id) {
    state.loadedPhotoId = boss.id;
    loadBossPhoto(boss.id);
  }
  renderSections(bossDetails[boss.id]);
  updateMarkDefeatedUI();
  renderRelatedBosses(boss);
  subscribeComments(boss.id);

  const prev = index > 0 ? flatBosses[index - 1] : null;
  const next = index < flatBosses.length - 1 ? flatBosses[index + 1] : null;

  if (els.prevLink) {
    if (prev) {
      els.prevLink.href = `wiki-boss.html?id=${encodeURIComponent(prev.id)}`;
      els.prevLink.hidden = false;
      if (els.prevLabel) els.prevLabel.textContent = localizedBossName(prev);
    } else {
      els.prevLink.hidden = true;
    }
  }

  if (els.nextLink) {
    if (next) {
      els.nextLink.href = `wiki-boss.html?id=${encodeURIComponent(next.id)}`;
      els.nextLink.hidden = false;
      if (els.nextLabel) els.nextLabel.textContent = localizedBossName(next);
    } else {
      els.nextLink.hidden = true;
    }
  }
}

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

  if (els.brandEyebrow) els.brandEyebrow.textContent = t('brandEyebrow');
  if (els.backLinkLabel) els.backLinkLabel.textContent = t('backToGuide');
  if (els.imagePlaceholderText) els.imagePlaceholderText.textContent = t('imagePlaceholder');
  if (els.contentPlaceholderText) els.contentPlaceholderText.textContent = t('contentPlaceholder');
  if (els.hpLabel) els.hpLabel.textContent = t('hpLabel');
  if (els.runesLabel) els.runesLabel.textContent = t('runesLabel');
  if (els.prevDir) els.prevDir.textContent = t('prevBoss');
  if (els.nextDir) els.nextDir.textContent = t('nextBoss');
  if (els.notFoundTitle) els.notFoundTitle.textContent = t('notFoundTitle');
  if (els.notFoundText) els.notFoundText.textContent = t('notFoundText');
  if (els.notFoundBackLabel) els.notFoundBackLabel.textContent = t('notFoundBack');
  if (els.relatedTitle) els.relatedTitle.textContent = t('relatedBossesTitle');
  if (els.commentsTitle) els.commentsTitle.textContent = t('commentsTitle');
  if (els.commentsEmpty) els.commentsEmpty.textContent = t('commentsEmpty');
  if (els.commentLabel) els.commentLabel.textContent = t('commentLabel');
  if (els.commentSubmitLabel) els.commentSubmitLabel.textContent = t('commentSubmit');
  if (els.commentLoginLink) els.commentLoginLink.textContent = t('commentLoginPrompt');
  if (els.commentGuestText) els.commentGuestText.textContent = t('commentLoginPromptText');
  hideCommentError();
  renderComments();
  updateCommentComposeUI();
  if (els.themeToggle) els.themeToggle.setAttribute('aria-label', t('themeLabel'));
  if (els.menuAccountLabel) els.menuAccountLabel.textContent = t('menuAccountLabel');
  if (els.menuPrefsLabel) els.menuPrefsLabel.textContent = t('menuPrefsLabel');

  renderBoss();

  if (window.AuthWidget) window.AuthWidget.setLanguage(lang);
}

function applyTheme(theme) {
  state.theme = theme;
  els.html.setAttribute('data-theme', theme);
  if (els.themeToggle) els.themeToggle.setAttribute('aria-pressed', String(theme === 'light'));
  savePreference(THEME_KEY, theme);
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
  if (els.defeatBtn) {
    els.defeatBtn.addEventListener('click', toggleDefeated);
  }
  if (els.commentForm) {
    els.commentForm.addEventListener('submit', handleCommentSubmit);
  }
  if (els.commentLoginLink) {
    els.commentLoginLink.addEventListener('click', () => {
      if (window.AuthWidget) window.AuthWidget.openAuthModal('login');
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

  const savedLang = loadPreference(LANG_KEY, 'en', ['en', 'ru', 'kk']);

  /* Seeded synchronously so a guest sees the right defeat-button state
     immediately; handleAuthChangeForProgress overwrites this the moment
     AuthWidget resolves (guest confirmed, or replaced with account data). */
  state.completed = loadGuestProgress();

  if (window.AuthWidget) {
    window.AuthWidget.init('en', { onBeforeOpen: closeBurgerMenu, onAuthChange: handleAuthChangeForProgress });
  }

  const gameDataResult = await subscribeGameData();
  if (gameDataResult.data) {
    flatBosses = buildFlatList(gameDataResult.data.eldenRingRegions, gameDataResult.data.shadowErdtreeRegions);
    nameTranslations = gameDataResult.data.nameTranslations;
    bossDetails = gameDataResult.data.bossDetails || {};
  }

  applyLanguage(savedLang);
  requestAnimationFrame(() => document.body.classList.add('is-ready'));
}

document.addEventListener('DOMContentLoaded', init);
