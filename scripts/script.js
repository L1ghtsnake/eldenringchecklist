'use strict';

const STORAGE_KEY = 'eldenRingBossChecklist';
const THEME_KEY = 'eldenRingBossChecklistTheme';
const LANG_KEY = 'eldenRingBossChecklistLang';
const GAME_KEY = 'eldenRingBossChecklistGame';

/* ==========================================================================
   Data — English source names (ids are stable, used for storage & lookup)
   ========================================================================== */

const eldenRingRegions = [
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
  },
  {
    id: 'farum-azula',
    name: 'Farum Azula',
    bosses: [
      { id: 'far-01', name: 'Dragon' },
      { id: 'far-02', name: 'Godskin Duo' },
      { id: 'far-03', name: 'Crucible Knight' },
      { id: 'far-04', name: 'Draconic Tree Sentinel' },
      { id: 'far-05', name: 'Maliketh, The Black Blade' }
    ]
  },
  {
    id: 'leyndell-ashen-capital',
    name: 'Leyndell, Ashen Capital',
    bosses: [
      { id: 'leyac-01', name: 'Sir Gideon Ofnir, the All-Knowing' },
      { id: 'leyac-02', name: 'Godfrey, First Elden Lord' },
      { id: 'leyac-03', name: 'Hoarah Loux' },
      { id: 'leyac-04', name: 'Radagon of the Golden Order' },
      { id: 'leyac-05', name: 'Elden Beast' }
    ]
  }
];

/* Shadow of the Erdtree — kept as a fully separate region set so the two
   games never mix, while reusing the exact same {id, name, bosses} shape. */
