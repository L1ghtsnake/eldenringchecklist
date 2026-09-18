'use strict';

const STORAGE_KEY = 'eldenRingBossChecklist';
const THEME_KEY = 'eldenRingBossChecklistTheme';
const LANG_KEY = 'eldenRingBossChecklistLang';
const GAME_KEY = 'eldenRingBossChecklistGame';
const CATEGORY_FILTER_KEY = 'eldenRingBossChecklistCategories';

/* Boss categories for the category filter. Bosses aren't tagged with these
   yet (that mapping comes later), so matchesCategoryFilter() treats any
   boss without a `categories` array as always visible — the filter is
   wired up and ready, it just has nothing to narrow down until the data
   carries category tags. */
const BOSS_CATEGORIES = ['story', 'hard', 'quest', 'optional'];


let games = {};
let ruNames = { regions: {}, bosses: {} };

/* UI string dictionary */
const i18n = {
  en: {
    eyebrow: 'Lands Between tracker',
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
    resetConfirm: 'Reset all boss progress? This cannot be undone.',
    themeToggle: 'Toggle dark or light theme',
    login: 'Log in',
    signup: 'Sign up',
    logout: 'Log out',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    loginSubmit: 'Log in',
    signupSubmit: 'Create account',
    authErrorGeneric: 'Something went wrong. Please try again.',
    authErrorInvalidEmail: 'Please enter a valid email address.',
    authErrorUserNotFound: 'No account found with this email.',
    authErrorWrongPassword: 'Incorrect password.',
    authErrorEmailInUse: 'An account with this email already exists.',
    authErrorWeakPassword: 'Password should be at least 6 characters.',
    authNoAccount: "Don't have an account?",
    authHaveAccount: 'Already have an account?',
    authSuccessLogin: 'Logged in successfully',
    authSuccessSignup: 'Account created successfully',
    account: 'Account',
    categoryFilterLabel: 'Filter by category',
    categoryStory: 'Story bosses',
    categoryHard: 'Hard bosses',
    categoryQuest: 'Quest bosses',
    categoryOptional: 'Optional bosses',
    languageLabel: 'Language',
    nicknameLabel: 'Nickname',
    authErrorNicknameRequired: 'Please enter a nickname.',
    memberSince: 'Member since',
    avatarEditLabel: 'Change avatar',
    avatarErrorInvalid: 'Please choose an image file.',
    avatarErrorGeneric: 'Could not update the avatar. Please try again.',
    authSubtitleLogin: 'Welcome back — pick up where you left off.',
    authSubtitleSignup: 'Create an account to save your progress anywhere.'
  },
  ru: {
    eyebrow: 'Междуземье',
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
    resetConfirm: 'Сбросить весь прогресс по боссам? Это действие необратимо.',
    themeToggle: 'Переключить тёмную или светлую тему',
    login: 'Войти',
    signup: 'Регистрация',
    logout: 'Выйти',
    emailLabel: 'Почта',
    passwordLabel: 'Пароль',
    loginSubmit: 'Войти',
    signupSubmit: 'Создать аккаунт',
    authErrorGeneric: 'Что-то пошло не так. Попробуйте ещё раз.',
    authErrorInvalidEmail: 'Введите корректный адрес почты.',
    authErrorUserNotFound: 'Аккаунт с такой почтой не найден.',
    authErrorWrongPassword: 'Неверный пароль.',
    authErrorEmailInUse: 'Аккаунт с такой почтой уже существует.',
    authErrorWeakPassword: 'Пароль должен содержать не менее 6 символов.',
    authNoAccount: 'Нет аккаунта?',
    authHaveAccount: 'Уже есть аккаунт?',
    authSuccessLogin: 'Вы успешно вошли в аккаунт',
    authSuccessSignup: 'Аккаунт успешно создан',
    account: 'Аккаунт',
    categoryFilterLabel: 'Фильтр по категориям',
    categoryStory: 'Сюжетные боссы',
    categoryHard: 'Сложные боссы',
    categoryQuest: 'Квестовые боссы',
    categoryOptional: 'Необязательные боссы',
    languageLabel: 'Язык',
    nicknameLabel: 'Никнейм',
    authErrorNicknameRequired: 'Пожалуйста, введите никнейм.',
    memberSince: 'Регистрация:',
    avatarEditLabel: 'Изменить аватар',
    avatarErrorInvalid: 'Пожалуйста, выберите файл изображения.',
    avatarErrorGeneric: 'Не удалось обновить аватар. Попробуйте ещё раз.',
    authSubtitleLogin: 'С возвращением — продолжайте с того места, где остановились.',
    authSubtitleSignup: 'Создайте аккаунт, чтобы сохранять прогресс на любом устройстве.'
  }
};

