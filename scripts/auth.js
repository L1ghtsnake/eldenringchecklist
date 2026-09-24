'use strict';

/* ==========================================================================
   Shared auth widget — Firebase email/password sign-in, the account
   modal (avatar, nickname, email, member-since, logout, and the link to
   the personal cabinet page). Every page that offers login (the landing
   page, the checklist, the personal cabinet) includes this one file
   instead of each carrying its own copy of ~500 lines of near-identical
   logic.

   Load order matters: the three Firebase compat SDK scripts, then
   scripts/firebase.js (defines the `auth` / `db` globals), then this
   file, then the page's own script. A page's own script calls
   `AuthWidget.init(lang, { onBeforeOpen, onAuthChange })` once during its
   own init(), and `AuthWidget.setLanguage(lang)` whenever the page's
   language toggle changes.

   `onBeforeOpen` — optional callback run just before the auth or account
   modal opens (checklist.html uses it to close the burger menu first).
   `onAuthChange` — optional callback run every time sign-in state
   changes, as `(user, profile)`; the profile page uses it to switch
   between its "please log in" and real profile views.
   ========================================================================== */

(function () {
  const i18n = {
    en: {
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
      nicknameLabel: 'Nickname',
      authErrorNicknameRequired: 'Please enter a nickname.',
      memberSince: 'Member since',
      avatarEditLabel: 'Change avatar',
      avatarErrorInvalid: 'Please choose an image file.',
      avatarErrorGeneric: 'Could not update the avatar. Please try again.',
      nicknameErrorGeneric: 'Could not update the nickname. Please try again.',
      authSubtitleLogin: 'Welcome back — pick up where you left off.',
      authSubtitleSignup: 'Create an account to save your progress anywhere.',
      loginMenuSub: 'Sync your progress across devices',
      manageAccount: 'Manage account',
      personalCabinet: 'Personal cabinet',
      adminPanelLabel: 'Admin panel',
      forgotPasswordLabel: 'Forgot password?'
    },
    ru: {
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
      nicknameLabel: 'Никнейм',
      authErrorNicknameRequired: 'Пожалуйста, введите никнейм.',
      memberSince: 'Регистрация:',
      avatarEditLabel: 'Изменить аватар',
      avatarErrorInvalid: 'Пожалуйста, выберите файл изображения.',
      avatarErrorGeneric: 'Не удалось обновить аватар. Попробуйте ещё раз.',
      nicknameErrorGeneric: 'Не удалось обновить никнейм. Попробуйте ещё раз.',
      authSubtitleLogin: 'С возвращением — продолжайте с того места, где остановились.',
      authSubtitleSignup: 'Создайте аккаунт, чтобы сохранять прогресс на любом устройстве.',
      loginMenuSub: 'Синхронизируйте прогресс между устройствами',
      manageAccount: 'Управление аккаунтом',
      personalCabinet: 'Личный кабинет',
      adminPanelLabel: 'Админ-панель',
      forgotPasswordLabel: 'Забыли пароль?'
    },
    kk: {
      login: 'Кіру',
      signup: 'Тіркелу',
      logout: 'Шығу',
      emailLabel: 'Пошта',
      passwordLabel: 'Құпия сөз',
      loginSubmit: 'Кіру',
      signupSubmit: 'Аккаунт жасау',
      authErrorGeneric: 'Бір қате кетті. Қайталап көріңіз.',
      authErrorInvalidEmail: 'Дұрыс пошта мекенжайын енгізіңіз.',
      authErrorUserNotFound: 'Бұл поштамен аккаунт табылмады.',
      authErrorWrongPassword: 'Құпия сөз қате.',
      authErrorEmailInUse: 'Бұл поштамен аккаунт бұрыннан бар.',
      authErrorWeakPassword: 'Құпия сөз кемінде 6 таңбадан тұруы керек.',
      authNoAccount: 'Аккаунтыңыз жоқ па?',
      authHaveAccount: 'Аккаунтыңыз бар ма?',
      authSuccessLogin: 'Сіз аккаунтқа сәтті кірдіңіз',
      authSuccessSignup: 'Аккаунт сәтті жасалды',
      account: 'Аккаунт',
      nicknameLabel: 'Никнейм',
      authErrorNicknameRequired: 'Никнейм енгізіңіз.',
      memberSince: 'Тіркелген күні:',
      avatarEditLabel: 'Аватарды өзгерту',
      avatarErrorInvalid: 'Сурет файлын таңдаңыз.',
      avatarErrorGeneric: 'Аватарды жаңарту мүмкін болмады. Қайталап көріңіз.',
      nicknameErrorGeneric: 'Никнеймді жаңарту мүмкін болмады. Қайталап көріңіз.',
      authSubtitleLogin: 'Қайта қош келдіңіз — тоқтаған жеріңізден жалғастырыңыз.',
      authSubtitleSignup: 'Прогресіңізді кез келген құрылғыда сақтау үшін аккаунт жасаңыз.',
      loginMenuSub: 'Прогресіңізді құрылғылар арасында синхрондаңыз',
      manageAccount: 'Аккаунтты басқару',
      personalCabinet: 'Жеке кабинет',
      adminPanelLabel: 'Әкімші панелі',
      forgotPasswordLabel: 'Құпия сөзді ұмыттыңыз ба?'
    }
  };

  let lang = 'en';
  let authMode = 'login';
  let currentUser = null;
  let currentUserProfile = null;
  let authToastTimer = null;
  const hooks = { onBeforeOpen: null, onAuthChange: null };
  const els = {};

  function t(key) {
    return (i18n[lang] && i18n[lang][key]) || i18n.en[key] || '';
  }

  function cacheDom() {
    els.loginBtn = document.getElementById('login-btn');
    els.loginBtnLabel = document.getElementById('login-btn-label');
    els.loginBtnSub = document.getElementById('login-btn-sub');
    els.accountBtn = document.getElementById('account-btn');
    els.accountBtnLabel = document.getElementById('account-btn-label');
    els.accountBtnAvatar = document.getElementById('account-btn-avatar');
    els.accountBtnIcon = document.getElementById('account-btn-icon');
    els.accountProfileCard = document.getElementById('account-profile-card');
    els.profileCardAvatar = document.getElementById('profile-card-avatar');
    els.profileCardIcon = document.getElementById('profile-card-icon');
    els.profileCardName = document.getElementById('profile-card-name');
    els.profileCardEmail = document.getElementById('profile-card-email');
    els.accountGroupDivider = document.getElementById('account-group-divider');
    els.logoutBtnInline = document.getElementById('logout-btn-inline');
    els.logoutInlineLabel = document.getElementById('logout-inline-label');
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
    els.authForgotBtn = document.getElementById('auth-forgot-btn');
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
    els.accountCabinetLink = document.getElementById('account-cabinet-link');
    els.accountCabinetLinkLabel = document.getElementById('account-cabinet-link-label');
    els.adminPanelLink = document.getElementById('admin-panel-link');
    els.adminPanelLinkLabel = document.getElementById('admin-panel-link-label');
  }

  function refreshAuthModalText() {
    if (els.authModalTitle) els.authModalTitle.textContent = authMode === 'login' ? t('login') : t('signup');
    if (els.authModalSubtitle) els.authModalSubtitle.textContent = authMode === 'login' ? t('authSubtitleLogin') : t('authSubtitleSignup');
    if (els.authNicknameLabel) els.authNicknameLabel.textContent = t('nicknameLabel');
    if (els.authEmailLabel) els.authEmailLabel.textContent = t('emailLabel');
    if (els.authPasswordLabel) els.authPasswordLabel.textContent = t('passwordLabel');
    if (els.authSubmit) els.authSubmit.textContent = authMode === 'login' ? t('loginSubmit') : t('signupSubmit');
    if (els.authForgotBtn) els.authForgotBtn.textContent = t('forgotPasswordLabel');
    if (els.authSwitchText) els.authSwitchText.textContent = authMode === 'login' ? t('authNoAccount') : t('authHaveAccount');
    if (els.authSwitchBtn) els.authSwitchBtn.textContent = authMode === 'login' ? t('signup') : t('login');
    if (els.loginBtn) els.loginBtn.setAttribute('aria-label', t('login'));
    if (els.loginBtnLabel) els.loginBtnLabel.textContent = t('login');
    if (els.loginBtnSub) els.loginBtnSub.textContent = t('loginMenuSub');
    if (els.accountBtn) els.accountBtn.setAttribute('aria-label', t('account'));
    if (els.accountBtnLabel) els.accountBtnLabel.textContent = t('account');
    if (els.accountProfileCard) {
      els.accountProfileCard.setAttribute('aria-label', t('manageAccount'));
      els.accountProfileCard.setAttribute('title', t('manageAccount'));
    }
    if (els.logoutBtnInline) els.logoutBtnInline.setAttribute('aria-label', t('logout'));
    if (els.logoutInlineLabel) els.logoutInlineLabel.textContent = t('logout');
    if (els.logoutBtn) {
      const logoutLabel = els.logoutBtn.querySelector('#logout-label');
      if (logoutLabel) logoutLabel.textContent = t('logout');
    }
    if (els.accountCabinetLinkLabel) els.accountCabinetLinkLabel.textContent = t('personalCabinet');
    if (els.adminPanelLinkLabel) els.adminPanelLinkLabel.textContent = t('adminPanelLabel');
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
     different pictures (door vs. person-plus) rather than one static
     icon, so the two modes look different at a glance and not just
     reworded. */
  const AUTH_ICONS = {
    login: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>',
    signup: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM19 8v6M22 11h-6"/></svg>'
  };

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
    if (els.authForgotBtn) els.authForgotBtn.hidden = mode !== 'login';
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
    if (hooks.onBeforeOpen) hooks.onBeforeOpen();
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
     in plain text) so it is never written here too. Non-fatal: the user
     stays signed in even if this write fails. */
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

  /* Reads the extra profile fields that live only in Firestore, not on
     the Firebase Auth user object — currently just the avatar image. */
  async function fetchUserProfile(uid) {
    try {
      const snap = await db.collection('users').doc(uid).get();
      return snap.exists ? snap.data() : null;
    } catch (err) {
      console.error('Failed to load user profile from Firestore:', err);
      return null;
    }
  }

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
      return new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-US', {
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
    /* Only ever shown to a user whose own Firestore users/{uid} doc has
       role: 'admin' — that field is never writable by the user's own
       client (see the Firestore rules in the admin setup notes), so
       this is a real gate, not just a hidden link. */
    if (els.adminPanelLink) els.adminPanelLink.hidden = !(profile && profile.role === 'admin');
  }

  /* Populates the rich profile row inside the checklist's burger menu —
     same nickname/email logic as the account modal, just written into
     the `.account-profile-card` elements instead. A no-op on pages that
     don't have that markup. */
  function renderAccountProfileCard(user, profile) {
    if (!user) return;
    const nickname = user.displayName || (profile && profile.nickname) || user.email || '';
    if (els.profileCardName) els.profileCardName.textContent = nickname;
    if (els.profileCardEmail) els.profileCardEmail.textContent = user.email || '';
  }

  /* Client-side resize/compress before storing an avatar as a data URL in
     Firestore — a small compressed JPEG easily fits as a plain Firestore
     field, avoiding the need for Firebase Storage (which needs the paid
     Blaze plan). */
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


  /* Public: change the signed-in user's avatar from a <input type=file>
     change event's File. Avatar editing itself now lives only in the
     personal cabinet page (profile.js calls this directly) — the account
     modal just displays the avatar read-only. Returns
     { ok: true } or { ok: false, message } with an already-localized
     error message, so callers don't need their own copy of auth.js's
     i18n strings. */
  async function changeAvatar(file) {
    if (!file || !currentUser) return { ok: false, message: t('avatarErrorGeneric') };

    if (!file.type || !file.type.startsWith('image/')) {
      return { ok: false, message: t('avatarErrorInvalid') };
    }

    try {
      const dataUrl = await readAndResizeImage(file, AVATAR_MAX_DIMENSION);
      currentUserProfile = Object.assign({}, currentUserProfile, { avatarDataUrl: dataUrl });
      renderAvatarInto(els.accountAvatarImg, els.accountAvatarFallback, dataUrl);
      renderAvatarInto(els.accountBtnAvatar, els.accountBtnIcon, dataUrl);
      renderAvatarInto(els.profileCardAvatar, els.profileCardIcon, dataUrl);
      await db.collection('users').doc(currentUser.uid).set({ avatarDataUrl: dataUrl }, { merge: true });
      if (hooks.onAuthChange) hooks.onAuthChange(currentUser, currentUserProfile);
      return { ok: true, dataUrl };
    } catch (err) {
      console.error('Failed to update avatar:', err);
      return { ok: false, message: t('avatarErrorGeneric') };
    }
  }

  /* Public: rename the signed-in user (Firebase Auth displayName is the
     source of truth everywhere it's set — see renderAccountModal /
     renderAccountProfileCard — with the Firestore `nickname` field kept
     in sync as a fallback for the rare case displayName isn't loaded
     yet). */
  async function changeNickname(newNickname) {
    const trimmed = (newNickname || '').trim();
    if (!currentUser) return { ok: false, message: t('authErrorGeneric') };
    if (!trimmed) return { ok: false, message: t('authErrorNicknameRequired') };

    try {
      await currentUser.updateProfile({ displayName: trimmed });
      currentUserProfile = Object.assign({}, currentUserProfile, { nickname: trimmed });
      await db.collection('users').doc(currentUser.uid).set({ nickname: trimmed }, { merge: true });
      renderAccountModal(currentUser, currentUserProfile);
      renderAccountProfileCard(currentUser, currentUserProfile);
      if (hooks.onAuthChange) hooks.onAuthChange(currentUser, currentUserProfile);
      return { ok: true, nickname: trimmed };
    } catch (err) {
      console.error('Failed to update nickname:', err);
      return { ok: false, message: t('nicknameErrorGeneric') };
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
    if (hooks.onBeforeOpen) hooks.onBeforeOpen();
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
    if (els.accountProfileCard) els.accountProfileCard.hidden = !loggedIn;
    if (els.accountGroupDivider) els.accountGroupDivider.hidden = !loggedIn;
    if (els.logoutBtnInline) els.logoutBtnInline.hidden = !loggedIn;

    if (loggedIn) {
      closeAuthModal();
      currentUserProfile = await fetchUserProfile(user.uid);
      renderAvatarInto(els.accountBtnAvatar, els.accountBtnIcon, currentUserProfile && currentUserProfile.avatarDataUrl);
      renderAvatarInto(els.profileCardAvatar, els.profileCardIcon, currentUserProfile && currentUserProfile.avatarDataUrl);
      renderAccountModal(user, currentUserProfile);
      renderAccountProfileCard(user, currentUserProfile);
    } else {
      currentUserProfile = null;
      closeAccountModal();
      renderAvatarInto(els.accountBtnAvatar, els.accountBtnIcon, null);
      renderAvatarInto(els.profileCardAvatar, els.profileCardIcon, null);
    }

    if (hooks.onAuthChange) hooks.onAuthChange(currentUser, currentUserProfile);
  }

  function attachAuthEvents() {
    if (els.loginBtn) {
      els.loginBtn.addEventListener('click', () => openAuthModal('login'));
    }
    if (els.accountBtn) {
      els.accountBtn.addEventListener('click', () => openAccountModal());
    }
    if (els.accountProfileCard) {
      els.accountProfileCard.addEventListener('click', () => openAccountModal());
    }
    if (els.logoutBtnInline) {
      els.logoutBtnInline.addEventListener('click', () => {
        auth.signOut();
      });
    }
    if (els.logoutBtn) {
      els.logoutBtn.addEventListener('click', () => {
        auth.signOut();
        closeAccountModal();
      });
    }
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
    });
  }

  function init(initialLang, options) {
    lang = initialLang || 'en';
    Object.assign(hooks, options || {});
    cacheDom();
    if (typeof auth !== 'undefined' && auth && typeof auth.onAuthStateChanged === 'function') {
      auth.onAuthStateChanged(updateAuthUI);
    }
    attachAuthEvents();
    refreshAuthModalText();
  }

  function setLanguage(newLang) {
    lang = newLang;
    refreshAuthModalText();
    if (currentUser) {
      renderAccountModal(currentUser, currentUserProfile);
      renderAccountProfileCard(currentUser, currentUserProfile);
    }
  }

  window.AuthWidget = {
    init,
    setLanguage,
    openAuthModal,
    changeAvatar,
    changeNickname,
    isLoggedIn: () => !!currentUser,
    getUser: () => currentUser,
    getProfile: () => currentUserProfile,
    isAdmin: () => !!(currentUserProfile && currentUserProfile.role === 'admin')
  };
})();
