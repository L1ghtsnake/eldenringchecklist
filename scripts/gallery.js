(() => {
  'use strict';

  /* Same storage keys as the other pages, so a language/theme choice
     made anywhere on the site carries over here too. */
  const THEME_KEY = 'eldenRingBossChecklistTheme';
  const LANG_KEY = 'eldenRingBossChecklistLang';

  const PAGE_SIZE = 9;

  /* Twenty real screenshots — ten from Elden Ring, ten from Shadow of
     the Erdtree — sourced from the games' own official Steam store
     listings (not generated). Thumbnails are pre-resized 640x360 crops
     used for the grid; the lightbox always loads the original
     1920x1080 file.

     This is also the FALLBACK list: the admin panel manages the real,
     live list in Firestore (gameData/gallery, field `photos`), and
     `subscribeGalleryImages` below replaces `IMAGES` with whatever it
     finds there the moment the page loads and again on every future
     edit. If that doc doesn't exist yet, or Firestore can't be reached,
     the gallery still shows this original set rather than going blank. */
  const FALLBACK_IMAGES = Array.from({ length: 20 }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    return {
      thumb: `../img/gallery/thumbs/eldenring-gallery-${num}-thumb.jpg`,
      full: `../img/gallery/eldenring-gallery-${num}.jpg`,
      game: i < 10 ? 'eldenring' : 'shadowerdtree'
    };
  });
  let IMAGES = FALLBACK_IMAGES;

  const i18n = {
    en: {
      docTitle: 'Elden Ring Database — Gallery',
      brandEyebrow: 'Gallery',
      themeLabel: 'Toggle dark or light theme',
      galleryEyebrow: 'Scenes',
      galleryTitle: 'Gallery of the Lands Between',
      gallerySubtitle: 'Twenty views from Elden Ring and Shadow of the Erdtree. Click any scene to look closer.',
      tileAltElden: 'Elden Ring screenshot',
      tileAltShadow: 'Shadow of the Erdtree screenshot',
      badgeElden: 'Elden Ring',
      badgeShadow: 'Shadow of the Erdtree',
      openImage: 'Open image',
      prevImage: 'Previous image',
      nextImage: 'Next image',
      closeImage: 'Close',
      pageLabel: 'Page',
      menuAccountLabel: 'Account',
      menuPrefsLabel: 'Preferences',
    },
    ru: {
      docTitle: 'Elden Ring Database — Галерея',
      brandEyebrow: 'Галерея',
      themeLabel: 'Переключить тёмную или светлую тему',
      galleryEyebrow: 'Сцены',
      galleryTitle: 'Галерея Междуземья',
      gallerySubtitle: 'Двадцать сцен из Elden Ring и Shadow of the Erdtree. Нажмите на любую, чтобы рассмотреть её ближе.',
      tileAltElden: 'Скриншот Elden Ring',
      tileAltShadow: 'Скриншот Shadow of the Erdtree',
      badgeElden: 'Elden Ring',
      badgeShadow: 'Shadow of the Erdtree',
      openImage: 'Открыть изображение',
      prevImage: 'Предыдущее изображение',
      nextImage: 'Следующее изображение',
      closeImage: 'Закрыть',
      pageLabel: 'Страница',
      menuAccountLabel: 'Аккаунт',
      menuPrefsLabel: 'Настройки',
    },
    kk: {
      docTitle: 'Elden Ring Database — Галерея',
      brandEyebrow: 'Галерея',
      themeLabel: 'Қараңғы немесе ашық тақырыпты ауыстыру',
      galleryEyebrow: 'Көріністер',
      galleryTitle: 'Аралық Жер галереясы',
      gallerySubtitle: 'Elden Ring және Shadow of the Erdtree ойындарынан жиырма көрініс. Жақынырақ қарау үшін кез келгенін басыңыз.',
      tileAltElden: 'Elden Ring скриншоты',
      tileAltShadow: 'Shadow of the Erdtree скриншоты',
      badgeElden: 'Elden Ring',
      badgeShadow: 'Shadow of the Erdtree',
      openImage: 'Суретті ашу',
      prevImage: 'Алдыңғы сурет',
      nextImage: 'Келесі сурет',
      closeImage: 'Жабу',
      pageLabel: 'Бет',
      menuAccountLabel: 'Аккаунт',
      menuPrefsLabel: 'Баптаулар',
    }
  };

  const els = {};
  let currentLang = 'en';
  let currentPage = 0;
  let lightboxIndex = 0;

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

    els.galleryEyebrow = document.getElementById('gallery-eyebrow');
    els.galleryTitle = document.getElementById('gallery-title');
    els.gallerySubtitle = document.getElementById('gallery-subtitle');
    els.grid = document.getElementById('gallery-grid');
    els.pagination = document.getElementById('gallery-pagination');

    els.lightboxOverlay = document.getElementById('lightbox-overlay');
    els.lightboxImage = document.getElementById('lightbox-image');
    els.lightboxCounter = document.getElementById('lightbox-counter');
    els.lightboxClose = document.getElementById('lightbox-close');
    els.lightboxPrev = document.getElementById('lightbox-prev');
    els.lightboxNext = document.getElementById('lightbox-next');
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

  /* ==========================================================================
     Grid + pagination
     ========================================================================== */

  function totalPages() {
    return Math.ceil(IMAGES.length / PAGE_SIZE);
  }

  function renderGrid() {
    if (!els.grid) return;
    els.grid.innerHTML = '';
    const start = currentPage * PAGE_SIZE;
    const pageImages = IMAGES.slice(start, start + PAGE_SIZE);

    pageImages.forEach((image, i) => {
      const globalIndex = start + i;
      const alt = image.game === 'eldenring' ? t('tileAltElden') : t('tileAltShadow');

      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'gallery-tile';
      tile.setAttribute('role', 'listitem');
      tile.setAttribute('aria-label', `${t('openImage')} ${globalIndex + 1}`);
      tile.style.animationDelay = (i * 45) + 'ms';
      tile.innerHTML = `
        <img src="${image.thumb}" alt="${alt}" loading="lazy" />
        <span class="gallery-tile-zoom" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3M11 8v6M8 11h6"/></svg>
        </span>
      `;
      tile.addEventListener('click', () => openLightbox(globalIndex));
      els.grid.appendChild(tile);
    });
  }

  function renderPagination() {
    if (!els.pagination) return;
    els.pagination.innerHTML = '';
    const pages = totalPages();

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'gallery-page-btn';
    prevBtn.setAttribute('aria-label', t('prevImage'));
    prevBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="m15 6-6 6 6 6"/></svg>';
    prevBtn.disabled = currentPage === 0;
    prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
    els.pagination.appendChild(prevBtn);

    for (let p = 0; p < pages; p++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gallery-page-btn' + (p === currentPage ? ' active' : '');
      btn.textContent = String(p + 1);
      btn.setAttribute('aria-label', `${t('pageLabel')} ${p + 1}`);
      btn.setAttribute('aria-current', p === currentPage ? 'page' : 'false');
      btn.addEventListener('click', () => goToPage(p));
      els.pagination.appendChild(btn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'gallery-page-btn';
    nextBtn.setAttribute('aria-label', t('nextImage'));
    nextBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="m9 6 6 6-6 6"/></svg>';
    nextBtn.disabled = currentPage === pages - 1;
    nextBtn.addEventListener('click', () => goToPage(currentPage + 1));
    els.pagination.appendChild(nextBtn);
  }

  function goToPage(page) {
    const pages = totalPages();
    if (page < 0 || page >= pages || page === currentPage) {
      if (page < 0 || page >= pages) return;
    }
    currentPage = page;
    renderGrid();
    renderPagination();
    if (els.grid) els.grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ==========================================================================
     Lightbox — click a tile to open it full-size; arrow buttons and the
     left/right arrow keys page through all 20 images (not just the
     current grid page), Escape or the close button dismisses it.
     ========================================================================== */

  function updateLightboxImage() {
    const image = IMAGES[lightboxIndex];
    if (!image || !els.lightboxImage) return;
    els.lightboxImage.src = image.full;
    els.lightboxImage.alt = image.game === 'eldenring' ? t('tileAltElden') : t('tileAltShadow');
    if (els.lightboxCounter) els.lightboxCounter.textContent = `${lightboxIndex + 1} / ${IMAGES.length}`;
  }

  function openLightbox(index) {
    lightboxIndex = index;
    if (!els.lightboxOverlay) return;
    updateLightboxImage();
    els.lightboxOverlay.hidden = false;
    requestAnimationFrame(() => els.lightboxOverlay.classList.add('is-open'));
  }

  function closeLightbox() {
    if (!els.lightboxOverlay) return;
    els.lightboxOverlay.classList.remove('is-open');
    window.setTimeout(() => {
      els.lightboxOverlay.hidden = true;
    }, 220);
  }

  function isLightboxOpen() {
    return !!(els.lightboxOverlay && !els.lightboxOverlay.hidden);
  }

  function stepLightbox(delta) {
    lightboxIndex = (lightboxIndex + delta + IMAGES.length) % IMAGES.length;
    updateLightboxImage();
  }

  function attachLightboxEvents() {
    if (els.lightboxClose) els.lightboxClose.addEventListener('click', closeLightbox);
    if (els.lightboxPrev) els.lightboxPrev.addEventListener('click', () => stepLightbox(-1));
    if (els.lightboxNext) els.lightboxNext.addEventListener('click', () => stepLightbox(1));
    if (els.lightboxOverlay) {
      els.lightboxOverlay.addEventListener('click', (event) => {
        if (event.target === els.lightboxOverlay) closeLightbox();
      });
    }
    document.addEventListener('keydown', (event) => {
      if (!isLightboxOpen()) return;
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowLeft') stepLightbox(-1);
      if (event.key === 'ArrowRight') stepLightbox(1);
    });
  }

  /* ==========================================================================
     Shared page chrome — theme, language, burger menu (identical to the
     other secondary pages: interactivemap.js / profile.js).
     ========================================================================== */

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

    if (els.galleryEyebrow) els.galleryEyebrow.textContent = t('galleryEyebrow');
    if (els.galleryTitle) els.galleryTitle.textContent = t('galleryTitle');
    if (els.gallerySubtitle) els.gallerySubtitle.textContent = t('gallerySubtitle');
    if (els.lightboxClose) els.lightboxClose.setAttribute('aria-label', t('closeImage'));
    if (els.lightboxPrev) els.lightboxPrev.setAttribute('aria-label', t('prevImage'));
    if (els.lightboxNext) els.lightboxNext.setAttribute('aria-label', t('nextImage'));

    if (window.AuthWidget) window.AuthWidget.setLanguage(lang);

    renderGrid();
    renderPagination();
    if (isLightboxOpen()) updateLightboxImage();

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


  /* Live gallery content — the admin panel writes the whole `photos`
     array back to gameData/gallery on every add/remove/reorder, and
     onSnapshot means every visitor's already-open gallery page updates
     immediately, with no refresh and no new deploy. */
  function subscribeGalleryImages() {
    if (typeof db === 'undefined' || !db) return;
    try {
      db.collection('gameData').doc('gallery').onSnapshot(
        (snap) => {
          const data = snap.exists ? snap.data() : null;
          const photos = data && Array.isArray(data.photos) && data.photos.length ? data.photos : FALLBACK_IMAGES;
          IMAGES = photos;
          const pages = totalPages();
          if (currentPage >= pages) currentPage = Math.max(0, pages - 1);
          renderGrid();
          renderPagination();
        },
        (err) => console.error('Failed to load gameData/gallery:', err)
      );
    } catch (err) {
      console.error('Failed to subscribe to gameData/gallery:', err);
    }
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
    attachLightboxEvents();
    subscribeGalleryImages();

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
