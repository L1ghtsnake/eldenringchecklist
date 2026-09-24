(() => {
  'use strict';

  /* ==========================================================================
     Admin panel — a dedicated page (reached only from the account modal's
     "Admin panel" link, never from any header/nav bar — see the note in
     auth.js) for editing the site's Firestore-backed content: boss
     lore/stats, the region/boss lists + categories, the site's footer
     texts, and the photo gallery.

     Real-time behaviour: every doc this page reads is subscribed to with
     onSnapshot, so as soon as an edit is saved here it also appears live
     on the public pages (they were converted to onSnapshot listeners in
     the same pass as this panel). Inside the panel itself, list/preview
     widgets (the boss/region dropdowns, the gallery grid) re-render on
     every remote update; free-text edit surfaces (the open boss form, the
     regions/categories list, the site-texts form) only re-render on
     first load, on an explicit selection, or right after this admin's
     own save — a "dirty" flag stops a remote change from overwriting
     text someone is in the middle of typing here.

     Security note: hiding the "Admin panel" link and gating this page's
     content on profile.role === 'admin' is a UI convenience only. The
     real gate has to be Firestore Security Rules that block a normal
     user from setting their own role field and restrict writes to
     gameData/* and siteConfig/* to admins — see the rules handed over
     separately, since this environment has no Firebase console access
     to deploy them.
     ========================================================================== */

  const THEME_KEY = 'eldenRingBossChecklistTheme';
  const LANG_KEY = 'eldenRingBossChecklistLang';

  const EFFECT_LABELS = ['Balance', 'Poison', 'Scarlet Rot', 'Bleed', 'Frostbite', 'Sleep', 'Madness', 'Death'];
  const DAMAGE_LABELS = ['Standard', 'Strike', 'Slash', 'Pierce', 'Magic', 'Fire', 'Lightning', 'Holy'];
  const CATEGORY_KEYS = ['story', 'hard', 'quest', 'optional'];
  const GAMES = ['eldenring', 'shadowerdtree'];

  const i18n = {
    en: {
      docTitle: 'Elden Ring Database — Admin Panel',
      brandEyebrow: 'Admin Panel',
      themeLabel: 'Toggle dark or light theme',
      menuAccountLabel: 'Account',
      menuPrefsLabel: 'Preferences',
      guardLoggedOutTitle: 'Admin Panel',
      guardLoggedOutText: 'Log in with an admin account to manage the site.',
      guardLoginLabel: 'Log in',
      guardDeniedTitle: 'Access denied',
      guardDeniedText: "This account doesn't have admin access.",
      tabBosses: 'Bosses',
      tabRegions: 'Regions & Categories',
      tabTexts: 'Site Texts',
      tabGallery: 'Gallery',
      tabUsers: 'Users',
      saveLabel: 'Save',
      savingLabel: 'Saving…',
      savedLabel: 'Saved.',
      errorPrefix: 'Error: ',
      bossGameLabel: 'Game',
      bossRegionLabel: 'Region',
      bossLabel: 'Boss',
      bossPickHint: 'Choose a boss above to edit its lore and stats.',
      fieldHp: 'HP',
      fieldRunes: 'Runes',
      fieldTagline: 'Tagline',
      fieldDescription: 'Description (blank line = new paragraph)',
      fieldLocation: 'Location',
      fieldAttacksIntro: 'Attacks — intro text',
      fieldAttacks: 'Attacks (one per line)',
      fieldTactics: 'Tactics — intro text',
      fieldTacticsList: 'Tactics (one per line)',
      fieldNotesIntro: 'Notes — intro text',
      fieldNotes: 'Notes (one per line)',
      fieldLoot: 'Loot — one per line, format: Name | Chance',
      fieldTrivia: 'Trivia',
      fieldQuoteText: 'Quote',
      fieldQuoteAuthor: 'Quote author',
      fieldResistEffects: 'Resistances — status effects',
      fieldResistDamage: 'Resistances — damage types',
      regionsGameLabel: 'Game',
      regionsLoadingLabel: 'Loading…',
      regionsAddRegionLabel: '+ Add region',
      regionsAddBossLabel: '+ Add boss',
      regionsDeleteRegionLabel: 'Delete region',
      regionsDeleteBossLabel: 'Delete',
      catStory: 'Story', catHard: 'Hard', catQuest: 'Quest', catOptional: 'Optional',
      promptRegionId: 'Region ID (lowercase, e.g. "limgrave"):',
      promptRegionName: 'Region name (EN):',
      promptBossId: 'Boss ID (e.g. "lim-29"):',
      promptBossName: 'Boss name (EN):',
      confirmDeleteRegion: 'Delete this region and all its bosses? This only takes effect once you press Save.',
      confirmDeleteBoss: 'Delete this boss? This only takes effect once you press Save.',
      textsFieldFooterCredit: 'Footer credit line',
      textsFieldPhone: 'Phone',
      textsFieldTelegram: 'Telegram',
      textsFieldEmails: 'Emails (one per line)',
      galleryNote: "Photos are added by URL (image hosting) — file upload isn't available on the free Firebase plan.",
      galleryFieldFull: 'Full image URL',
      galleryFieldThumb: 'Thumbnail URL (optional — falls back to full image)',
      galleryFieldGame: 'Game',
      galleryAddLabel: 'Add photo',
      galleryRemoveLabel: 'Remove',
      galleryMoveUpLabel: 'Move up',
      galleryMoveDownLabel: 'Move down',
      galleryEmptyLabel: 'No photos yet — add one above.',
      usersStatTotal: 'Total accounts',
      usersStatDefeated: 'Bosses defeated across all accounts',
      usersEmailHeader: 'Email',
      usersNicknameFallback: '(no nickname)',
      usersRoleAdmin: 'Admin',
      usersRoleUser: 'User',
      usersCreatedLabel: 'Joined',
      usersDefeatedLabel: 'defeated',
      usersMakeAdminLabel: 'Make admin',
      usersRemoveAdminLabel: 'Remove admin',
      usersSelfHint: "You can't change your own role here.",
      usersEmptyLabel: 'No accounts yet.',
      usersConfirmMakeAdmin: 'Grant this account admin access?',
      usersConfirmRemoveAdmin: "Remove this account's admin access?",
      usersRoleErrorPrefix: 'Could not update role: '
    },
    ru: {
      docTitle: 'Elden Ring Database — Админ-панель',
      brandEyebrow: 'Админ-панель',
      themeLabel: 'Переключить тёмную или светлую тему',
      menuAccountLabel: 'Аккаунт',
      menuPrefsLabel: 'Настройки',
      guardLoggedOutTitle: 'Админ-панель',
      guardLoggedOutText: 'Войдите в аккаунт администратора, чтобы управлять сайтом.',
      guardLoginLabel: 'Войти',
      guardDeniedTitle: 'Доступ запрещён',
      guardDeniedText: 'У этого аккаунта нет прав администратора.',
      tabBosses: 'Боссы',
      tabRegions: 'Регионы и категории',
      tabTexts: 'Тексты сайта',
      tabGallery: 'Галерея',
      tabUsers: 'Пользователи',
      saveLabel: 'Сохранить',
      savingLabel: 'Сохранение…',
      savedLabel: 'Сохранено.',
      errorPrefix: 'Ошибка: ',
      bossGameLabel: 'Игра',
      bossRegionLabel: 'Регион',
      bossLabel: 'Босс',
      bossPickHint: 'Выберите босса выше, чтобы отредактировать его описание и характеристики.',
      fieldHp: 'HP',
      fieldRunes: 'Руны',
      fieldTagline: 'Слоган',
      fieldDescription: 'Описание (пустая строка = новый абзац)',
      fieldLocation: 'Локация',
      fieldAttacksIntro: 'Атаки — вступление',
      fieldAttacks: 'Атаки (по одной в строке)',
      fieldTactics: 'Тактика — вступление',
      fieldTacticsList: 'Тактика (по одной в строке)',
      fieldNotesIntro: 'Заметки — вступление',
      fieldNotes: 'Заметки (по одной в строке)',
      fieldLoot: 'Добыча — по одной в строке, формат: Название | Шанс',
      fieldTrivia: 'Интересные факты',
      fieldQuoteText: 'Цитата',
      fieldQuoteAuthor: 'Автор цитаты',
      fieldResistEffects: 'Сопротивления — эффекты',
      fieldResistDamage: 'Сопротивления — типы урона',
      regionsGameLabel: 'Игра',
      regionsLoadingLabel: 'Загрузка…',
      regionsAddRegionLabel: '+ Добавить регион',
      regionsAddBossLabel: '+ Добавить босса',
      regionsDeleteRegionLabel: 'Удалить регион',
      regionsDeleteBossLabel: 'Удалить',
      catStory: 'Сюжет', catHard: 'Сложный', catQuest: 'Квест', catOptional: 'Опционально',
      promptRegionId: 'ID региона (латиницей, напр. "limgrave"):',
      promptRegionName: 'Название региона (EN):',
      promptBossId: 'ID босса (напр. "lim-29"):',
      promptBossName: 'Имя босса (EN):',
      confirmDeleteRegion: 'Удалить этот регион и всех его боссов? Изменение применится только после нажатия «Сохранить».',
      confirmDeleteBoss: 'Удалить этого босса? Изменение применится только после нажатия «Сохранить».',
      textsFieldFooterCredit: 'Строка в подвале сайта',
      textsFieldPhone: 'Телефон',
      textsFieldTelegram: 'Telegram',
      textsFieldEmails: 'Email (по одному в строке)',
      galleryNote: 'Фото добавляются по ссылке (хостинг изображений) — загрузка файлов недоступна на бесплатном тарифе Firebase.',
      galleryFieldFull: 'Ссылка на полное изображение',
      galleryFieldThumb: 'Ссылка на превью (необязательно — иначе используется полное изображение)',
      galleryFieldGame: 'Игра',
      galleryAddLabel: 'Добавить фото',
      galleryRemoveLabel: 'Удалить',
      galleryMoveUpLabel: 'Выше',
      galleryMoveDownLabel: 'Ниже',
      galleryEmptyLabel: 'Пока нет фото — добавьте выше.',
      usersStatTotal: 'Всего аккаунтов',
      usersStatDefeated: 'Боссов повержено во всех аккаунтах',
      usersEmailHeader: 'Email',
      usersNicknameFallback: '(без никнейма)',
      usersRoleAdmin: 'Админ',
      usersRoleUser: 'Пользователь',
      usersCreatedLabel: 'Регистрация',
      usersDefeatedLabel: 'повержено',
      usersMakeAdminLabel: 'Сделать админом',
      usersRemoveAdminLabel: 'Забрать права админа',
      usersSelfHint: 'Вы не можете изменить свою собственную роль здесь.',
      usersEmptyLabel: 'Пока нет аккаунтов.',
      usersConfirmMakeAdmin: 'Выдать этому аккаунту права администратора?',
      usersConfirmRemoveAdmin: 'Забрать у этого аккаунта права администратора?',
      usersRoleErrorPrefix: 'Не удалось изменить роль: '
    },
    kk: {
      docTitle: 'Elden Ring Database — Әкімші панелі',
      brandEyebrow: 'Әкімші панелі',
      themeLabel: 'Қараңғы немесе ашық тақырыпты ауыстыру',
      menuAccountLabel: 'Аккаунт',
      menuPrefsLabel: 'Баптаулар',
      guardLoggedOutTitle: 'Әкімші панелі',
      guardLoggedOutText: 'Сайтты басқару үшін әкімші аккаунтымен кіріңіз.',
      guardLoginLabel: 'Кіру',
      guardDeniedTitle: 'Кіру рұқсат етілмеген',
      guardDeniedText: 'Бұл аккаунтта әкімші құқығы жоқ.',
      tabBosses: 'Боссдар',
      tabRegions: 'Аймақтар мен санаттар',
      tabTexts: 'Сайт мәтіндері',
      tabGallery: 'Галерея',
      tabUsers: 'Пайдаланушылар',
      saveLabel: 'Сақтау',
      savingLabel: 'Сақталуда…',
      savedLabel: 'Сақталды.',
      errorPrefix: 'Қате: ',
      bossGameLabel: 'Ойын',
      bossRegionLabel: 'Аймақ',
      bossLabel: 'Босс',
      bossPickHint: 'Сипаттамасы мен сипаттамаларын өңдеу үшін жоғарыдан боссты таңдаңыз.',
      fieldHp: 'HP',
      fieldRunes: 'Рундар',
      fieldTagline: 'Ұран',
      fieldDescription: 'Сипаттама (бос жол = жаңа абзац)',
      fieldLocation: 'Орналасуы',
      fieldAttacksIntro: 'Шабуылдар — кіріспе',
      fieldAttacks: 'Шабуылдар (әр жолда біреу)',
      fieldTactics: 'Тактика — кіріспе',
      fieldTacticsList: 'Тактика (әр жолда біреу)',
      fieldNotesIntro: 'Ескертпелер — кіріспе',
      fieldNotes: 'Ескертпелер (әр жолда біреу)',
      fieldLoot: 'Олжа — әр жолда біреу, формат: Атауы | Мүмкіндігі',
      fieldTrivia: 'Қызықты фактілер',
      fieldQuoteText: 'Дәйексөз',
      fieldQuoteAuthor: 'Дәйексөз авторы',
      fieldResistEffects: 'Төзімділік — әсерлер',
      fieldResistDamage: 'Төзімділік — зақым түрлері',
      regionsGameLabel: 'Ойын',
      regionsLoadingLabel: 'Жүктелуде…',
      regionsAddRegionLabel: '+ Аймақ қосу',
      regionsAddBossLabel: '+ Босс қосу',
      regionsDeleteRegionLabel: 'Аймақты жою',
      regionsDeleteBossLabel: 'Жою',
      catStory: 'Сюжет', catHard: 'Қиын', catQuest: 'Квест', catOptional: 'Қосымша',
      promptRegionId: 'Аймақ ID (латын әрпімен, мыс. "limgrave"):',
      promptRegionName: 'Аймақ атауы (EN):',
      promptBossId: 'Босс ID (мыс. "lim-29"):',
      promptBossName: 'Босс аты (EN):',
      confirmDeleteRegion: 'Бұл аймақты және оның барлық боссын жоюсыз ба? Өзгеріс тек «Сақтау» батырмасынан кейін күшіне енеді.',
      confirmDeleteBoss: 'Бұл боссты жоюсыз ба? Өзгеріс тек «Сақтау» батырмасынан кейін күшіне енеді.',
      textsFieldFooterCredit: 'Сайт төменгі жолағының мәтіні',
      textsFieldPhone: 'Телефон',
      textsFieldTelegram: 'Telegram',
      textsFieldEmails: 'Email (әр жолда біреу)',
      galleryNote: 'Фотолар сілтеме арқылы қосылады (сурет хостингі) — тегін Firebase тарифінде файл жүктеу қолжетімсіз.',
      galleryFieldFull: 'Толық сурет сілтемесі',
      galleryFieldThumb: 'Мини-нұсқа сілтемесі (міндетті емес — болмаса толық сурет қолданылады)',
      galleryFieldGame: 'Ойын',
      galleryAddLabel: 'Фото қосу',
      galleryRemoveLabel: 'Жою',
      galleryMoveUpLabel: 'Жоғары',
      galleryMoveDownLabel: 'Төмен',
      galleryEmptyLabel: 'Әзірге фото жоқ — жоғарыдан қосыңыз.',
      usersStatTotal: 'Барлық аккаунттар',
      usersStatDefeated: 'Барлық аккаунттарда жеңілген боссылар',
      usersEmailHeader: 'Email',
      usersNicknameFallback: '(никнейм жоқ)',
      usersRoleAdmin: 'Админ',
      usersRoleUser: 'Пайдаланушы',
      usersCreatedLabel: 'Тіркелген күні',
      usersDefeatedLabel: 'жеңілді',
      usersMakeAdminLabel: 'Админ ету',
      usersRemoveAdminLabel: 'Админ құқығын алу',
      usersSelfHint: 'Өз рөліңізді осында өзгерте алмайсыз.',
      usersEmptyLabel: 'Әзірге аккаунт жоқ.',
      usersConfirmMakeAdmin: 'Бұл аккаунтқа админ құқығын беру керек пе?',
      usersConfirmRemoveAdmin: 'Бұл аккаунттан админ құқығын алу керек пе?',
      usersRoleErrorPrefix: 'Рөлді өзгерту мүмкін болмады: '
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

    els.guard = document.getElementById('admin-guard');
    els.guardTitle = document.getElementById('admin-guard-title');
    els.guardText = document.getElementById('admin-guard-text');
    els.guardLoginBtn = document.getElementById('admin-guard-login-btn');
    els.guardLoginLabel = document.getElementById('admin-guard-login-label');
    els.content = document.getElementById('admin-content');

    els.tabs = document.getElementById('admin-tabs');
    els.tabLabelBosses = document.getElementById('tab-label-bosses');
    els.tabLabelRegions = document.getElementById('tab-label-regions');
    els.tabLabelTexts = document.getElementById('tab-label-texts');
    els.tabLabelGallery = document.getElementById('tab-label-gallery');
    els.tabLabelUsers = document.getElementById('tab-label-users');

    // Bosses tab
    els.bossGameLabel = document.getElementById('boss-game-label');
    els.bossRegionLabel = document.getElementById('boss-region-label');
    els.bossBossLabel = document.getElementById('boss-boss-label');
    els.bossGameSelect = document.getElementById('boss-game-select');
    els.bossRegionSelect = document.getElementById('boss-region-select');
    els.bossBossSelect = document.getElementById('boss-boss-select');
    els.bossPickHint = document.getElementById('boss-pick-hint');
    els.bossForm = document.getElementById('boss-form');
    els.bossFieldLabels = {
      hp: document.getElementById('boss-field-hp'),
      runes: document.getElementById('boss-field-runes'),
      tagline: document.getElementById('boss-field-tagline'),
      description: document.getElementById('boss-field-description'),
      location: document.getElementById('boss-field-location'),
      attacksIntro: document.getElementById('boss-field-attacksIntro'),
      attacks: document.getElementById('boss-field-attacks'),
      tactics: document.getElementById('boss-field-tactics'),
      tacticsList: document.getElementById('boss-field-tacticsList'),
      notesIntro: document.getElementById('boss-field-notesIntro'),
      notes: document.getElementById('boss-field-notes'),
      loot: document.getElementById('boss-field-loot'),
      trivia: document.getElementById('boss-field-trivia'),
      quoteText: document.getElementById('boss-field-quoteText'),
      quoteAuthor: document.getElementById('boss-field-quoteAuthor'),
      resistEffects: document.getElementById('boss-field-resistEffects'),
      resistDamage: document.getElementById('boss-field-resistDamage')
    };
    els.bossHp = document.getElementById('boss-hp');
    els.bossRunes = document.getElementById('boss-runes');
    els.bossTagline = document.getElementById('boss-tagline');
    els.bossDescription = document.getElementById('boss-description');
    els.bossLocation = document.getElementById('boss-location');
    els.bossAttacksIntro = document.getElementById('boss-attacksIntro');
    els.bossAttacks = document.getElementById('boss-attacks');
    els.bossTactics = document.getElementById('boss-tactics');
    els.bossTacticsList = document.getElementById('boss-tacticsList');
    els.bossNotesIntro = document.getElementById('boss-notesIntro');
    els.bossNotes = document.getElementById('boss-notes');
    els.bossLoot = document.getElementById('boss-loot');
    els.bossTrivia = document.getElementById('boss-trivia');
    els.bossQuoteText = document.getElementById('boss-quote-text');
    els.bossQuoteAuthor = document.getElementById('boss-quote-author');
    els.bossResistEffects = document.getElementById('boss-resist-effects');
    els.bossResistDamage = document.getElementById('boss-resist-damage');
    els.bossFormError = document.getElementById('boss-form-error');
    els.bossFormStatus = document.getElementById('boss-form-status');
    els.bossSaveLabel = document.getElementById('boss-save-label');

    // Regions tab
    els.regionsGameLabel = document.getElementById('regions-game-label');
    els.regionsGameSelect = document.getElementById('regions-game-select');
    els.regionsLoadingHint = document.getElementById('regions-loading-hint');
    els.regionsList = document.getElementById('regions-list');
    els.regionsAddRegionBtn = document.getElementById('regions-add-region-btn');
    els.regionsAddRegionLabel = document.getElementById('regions-add-region-label');
    els.regionsFormError = document.getElementById('regions-form-error');
    els.regionsFormStatus = document.getElementById('regions-form-status');
    els.regionsSaveBtn = document.getElementById('regions-save-btn');
    els.regionsSaveLabel = document.getElementById('regions-save-label');

    // Texts tab
    els.textsForm = document.getElementById('texts-form');
    els.textsFieldFooterCredit = document.getElementById('texts-field-footerCredit');
    els.textsFieldPhone = document.getElementById('texts-field-phone');
    els.textsFieldTelegram = document.getElementById('texts-field-telegram');
    els.textsFieldEmails = document.getElementById('texts-field-emails');
    els.textsFooterCredit = document.getElementById('texts-footerCredit');
    els.textsPhone = document.getElementById('texts-phone');
    els.textsTelegram = document.getElementById('texts-telegram');
    els.textsEmails = document.getElementById('texts-emails');
    els.textsFormError = document.getElementById('texts-form-error');
    els.textsFormStatus = document.getElementById('texts-form-status');
    els.textsSaveLabel = document.getElementById('texts-save-label');

    // Gallery tab
    els.galleryNote = document.getElementById('gallery-note');
    els.galleryAddForm = document.getElementById('gallery-add-form');
    els.galleryFieldFull = document.getElementById('gallery-field-full');
    els.galleryFieldThumb = document.getElementById('gallery-field-thumb');
    els.galleryFieldGame = document.getElementById('gallery-field-game');
    els.galleryFull = document.getElementById('gallery-full');
    els.galleryThumb = document.getElementById('gallery-thumb');
    els.galleryGame = document.getElementById('gallery-game');
    els.galleryAddLabel = document.getElementById('gallery-add-label');
    els.galleryFormError = document.getElementById('gallery-form-error');
    els.galleryFormStatus = document.getElementById('gallery-form-status');
    els.galleryList = document.getElementById('gallery-list');

    // Users tab
    els.usersStatTotal = document.getElementById('users-stat-total');
    els.usersStatTotalLabel = document.getElementById('users-stat-total-label');
    els.usersStatDefeated = document.getElementById('users-stat-defeated');
    els.usersStatDefeatedLabel = document.getElementById('users-stat-defeated-label');
    els.usersList = document.getElementById('users-list');
    els.usersEmpty = document.getElementById('users-empty');
  }

  function loadPreference(key, fallback, validValues) {
    try {
      const value = localStorage.getItem(key);
      if (value && validValues.includes(value)) return value;
    } catch (err) { /* storage unavailable */ }
    return fallback;
  }

  function savePreference(key, value) {
    try { localStorage.setItem(key, value); } catch (err) { /* storage unavailable */ }
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

  /* ==========================================================================
     Auth / access gate
     ========================================================================== */

  let lastAuthState = { user: null, profile: null };

  function renderGuard(user, profile) {
    lastAuthState = { user, profile };
    const isAdmin = !!(user && profile && profile.role === 'admin');
    if (els.guard) els.guard.hidden = isAdmin;
    if (els.content) els.content.hidden = !isAdmin;
    if (!isAdmin) {
      if (user) {
        // Logged in, but not an admin account.
        if (els.guardTitle) els.guardTitle.textContent = t('guardDeniedTitle');
        if (els.guardText) els.guardText.textContent = t('guardDeniedText');
        if (els.guardLoginBtn) els.guardLoginBtn.hidden = true;
      } else {
        if (els.guardTitle) els.guardTitle.textContent = t('guardLoggedOutTitle');
        if (els.guardText) els.guardText.textContent = t('guardLoggedOutText');
        if (els.guardLoginBtn) els.guardLoginBtn.hidden = false;
      }
      return;
    }
    // Just became admin (or language changed while already admin) — make
    // sure the data subscriptions are running and the active tab has content.
    ensureDataSubscribed();
  }

  /* ==========================================================================
     i18n application
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
    if (els.brandEyebrow) els.brandEyebrow.textContent = t('brandEyebrow');
    if (els.themeToggle) els.themeToggle.setAttribute('aria-label', t('themeLabel'));
    if (els.menuAccountLabel) els.menuAccountLabel.textContent = t('menuAccountLabel');
    if (els.menuPrefsLabel) els.menuPrefsLabel.textContent = t('menuPrefsLabel');

    if (els.guardLoginLabel) els.guardLoginLabel.textContent = t('guardLoginLabel');

    if (els.tabLabelBosses) els.tabLabelBosses.textContent = t('tabBosses');
    if (els.tabLabelRegions) els.tabLabelRegions.textContent = t('tabRegions');
    if (els.tabLabelTexts) els.tabLabelTexts.textContent = t('tabTexts');
    if (els.tabLabelGallery) els.tabLabelGallery.textContent = t('tabGallery');
    if (els.tabLabelUsers) els.tabLabelUsers.textContent = t('tabUsers');

    if (els.bossGameLabel) els.bossGameLabel.textContent = t('bossGameLabel');
    if (els.bossRegionLabel) els.bossRegionLabel.textContent = t('bossRegionLabel');
    if (els.bossBossLabel) els.bossBossLabel.textContent = t('bossLabel');
    if (els.bossPickHint) els.bossPickHint.textContent = t('bossPickHint');
    Object.keys(els.bossFieldLabels).forEach((key) => {
      const el = els.bossFieldLabels[key];
      if (el) el.textContent = t('field' + key.charAt(0).toUpperCase() + key.slice(1));
    });
    if (els.bossSaveLabel) els.bossSaveLabel.textContent = t('saveLabel');

    if (els.regionsGameLabel) els.regionsGameLabel.textContent = t('regionsGameLabel');
    if (els.regionsLoadingHint) els.regionsLoadingHint.textContent = t('regionsLoadingLabel');
    if (els.regionsAddRegionLabel) els.regionsAddRegionLabel.textContent = t('regionsAddRegionLabel');
    if (els.regionsSaveLabel) els.regionsSaveLabel.textContent = t('saveLabel');

    if (els.textsFieldFooterCredit) els.textsFieldFooterCredit.textContent = t('textsFieldFooterCredit');
    if (els.textsFieldPhone) els.textsFieldPhone.textContent = t('textsFieldPhone');
    if (els.textsFieldTelegram) els.textsFieldTelegram.textContent = t('textsFieldTelegram');
    if (els.textsFieldEmails) els.textsFieldEmails.textContent = t('textsFieldEmails');
    if (els.textsSaveLabel) els.textsSaveLabel.textContent = t('saveLabel');

    if (els.galleryNote) els.galleryNote.textContent = t('galleryNote');
    if (els.galleryFieldFull) els.galleryFieldFull.textContent = t('galleryFieldFull');
    if (els.galleryFieldThumb) els.galleryFieldThumb.textContent = t('galleryFieldThumb');
    if (els.galleryFieldGame) els.galleryFieldGame.textContent = t('galleryFieldGame');
    if (els.galleryAddLabel) els.galleryAddLabel.textContent = t('galleryAddLabel');

    // Re-render bits whose labels come from i18n (resistance rows, region
    // cards' category chips, gallery cards' remove/move buttons).
    if (bossState.currentBossId) renderResistGrids(bossState.currentDetail);
    if (regionsState.rendered) renderRegionsList();
    renderGalleryList();
    if (els.usersStatTotalLabel) els.usersStatTotalLabel.textContent = t('usersStatTotal');
    if (els.usersStatDefeatedLabel) els.usersStatDefeatedLabel.textContent = t('usersStatDefeated');
    if (els.usersEmpty) els.usersEmpty.textContent = t('usersEmptyLabel');
    renderUsersList();

    if (window.AuthWidget) {
      window.AuthWidget.setLanguage(lang);
      renderGuard(window.AuthWidget.getUser(), window.AuthWidget.getProfile());
    }

    savePreference(LANG_KEY, lang);
  }

  /* ==========================================================================
     Tabs
     ========================================================================== */

  function attachTabEvents() {
    if (!els.tabs) return;
    els.tabs.addEventListener('click', (event) => {
      const btn = event.target.closest('.admin-tab');
      if (!btn) return;
      const tab = btn.dataset.tab;
      els.tabs.querySelectorAll('.admin-tab').forEach((b) => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', String(active));
      });
      document.querySelectorAll('.admin-panel').forEach((panel) => {
        panel.hidden = panel.dataset.panel !== tab;
      });
    });
  }

  /* ==========================================================================
     Firestore data — live subscriptions shared by all four tabs.
     ========================================================================== */

  const cache = {
    eldenring: { regions: [] },
    shadowerdtree: { regions: [] },
    translations: { ru: { regions: {}, bosses: {} }, kk: { regions: {}, bosses: {} } },
    bossDetails: {},
    siteConfig: {},
    gallery: { photos: [] },
    users: []
  };

  const loaded = { eldenring: false, shadowerdtree: false, translations: false, bossDetails: false, siteConfig: false, gallery: false, users: false };
  let dataSubscribed = false;

  function ensureDataSubscribed() {
    if (dataSubscribed) return;
    dataSubscribed = true;

    db.collection('gameData').doc('eldenring').onSnapshot((snap) => {
      cache.eldenring = snap.exists ? (snap.data() || { regions: [] }) : { regions: [] };
      loaded.eldenring = true;
      onGameDataUpdate('eldenring');
    }, (err) => { console.error('eldenring snapshot error:', err); loaded.eldenring = true; });

    db.collection('gameData').doc('shadowerdtree').onSnapshot((snap) => {
      cache.shadowerdtree = snap.exists ? (snap.data() || { regions: [] }) : { regions: [] };
      loaded.shadowerdtree = true;
      onGameDataUpdate('shadowerdtree');
    }, (err) => { console.error('shadowerdtree snapshot error:', err); loaded.shadowerdtree = true; });

    db.collection('gameData').doc('translations').onSnapshot((snap) => {
      const data = snap.exists ? (snap.data() || {}) : {};
      cache.translations = {
        ru: { regions: (data.ru && data.ru.regions) || {}, bosses: (data.ru && data.ru.bosses) || {} },
        kk: { regions: (data.kk && data.kk.regions) || {}, bosses: (data.kk && data.kk.bosses) || {} }
      };
      loaded.translations = true;
      onGameDataUpdate('translations');
    }, (err) => { console.error('translations snapshot error:', err); loaded.translations = true; });

    db.collection('gameData').doc('bossDetails').onSnapshot((snap) => {
      cache.bossDetails = snap.exists ? (snap.data() || {}) : {};
      loaded.bossDetails = true;
      onBossDetailsUpdate();
    }, (err) => { console.error('bossDetails snapshot error:', err); loaded.bossDetails = true; });

    db.collection('siteConfig').doc('main').onSnapshot((snap) => {
      cache.siteConfig = snap.exists ? (snap.data() || {}) : {};
      loaded.siteConfig = true;
      onSiteConfigUpdate();
    }, (err) => { console.error('siteConfig snapshot error:', err); loaded.siteConfig = true; });

    db.collection('gameData').doc('gallery').onSnapshot((snap) => {
      const data = snap.exists ? snap.data() : null;
      cache.gallery = { photos: (data && Array.isArray(data.photos)) ? data.photos : [] };
      loaded.gallery = true;
      renderGalleryList();
    }, (err) => { console.error('gallery snapshot error:', err); loaded.gallery = true; });

    /* Firestore's client SDKs (unlike the server-only Admin SDK) don't
       support field-projection queries — there's no .select() here to
       skip each account's heavier fields (avatarDataUrl, history).
       orderBy('email') is the optimization actually available client-side:
       it offloads the sort to Firestore instead of the browser, and the
       roster is small enough (one doc per registered account) that a
       plain, real-time, unpaginated read of it is the right trade-off —
       see the region-level pagination on the checklist/guide pages for
       where the ТЗ's "data duplication for performance" applies instead,
       to the actually large gameData documents. */
    db.collection('users').orderBy('email').onSnapshot((snap) => {
      cache.users = snap.docs.map((doc) => {
        const data = doc.data();
        return {
          uid: doc.id,
          email: data.email || '',
          nickname: data.nickname || '',
          role: data.role || '',
          createdAt: data.createdAt || null,
          defeatedCount: Array.isArray(data.progress) ? data.progress.length : 0
        };
      });
      loaded.users = true;
      renderUsersList();
    }, (err) => { console.error('users snapshot error:', err); loaded.users = true; });
  }

  function onGameDataUpdate(source) {
    refreshBossDropdowns();
    if (!regionsState.dirty && (source === regionsState.game || source === 'translations')) {
      renderRegionsList();
    }
  }

  function onBossDetailsUpdate() {
    if (!bossState.dirty && bossState.currentBossId) {
      loadBossIntoForm(bossState.currentBossId);
    }
  }

  function onSiteConfigUpdate() {
    if (!textsState.dirty) renderTextsForm();
  }

  /* ==========================================================================
     Bosses tab
     ========================================================================== */

  const bossState = { game: 'eldenring', regionId: '', currentBossId: '', currentDetail: null, dirty: false };

  function findRegions(game) {
    return (cache[game] && Array.isArray(cache[game].regions)) ? cache[game].regions : [];
  }

  function refreshBossDropdowns() {
    if (!els.bossGameSelect) return;
    const game = els.bossGameSelect.value || bossState.game;
    const regions = findRegions(game);

    const prevRegion = els.bossRegionSelect.value;
    els.bossRegionSelect.innerHTML = '';
    regions.forEach((region) => {
      const opt = document.createElement('option');
      opt.value = region.id;
      opt.textContent = region.name || region.id;
      els.bossRegionSelect.appendChild(opt);
    });
    let region = regions.find((r) => r.id === prevRegion) || regions[0];
    if (region) els.bossRegionSelect.value = region.id;

    const prevBoss = els.bossBossSelect.value;
    els.bossBossSelect.innerHTML = '';
    const bosses = (region && Array.isArray(region.bosses)) ? region.bosses : [];
    bosses.forEach((boss) => {
      const opt = document.createElement('option');
      opt.value = boss.id;
      opt.textContent = boss.name || boss.id;
      els.bossBossSelect.appendChild(opt);
    });
    const stillThere = bosses.find((b) => b.id === prevBoss);
    if (stillThere) {
      els.bossBossSelect.value = prevBoss;
    } else if (bosses[0]) {
      els.bossBossSelect.value = bosses[0].id;
      if (!bossState.dirty) selectBoss(bosses[0].id);
    }
  }

  function renderResistGrid(container, labels, existingRows) {
    if (!container) return;
    container.innerHTML = '';
    labels.forEach((label, i) => {
      const cell = document.createElement('div');
      cell.className = 'admin-resist-cell';
      const lab = document.createElement('span');
      lab.className = 'admin-resist-cell-label';
      lab.textContent = label;
      const input = document.createElement('input');
      input.type = 'text';
      input.dataset.index = String(i);
      input.dataset.label = label;
      input.value = (existingRows && existingRows[i] && existingRows[i].value) || '';
      cell.appendChild(lab);
      cell.appendChild(input);
      container.appendChild(cell);
    });
  }

  function renderResistGrids(detail) {
    const res = (detail && detail.ru && detail.ru.resistances) || {};
    renderResistGrid(els.bossResistEffects, EFFECT_LABELS, res.effects);
    renderResistGrid(els.bossResistDamage, DAMAGE_LABELS, res.damage);
  }

  function selectBoss(bossId) {
    bossState.currentBossId = bossId;
    bossState.dirty = false;
    loadBossIntoForm(bossId);
  }

  function loadBossIntoForm(bossId) {
    const detail = cache.bossDetails[bossId] || {};
    bossState.currentDetail = detail;
    const d = detail.ru || {};

    if (els.bossForm) els.bossForm.hidden = false;
    if (els.bossPickHint) els.bossPickHint.hidden = true;

    els.bossHp.value = detail.hp != null ? detail.hp : '';
    els.bossRunes.value = detail.runes != null ? detail.runes : '';
    els.bossTagline.value = d.tagline || '';
    els.bossDescription.value = d.description || '';
    els.bossLocation.value = d.location || '';
    els.bossAttacksIntro.value = d.attacksIntro || '';
    els.bossAttacks.value = (d.attacks || []).join('\n');
    els.bossTactics.value = d.tactics || '';
    els.bossTacticsList.value = (d.tacticsList || []).join('\n');
    els.bossNotesIntro.value = d.notesIntro || '';
    els.bossNotes.value = (d.notes || []).join('\n');
    els.bossLoot.value = (d.loot || []).map((item) => `${item.name || ''} | ${item.chance || ''}`).join('\n');
    els.bossTrivia.value = d.trivia || '';
    els.bossQuoteText.value = (d.quote && d.quote.text) || '';
    els.bossQuoteAuthor.value = (d.quote && d.quote.author) || '';

    renderResistGrids(detail);
    hideBossFormMessages();
  }

  function hideBossFormMessages() {
    if (els.bossFormError) els.bossFormError.hidden = true;
    if (els.bossFormStatus) els.bossFormStatus.hidden = true;
  }

  function splitLines(value) {
    return String(value || '').split('\n').map((line) => line.trim()).filter(Boolean);
  }

  function readResistGrid(container) {
    if (!container) return [];
    const rows = [];
    container.querySelectorAll('input').forEach((input) => {
      const value = input.value.trim();
      if (value) rows.push({ label: input.dataset.label, value });
    });
    return rows;
  }

  function buildLootArray(value) {
    return splitLines(value).map((line) => {
      const parts = line.split('|');
      return { name: (parts[0] || '').trim(), chance: (parts[1] || '').trim() };
    });
  }

  async function handleBossFormSubmit(event) {
    event.preventDefault();
    if (!bossState.currentBossId) return;
    hideBossFormMessages();

    const hpRaw = els.bossHp.value.trim();
    const runesRaw = els.bossRunes.value.trim();

    const detailUpdate = {
      hp: hpRaw === '' ? null : Number(hpRaw),
      runes: runesRaw === '' ? null : Number(runesRaw),
      ru: {
        tagline: els.bossTagline.value.trim(),
        description: els.bossDescription.value.trim(),
        location: els.bossLocation.value.trim(),
        attacksIntro: els.bossAttacksIntro.value.trim(),
        attacks: splitLines(els.bossAttacks.value),
        tactics: els.bossTactics.value.trim(),
        tacticsList: splitLines(els.bossTacticsList.value),
        notesIntro: els.bossNotesIntro.value.trim(),
        notes: splitLines(els.bossNotes.value),
        loot: buildLootArray(els.bossLoot.value),
        trivia: els.bossTrivia.value.trim(),
        quote: {
          text: els.bossQuoteText.value.trim(),
          author: els.bossQuoteAuthor.value.trim()
        },
        resistances: {
          effects: readResistGrid(els.bossResistEffects),
          damage: readResistGrid(els.bossResistDamage)
        }
      }
    };

    if (els.bossFormStatus) {
      els.bossFormStatus.hidden = false;
      els.bossFormStatus.textContent = t('savingLabel');
    }

    try {
      await db.collection('gameData').doc('bossDetails').set({ [bossState.currentBossId]: detailUpdate }, { merge: true });
      bossState.dirty = false;
      if (els.bossFormStatus) els.bossFormStatus.textContent = t('savedLabel');
    } catch (err) {
      console.error('Failed to save boss details:', err);
      if (els.bossFormStatus) els.bossFormStatus.hidden = true;
      if (els.bossFormError) {
        els.bossFormError.hidden = false;
        els.bossFormError.textContent = t('errorPrefix') + err.message;
      }
    }
  }

  function attachBossTabEvents() {
    if (els.bossGameSelect) {
      els.bossGameSelect.addEventListener('change', () => {
        bossState.game = els.bossGameSelect.value;
        bossState.dirty = false;
        refreshBossDropdowns();
      });
    }
    if (els.bossRegionSelect) {
      els.bossRegionSelect.addEventListener('change', () => {
        bossState.dirty = false;
        refreshBossDropdowns();
      });
    }
    if (els.bossBossSelect) {
      els.bossBossSelect.addEventListener('change', () => selectBoss(els.bossBossSelect.value));
    }
    if (els.bossForm) {
      els.bossForm.addEventListener('input', () => { bossState.dirty = true; });
      els.bossForm.addEventListener('submit', handleBossFormSubmit);
    }
  }

  /* ==========================================================================
     Regions & Categories tab
     ========================================================================== */

  const regionsState = { game: 'eldenring', rendered: false, dirty: false };

  function slugify(value) {
    return String(value || '').trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function buildRegionCard(region) {
    const card = document.createElement('div');
    card.className = 'admin-region-card';
    card.dataset.regionId = region.id;

    const head = document.createElement('div');
    head.className = 'admin-region-head';
    head.appendChild(makeNameField('EN', region.name || '', 'region-name-en'));
    head.appendChild(makeNameField('RU', (cache.translations.ru.regions || {})[region.id] || '', 'region-name-ru'));
    head.appendChild(makeNameField('KK', (cache.translations.kk.regions || {})[region.id] || '', 'region-name-kk'));

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'admin-icon-btn admin-icon-btn--danger';
    delBtn.textContent = t('regionsDeleteRegionLabel');
    delBtn.addEventListener('click', () => {
      if (!confirm(t('confirmDeleteRegion'))) return;
      card.remove();
      regionsState.dirty = true;
    });
    head.appendChild(delBtn);
    card.appendChild(head);

    const bossList = document.createElement('div');
    bossList.className = 'admin-boss-list';
    (region.bosses || []).forEach((boss) => bossList.appendChild(renderBossRow(boss)));
    card.appendChild(bossList);

    const addBossBtn = document.createElement('button');
    addBossBtn.type = 'button';
    addBossBtn.className = 'admin-add-btn';
    addBossBtn.style.marginBottom = '0';
    addBossBtn.textContent = t('regionsAddBossLabel');
    addBossBtn.addEventListener('click', () => {
      const id = slugify(prompt(t('promptBossId')) || '');
      if (!id) return;
      const name = (prompt(t('promptBossName')) || '').trim();
      if (!name) return;
      bossList.appendChild(renderBossRow({ id, name, categories: [] }));
      regionsState.dirty = true;
    });
    card.appendChild(addBossBtn);

    return card;
  }

  function renderRegionsList() {
    if (!els.regionsList) return;
    const game = regionsState.game;
    const regions = findRegions(game);
    if (els.regionsLoadingHint) els.regionsLoadingHint.hidden = loaded[game];

    els.regionsList.innerHTML = '';
    regions.forEach((region) => els.regionsList.appendChild(buildRegionCard(region)));

    regionsState.rendered = true;
    regionsState.dirty = false;
  }

  function makeNameField(labelText, value, cls) {
    const label = document.createElement('label');
    label.className = 'auth-field';
    const span = document.createElement('span');
    span.textContent = labelText;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = cls;
    input.value = value;
    label.appendChild(span);
    label.appendChild(input);
    return label;
  }

  function renderBossRow(boss) {
    const row = document.createElement('div');
    row.className = 'admin-boss-row';
    row.dataset.bossId = boss.id;

    row.appendChild(makeNameField('EN', boss.name || '', 'boss-name-en'));
    row.appendChild(makeNameField('RU', (cache.translations.ru.bosses || {})[boss.id] || '', 'boss-name-ru'));
    row.appendChild(makeNameField('KK', (cache.translations.kk.bosses || {})[boss.id] || '', 'boss-name-kk'));

    const cats = document.createElement('div');
    cats.className = 'admin-boss-cats';
    const currentCats = new Set(boss.categories || []);
    CATEGORY_KEYS.forEach((key) => {
      const chip = document.createElement('label');
      chip.className = 'admin-cat-chip';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.dataset.cat = key;
      input.checked = currentCats.has(key);
      const span = document.createElement('span');
      span.textContent = t('cat' + key.charAt(0).toUpperCase() + key.slice(1));
      chip.appendChild(input);
      chip.appendChild(span);
      cats.appendChild(chip);
    });
    row.appendChild(cats);

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'admin-icon-btn admin-icon-btn--danger';
    delBtn.textContent = t('regionsDeleteBossLabel');
    delBtn.addEventListener('click', () => {
      if (!confirm(t('confirmDeleteBoss'))) return;
      row.remove();
      regionsState.dirty = true;
    });
    row.appendChild(delBtn);

    return row;
  }

  async function handleRegionsSave() {
    if (els.regionsFormError) els.regionsFormError.hidden = true;
    const game = regionsState.game;

    const regions = [];
    const ruRegionNames = {};
    const kkRegionNames = {};
    const ruBossNames = {};
    const kkBossNames = {};

    els.regionsList.querySelectorAll('.admin-region-card').forEach((card) => {
      const regionId = card.dataset.regionId;
      const enName = card.querySelector('.region-name-en').value.trim();
      const ruName = card.querySelector('.region-name-ru').value.trim();
      const kkName = card.querySelector('.region-name-kk').value.trim();
      if (ruName) ruRegionNames[regionId] = ruName;
      if (kkName) kkRegionNames[regionId] = kkName;

      const bosses = [];
      card.querySelectorAll('.admin-boss-row').forEach((row) => {
        const bossId = row.dataset.bossId;
        const bEnName = row.querySelector('.boss-name-en').value.trim();
        const bRuName = row.querySelector('.boss-name-ru').value.trim();
        const bKkName = row.querySelector('.boss-name-kk').value.trim();
        if (bRuName) ruBossNames[bossId] = bRuName;
        if (bKkName) kkBossNames[bossId] = bKkName;
        const categories = Array.from(row.querySelectorAll('input[data-cat]'))
          .filter((cb) => cb.checked)
          .map((cb) => cb.dataset.cat);
        bosses.push({ id: bossId, name: bEnName, categories });
      });

      regions.push({ id: regionId, name: enName, bosses });
    });

    if (els.regionsFormStatus) {
      els.regionsFormStatus.hidden = false;
      els.regionsFormStatus.textContent = t('savingLabel');
    }

    try {
      await db.collection('gameData').doc(game).set({ regions });
      await db.collection('gameData').doc('translations').set({
        ru: { regions: ruRegionNames, bosses: ruBossNames },
        kk: { regions: kkRegionNames, bosses: kkBossNames }
      }, { merge: true });
      regionsState.dirty = false;
      if (els.regionsFormStatus) els.regionsFormStatus.textContent = t('savedLabel');
    } catch (err) {
      console.error('Failed to save regions:', err);
      if (els.regionsFormStatus) els.regionsFormStatus.hidden = true;
      if (els.regionsFormError) {
        els.regionsFormError.hidden = false;
        els.regionsFormError.textContent = t('errorPrefix') + err.message;
      }
    }
  }

  function attachRegionsTabEvents() {
    if (els.regionsGameSelect) {
      els.regionsGameSelect.addEventListener('change', () => {
        regionsState.game = els.regionsGameSelect.value;
        regionsState.dirty = false;
        renderRegionsList();
      });
    }
    if (els.regionsList) {
      els.regionsList.addEventListener('input', () => { regionsState.dirty = true; });
      els.regionsList.addEventListener('change', () => { regionsState.dirty = true; });
    }
    if (els.regionsAddRegionBtn) {
      els.regionsAddRegionBtn.addEventListener('click', () => {
        const id = slugify(prompt(t('promptRegionId')) || '');
        if (!id) return;
        const name = (prompt(t('promptRegionName')) || '').trim();
        if (!name) return;
        // Append the new card directly rather than re-running
        // renderRegionsList (which would also discard any unsaved edits
        // already made to the other region cards).
        els.regionsList.appendChild(buildRegionCard({ id, name, bosses: [] }));
        regionsState.dirty = true;
      });
    }
    if (els.regionsSaveBtn) els.regionsSaveBtn.addEventListener('click', handleRegionsSave);
  }

  /* ==========================================================================
     Site Texts tab
     ========================================================================== */

  const textsState = { dirty: false };

  function renderTextsForm() {
    const cfg = cache.siteConfig || {};
    els.textsFooterCredit.value = cfg.footerCredit || '';
    els.textsPhone.value = cfg.phone || '';
    els.textsTelegram.value = cfg.telegram || '';
    els.textsEmails.value = (cfg.emails || []).join('\n');
    textsState.dirty = false;
  }

  async function handleTextsFormSubmit(event) {
    event.preventDefault();
    if (els.textsFormError) els.textsFormError.hidden = true;
    if (els.textsFormStatus) {
      els.textsFormStatus.hidden = false;
      els.textsFormStatus.textContent = t('savingLabel');
    }
    try {
      await db.collection('siteConfig').doc('main').set({
        footerCredit: els.textsFooterCredit.value.trim(),
        phone: els.textsPhone.value.trim(),
        telegram: els.textsTelegram.value.trim(),
        emails: splitLines(els.textsEmails.value)
      }, { merge: true });
      textsState.dirty = false;
      if (els.textsFormStatus) els.textsFormStatus.textContent = t('savedLabel');
    } catch (err) {
      console.error('Failed to save site texts:', err);
      if (els.textsFormStatus) els.textsFormStatus.hidden = true;
      if (els.textsFormError) {
        els.textsFormError.hidden = false;
        els.textsFormError.textContent = t('errorPrefix') + err.message;
      }
    }
  }

  function attachTextsTabEvents() {
    if (els.textsForm) {
      els.textsForm.addEventListener('input', () => { textsState.dirty = true; });
      els.textsForm.addEventListener('submit', handleTextsFormSubmit);
    }
  }

  /* ==========================================================================
     Gallery tab
     ========================================================================== */

  function renderGalleryList() {
    if (!els.galleryList) return;
    const photos = cache.gallery.photos || [];
    els.galleryList.innerHTML = '';

    if (!photos.length) {
      const empty = document.createElement('p');
      empty.className = 'admin-hint';
      empty.textContent = t('galleryEmptyLabel');
      els.galleryList.appendChild(empty);
      return;
    }

    photos.forEach((photo, index) => {
      const item = document.createElement('div');
      item.className = 'admin-gallery-item';

      const img = document.createElement('img');
      img.className = 'admin-gallery-thumb';
      img.src = photo.thumb || photo.full;
      img.alt = '';
      img.loading = 'lazy';
      item.appendChild(img);

      const meta = document.createElement('p');
      meta.className = 'admin-gallery-meta';
      meta.textContent = photo.game === 'shadowerdtree' ? 'Shadow of the Erdtree' : 'Elden Ring';
      item.appendChild(meta);

      const actions = document.createElement('div');
      actions.className = 'admin-gallery-actions';

      const upBtn = document.createElement('button');
      upBtn.type = 'button';
      upBtn.className = 'admin-icon-btn';
      upBtn.textContent = '↑';
      upBtn.setAttribute('aria-label', t('galleryMoveUpLabel'));
      upBtn.disabled = index === 0;
      upBtn.addEventListener('click', () => moveGalleryPhoto(index, -1));
      actions.appendChild(upBtn);

      const downBtn = document.createElement('button');
      downBtn.type = 'button';
      downBtn.className = 'admin-icon-btn';
      downBtn.textContent = '↓';
      downBtn.setAttribute('aria-label', t('galleryMoveDownLabel'));
      downBtn.disabled = index === photos.length - 1;
      downBtn.addEventListener('click', () => moveGalleryPhoto(index, 1));
      actions.appendChild(downBtn);

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'admin-icon-btn admin-icon-btn--danger';
      removeBtn.textContent = t('galleryRemoveLabel');
      removeBtn.addEventListener('click', () => removeGalleryPhoto(index));
      actions.appendChild(removeBtn);

      item.appendChild(actions);
      els.galleryList.appendChild(item);
    });
  }

  function nextGalleryId() {
    return 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  async function writeGalleryPhotos(photos) {
    await db.collection('gameData').doc('gallery').set({ photos }, { merge: true });
  }

  async function handleGalleryAddSubmit(event) {
    event.preventDefault();
    if (els.galleryFormError) els.galleryFormError.hidden = true;
    const full = els.galleryFull.value.trim();
    if (!full) return;
    const thumb = els.galleryThumb.value.trim() || full;
    const game = els.galleryGame.value;

    if (els.galleryFormStatus) {
      els.galleryFormStatus.hidden = false;
      els.galleryFormStatus.textContent = t('savingLabel');
    }
    try {
      const photos = (cache.gallery.photos || []).concat([{ id: nextGalleryId(), full, thumb, game }]);
      await writeGalleryPhotos(photos);
      els.galleryAddForm.reset();
      if (els.galleryFormStatus) els.galleryFormStatus.textContent = t('savedLabel');
    } catch (err) {
      console.error('Failed to add gallery photo:', err);
      if (els.galleryFormStatus) els.galleryFormStatus.hidden = true;
      if (els.galleryFormError) {
        els.galleryFormError.hidden = false;
        els.galleryFormError.textContent = t('errorPrefix') + err.message;
      }
    }
  }

  async function removeGalleryPhoto(index) {
    const photos = (cache.gallery.photos || []).slice();
    photos.splice(index, 1);
    try {
      await writeGalleryPhotos(photos);
    } catch (err) {
      console.error('Failed to remove gallery photo:', err);
      alert(t('errorPrefix') + err.message);
    }
  }

  async function moveGalleryPhoto(index, delta) {
    const photos = (cache.gallery.photos || []).slice();
    const target = index + delta;
    if (target < 0 || target >= photos.length) return;
    const [item] = photos.splice(index, 1);
    photos.splice(target, 0, item);
    try {
      await writeGalleryPhotos(photos);
    } catch (err) {
      console.error('Failed to reorder gallery photos:', err);
      alert(t('errorPrefix') + err.message);
    }
  }

  function attachGalleryTabEvents() {
    if (els.galleryAddForm) els.galleryAddForm.addEventListener('submit', handleGalleryAddSubmit);
  }

  /* ==========================================================================
     Users tab — a read-mostly roster (see ensureDataSubscribed above for
     why this is a plain orderBy() query rather than a projection) plus
     one action: toggling an account's admin role. Everything else about
     an account (nickname, avatar, progress) stays the owner's alone to
     change — see the "affectedKeys hasOnly(['role'])" restriction in
     firestore.rules.
     ========================================================================== */

  function formatUserJoinDate(timestamp) {
    if (!timestamp) return '—';
    const date = typeof timestamp.toDate === 'function' ? timestamp.toDate() : new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat(currentLang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
  }

  function renderUsersList() {
    if (!els.usersList) return;
    const users = cache.users || [];
    const currentUid = lastAuthState.user ? lastAuthState.user.uid : null;

    const totalDefeated = users.reduce((sum, u) => sum + u.defeatedCount, 0);
    if (els.usersStatTotal) els.usersStatTotal.textContent = String(users.length);
    if (els.usersStatDefeated) els.usersStatDefeated.textContent = String(totalDefeated);

    els.usersList.innerHTML = '';
    if (els.usersEmpty) els.usersEmpty.hidden = users.length !== 0;
    if (!users.length) return;

    const sorted = users.slice().sort((a, b) => a.email.localeCompare(b.email));

    sorted.forEach((user) => {
      const isAdminUser = user.role === 'admin';
      const isSelf = user.uid === currentUid;

      const row = document.createElement('div');
      row.className = 'admin-user-row';

      const info = document.createElement('div');
      info.className = 'admin-user-info';
      const emailEl = document.createElement('span');
      emailEl.className = 'admin-user-email';
      emailEl.textContent = user.email || user.uid;
      info.appendChild(emailEl);
      const nicknameEl = document.createElement('span');
      nicknameEl.className = 'admin-user-nickname';
      nicknameEl.textContent = user.nickname || t('usersNicknameFallback');
      info.appendChild(nicknameEl);
      row.appendChild(info);

      const meta = document.createElement('div');
      meta.className = 'admin-user-meta';

      const badge = document.createElement('span');
      badge.className = 'admin-role-badge' + (isAdminUser ? ' admin-role-badge--admin' : '');
      badge.textContent = isAdminUser ? t('usersRoleAdmin') : t('usersRoleUser');
      meta.appendChild(badge);

      const joined = document.createElement('span');
      joined.textContent = t('usersCreatedLabel') + ': ' + formatUserJoinDate(user.createdAt);
      meta.appendChild(joined);

      const defeated = document.createElement('span');
      defeated.textContent = user.defeatedCount + ' ' + t('usersDefeatedLabel');
      meta.appendChild(defeated);

      row.appendChild(meta);

      const toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.className = 'admin-icon-btn admin-role-toggle-btn' + (isAdminUser ? ' admin-icon-btn--danger' : '');
      toggleBtn.textContent = isAdminUser ? t('usersRemoveAdminLabel') : t('usersMakeAdminLabel');
      if (isSelf) {
        toggleBtn.disabled = true;
        toggleBtn.title = t('usersSelfHint');
      } else {
        toggleBtn.addEventListener('click', () => handleToggleUserRole(user, isAdminUser));
      }
      row.appendChild(toggleBtn);

      els.usersList.appendChild(row);
    });
  }

  async function handleToggleUserRole(user, isCurrentlyAdmin) {
    const confirmMsg = isCurrentlyAdmin ? t('usersConfirmRemoveAdmin') : t('usersConfirmMakeAdmin');
    if (!window.confirm(confirmMsg + '\n\n' + user.email)) return;

    try {
      await db.collection('users').doc(user.uid).update({
        role: isCurrentlyAdmin ? firebase.firestore.FieldValue.delete() : 'admin'
      });
    } catch (err) {
      console.error('Failed to update user role:', err);
      window.alert(t('usersRoleErrorPrefix') + err.message);
    }
  }

  /* ==========================================================================
     Init
     ========================================================================== */

  function init() {
    cacheDom();

    const theme = loadPreference(THEME_KEY, 'dark', ['dark', 'light']);
    applyTheme(theme);

    const lang = loadPreference(LANG_KEY, 'en', ['en', 'ru', 'kk']);

    if (window.AuthWidget) {
      window.AuthWidget.init(lang, {
        onBeforeOpen: closeBurgerMenu,
        onAuthChange: renderGuard
      });
    }

    applyLanguage(lang);
    attachThemeEvents();
    attachLangFilterEvents();
    attachBurgerMenuEvents();
    attachTabEvents();
    attachBossTabEvents();
    attachRegionsTabEvents();
    attachTextsTabEvents();
    attachGalleryTabEvents();

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