const shadowErdtreeRegions = [
  {
    id: 'gravesite-plain',
    name: 'Gravesite Plain',
    bosses: [
      { id: 'gp-01', name: 'Logur the Beast Claw' },
      { id: 'gp-02', name: 'Blackgaol Knight' },
      { id: 'gp-03', name: 'Furnace Golem' },
      { id: 'gp-04', name: 'Ghostflame Dragon' },
      { id: 'gp-05', name: 'Demi-Human Swordmaster Onze' },
      { id: 'gp-06', name: 'Ancient Dragon-Man' },
      { id: 'gp-07', name: 'Magma Wyrm' },
      { id: 'gp-08', name: 'Ancient Dragon-Man' },
      { id: 'gp-09', name: 'Death Knight' },
      { id: 'gp-10', name: 'Ulcerated Tree Spirit' },
      { id: 'gp-11', name: 'Chief Bloodfiend' },
      { id: 'gp-12', name: 'Furnace Golem' },
      { id: 'gp-13', name: 'Moore' }
    ]
  },
  {
    id: 'belurat-tower-settlement',
    name: 'Belurat, Tower Settlement',
    bosses: [
      { id: 'bts-01', name: 'Ulcerated Tree Spirit' },
      { id: 'bts-02', name: 'Fire Knight Queelign' },
      { id: 'bts-03', name: 'Divine Beast Dancing Lion' }
    ]
  },
  {
    id: 'cerulean-coast',
    name: 'Cerulean Coast',
    bosses: [
      { id: 'cc-01', name: 'Demi-Human Queen Marigga' },
      { id: 'cc-02', name: 'Ghostflame Dragon' },
      { id: 'cc-03', name: 'Dancer of Ranah' }
    ]
  },
  {
    id: 'castle-ensis',
    name: 'Castle Ensis',
    bosses: [
      { id: 'ce-01', name: 'Troll Knight' },
      { id: 'ce-02', name: 'Moonrithyll, Carian Knight' },
      { id: 'ce-03', name: 'Rellana, Twin Moon Knight' }
    ]
  },
  {
    id: 'scadu-altus',
    name: 'Scadu Altus',
    bosses: [
      { id: 'sa-01', name: 'Troll Knight Apparition' },
      { id: 'sa-02', name: 'Black Knight Garrew' },
      { id: 'sa-03', name: 'Fire Knight Queelign' },
      { id: 'sa-04', name: 'Furnace Golem' },
      { id: 'sa-05', name: 'Black Knight' },
      { id: 'sa-06', name: 'Ralva the Great Red Bear' },
      { id: 'sa-07', name: 'Dryleaf Dane' },
      { id: 'sa-08', name: 'Ghostflame Dragon' },
      { id: 'sa-09', name: 'Black Knight Edredd' },
      { id: 'sa-10', name: 'Greater Potentate' },
      { id: 'sa-11', name: 'Greater Potentate' },
      { id: 'sa-12', name: 'Curseblade Labirith' },
      { id: 'sa-13', name: 'Furnace Golem' },
      { id: 'sa-14', name: 'Swordhand of Night Anna' }
    ]
  },
  {
    id: 'foot-of-the-jagged-peak',
    name: 'Foot of the Jagged Peak',
    bosses: [
      { id: 'fjp-01', name: 'Jagged Peak Drake' },
      { id: 'fjp-02', name: 'Jagged Peak Drake & Lesser Dragon' }
    ]
  },
  {
    id: 'charos-hidden-grave',
    name: "Charo's Hidden Grave",
    bosses: [
      { id: 'chg-01', name: 'Tibia Mariner' },
      { id: 'chg-02', name: 'Death Rite Bird' },
      { id: 'chg-03', name: 'Hippopotamus' },
      { id: 'chg-04', name: 'Furnace Golem' },
      { id: 'chg-05', name: 'Lamenter' }
    ]
  },
  {
    id: 'jagged-peak',
    name: 'Jagged Peak',
    bosses: [
      { id: 'jp-01', name: 'Ancient Dragon Senessax' },
      { id: 'jp-02', name: 'Bayle the Dread' }
    ]
  },
  {
    id: 'rauh-base',
    name: 'Rauh Base',
    bosses: [
      { id: 'rb-01', name: 'Red Bear' },
      { id: 'rb-02', name: 'Rugalea the Great Red Bear' },
      { id: 'rb-03', name: 'Death Knight' }
    ]
  },
  {
    id: 'stone-coffin-fissure',
    name: 'Stone Coffin Fissure',
    bosses: [
      { id: 'scf-01', name: 'Misbegotten Crusader' },
      { id: 'scf-02', name: 'Putrescent Knight' },
      { id: 'scf-03', name: 'Thiollier' }
    ]
  },
  {
    id: 'shadow-keep',
    name: 'Shadow Keep',
    bosses: [
      { id: 'sk-01', name: 'Golden Hippopotamus' },
      { id: 'sk-02', name: 'Assist Leda/Hornsent' },
      { id: 'sk-03', name: 'Ulcerated Tree Spirit' },
      { id: 'sk-04', name: 'Ulcerated Tree Spirit' },
      { id: 'sk-05', name: 'Wego, Fire Knight Elder' },
      { id: 'sk-06', name: 'Assist Leda/Ansbach' },
      { id: 'sk-07', name: 'Kood, Fire Knight Captain' },
      { id: 'sk-08', name: 'Messmer the Impaler' },
      { id: 'sk-09', name: 'Salza, Fire Knight Sage' }
    ]
  },
  {
    id: 'scadutree-base',
    name: 'Scadutree Base',
    bosses: [
      { id: 'stb-01', name: 'Scadutree Avatar' }
    ]
  },
  {
    id: 'scaduview',
    name: 'Scaduview',
    bosses: [
      { id: 'sv-01', name: 'Commander Gaius' }
    ]
  },
  {
    id: 'hinterland',
    name: 'Hinterland',
    bosses: [
      { id: 'hl-01', name: 'Tree Sentinel Duo' },
      { id: 'hl-02', name: 'Fallingstar Beast' }
    ]
  },
  {
    id: 'ymirs-quest',
    name: "Ymir's Quest",
    bosses: [
      { id: 'yq-01', name: 'Metyr, Mother of Fingers' },
      { id: 'yq-02', name: 'Jolán & Count Ymir' }
    ]
  },
  {
    id: 'ancient-ruins-of-rauh',
    name: 'Ancient Ruins of Rauh',
    bosses: [
      { id: 'aror-01', name: 'Crucible Knight Devonia' },
      { id: 'aror-02', name: 'Hippopotamus' },
      { id: 'aror-03', name: 'Furnace Golem' },
      { id: 'aror-04', name: 'Divine Beast Dancing Lion' },
      { id: 'aror-05', name: 'Romina, Saint of the Bud' }
    ]
  },
  {
    id: 'recluses-river',
    name: "Recluses' River",
    bosses: [
      { id: 'rr-01', name: 'Furnace Golem' },
      { id: 'rr-02', name: 'Furnace Golem' },
      { id: 'rr-03', name: 'Rakshasa' },
      { id: 'rr-04', name: 'Hippopotamus' },
      { id: 'rr-05', name: 'Hippopotamus' },
      { id: 'rr-06', name: 'Jori, Elder Inquisitor' }
    ]
  },
  {
    id: 'abyssal-woods',
    name: 'Abyssal Woods',
    bosses: [
      { id: 'aw-01', name: 'Madding Hand' },
      { id: 'aw-02', name: 'Aging Untouchables' },
      { id: 'aw-03', name: 'Midra, Lord of Frenzied Flame' }
    ]
  },
  {
    id: 'enir-ilim',
    name: 'Enir-Ilim',
    bosses: [
      { id: 'ei-01', name: 'Divine Beast Warrior of Lightning' },
      { id: 'ei-02', name: 'Divine Beast Warrior of Frost' },
      { id: 'ei-03', name: 'Divine Beast Warrior of Wind' },
      { id: 'ei-04', name: 'Divine Beast Warrior of Wind' },
      { id: 'ei-05', name: 'Leda, Dane & Allies' },
      { id: 'ei-06', name: 'Promised Consort Radahn' }
    ]
  }
];

