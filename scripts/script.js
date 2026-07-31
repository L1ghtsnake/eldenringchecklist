'use strict';

const STORAGE_KEY = 'eldenRingBossChecklist';

const regions = [
  {
    id: 'limgrave',
    name: 'Limgrave',
    bosses: [
      { id: 'lim-01', name: 'Soldier of Godrick' },
      { id: 'lim-02', name: 'Demi-Human Chiefs' },
      { id: 'lim-03', name: 'Burial Tree Watchdog' },
      { id: 'lim-04', name: 'Beastman of Farum Azula' },
      { id: 'lim-05', name: 'Stonedigger Troll' },
      { id: 'lim-06', name: 'Grave Warden Duelist' },
      { id: 'lim-07', name: 'Bloody Finger Nerijus' },
      { id: 'lim-08', name: 'Patches' },
      { id: 'lim-09', name: 'Guardian Golem' },
      { id: 'lim-10', name: 'Black Knife Assassin' },
      { id: 'lim-11', name: 'Recusant Henricus' },
      { id: 'lim-12', name: 'Mad Pumpkin Head' },
      { id: 'lim-13', name: "Night's Cavalry (Highway Bridge)" },
      { id: 'lim-14', name: 'Tree Sentinel' },
      { id: 'lim-15', name: 'Flying Dragon Agheel' },
      { id: 'lim-16', name: 'Tibia Mariner' },
      { id: 'lim-17', name: 'Anastasia, Tarnished-Eater' },
      { id: 'lim-18', name: 'Bloodhound Knight Darriwil' },
      { id: 'lim-19', name: 'Crucible Knight (Stormhill)' },
      { id: 'lim-20', name: "Bell Bearing Hunter (Warmaster's Shack)" },
      { id: 'lim-21', name: "Deathbird (Warmaster's Shack East)" },
      { id: 'lim-22', name: 'Old Knight Istvan' },
      { id: 'lim-23', name: "Ulcerated Tree Spirit (Fringefolk Hero's Grave)" },
      { id: 'lim-24', name: 'Ulcerated Tree Spirit (Stormveil Castle)' },
      { id: 'lim-25', name: 'Crucible Knight (Stormveil Castle)' },
      { id: 'lim-26', name: 'Grafted Scion' },
      { id: 'lim-27', name: 'Margit, the Fell Omen' },
      { id: 'lim-28', name: 'Godrick the Grafted' }
    ]
  },
  {
    id: 'weeping-peninsula',
    name: 'Weeping Peninsula',
    bosses: [
      { id: 'wp-01', name: 'Burial Tree Watchdog and Imps' },
      { id: 'wp-02', name: 'Runebear' },
      { id: 'wp-03', name: "Night's Cavalry (Castle Morne Rampart)" },
      { id: 'wp-04', name: 'Deathbird (Castle Morne Outskirts)' },
      { id: 'wp-05', name: 'Cemetery Shade' },
      { id: 'wp-06', name: 'Erdtree Avatar' },
      { id: 'wp-07', name: 'Scaly Misbegotten' },
      { id: 'wp-08', name: 'Miranda the Blighted Bloom' },
      { id: 'wp-09', name: 'Ancient Hero of Zamor' },
      { id: 'wp-10', name: 'Leonine Misbegotten' }
    ]
  },
  {
    id: 'liurnia',
    name: 'Liurnia of the Lakes',
    bosses: [
      { id: 'liu-01', name: 'Cleanrot Knight' },
      { id: 'liu-02', name: 'Adan, Thief of Fire' },
      { id: 'liu-03', name: 'Burial Tree Watchdog' },
      { id: 'liu-04', name: 'Tibia Mariner (East Liurnia)' },
      { id: 'liu-05', name: "Night's Cavalry (Gate Town Bridge)" },
      { id: 'liu-06', name: 'Preceptor Miriam' },
      { id: 'liu-07', name: 'Godskin Noble' },
      { id: 'liu-08', name: 'Deathbird (Scenic Isle)' },
      { id: 'liu-09', name: 'Crayfish and Grafted Scion' },
      { id: 'liu-10', name: 'Glintstone Dragon Smarag' },
      { id: 'liu-11', name: 'Crystalians (Academy Crystal Cave)' },
      { id: 'liu-12', name: 'Death Rite Bird (Gate Town North)' },
      { id: 'liu-13', name: 'Ring Blade Crystalian' },
      { id: 'liu-14', name: 'Bell Bearing Hunter (Church of Vows)' },
      { id: 'liu-15', name: 'Erdtree Avatar (East Minor Erdtree)' },
      { id: 'liu-16', name: 'Cemetery Shade and Black Knife Assassin' },
      { id: 'liu-17', name: 'Festering Fingerprint Vyke' },
      { id: 'liu-18', name: "Night's Cavalry (Bellum Highway Forest)" },
      { id: 'liu-19', name: 'Royal Revenant' },
      { id: 'liu-20', name: 'Bols, Carian Knight' },
      { id: 'liu-21', name: 'Edgar the Revenger' },
      { id: 'liu-22', name: 'Erdtree Avatar (West Minor Erdtree)' },
      { id: 'liu-23', name: 'Spirit-Caller Snail' },
      { id: 'liu-24', name: 'Omenkiller' },
      { id: 'liu-25', name: 'Dragons x3 (Moonlight Altar)' },
      { id: 'liu-26', name: 'Crystalians x4 (Moonlight Altar)' },
      { id: 'liu-27', name: 'Red Wolf of the Moonlight Altar' },
      { id: 'liu-28', name: 'Alecto, Black Knife Ringleader' },
      { id: 'liu-29', name: 'Royal Knight Loretta' },
      { id: 'liu-30', name: 'Glintstone Dragon Adula' },
      { id: 'liu-31', name: 'Red Wolf (Behind Caria Manor)' },
      { id: 'liu-32', name: 'Alabaster Lord' },
      { id: 'liu-33', name: 'Magma Wyrm Makar' },
      { id: 'liu-34', name: 'Ravenmount Assassin' },
      { id: 'liu-35', name: 'Red Wolf of Radagon' },
      { id: 'liu-36', name: 'Rennala, Queen of the Full Moon' }
    ]
  },
  {
    id: 'altus-plateau',
    name: 'Altus Plateau',
    bosses: [
      { id: 'alt-01', name: 'Ancient Dragon Lansseax' },
      { id: 'alt-02', name: 'Misbegotten Warrior and Perfumer Tricia' },
      { id: 'alt-03', name: 'Godefroy the Grafted' },
      { id: 'alt-04', name: "Night's Cavalry (Altus Highway)" },
      { id: 'alt-05', name: 'Demi-Human Queen Gilika' },
      { id: 'alt-06', name: 'Tibia Mariner (Wyndham Ruins)' },
      { id: 'alt-07', name: 'Necromancer Garris and Black Knife Assassin' },
      { id: 'alt-08', name: 'Erdtree Burial Watchdog' },
      { id: 'alt-09', name: 'Stonedigger Troll (Old Altus Tunnel)' },
      { id: 'alt-10', name: 'Eleonora, Violet Bloody Finger' },
      { id: 'alt-11', name: 'Maleigh Marais, Shaded Castle Castellan' },
      { id: 'alt-12', name: 'Elemer of the Briar' },
      { id: 'alt-13', name: 'Rileigh the Idle' },
      { id: 'alt-14', name: 'Sanguine Noble' },
      { id: 'alt-15', name: 'Wormface (Minor Erdtree)' },
      { id: 'alt-16', name: 'Godskin Apostle (Dominula Windmill Village)' },
      { id: 'alt-17', name: 'Crystalians x2 (Altus Tunnel)' },
      { id: 'alt-18', name: "Black Knife Assassin (Sainted Hero's Grave)" },
      { id: 'alt-19', name: "Ancient Hero of Zamor (Sainted Hero's Grave)" },
      { id: 'alt-20', name: 'Omenkiller and Miranda the Blighted Bloom' },
      { id: 'alt-21', name: 'Fallingstar Beast (South Altus Plateau)' },
      { id: 'alt-22', name: 'Tree Sentinel x2 (Leyndell Entrance)' }
    ]
  },
  {
    id: 'caelid-wilds',
    name: 'Caelid Wilds',
    bosses: [
      { id: 'cae-01', name: 'Magma Wyrm (Gael Tunnel)' },
      { id: 'cae-02', name: 'Erdtree Avatar (West Minor Erdtree)' },
      { id: 'cae-03', name: 'Erdtree Burial Watchdog x2' },
      { id: 'cae-04', name: 'Mad Pumpkin Head x2' },
      { id: 'cae-05', name: 'Knights of the Great Jar x3' },
      { id: 'cae-06', name: 'Frenzied Duelist' },
      { id: 'cae-07', name: 'Decaying Ekzykes' },
      { id: 'cae-08', name: "Night's Cavalry (Caelid Highway South)" },
      { id: 'cae-09', name: 'Death Rite Bird (Southern Aeonia Swamp Bank)' },
      { id: 'cae-10', name: "Commander O'Neil" },
      { id: 'cae-11', name: 'Millicent' },
      { id: 'cae-12', name: 'Nox Swordstress and Nox Priest' },
      { id: 'cae-13', name: 'Fallingstar Beast (Sellia Crystal Tunnel)' },
      { id: 'cae-14', name: 'Cleanrot Knight x2' },
      { id: 'cae-15', name: 'Battlemage Hugues' },
      { id: 'cae-16', name: 'Elder Dragon Greyoll' },
      { id: 'cae-17', name: 'Crystalians x3 (Sellia Hideaway)' },
      { id: 'cae-18', name: 'Godskin Apostle (Divine Tower of Caelid)' },
      { id: 'cae-19', name: 'Putrid Avatar' },
      { id: 'cae-20', name: 'Beastman of Farum Azula x2' },
      { id: 'cae-21', name: "Night's Cavalry (Lenne's Rise Bridge)" },
      { id: 'cae-22', name: 'Flying Dragon Greyll' },
      { id: 'cae-23', name: 'Black Blade Kindred' },
      { id: 'cae-24', name: 'Gurranq, Beast Clergyman' },
      { id: 'cae-25', name: 'Misbegotten Warrior and Crucible Knight' },
      { id: 'cae-26', name: 'Starscourge Radahn' },
      { id: 'cae-27', name: 'Putrid Tree Spirit' }
    ]
  },
  {
    id: 'gelmir-volcano-manor',
    name: 'Mt. Gelmir and Volcano Manor',
    bosses: [
      { id: 'gel-01', name: 'Grafted Scion (North Mt. Gelmir)' },
      { id: 'gel-02', name: 'Demi-Human Queen Margot' },
      { id: 'gel-03', name: 'Ulcerated Tree Spirit (Minor Erdtree)' },
      { id: 'gel-04', name: 'Kindred of Rot x2' },
      { id: 'gel-05', name: 'Red Wolf of the Champion' },
      { id: 'gel-06', name: 'Full-Grown Fallingstar Beast' },
      { id: 'gel-07', name: 'Wormface (Road of Iniquity)' },
      { id: 'gel-08', name: 'Fire Prelate' },
      { id: 'gel-09', name: 'Magma Wyrm (South of Fort Laiedd)' },
      { id: 'gel-10', name: 'Demi-Human Queen Maggie' },
      { id: 'gel-11', name: 'Abductor Virgin x2' },
      { id: 'gel-12', name: 'Magma Wyrm (Volcano Manor)' },
      { id: 'gel-13', name: 'Godskin Noble (Volcano Manor)' },
      { id: 'gel-14', name: 'Rykard, Lord of Blasphemy' },
      { id: 'gel-15', name: "Tanith's Knight" }
    ]
  },
  {
    id: 'leyndell',
    name: 'Leyndell, the Capital',
    bosses: [
      { id: 'ley-01', name: 'Ulcerated Tree Spirit (Leyndell West)' },
      { id: 'ley-02', name: 'Twinblade Gargoyle' },
      { id: 'ley-03', name: 'Margit, the Fell Omen (Leyndell West)' },
      { id: 'ley-04', name: 'Deathbird (Leyndell North)' },
      { id: 'ley-05', name: 'Onyx Lord' },
      { id: 'ley-06', name: 'The Loathsome Dung Eater' },
      { id: 'ley-07', name: 'Draconic Tree Sentinel' },
      { id: 'ley-08', name: 'Grave Warden Duelist (Auriza Side Tomb)' },
      { id: 'ley-09', name: 'Crucible Knight Ordovis and Crucible Knight' },
      { id: 'ley-10', name: 'Erdtree Avatar (Leyndell Main Road)' },
      { id: 'ley-11', name: 'Ulcerated Tree Spirit (Lower Capital Church)' },
      { id: 'ley-12', name: 'Gargoyle (West Capital Rampart)' },
      { id: 'ley-13', name: 'Vargram and Wilhelm' },
      { id: 'ley-14', name: 'Godfrey, First Elden Lord' },
      { id: 'ley-15', name: "Black Knife Assassin (Queen's Bedchamber)" },
      { id: 'ley-16', name: 'Morgott, the Omen King' },
      { id: 'ley-17', name: 'Fell Twins x2' }
    ]
  },
  {
    id: 'mountaintops',
    name: 'Mountaintops of the Giants and Consecrated Snowfield',
    bosses: [
      { id: 'mtn-01', name: "Night's Cavalry" },
      { id: 'mtn-02', name: 'Black Blade Kindred' },
      { id: 'mtn-03', name: 'Ancient Hero of Zamor' },
      { id: 'mtn-04', name: 'Ulcerated Tree Spirit' },
      { id: 'mtn-05', name: 'Erdtree Avatar' },
      { id: 'mtn-06', name: 'Juno Hoslow, Knight of Blood' },
      { id: 'mtn-07', name: 'Death Rite Bird' },
      { id: 'mtn-08', name: 'Tibia Mariner' },
      { id: 'mtn-09', name: 'Commander Niall' },
      { id: 'mtn-10', name: 'Vyke, Knight of the Round Table' },
      { id: 'mtn-11', name: 'Guardian of Arganti' },
      { id: 'mtn-12', name: 'Borealis the Freezing Fog' },
      { id: 'mtn-13', name: 'Spirit-Caller Snail and Cleanrot Aristocrat' },
      { id: 'mtn-14', name: 'Okina, Bloody Finger' },
      { id: 'mtn-15', name: 'Fire Giant' },
      { id: 'mtn-16', name: 'False Tear Crystalian' },
      { id: 'mtn-17', name: 'Putrid Grave Warden Duelist' },
      { id: 'mtn-18', name: "Night's Cavalry x2" },
      { id: 'mtn-19', name: 'Astel, Naturalborn of the Void' },
      { id: 'mtn-20', name: 'Bloody Aristocrat' },
      { id: 'mtn-21', name: 'Anastasia, Tarnished-Eater' },
      { id: 'mtn-22', name: 'Great Wyrm Theodorix' },
      { id: 'mtn-23', name: 'Bastard Cross-Legged Knight' },
      { id: 'mtn-24', name: 'Putrid Avatar' },
      { id: 'mtn-25', name: 'Death Rite Bird' },
      { id: 'mtn-26', name: 'Black Knife Assassin' },
      { id: 'mtn-27', name: 'Loretta, Knight of the Haligtree' },
      { id: 'mtn-28', name: 'Putrid Tree Spirit' },
      { id: 'mtn-29', name: 'Putrid Tree Spirit' },
      { id: 'mtn-30', name: 'Sisters of Millicent' },
      { id: 'mtn-31', name: 'Putrid Avatar' },
      { id: 'mtn-32', name: 'Malenia, Blade of Miquella' }
    ]
  }
];