/* ==========================================================================
   State
   ========================================================================== */

const state = {
  filter: 'all',
  searchTerm: '',
  completed: new Set(),
  openRegions: {
    eldenring: new Set(),
    shadowerdtree: new Set()
  },
  lang: 'en',
  theme: 'dark',
  activeGame: 'eldenring',
  categoryFilters: new Set(BOSS_CATEGORIES)
};

let authMode = 'login';
let currentUser = null;
let currentUserProfile = null;

const els = {};

function cacheDom() {
  els.html = document.documentElement;
  els.accordion = document.getElementById('accordion');
  els.searchInput = document.getElementById('search-input');
  els.filterButtons = document.querySelectorAll('.filter-btn');
  els.resetBtn = document.getElementById('reset-btn');
  els.resetLabel = document.getElementById('reset-label');
  els.loginBtn = document.getElementById('login-btn');
  els.accountBtn = document.getElementById('account-btn');
  els.accountBtnAvatar = document.getElementById('account-btn-avatar');
  els.accountBtnIcon = document.getElementById('account-btn-icon');
  els.logoutBtn = document.getElementById('logout-btn');
  els.authModal = document.getElementById('auth-modal');
  els.authModalClose = document.getElementById('auth-modal-close');
  els.authModalIcon = document.getElementById('auth-modal-icon');
  els.authModalTitle = document.getElementById('auth-modal-title');
  els.authModalSubtitle = document.getElementById('auth-modal-subtitle');
  els.authModalCard = els.authModal ? els.authModal.querySelector('.modal-card') : null;
  els.authForm = document.getElementById('auth-form');
  els.authNicknameField = document.getElementById('auth-nickname-field');
  els.authNicknameInput = document.getElementById('auth-nickname');
  els.authNicknameLabel = document.getElementById('auth-nickname-label');
  els.authEmailInput = document.getElementById('auth-email');
  els.authPasswordInput = document.getElementById('auth-password');
  els.authEmailLabel = document.getElementById('auth-email-label');
  els.authPasswordLabel = document.getElementById('auth-password-label');
  els.authError = document.getElementById('auth-error');
  els.authSubmit = document.getElementById('auth-submit');
  els.authSwitchText = document.getElementById('auth-switch-text');
  els.authSwitchBtn = document.getElementById('auth-switch-btn');
  els.authToast = document.getElementById('auth-toast');
  els.authToastText = document.getElementById('auth-toast-text');
  els.accountModal = document.getElementById('account-modal');
  els.accountModalClose = document.getElementById('account-modal-close');
  els.accountModalNickname = document.getElementById('account-modal-nickname');
  els.accountModalEmail = document.getElementById('account-modal-email');
  els.accountModalDate = document.getElementById('account-modal-date');
  els.accountAvatarImg = document.getElementById('account-avatar-img');
  els.accountAvatarFallback = document.getElementById('account-avatar-fallback');
  els.accountAvatarEditBtn = document.getElementById('account-avatar-edit');
  els.accountAvatarInput = document.getElementById('account-avatar-input');
  els.accountAvatarError = document.getElementById('account-avatar-error');
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
}

/* ==========================================================================
   Remote data — boss & region names + Russian translations live in Firestore
   ========================================================================== */

async function fetchGameData() {
  const [eldenSnap, shadowSnap, translationsSnap] = await Promise.all([
    db.collection('gameData').doc('eldenring').get(),
    db.collection('gameData').doc('shadowerdtree').get(),
    db.collection('gameData').doc('translations').get()
  ]);

  if (!eldenSnap.exists || !shadowSnap.exists) {
    throw new Error('Boss data not found in Firestore — run seed.html once to upload it.');
  }

  const translations = translationsSnap.exists ? translationsSnap.data() : {};

  return {
    eldenRingRegions: eldenSnap.data().regions,
    shadowErdtreeRegions: shadowSnap.data().regions,
    ruNames: {
      regions: translations.regions || {},
      bosses: translations.bosses || {}
    }
  };
}