/* Internal-only code names (never shown in the UI — see i18n gameEldenRing /
   gameShadowErdtree for the user-facing labels). */
const games = {
  eldenring: { id: 'eldenring', regions: eldenRingRegions },
  shadowerdtree: { id: 'shadowerdtree', regions: shadowErdtreeRegions }
};

/* Russian localization — region and boss names */
const ruNames = {
  regions: {
    limgrave: 'Лимгрейв',
    'weeping-peninsula': 'Плачущий полуостров',
    liurnia: 'Лиурния Озёр',
    'altus-plateau': 'Альтус Плато',
    'caelid-wilds': 'Дикий край Каэлид',
    'gelmir-volcano-manor': 'Гора Гельмир и Поместье Вулкан',
    leyndell: 'Лейндел, Столица',
    mountaintops: 'Вершины Великанов и Святое Заснеженное поле',
    'farum-azula': 'Фарум Азула',
    'leyndell-ashen-capital': 'Лейндел, Пепельная Столица'
  },
  bosses: {
    'lim-01': 'Солдат Годрика',
    'lim-02': 'Вожди полулюдей',
    'lim-03': 'Сторож погребального древа',
    'lim-04': 'Зверочеловек Фарум Азулы',
    'lim-05': 'Тролль-камнерой',
    'lim-06': 'Дуэлянт — хранитель могил',
    'lim-07': 'Кровавый Палец Нериюс',
    'lim-08': 'Пэтчес',
    'lim-09': 'Голем-страж',
    'lim-10': 'Убийца из Чёрных ножей',
    'lim-11': 'Раскольник Генрикус',
    'lim-12': 'Безумный тыквоголовый',
    'lim-13': 'Ночной всадник (мост на тракте)',
    'lim-14': 'Древесный страж',
    'lim-15': 'Летающий дракон Агил',
    'lim-16': 'Лодочник Тибия',
    'lim-17': 'Анастасия, пожирательница Погасших',
    'lim-18': 'Рыцарь-ищейка Дарривил',
    'lim-19': 'Рыцарь Тигля (Штормхилл)',
    'lim-20': 'Охотник за печатями торговца (хижина Мастера войны)',
    'lim-21': 'Птица смерти (к востоку от хижины Мастера войны)',
    'lim-22': 'Старый рыцарь Иштван',
    'lim-23': 'Изъязвлённый древесный дух (Могила героя Окраинного народа)',
    'lim-24': 'Изъязвлённый древесный дух (замок Штормвилль)',
    'lim-25': 'Рыцарь Тигля (замок Штормвилль)',
    'lim-26': 'Приплавленный Отпрыск',
    'lim-27': 'Маргит, Омен Забвения',
    'lim-28': 'Годрик Приплавленный',

    'wp-01': 'Сторож погребального древа и бесы',
    'wp-02': 'Рунный медведь',
    'wp-03': 'Ночной всадник (вал замка Морн)',
    'wp-04': 'Птица смерти (окрестности замка Морн)',
    'wp-05': 'Кладбищенская тень',
    'wp-06': 'Воплощение Древа Эрд',
    'wp-07': 'Чешуйчатый Иначе-рождённый',
    'wp-08': 'Миранда, порочный цветок',
    'wp-09': 'Древний герой Замора',
    'wp-10': 'Львиный Иначе-рождённый',

    'liu-01': 'Рыцарь Чистой Гнили',
    'liu-02': 'Адан, похититель огня',
    'liu-03': 'Сторож погребального древа',
    'liu-04': 'Лодочник Тибия (восток Лиурнии)',
    'liu-05': 'Ночной всадник (мост у Врат)',
    'liu-06': 'Наставница Мириам',
    'liu-07': 'Дворянин Кожи Бога',
    'liu-08': 'Птица смерти (Живописный остров)',
    'liu-09': 'Рак и Приплавленный Отпрыск',
    'liu-10': 'Дракон блескучего камня Смараг',
    'liu-11': 'Кристалиане (Хрустальная пещера Академии)',
    'liu-12': 'Погребальная птица (к северу от Врат)',
    'liu-13': 'Кристалианин с кольцевым клинком',
    'liu-14': 'Охотник за печатями торговца (Церковь Обетов)',
    'liu-15': 'Воплощение Древа Эрд (малое древо на востоке)',
    'liu-16': 'Кладбищенская тень и убийца из Чёрных ножей',
    'liu-17': 'Вик, Гноящийся Отпечаток Пальца',
    'liu-18': 'Ночной всадник (лес у тракта Беллум)',
    'liu-19': 'Королевский ревенант',
    'liu-20': 'Больс, рыцарь Кариан',
    'liu-21': 'Эдгар Мститель',
    'liu-22': 'Воплощение Древа Эрд (малое древо на западе)',
    'liu-23': 'Улитка — призывательница духов',
    'liu-24': 'Убийца Оменов',
    'liu-25': 'Драконы x3 (Алтарь лунного света)',
    'liu-26': 'Кристалиане x4 (Алтарь лунного света)',
    'liu-27': 'Красный волк Алтаря лунного света',
    'liu-28': 'Алекто, предводительница Чёрных ножей',
    'liu-29': 'Королевский рыцарь Лоретта',
    'liu-30': 'Дракон блескучего камня Адула',
    'liu-31': 'Красный волк (за поместьем Кария)',
    'liu-32': 'Алебастровый лорд',
    'liu-33': 'Магматический змей Макар',
    'liu-34': 'Убийца-наездник ворона',
    'liu-35': 'Красный волк Радагона',
    'liu-36': 'Реналла, королева полной луны',

    'alt-01': 'Древний дракон Лансьё',
    'alt-02': 'Воин Иначе-рождённых и парфюмерша Триша',
    'alt-03': 'Годфруа Приплавленный',
    'alt-04': 'Ночной всадник (тракт Альтуса)',
    'alt-05': 'Королева полулюдей Гилика',
    'alt-06': 'Лодочник Тибия (руины Виндхэма)',
    'alt-07': 'Некромант Гаррис и убийца из Чёрных ножей',
    'alt-08': 'Погребальный страж Древа Эрд',
    'alt-09': 'Тролль-камнерой (старый туннель Альтуса)',
    'alt-10': 'Элеонора, Лиловый Кровавый Палец',
    'alt-11': 'Мали Маре, кастелян Затенённого замка',
    'alt-12': 'Элемер Тернистый',
    'alt-13': 'Райли Праздный',
    'alt-14': 'Кровавый дворянин',
    'alt-15': 'Червеликий (малое древо)',
    'alt-16': 'Апостол Кожи Бога (деревня Доминула)',
    'alt-17': 'Кристалиане x2 (туннель Альтуса)',
    'alt-18': 'Убийца из Чёрных ножей (Могила святого героя)',
    'alt-19': 'Древний герой Замора (Могила святого героя)',
    'alt-20': 'Убийца Оменов и Миранда, порочный цветок',
    'alt-21': 'Зверь падающей звезды (юг Альтус Плато)',
    'alt-22': 'Древесные стражи x2 (вход в Лейндел)',

    'cae-01': 'Магматический змей (туннель Гаэль)',
    'cae-02': 'Воплощение Древа Эрд (малое древо на западе)',
    'cae-03': 'Погребальные стражи Древа Эрд x2',
    'cae-04': 'Безумные тыквоголовые x2',
    'cae-05': 'Рыцари Великого Кувшина x3',
    'cae-06': 'Обезумевший дуэлянт',
    'cae-07': 'Разлагающийся Экзайкс',
    'cae-08': 'Ночной всадник (юг тракта Каэлида)',
    'cae-09': 'Погребальная птица (южный берег болота Эония)',
    'cae-10': "Командир О'Нил",
    'cae-11': 'Миллисента',
    'cae-12': 'Мечница Нокс и жрец Нокс',
    'cae-13': 'Зверь падающей звезды (Хрустальный туннель Селии)',
    'cae-14': 'Рыцари Чистой Гнили x2',
    'cae-15': 'Боевой маг Хьюг',
    'cae-16': 'Древний дракон Грейолл',
    'cae-17': 'Кристалиане x3 (укрытие Селии)',
    'cae-18': 'Апостол Кожи Бога (Святая башня Каэлида)',
    'cae-19': 'Гнилостное воплощение',
    'cae-20': 'Зверолюди Фарум Азулы x2',
    'cae-21': 'Ночной всадник (мост Возвышения Ленны)',
    'cae-22': 'Летающий дракон Грейлл',
    'cae-23': 'Родич Чёрного Клинка',
    'cae-24': 'Гурранк, звероподобный священник',
    'cae-25': 'Воин Иначе-рождённых и рыцарь Тигля',
    'cae-26': 'Радан, Бич Звёзд',
    'cae-27': 'Гнилостный древесный дух',

    'gel-01': 'Приплавленный Отпрыск (север горы Гельмир)',
    'gel-02': 'Королева полулюдей Марго',
    'gel-03': 'Изъязвлённый древесный дух (малое древо)',
    'gel-04': 'Родичи Гнили x2',
    'gel-05': 'Красный волк Чемпиона',
    'gel-06': 'Взрослый зверь падающей звезды',
    'gel-07': 'Червеликий (Дорога нечестия)',
    'gel-08': 'Огненный прелат',
    'gel-09': 'Магматический змей (юг форта Лайед)',
    'gel-10': 'Королева полулюдей Мэгги',
    'gel-11': 'Девы-похитительницы x2',
    'gel-12': 'Магматический змей (Поместье Вулкан)',
    'gel-13': 'Дворянин Кожи Бога (Поместье Вулкан)',
    'gel-14': 'Рикард, Владыка Богохульства',
    'gel-15': 'Рыцарь Танит',

    'ley-01': 'Изъязвлённый древесный дух (запад Лейндела)',
    'ley-02': 'Горгулья с двумя клинками',
    'ley-03': 'Маргит, Омен Забвения (запад Лейндела)',
    'ley-04': 'Птица смерти (север Лейндела)',
    'ley-05': 'Ониксовый лорд',
    'ley-06': 'Омерзительный Пожиратель Дерьма',
    'ley-07': 'Драконий страж Древа',
    'ley-08': 'Дуэлянт — хранитель могил (боковая гробница Аурицы)',
    'ley-09': 'Рыцарь Тигля Ордовис и рыцарь Тигля',
    'ley-10': 'Воплощение Древа Эрд (главная дорога Лейндела)',
    'ley-11': 'Изъязвлённый древесный дух (церковь Нижней столицы)',
    'ley-12': 'Горгулья (западный вал столицы)',
    'ley-13': 'Варграм и Вильгельм',
    'ley-14': 'Годфри, Первый Элден Лорд',
    'ley-15': 'Убийца из Чёрных ножей (опочивальня королевы)',
    'ley-16': 'Морготт, Король Омен',
    'ley-17': 'Зловещие близнецы x2',

    'mtn-01': 'Ночной всадник',
    'mtn-02': 'Родич Чёрного Клинка',
    'mtn-03': 'Древний герой Замора',
    'mtn-04': 'Изъязвлённый древесный дух',
    'mtn-05': 'Воплощение Древа Эрд',
    'mtn-06': 'Джуно Хослоу, рыцарь крови',
    'mtn-07': 'Погребальная птица',
    'mtn-08': 'Лодочник Тибия',
    'mtn-09': 'Командир Найлл',
    'mtn-10': 'Вик, рыцарь Круглого стола',
    'mtn-11': 'Главный страж Арганти',
    'mtn-12': 'Борелис Леденящий Туман',
    'mtn-13': 'Улитка-призывательница духов и Аристократ божественной кожи',
    'mtn-14': 'Окина, Окровавленный палец',
    'mtn-15': 'Огненный великан',
    'mtn-16': 'Ложная Слеза',
    'mtn-17': 'Гнилостный дуэлянт, хранитель могил',
    'mtn-18': 'Ночной всадник x2',
    'mtn-19': 'Астель, Звёзды Тьмы',
    'mtn-20': 'Кровавый аристократ',
    'mtn-21': 'Анастасия, пожирательница Погасших',
    'mtn-22': 'Великий змей Теодорикс',
    'mtn-23': 'Крестоносец-бастард',
    'mtn-24': 'Гнилостное воплощение',
    'mtn-25': 'Погребальная птица',
    'mtn-26': 'Убийца из Чёрных ножей',
    'mtn-27': 'Лоретта, рыцарь Святого Древа',
    'mtn-28': 'Гнилостный древесный дух',
    'mtn-29': 'Гнилостный древесный дух',
    'mtn-30': 'Сестры Миллисенты',
    'mtn-31': 'Гнилостное воплощение',
    'mtn-32': 'Маления, клинок Микеллы',

    'far-01': 'Дракон',
    'far-02': 'Двое из божественной кожи',
    'far-03': 'Рыцарь Горнила',
    'far-04': 'Драконий страж древа',
    'far-05': 'Маликет Черный Клинок',

    'leyac-01': 'Сэр Гидеон Офнир Всеведущий',
    'leyac-02': 'Годфри Первый Повелитель Эльдена',
    'leyac-03': 'Хоара Лукс',
    'leyac-04': 'Радагон из Золотого Порядка',
    'leyac-05': 'Зверь Эльдена'
  }
};

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
    themeToggle: 'Toggle dark or light theme'
  },
  ru: {
    eyebrow: 'Трекер Промежуточных Земель',
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
    gameShadowErdtree: 'Тень Эрдтри',
    selectAll: 'Выделить всех боссов',
    deselectAll: 'Снять отметки со всех боссов',
    noneFound: 'Ничего не найдено. Попробуйте другой запрос.',
    noMatch: 'Нет боссов, подходящих под фильтр.',
    footer: 'Прогресс сохраняется автоматически в этом браузере.',
    resetConfirm: 'Сбросить весь прогресс по боссам? Это действие необратимо.',
    themeToggle: 'Переключить тёмную или светлую тему'
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
    eldenring: new Set([eldenRingRegions[0].id]),
    shadowerdtree: new Set([shadowErdtreeRegions[0].id])
  },
  lang: 'en',
  theme: 'dark',
  activeGame: 'eldenring'
};

const els = {};

function cacheDom() {
  els.html = document.documentElement;
  els.accordion = document.getElementById('accordion');
  els.searchInput = document.getElementById('search-input');
  els.filterButtons = document.querySelectorAll('.filter-btn');
  els.resetBtn = document.getElementById('reset-btn');
  els.resetLabel = document.getElementById('reset-label');
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
  els.langButtons = document.querySelectorAll('.lang-btn');
  els.gameButtons = document.querySelectorAll('.game-switch-btn');
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
    const visibleBosses = region.bosses.filter((b) => matchesSearch(b) && matchesFilter(b));
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
    const bossesToRender = hasSearch ? visibleBosses : region.bosses.filter((b) => matchesFilter(b));

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

  els.langButtons.forEach((btn) => {
    const active = btn.dataset.lang === lang;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });

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
  els.langButtons.forEach((btn) => {
    btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
  });
  els.gameButtons.forEach((btn) => {
    btn.addEventListener('click', () => applyGame(btn.dataset.game));
  });
}

function init() {
  cacheDom();
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
