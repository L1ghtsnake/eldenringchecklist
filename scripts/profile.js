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
      nicknameCancel: 'Cancel',
      commentsTitle: 'Your comments',
      commentsCount: '{n} comments',
      commentsHint: "See every comment you've left across the guide, and when you left it.",
      commentsViewBtn: 'View all your comments',
      commentsModalTitle: 'Your comments',
      commentsModalEmpty: "You haven't left any comments yet — leave one on a boss's guide page.",
      commentDeleteLabel: 'Delete comment',
      commentDeleteConfirm: 'Delete this comment?',
      commentDeleteError: 'Could not delete the comment. Please try again.'
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
      nicknameCancel: 'Отмена',
      commentsTitle: 'Ваши комментарии',
      commentsCount: '{n} комментариев',
      commentsHint: 'Здесь собраны все ваши комментарии по всему руководству — какой босс, что написано и когда.',
      commentsViewBtn: 'Просмотреть все ваши комментарии',
      commentsModalTitle: 'Ваши комментарии',
      commentsModalEmpty: 'Вы ещё не оставили ни одного комментария — оставьте первый на странице любого босса.',
      commentDeleteLabel: 'Удалить комментарий',
      commentDeleteConfirm: 'Удалить этот комментарий?',
      commentDeleteError: 'Не удалось удалить комментарий. Попробуйте ещё раз.'
    },
    kk: {
      docTitle: 'Elden Ring Database — Жеке кабинет',
      brandEyebrow: 'Жеке кабинет',
      themeLabel: 'Қараңғы немесе ашық тақырыпты ауыстыру',
      guardTitle: 'Жеке кабинет',
      guardText: 'Профиліңізді, сақталған деректеріңізді және соңғы әрекеттеріңізді көру үшін аккаунтқа кіріңіз.',
      guardLogin: 'Кіру',
      memberSince: 'Тіркелген күні:',
      infoTitle: 'Аккаунт туралы ақпарат',
      infoEmailLabel: 'Email',
      infoDateLabel: 'Тіркелген күні',
      recentTitle: 'Соңғы әрекеттер',
      recentSummary: '{done} / {total} босс жеңілді',
      recentEmpty: 'Сайтты пайдалана бастаған соң, соңғы әрекеттеріңіз осында көрінеді.',
      recentContinue: 'Чек-листті жалғастыру',
      gameElden: 'Elden Ring',
      gameShadow: 'Shadow of the Erdtree',
      timeJustNow: 'Жаңа ғана',
      timeMinutes: '{n} мин. бұрын',
      timeHours: '{n} сағ. бұрын',
      timeDays: '{n} күн бұрын',
      menuAccountLabel: 'Аккаунт',
      menuPrefsLabel: 'Баптаулар',
      avatarEditLabel: 'Аватарды өзгерту',
      nicknameEditLabel: 'Никнеймді өзгерту',
      nicknameSave: 'Сақтау',
      nicknameCancel: 'Бас тарту',
      commentsTitle: 'Сіздің пікірлеріңіз',
      commentsCount: '{n} пікір',
      commentsHint: 'Нұсқаулық бойынша қалдырған барлық пікірлеріңіз осында — қай босс, не жазылған және қашан.',
      commentsViewBtn: 'Барлық пікірлеріңізді қарау',
      commentsModalTitle: 'Сіздің пікірлеріңіз',
      commentsModalEmpty: 'Сіз әлі пікір қалдырған жоқсыз — кез келген босс бетінде біріншісін қалдырыңыз.',
      commentDeleteLabel: 'Пікірді жою',
      commentDeleteConfirm: 'Бұл пікірді жою керек пе?',
      commentDeleteError: 'Пікірді жою мүмкін болмады. Қайталап көріңіз.'
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

    els.commentsTitle = document.getElementById('profile-comments-title');
    els.commentsSummary = document.getElementById('profile-comments-summary');
    els.commentsHint = document.getElementById('profile-comments-hint');
    els.commentsViewBtn = document.getElementById('profile-comments-view-btn');
    els.commentsViewLabel = document.getElementById('profile-comments-view-label');

    els.myCommentsModal = document.getElementById('my-comments-modal');
    els.myCommentsClose = document.getElementById('my-comments-close');
    els.myCommentsTitle = document.getElementById('my-comments-title');
    els.myCommentsList = document.getElementById('my-comments-list');
    els.myCommentsEmpty = document.getElementById('my-comments-empty');
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
         later without a full page reload, and tear down that account's
         real-time listeners. */
      teardownProgressListeners();
      cachedProgressData = null;
      teardownMyComments();
      closeMyCommentsModal();
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
    subscribeProgressData(user.uid);
    subscribeMyComments(user.uid);
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

  /* Real-time coordinator for the "Recent activity" feed — tracks the
     latest snapshot from each of the four docs it depends on and only
     (re)renders once every one of them has delivered at least one
     snapshot, exactly like script.js's game-data listeners. */
  let latestEldenSnap = null;
  let latestShadowSnap = null;
  let latestTranslationsSnap = null;
  let latestUserSnap = null;
  let unsubGameEldenring = null;
  let unsubGameShadow = null;
  let unsubGameTranslations = null;
  let unsubUserDoc = null;

  function teardownProgressListeners() {
    if (unsubGameEldenring) { unsubGameEldenring(); unsubGameEldenring = null; }
    if (unsubGameShadow) { unsubGameShadow(); unsubGameShadow = null; }
    if (unsubGameTranslations) { unsubGameTranslations(); unsubGameTranslations = null; }
    if (unsubUserDoc) { unsubUserDoc(); unsubUserDoc = null; }
    latestEldenSnap = null;
    latestShadowSnap = null;
    latestTranslationsSnap = null;
    latestUserSnap = null;
  }

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
    const langTable = translations[currentLang];
    els.recentList.hidden = false;
    els.recentList.innerHTML = '';

    entries.forEach((entry) => {
      const info = bossIndex[entry.id];
      if (!info) return;
      const bossName = (langTable && langTable.bosses[entry.id]) || info.name;
      const regionName = (langTable && langTable.regions[info.regionId]) || info.regionName;
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

  function updateCachedProgressFromSnapshots() {
    if (!latestEldenSnap || !latestShadowSnap || !latestTranslationsSnap || !latestUserSnap) return;

    const eldenRegions = latestEldenSnap.exists ? latestEldenSnap.data().regions : [];
    const shadowRegions = latestShadowSnap.exists ? latestShadowSnap.data().regions : [];
    const translationsData = latestTranslationsSnap.exists ? latestTranslationsSnap.data() : {};
    const userData = latestUserSnap.exists ? latestUserSnap.data() : {};

    const progressList = Array.isArray(userData.progress) ? userData.progress : [];
    const progressSet = new Set(progressList.filter((id) => typeof id === 'string'));
    const historyList = Array.isArray(userData.history) ? userData.history : [];
    const history = historyList.filter((entry) => entry && typeof entry.id === 'string' && typeof entry.at === 'number');

    const { bossIndex, total, done } = buildBossIndexAndTotals(eldenRegions, shadowRegions, progressSet);

    cachedProgressData = {
      bossIndex,
      translations: {
        ru: {
          regions: (translationsData.ru && translationsData.ru.regions) || {},
          bosses: (translationsData.ru && translationsData.ru.bosses) || {}
        },
        kk: {
          regions: (translationsData.kk && translationsData.kk.regions) || {},
          bosses: (translationsData.kk && translationsData.kk.bosses) || {}
        }
      },
      history,
      total,
      done
    };
    renderRecentSection();
    renderMyCommentsModal();
  }

  function subscribeProgressData(uid) {
    /* A different account logging in without a page reload would
       otherwise leave the previous account's listeners (and its
       users/{uid} subscription) running. */
    teardownProgressListeners();

    unsubGameEldenring = db.collection('gameData').doc('eldenring').onSnapshot((snap) => {
      latestEldenSnap = snap;
      updateCachedProgressFromSnapshots();
    }, (err) => console.error('Failed to load boss data (eldenring):', err));

    unsubGameShadow = db.collection('gameData').doc('shadowerdtree').onSnapshot((snap) => {
      latestShadowSnap = snap;
      updateCachedProgressFromSnapshots();
    }, (err) => console.error('Failed to load boss data (shadowerdtree):', err));

    unsubGameTranslations = db.collection('gameData').doc('translations').onSnapshot((snap) => {
      latestTranslationsSnap = snap;
      updateCachedProgressFromSnapshots();
    }, (err) => console.error('Failed to load translations:', err));

    unsubUserDoc = db.collection('users').doc(uid).onSnapshot((snap) => {
      latestUserSnap = snap;
      updateCachedProgressFromSnapshots();
    }, (err) => console.error('Failed to load recent activity:', err));
  }

  /* ==========================================================================
     Your comments — every comments/{id} doc this account authored
     (single equality filter, `where('uid', '==', uid)`, sorted
     newest-first client-side — same no-composite-index approach as the
     per-boss query in wiki-boss.js). Boss names are resolved through the
     same bossIndex/translations the Recent Activity feed above already
     builds, rather than storing a name snapshot on each comment, so a
     later boss rename stays correct here too.
     ========================================================================== */

  let myComments = [];
  let unsubMyComments = null;

  function teardownMyComments() {
    if (unsubMyComments) {
      unsubMyComments();
      unsubMyComments = null;
    }
    myComments = [];
  }

  function subscribeMyComments(uid) {
    teardownMyComments();
    unsubMyComments = db.collection('comments').where('uid', '==', uid).onSnapshot((snap) => {
      const list = [];
      snap.forEach((doc) => {
        const data = doc.data();
        if (typeof data.text !== 'string' || typeof data.bossId !== 'string') return;
        const createdAt = data.createdAt && typeof data.createdAt.toMillis === 'function' ? data.createdAt.toMillis() : null;
        list.push({ id: doc.id, bossId: data.bossId, text: data.text, createdAt });
      });
      list.sort((a, b) => (b.createdAt == null ? Infinity : b.createdAt) - (a.createdAt == null ? Infinity : a.createdAt));
      myComments = list;
      updateCommentsSummary();
      renderMyCommentsModal();
    }, (err) => console.error('Failed to load your comments:', err));
  }

  function updateCommentsSummary() {
    if (els.commentsSummary) els.commentsSummary.textContent = t('commentsCount').replace('{n}', myComments.length);
  }

  function formatCommentDateTime(ms) {
    if (ms == null) return t('timeJustNow');
    const date = new Date(ms);
    if (Number.isNaN(date.getTime())) return '';
    const locale = currentLang === 'ru' ? 'ru-RU' : currentLang === 'kk' ? 'kk-KZ' : 'en-US';
    try {
      return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
    } catch (err) {
      return date.toLocaleString();
    }
  }

  function renderMyCommentsModal() {
    if (!els.myCommentsList || !els.myCommentsEmpty) return;

    if (!myComments.length) {
      els.myCommentsList.hidden = true;
      els.myCommentsList.innerHTML = '';
      els.myCommentsEmpty.hidden = false;
      return;
    }

    els.myCommentsEmpty.hidden = true;
    els.myCommentsList.hidden = false;
    els.myCommentsList.innerHTML = '';

    const bossIndex = cachedProgressData ? cachedProgressData.bossIndex : {};
    const translations = cachedProgressData ? cachedProgressData.translations : null;
    const langTable = translations && (currentLang === 'ru' || currentLang === 'kk') ? translations[currentLang] : null;

    myComments.forEach((comment) => {
      const info = bossIndex[comment.bossId];
      const bossName = (info && langTable && langTable.bosses[comment.bossId]) || (info && info.name) || comment.bossId;

      const li = document.createElement('li');
      li.className = 'my-comment-item';

      const head = document.createElement('div');
      head.className = 'my-comment-head';

      const link = document.createElement('a');
      link.className = 'my-comment-boss-link';
      link.href = `wiki-boss.html?id=${encodeURIComponent(comment.bossId)}`;
      link.textContent = bossName;
      head.appendChild(link);

      const date = document.createElement('span');
      date.className = 'my-comment-date';
      date.textContent = formatCommentDateTime(comment.createdAt);
      head.appendChild(date);

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'my-comment-delete';
      deleteBtn.setAttribute('aria-label', t('commentDeleteLabel'));
      deleteBtn.title = t('commentDeleteLabel');
      deleteBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z"/></svg>';
      deleteBtn.addEventListener('click', () => deleteMyComment(comment.id));
      head.appendChild(deleteBtn);

      li.appendChild(head);

      const text = document.createElement('p');
      text.className = 'my-comment-text';
      text.textContent = comment.text;
      li.appendChild(text);

      els.myCommentsList.appendChild(li);
    });
  }

  function deleteMyComment(commentId) {
    if (!confirm(t('commentDeleteConfirm'))) return;
    db.collection('comments').doc(commentId).delete().catch((err) => {
      console.error('Failed to delete comment:', err);
      alert(t('commentDeleteError'));
    });
  }

  function openMyCommentsModal() {
    if (!els.myCommentsModal) return;
    closeBurgerMenu();
    els.myCommentsModal.hidden = false;
  }

  function closeMyCommentsModal() {
    if (!els.myCommentsModal) return;
    els.myCommentsModal.hidden = true;
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

    if (els.commentsTitle) els.commentsTitle.textContent = t('commentsTitle');
    if (els.commentsHint) els.commentsHint.textContent = t('commentsHint');
    if (els.commentsViewLabel) els.commentsViewLabel.textContent = t('commentsViewBtn');
    if (els.myCommentsTitle) els.myCommentsTitle.textContent = t('commentsModalTitle');
    if (els.myCommentsEmpty) els.myCommentsEmpty.textContent = t('commentsModalEmpty');
    updateCommentsSummary();
    renderMyCommentsModal();

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
      if (els.myCommentsModal && !els.myCommentsModal.hidden) closeMyCommentsModal();
    });
  }

  function attachMyCommentsEvents() {
    if (els.commentsViewBtn) {
      els.commentsViewBtn.addEventListener('click', openMyCommentsModal);
    }
    if (els.myCommentsClose) {
      els.myCommentsClose.addEventListener('click', closeMyCommentsModal);
    }
    if (els.myCommentsModal) {
      els.myCommentsModal.addEventListener('click', (event) => {
        if (event.target === els.myCommentsModal) closeMyCommentsModal();
      });
    }
  }

  function init() {
    cacheDom();

    const theme = loadPreference(THEME_KEY, 'dark', ['dark', 'light']);
    applyTheme(theme);

    const lang = loadPreference(LANG_KEY, 'en', ['en', 'ru', 'kk']);

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
    attachMyCommentsEvents();

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