const state = {
  filter: 'all',
  searchTerm: '',
  completed: new Set(),
  openRegions: new Set([regions[0].id])
};

const els = {};

function cacheDom() {
  els.accordion = document.getElementById('accordion');
  els.searchInput = document.getElementById('search-input');
  els.filterButtons = document.querySelectorAll('.filter-btn');
  els.resetBtn = document.getElementById('reset-btn');
  els.completedCount = document.getElementById('completed-count');
  els.totalCount = document.getElementById('total-count');
  els.percentLabel = document.getElementById('percent-label');
  els.overallBar = document.getElementById('overall-bar');
  els.chartFill = document.getElementById('chart-fill');
  els.chartPercent = document.getElementById('chart-percent');
  els.emptyState = document.getElementById('empty-state');
  els.regionsFoundCount = document.getElementById('regions-found-count');
  els.remainingCount = document.getElementById('remaining-count');
}

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

function getAllBosses() {
  const list = [];
  regions.forEach((region) => {
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
  return boss.name.toLowerCase().includes(term);
}

function buildAccordion() {
  els.accordion.innerHTML = '';
  let visibleRegionCount = 0;

  regions.forEach((region, regionIndex) => {
    const { total, done } = getTotals(region.bosses);
    const pct = total ? Math.round((done / total) * 100) : 0;
    const visibleBosses = region.bosses.filter((b) => matchesSearch(b) && matchesFilter(b));
    const hasSearch = state.searchTerm.trim().length > 0;

    if (hasSearch && visibleBosses.length === 0) return;
    visibleRegionCount += 1;

    const isOpen = hasSearch ? true : state.openRegions.has(region.id);
    const finished = total > 0 && done === total;

    const item = document.createElement('article');
    item.className = 'accordion-item' + (finished ? ' is-finished' : '');
    item.style.animationDelay = (regionIndex * 40) + 'ms';

    const headerId = 'header-' + region.id;
    const panelId = 'panel-' + region.id;

    item.innerHTML = `
      <h3 class="accordion-heading">
        <button type="button" class="accordion-trigger" id="${headerId}" aria-expanded="${isOpen}" aria-controls="${panelId}" data-region-id="${region.id}">
          <span class="trigger-main">
            <span class="region-dot" aria-hidden="true"></span>
            <span class="region-name">${region.name}</span>
          </span>
          <span class="trigger-meta">
            <span class="region-count">${done}<span class="count-sep">/</span>${total}</span>
            <span class="region-mini-bar"><span class="region-mini-fill" style="width:${pct}%"></span></span>
            <svg class="chevron" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6"/></svg>
          </span>
        </button>
      </h3>
      <div class="accordion-content ${isOpen ? 'is-open' : ''}" id="${panelId}" role="region" aria-labelledby="${headerId}">
        <div class="accordion-inner">
          <ul class="boss-list"></ul>
        </div>
      </div>
    `;

    const list = item.querySelector('.boss-list');
    const bossesToRender = hasSearch ? visibleBosses : region.bosses.filter((b) => matchesFilter(b));

    list.appendChild(createRegionSelectRow(region));

    if (bossesToRender.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'boss-empty';
      empty.textContent = 'No bosses match this filter.';
      list.appendChild(empty);
    } else {
      bossesToRender.forEach((boss, index) => {
        list.appendChild(createBossRow(boss, index));
      });
    }

    const trigger = item.querySelector('.accordion-trigger');
    trigger.addEventListener('click', () => toggleRegion(region.id));

    els.accordion.appendChild(item);
  });

  if (els.regionsFoundCount) {
    els.regionsFoundCount.textContent = visibleRegionCount;
  }

  els.emptyState.hidden = visibleRegionCount !== 0;
}

function createRegionSelectRow(region) {
  const { total, done } = getTotals(region.bosses);
  const li = document.createElement('li');
  li.className = 'region-select-item';

  li.innerHTML = `
    <label class="region-select-row" for="select-${region.id}">
      <span class="boss-checkbox-wrap">
        <input
          type="checkbox"
          id="select-${region.id}"
          class="boss-checkbox region-select-checkbox"
          data-region-select="${region.id}"
          ${total > 0 && done === total ? 'checked' : ''}
        />
        <span class="boss-checkbox-visual" aria-hidden="true">
          <svg class="region-select-check" width="13" height="10" viewBox="0 0 13 10"><path d="M1 5.2 4.6 8.5 12 1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <svg class="region-select-minus" width="12" height="2" viewBox="0 0 12 2"><path d="M1 1h10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </span>
      </span>
      <span>Select all in this region</span>
    </label>
  `;

  const checkbox = li.querySelector('.region-select-checkbox');
  checkbox.indeterminate = done > 0 && done < total;
  checkbox.addEventListener('change', () => toggleRegionBosses(region.id, checkbox.checked));

  return li;
}

function toggleRegionBosses(regionId, completed) {
  const region = regions.find((item) => item.id === regionId);
  if (!region) return;

  region.bosses.forEach((boss) => {
    if (completed) state.completed.add(boss.id);
    else state.completed.delete(boss.id);
  });

  saveProgress();
  buildAccordion();
  updateProgress();
}

function createBossRow(boss, index) {
  const isDone = state.completed.has(boss.id);
  const li = document.createElement('li');
  li.className = 'boss-row' + (isDone ? ' completed' : '');
  li.style.animationDelay = (index * 22) + 'ms';

  li.innerHTML = `
    <label class="boss-label" for="chk-${boss.id}">
      <span class="boss-checkbox-wrap">
        <input type="checkbox" id="chk-${boss.id}" class="boss-checkbox" ${isDone ? 'checked' : ''} />
        <span class="boss-checkbox-visual" aria-hidden="true">
          <svg width="13" height="10" viewBox="0 0 13 10"><path d="M1 5.2 4.6 8.5 12 1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
      </span>
      <span class="boss-name-wrap">
        <span class="boss-name">${boss.name}</span>
      </span>
    </label>
  `;

  const checkbox = li.querySelector('input');
  checkbox.addEventListener('change', () => toggleBoss(boss.id, li));

  return li;
}

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

function refreshRegionMeta() {
  regions.forEach((region) => {
    const { total, done } = getTotals(region.bosses);
    const pct = total ? Math.round((done / total) * 100) : 0;
    const trigger = document.querySelector(`.accordion-trigger[data-region-id="${region.id}"]`);
    if (!trigger) return;
    const countEl = trigger.querySelector('.region-count');
    const fillEl = trigger.querySelector('.region-mini-fill');
    const itemEl = trigger.closest('.accordion-item');
    const selectEl = itemEl ? itemEl.querySelector(`[data-region-select="${region.id}"]`) : null;
    if (countEl) countEl.innerHTML = `${done}<span class="count-sep">/</span>${total}`;
    if (fillEl) fillEl.style.width = pct + '%';
    if (selectEl) {
      selectEl.checked = total > 0 && done === total;
      selectEl.indeterminate = done > 0 && done < total;
    }
    if (itemEl) itemEl.classList.toggle('is-finished', total > 0 && done === total);
  });
}

function toggleRegion(regionId) {
  if (state.searchTerm.trim()) return;
  if (state.openRegions.has(regionId)) {
    state.openRegions.delete(regionId);
  } else {
    state.openRegions.add(regionId);
  }
  const trigger = document.querySelector(`.accordion-trigger[data-region-id="${regionId}"]`);
  const panel = document.getElementById('panel-' + regionId);
  if (trigger && panel) {
    const isOpen = state.openRegions.has(regionId);
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
  const confirmed = confirm('Reset all boss progress? This cannot be undone.');
  if (!confirmed) return;
  state.completed = new Set();
  saveProgress();
  buildAccordion();
  updateProgress();
}

function updateProgress() {
  const allBosses = getAllBosses();
  const { total, done } = getTotals(allBosses);
  const pct = total ? Math.round((done / total) * 100) : 0;

  els.completedCount.textContent = done;
  els.totalCount.textContent = total;
  els.percentLabel.textContent = pct + '%';
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

function attachEvents() {
  els.searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
  els.filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });
  els.resetBtn.addEventListener('click', resetProgress);
}

function init() {
  cacheDom();
  state.completed = loadProgress();
  attachEvents();
  buildAccordion();
  updateProgress();
  requestAnimationFrame(() => document.body.classList.add('is-ready'));
}

document.addEventListener('DOMContentLoaded', init);