/* ==========================================================================
   Authentication — email/password sign in & sign up via Firebase Auth
   ========================================================================== */

function refreshAuthModalText() {
  if (els.authModalTitle) els.authModalTitle.textContent = authMode === 'login' ? t('login') : t('signup');
  if (els.authModalSubtitle) els.authModalSubtitle.textContent = authMode === 'login' ? t('authSubtitleLogin') : t('authSubtitleSignup');
  if (els.authNicknameLabel) els.authNicknameLabel.textContent = t('nicknameLabel');
  if (els.authEmailLabel) els.authEmailLabel.textContent = t('emailLabel');
  if (els.authPasswordLabel) els.authPasswordLabel.textContent = t('passwordLabel');
  if (els.authSubmit) els.authSubmit.textContent = authMode === 'login' ? t('loginSubmit') : t('signupSubmit');
  if (els.authSwitchText) els.authSwitchText.textContent = authMode === 'login' ? t('authNoAccount') : t('authHaveAccount');
  if (els.authSwitchBtn) els.authSwitchBtn.textContent = authMode === 'login' ? t('signup') : t('login');
  if (els.loginBtn) els.loginBtn.setAttribute('aria-label', t('login'));
  if (els.accountBtn) els.accountBtn.setAttribute('aria-label', t('account'));
  if (els.accountAvatarEditBtn) {
    els.accountAvatarEditBtn.setAttribute('aria-label', t('avatarEditLabel'));
    els.accountAvatarEditBtn.setAttribute('title', t('avatarEditLabel'));
  }
  if (els.logoutBtn) {
    const logoutLabel = els.logoutBtn.querySelector('#logout-label');
    if (logoutLabel) logoutLabel.textContent = t('logout');
  }
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

function showAuthError(message) {
  if (!els.authError) return;
  els.authError.textContent = message;
  els.authError.hidden = false;
}

function hideAuthError() {
  if (!els.authError) return;
  els.authError.hidden = true;
  els.authError.textContent = '';
}

let authToastTimer = null;

function showAuthToast(message) {
  if (!els.authToast || !els.authToastText) return;
  if (authToastTimer) {
    window.clearTimeout(authToastTimer);
    authToastTimer = null;
  }
  els.authToastText.textContent = message;
  els.authToast.hidden = false;
  requestAnimationFrame(() => els.authToast.classList.add('is-visible'));
  authToastTimer = window.setTimeout(() => {
    els.authToast.classList.remove('is-visible');
    window.setTimeout(() => {
      els.authToast.hidden = true;
    }, 320);
  }, 2600);
}

/* Login/signup icon swap for setAuthTab() below. Deliberately two
   different pictures (door vs. person-plus) rather than one static icon,
   so the two modes look different at a glance and not just reworded. */
const AUTH_ICONS = {
  login: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>',
  signup: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM19 8v6M22 11h-6"/></svg>'
};

/* Sets which mode the modal is in ('login' or 'signup') without any
   segmented tab control — but the two modes still look visibly different
   (icon, accent border, button gradient, subtitle), not just reworded
   labels, so switching between them doesn't feel identical. */
function setAuthTab(mode) {
  authMode = mode;
  if (els.authModal) els.authModal.dataset.mode = mode;
  if (els.authModalIcon) {
    els.authModalIcon.innerHTML = AUTH_ICONS[mode];
    els.authModalIcon.classList.toggle('auth-modal-icon--login', mode === 'login');
    els.authModalIcon.classList.toggle('auth-modal-icon--signup', mode === 'signup');
  }
  if (els.authPasswordInput) {
    els.authPasswordInput.setAttribute('autocomplete', mode === 'login' ? 'current-password' : 'new-password');
  }
  if (els.authNicknameField) els.authNicknameField.hidden = mode !== 'signup';
  if (els.authNicknameInput) {
    if (mode === 'signup') {
      els.authNicknameInput.setAttribute('required', 'required');
    } else {
      els.authNicknameInput.removeAttribute('required');
    }
  }
  hideAuthError();
  refreshAuthModalText();
}

function openAuthModal(mode) {
  if (!els.authModal) return;
  setAuthTab(mode);
  if (els.authForm) els.authForm.reset();
  hideAuthError();
  els.authModal.hidden = false;
  window.setTimeout(() => {
    if (els.authEmailInput) els.authEmailInput.focus();
  }, 0);
}

function closeAuthModal() {
  if (!els.authModal) return;
  els.authModal.hidden = true;
}

function friendlyAuthError(err) {
  const map = {
    'auth/invalid-email': 'authErrorInvalidEmail',
    'auth/user-not-found': 'authErrorUserNotFound',
    'auth/wrong-password': 'authErrorWrongPassword',
    'auth/invalid-credential': 'authErrorWrongPassword',
    'auth/email-already-in-use': 'authErrorEmailInUse',
    'auth/weak-password': 'authErrorWeakPassword'
  };
  const key = err && map[err.code];
  return key ? t(key) : t('authErrorGeneric');
}

/* Records that a user exists / signed in — nickname + email + timestamps
   only. Firebase Auth already stores the password itself (hashed, never
   in plain text) so it is never written here too; duplicating it in
   Firestore would just be a second, weaker copy of a secret that a
   misconfigured rule or a leaked read could expose. Non-fatal: the user
   stays signed in even if this write fails (e.g. Firestore rules for
   "users" haven't been opened up yet). */
async function recordUserAccount(user, isNewAccount, nickname) {
  if (!user) return;
  try {
    const now = firebase.firestore.FieldValue.serverTimestamp();
    const payload = { email: user.email, lastLoginAt: now };
    if (isNewAccount) {
      payload.createdAt = now;
      if (nickname) payload.nickname = nickname;
    }
    await db.collection('users').doc(user.uid).set(payload, { merge: true });
  } catch (err) {
    console.error('Failed to record user account in Firestore:', err);
  }
}

/* Reads the extra profile fields that live only in Firestore, not on the
   Firebase Auth user object — currently just the avatar image. Nickname
   and account-creation date come straight off the Auth user instead
   (displayName / metadata.creationTime), so they're always in sync even
   if this read fails. */
async function fetchUserProfile(uid) {
  try {
    const snap = await db.collection('users').doc(uid).get();
    return snap.exists ? snap.data() : null;
  } catch (err) {
    console.error('Failed to load user profile from Firestore:', err);
    return null;
  }
}

/* Sets the inline `display` directly in addition to the `hidden`
   attribute — belt-and-suspenders so the image/fallback pair can never
   both render at once, regardless of any CSS specificity edge case. */
function renderAvatarInto(imgEl, iconEl, dataUrl) {
  if (!imgEl || !iconEl) return;
  if (dataUrl) {
    imgEl.src = dataUrl;
    imgEl.hidden = false;
    imgEl.style.display = '';
    iconEl.hidden = true;
    iconEl.style.display = 'none';
  } else {
    imgEl.hidden = true;
    imgEl.style.display = 'none';
    imgEl.removeAttribute('src');
    iconEl.hidden = false;
    iconEl.style.display = '';
  }
}

function formatAccountDate(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '';
  try {
    return new Intl.DateTimeFormat(state.lang === 'ru' ? 'ru-RU' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  } catch (err) {
    return '';
  }
}

function renderAccountModal(user, profile) {
  if (!user) return;
  const nickname = user.displayName || (profile && profile.nickname) || user.email || '';
  if (els.accountModalNickname) els.accountModalNickname.textContent = nickname;
  if (els.accountModalEmail) els.accountModalEmail.textContent = user.email || '';
  if (els.accountModalDate) {
    const formatted = formatAccountDate(user.metadata && user.metadata.creationTime);
    els.accountModalDate.textContent = formatted ? `${t('memberSince')} ${formatted}` : '';
  }
  renderAvatarInto(els.accountAvatarImg, els.accountAvatarFallback, profile && profile.avatarDataUrl);
}

/* Client-side resize/compress before storing an avatar as a data URL in
   Firestore. Deliberately not using Firebase Storage — new Firebase
   projects need the paid Blaze plan for Storage, and a small compressed
   JPEG easily fits as a plain Firestore field. */
const AVATAR_MAX_DIMENSION = 256;
const AVATAR_JPEG_QUALITY = 0.82;

function readAndResizeImage(file, maxDimension) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read-failed'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('decode-failed'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round(height * (maxDimension / width));
            width = maxDimension;
          }
        } else if (height > maxDimension) {
          width = Math.round(width * (maxDimension / height));
          height = maxDimension;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', AVATAR_JPEG_QUALITY));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function showAccountAvatarError(message) {
  if (!els.accountAvatarError) return;
  els.accountAvatarError.textContent = message;
  els.accountAvatarError.hidden = false;
}

