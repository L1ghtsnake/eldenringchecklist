'use strict';

/* ==========================================================================
   Standalone "Reset password" page. Kept deliberately separate from the
   shared auth modal/auth.js: this is the one flow a signed-out, locked-out
   visitor needs to reach without first successfully logging in, so it
   gets its own minimal page (just a brand link, no burger menu / account
   widget) rather than living inside a modal on every other page.

   The actual email delivery is Firebase Auth's own hosted service —
   auth.sendPasswordResetEmail() below is a real, working call, not a
   stub. As long as Email/Password sign-in is enabled for this project
   (it already is — that's how login works at all) and the address is a
   real registered account, Firebase sends a real email from its own
   servers; nothing here needs a backend or SMTP setup. Clicking the link
   in that email lands on Firebase's own hosted "choose a new password"
   page, which is also already fully functional out of the box.
   ========================================================================== */

const THEME_KEY = 'eldenRingBossChecklistTheme';
const LANG_KEY = 'eldenRingBossChecklistLang';

const i18n = {
  en: {
    docTitle: 'Elden Ring Database — Reset password',
    title: 'Reset your password',
    subtitle: "Enter the email on your account and we'll send you a link to reset your password.",
    emailLabel: 'Email',
    submitLabel: 'Send reset link',
    sendingLabel: 'Sending…',
    backLabel: 'Back to the site',
    errorRequired: 'Enter your email first.',
    errorInvalidEmail: "That doesn't look like a valid email address.",
    errorTooMany: 'Too many attempts — please wait a bit and try again.',
    errorGeneric: 'Something went wrong. Please try again in a moment.',
    /* Deliberately the same message whether or not the address is
       actually registered — Firebase's own account-enumeration
       protection does this on the server side when enabled, and this
       mirrors it on the client regardless of that Console setting. */
    success: "If an account exists for that email, a reset link is on its way — check your inbox (and your spam folder)."
  },
  ru: {
    docTitle: 'Elden Ring Database — Сброс пароля',
    title: 'Сброс пароля',
    subtitle: 'Введите email своего аккаунта — мы отправим ссылку для сброса пароля.',
    emailLabel: 'Email',
    submitLabel: 'Отправить ссылку',
    sendingLabel: 'Отправка…',
    backLabel: 'Вернуться на сайт',
    errorRequired: 'Сначала введите почту.',
    errorInvalidEmail: 'Похоже, это не настоящий email-адрес.',
    errorTooMany: 'Слишком много попыток — подождите немного и попробуйте снова.',
    errorGeneric: 'Что-то пошло не так. Попробуйте ещё раз через минуту.',
    success: 'Если такой аккаунт существует, письмо со ссылкой для сброса пароля уже в пути — проверьте почту (и папку "Спам").'
  },
  kk: {
    docTitle: 'Elden Ring Database — Құпия сөзді қалпына келтіру',
    title: 'Құпия сөзді қалпына келтіру',
    subtitle: 'Аккаунтыңыздың email-ын енгізіңіз — біз құпия сөзді қалпына келтіру сілтемесін жібереміз.',
    emailLabel: 'Email',
    submitLabel: 'Сілтемені жіберу',
    sendingLabel: 'Жіберілуде…',
    backLabel: 'Сайтқа оралу',
    errorRequired: 'Алдымен поштаңызды енгізіңіз.',
    errorInvalidEmail: 'Бұл нақты email мекенжайына ұқсамайды.',
    errorTooMany: 'Тым көп әрекет — сәл күтіп, қайталап көріңіз.',
    errorGeneric: 'Бірдеңе дұрыс болмады. Бірнеше минуттан кейін қайталап көріңіз.',
    success: 'Мұндай аккаунт бар болса, құпия сөзді қалпына келтіру сілтемесі бар хат жолда — поштаңызды (және "Спам" қалтасын) тексеріңіз.'
  }
};

let currentLang = 'en';

function t(key) {
  return (i18n[currentLang] && i18n[currentLang][key]) || i18n.en[key] || '';
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

const els = {};

function cacheDom() {
  els.html = document.documentElement;
  els.title = document.getElementById('reset-title');
  els.subtitle = document.getElementById('reset-subtitle');
  els.emailLabel = document.getElementById('reset-email-label');
  els.emailInput = document.getElementById('reset-email');
  els.form = document.getElementById('reset-form');
  els.error = document.getElementById('reset-error');
  els.success = document.getElementById('reset-success');
  els.submit = document.getElementById('reset-submit');
  els.submitLabel = document.getElementById('reset-submit-label');
  els.backLink = document.getElementById('reset-back-link');
  els.backLabel = document.getElementById('reset-back-label');
}

function applyLanguage(lang) {
  currentLang = lang;
  els.html.setAttribute('lang', lang);
  document.title = t('docTitle');
  if (els.title) els.title.textContent = t('title');
  if (els.subtitle) els.subtitle.textContent = t('subtitle');
  if (els.emailLabel) els.emailLabel.textContent = t('emailLabel');
  if (els.submitLabel) els.submitLabel.textContent = t('submitLabel');
  if (els.backLabel) els.backLabel.textContent = t('backLabel');
}

function applyTheme(theme) {
  els.html.setAttribute('data-theme', theme);
}

function showError(message) {
  if (!els.error) return;
  els.error.textContent = message;
  els.error.hidden = false;
}

function hideError() {
  if (!els.error) return;
  els.error.hidden = true;
  els.error.textContent = '';
}

function showSuccess() {
  if (!els.success) return;
  els.success.textContent = t('success');
  els.success.hidden = false;
}

function friendlyResetError(err) {
  const code = err && err.code;
  if (code === 'auth/invalid-email') return t('errorInvalidEmail');
  if (code === 'auth/too-many-requests') return t('errorTooMany');
  /* auth/user-not-found intentionally falls through to the generic
     branch in handleSubmit below — see the success-message comment
     above for why. */
  return t('errorGeneric');
}

async function handleSubmit(event) {
  event.preventDefault();
  hideError();
  if (els.success) els.success.hidden = true;

  const email = els.emailInput ? els.emailInput.value.trim() : '';
  if (!email) {
    showError(t('errorRequired'));
    return;
  }

  if (els.submit) els.submit.disabled = true;
  const originalLabel = els.submitLabel ? els.submitLabel.textContent : '';
  if (els.submitLabel) els.submitLabel.textContent = t('sendingLabel');

  try {
    await auth.sendPasswordResetEmail(email);
    showSuccess();
    if (els.form) els.form.reset();
  } catch (err) {
    console.error('Password reset error:', err);
    if (err && err.code === 'auth/user-not-found') {
      /* Don't reveal whether the account exists. */
      showSuccess();
      if (els.form) els.form.reset();
    } else {
      showError(friendlyResetError(err));
    }
  } finally {
    if (els.submit) els.submit.disabled = false;
    if (els.submitLabel) els.submitLabel.textContent = originalLabel;
  }
}

function init() {
  cacheDom();

  const savedTheme = loadPreference(THEME_KEY, 'dark', ['dark', 'light']);
  applyTheme(savedTheme);

  const savedLang = loadPreference(LANG_KEY, 'en', ['en', 'ru', 'kk']);
  applyLanguage(savedLang);

  if (els.form) els.form.addEventListener('submit', handleSubmit);

  requestAnimationFrame(() => document.body.classList.add('is-ready'));
}

document.addEventListener('DOMContentLoaded', init);
