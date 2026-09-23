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
    triviaTitle: 'Trivia'
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
    triviaTitle: 'Интересные факты'
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
    triviaTitle: 'Қызықты деректер'
  }
};

let nameTranslations = { ru: { regions: {}, bosses: {} }, kk: { regions: {}, bosses: {} } };
let flatBosses = []; // [{ id, name, regionId, regionName, game }], in canonical order
let bossDetails = {}; // { [bossId]: { hp, runes, ru: {...} } }

const state = {
  lang: 'en',
  theme: 'dark',
  currentBoss: null
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
  const [eldenSnap, shadowSnap, translationsSnap, detailsSnap] = await Promise.all([
    db.collection('gameData').doc('eldenring').get(),
    db.collection('gameData').doc('shadowerdtree').get(),
    db.collection('gameData').doc('translations').get(),
    db.collection('gameData').doc('bossDetails').get()
  ]);

  const translations = translationsSnap.exists ? translationsSnap.data() : {};

  return {
    eldenRingRegions: eldenSnap.exists ? eldenSnap.data().regions : [],
    shadowErdtreeRegions: shadowSnap.exists ? shadowSnap.data().regions : [],
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
    bossDetails: detailsSnap.exists ? detailsSnap.data() : {}
  };
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
      list.push({ id: boss.id, name: boss.name, regionId: region.id, regionName: region.name, game: 'eldenring' });
    });
  });
  shadowRegions.forEach((region) => {
    region.bosses.forEach((boss) => {
      list.push({ id: boss.id, name: boss.name, regionId: region.id, regionName: region.name, game: 'shadowerdtree' });
    });
  });
  return list;
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

  if (d.attacks && d.attacks.length) {
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

  if (window.AuthWidget) {
    window.AuthWidget.init('en', { onBeforeOpen: closeBurgerMenu, onAuthChange: null });
  }

  try {
    const data = await fetchGameData();
    flatBosses = buildFlatList(data.eldenRingRegions, data.shadowErdtreeRegions);
    nameTranslations = data.nameTranslations;
    bossDetails = data.bossDetails || {};
  } catch (err) {
    console.error('Failed to load boss data from Firebase:', err);
  }

  applyLanguage(savedLang);
  requestAnimationFrame(() => document.body.classList.add('is-ready'));
}

document.addEventListener('DOMContentLoaded', init);