function hideAccountAvatarError() {
  if (!els.accountAvatarError) return;
  els.accountAvatarError.hidden = true;
  els.accountAvatarError.textContent = '';
}

async function handleAvatarChange(event) {
  const file = event.target.files && event.target.files[0];
  event.target.value = '';
  if (!file || !currentUser) return;

  if (!file.type || !file.type.startsWith('image/')) {
    showAccountAvatarError(t('avatarErrorInvalid'));
    return;
  }

  hideAccountAvatarError();
  try {
    const dataUrl = await readAndResizeImage(file, AVATAR_MAX_DIMENSION);
    currentUserProfile = Object.assign({}, currentUserProfile, { avatarDataUrl: dataUrl });
    renderAvatarInto(els.accountAvatarImg, els.accountAvatarFallback, dataUrl);
    renderAvatarInto(els.accountBtnAvatar, els.accountBtnIcon, dataUrl);
    await db.collection('users').doc(currentUser.uid).set({ avatarDataUrl: dataUrl }, { merge: true });
  } catch (err) {
    console.error('Failed to update avatar:', err);
    showAccountAvatarError(t('avatarErrorGeneric'));
  }
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  hideAuthError();

  const email = els.authEmailInput.value.trim();
  const password = els.authPasswordInput.value;
  const isSignup = authMode === 'signup';
  const nickname = els.authNicknameInput ? els.authNicknameInput.value.trim() : '';

  if (isSignup && !nickname) {
    showAuthError(t('authErrorNicknameRequired'));
    return;
  }

  if (els.authSubmit) els.authSubmit.disabled = true;
  try {
    const credential = isSignup
      ? await auth.createUserWithEmailAndPassword(email, password)
      : await auth.signInWithEmailAndPassword(email, password);

    if (isSignup) {
      await credential.user.updateProfile({ displayName: nickname });
    }

    await recordUserAccount(credential.user, isSignup, isSignup ? nickname : undefined);
    await updateAuthUI(credential.user);
    closeAuthModal();
    showAuthToast(isSignup ? t('authSuccessSignup') : t('authSuccessLogin'));
  } catch (err) {
    console.error('Auth error:', err);
    showAuthError(friendlyAuthError(err));
  } finally {
    if (els.authSubmit) els.authSubmit.disabled = false;
  }
}

function openAccountModal() {
  if (!els.accountModal) return;
  if (currentUser) renderAccountModal(currentUser, currentUserProfile);
  els.accountModal.hidden = false;
}

function closeAccountModal() {
  if (!els.accountModal) return;
  els.accountModal.hidden = true;
}

async function updateAuthUI(user) {
  currentUser = user;
  const loggedIn = !!user;
  if (els.loginBtn) els.loginBtn.hidden = loggedIn;
  if (els.accountBtn) els.accountBtn.hidden = !loggedIn;

  if (loggedIn) {
    closeAuthModal();
    currentUserProfile = await fetchUserProfile(user.uid);
    renderAvatarInto(els.accountBtnAvatar, els.accountBtnIcon, currentUserProfile && currentUserProfile.avatarDataUrl);
    renderAccountModal(user, currentUserProfile);
  } else {
    currentUserProfile = null;
    closeAccountModal();
    renderAvatarInto(els.accountBtnAvatar, els.accountBtnIcon, null);
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

function attachAuthEvents() {
  if (els.loginBtn) els.loginBtn.addEventListener('click', () => openAuthModal('login'));
  if (els.accountBtn) els.accountBtn.addEventListener('click', openAccountModal);
  if (els.logoutBtn) {
    els.logoutBtn.addEventListener('click', () => {
      auth.signOut();
      closeAccountModal();
    });
  }
  if (els.accountAvatarEditBtn && els.accountAvatarInput) {
    els.accountAvatarEditBtn.addEventListener('click', () => els.accountAvatarInput.click());
  }
  if (els.accountAvatarInput) els.accountAvatarInput.addEventListener('change', handleAvatarChange);
  if (els.authModalClose) els.authModalClose.addEventListener('click', closeAuthModal);
  if (els.authModal) {
    els.authModal.addEventListener('click', (event) => {
      if (event.target === els.authModal) closeAuthModal();
    });
  }
  if (els.accountModalClose) els.accountModalClose.addEventListener('click', closeAccountModal);
  if (els.accountModal) {
    els.accountModal.addEventListener('click', (event) => {
      if (event.target === els.accountModal) closeAccountModal();
    });
  }
  if (els.authSwitchBtn) {
    els.authSwitchBtn.addEventListener('click', () => {
      setAuthTab(authMode === 'login' ? 'signup' : 'login');
      if (els.authForm) els.authForm.reset();
      if (els.authEmailInput) els.authEmailInput.focus();
      if (els.authModalCard) {
        els.authModalCard.classList.remove('mode-switch-anim');
        void els.authModalCard.offsetWidth;
        els.authModalCard.classList.add('mode-switch-anim');
      }
    });
  }
  if (els.authForm) els.authForm.addEventListener('submit', handleAuthSubmit);
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (els.authModal && !els.authModal.hidden) closeAuthModal();
    if (els.accountModal && !els.accountModal.hidden) closeAccountModal();
    if (els.categoryFilterPanel && !els.categoryFilterPanel.hidden) closeCategoryPanel();
    if (els.langFilterPanel && !els.langFilterPanel.hidden) closeLangPanel();
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

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(state.completed)));
  } catch (err) {
    /* storage unavailable */
  }
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
  if (state.lang === 'ru' && ruNames.regions[region.id]) return ruNames.regions[region.id];
  return region.name;
}

function getBossName(boss) {
  if (state.lang === 'ru' && ruNames.bosses[boss.id]) return ruNames.bosses[boss.id];
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

/* ==========================================================================
   Rendering — accordion
   ========================================================================== */

function buildAccordion() {
  els.accordion.innerHTML = '';
  let visibleRegionCount = 0;
  const openRegions = state.openRegions[state.activeGame];

  getActiveRegions().forEach((region, regionIndex) => {
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
  } else {
    state.completed.delete(bossId);
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
    } else {
      state.completed.delete(boss.id);
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
  els.footerText.textContent = t('footer');
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

  refreshAuthModalText();
  refreshCategoryFilterText();
  if (currentUser) renderAccountModal(currentUser, currentUserProfile);

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
}

async function init() {
  cacheDom();
  auth.onAuthStateChanged(updateAuthUI);
  attachAuthEvents();
  refreshAuthModalText();

  state.categoryFilters = loadCategoryFilters();
  if (els.categoryCheckboxes) {
    els.categoryCheckboxes.forEach((checkbox) => {
      checkbox.checked = state.categoryFilters.has(checkbox.value);
    });
  }
  refreshCategoryFilterButtonState();
  refreshCategoryFilterText();
  refreshLangFilterText();

  try {
    const data = await fetchGameData();
    games = {
      eldenring: { id: 'eldenring', regions: data.eldenRingRegions },
      shadowerdtree: { id: 'shadowerdtree', regions: data.shadowErdtreeRegions }
    };
    ruNames = data.ruNames;
    state.openRegions.eldenring.add(data.eldenRingRegions[0].id);
    state.openRegions.shadowerdtree.add(data.shadowErdtreeRegions[0].id);
  } catch (err) {
    console.error('Failed to load boss data from Firebase:', err);
    if (els.accordion) {
      els.accordion.innerHTML = '<p class="no-results">Could not load boss data from the database. Check your connection and reload the page.</p>';
    }
    return;
  }

  state.completed = loadProgress();

  const savedTheme = loadPreference(THEME_KEY, 'dark', ['dark', 'light']);
  const savedLang = loadPreference(LANG_KEY, 'en', ['en', 'ru']);
  const savedGame = loadPreference(GAME_KEY, 'eldenring', ['eldenring', 'shadowerdtree']);

  attachEvents();
  applyTheme(savedTheme);
  applyGame(savedGame);
  applyLanguage(savedLang);
  requestAnimationFrame(() => document.body.classList.add('is-ready'));
}

document.addEventListener('DOMContentLoaded', init);
