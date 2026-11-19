// Leonida Trophy Guide — tracker: renders the 55 trophies from data/trophies.json,
// saves progress in localStorage, filters by kind/grade/search, hides story trophies
// in spoiler mode until earned, and exports/imports progress as JSON.
// Source links: the guide cites its sources by name beside each trophy; names that
// have a verified URL are rendered as links (a link fetches nothing until followed).
const STORAGE_KEY = 'gta6-trophy-progress-v1';
const EXPORT_NAME = 'gta6-trophy-progress.json';

const SOURCE_LINKS = [
  ['Output Lag', 'https://outputlag.com/guides/gta-6-trophy-list/'],
  ['GTA Vice City Hub', 'https://www.gtavicecityhub.com/achievements'],
  ['KeenGamer', 'https://www.keengamer.com/articles/guides/gta-6-trophy-guide-platinum-roadmap-all-55-trophies/'],
  ['LeonidaKit', 'https://www.leonidakit.com/en/trophees.html'],
  ['GTA Zone', 'https://gta-zone.com/news/gta-6-trophies-achievements/'],
  ['eGamers', 'https://egamers.io/gta-6-trophy-list-all-55-trophies-and-achievements-plus-the-hardest-ones/'],
  ['LeonidaHub', 'https://leonidahub.org/en/news/gta-vi-reportedly-has-55-ps5-trophies-platinum-included-as-xbox-and-playstation-data-line-up'],
];

const KINDS = [
  ['all', 'All kinds'],
  ['story', 'Story'],
  ['missable', 'Missable'],
  ['collectibles', 'Collectibles'],
  ['activities', 'Activities'],
  ['exploration', 'Exploration'],
  ['misc', 'Other'],
  ['online', 'Online'],
];

const data = await (await fetch('data/trophies.json')).json();
const trophies = data.trophies;

let earned = new Set();
try {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) earned = new Set(JSON.parse(raw).filter((n) => trophies.some((t) => t.name === n)));
} catch {
  earned = new Set();
}

const state = { kind: 'all', grade: 'all', query: '', spoiler: false, hideEarned: false };
readHashIntoState();

const listEl = document.getElementById('trophyList');
const emptyEl = document.getElementById('emptyMsg');
const shownEl = document.getElementById('shownCount');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('gradeFilter');
const spoilerEl = document.getElementById('spoilerToggle');
const hideEarnedEl = document.getElementById('hideEarnedToggle');

function readHashIntoState() {
  const params = new URLSearchParams(location.hash.slice(1));
  if (KINDS.some(([k]) => k === params.get('kind'))) state.kind = params.get('kind');
  if (['all', 'platinum', 'gold', 'silver', 'bronze'].includes(params.get('grade'))) state.grade = params.get('grade');
  if (params.get('q')) state.query = params.get('q');
  state.spoiler = params.get('spoiler') === 'on';
  state.hideEarned = params.get('hide') === 'earned';
}

function writeStateToHash() {
  const params = new URLSearchParams();
  if (state.kind !== 'all') params.set('kind', state.kind);
  if (state.grade !== 'all') params.set('grade', state.grade);
  if (state.query) params.set('q', state.query);
  if (state.spoiler) params.set('spoiler', 'on');
  if (state.hideEarned) params.set('hide', 'earned');
  history.replaceState(null, '', params.size ? `#${params}` : location.pathname);
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort()));
}

function gradeLabel(grade) {
  return grade[0].toUpperCase() + grade.slice(1);
}

function kindLabel(kind) {
  return { story: 'Story', collectibles: 'Collectibles', activities: 'Activities', exploration: 'Exploration', misc: 'Other', platinum: 'Platinum' }[kind] ?? kind;
}

function isSpoilerHidden(trophy) {
  return state.spoiler && trophy.kind === 'story' && !earned.has(trophy.name);
}

function trophyMatches(trophy) {
  if (state.kind === 'missable' && !trophy.missable) return false;
  if (state.kind === 'online') return false; // No online trophies: every trophy is single-player.
  if (state.kind !== 'all' && state.kind !== 'missable' && trophy.kind !== state.kind) return false;
  if (state.grade !== 'all' && trophy.grade !== state.grade) return false;
  if (state.hideEarned && earned.has(trophy.name)) return false;
  if (state.query) {
    const hay = `${trophy.name} ${trophy.description} ${trophy.guide} ${trophy.steps.join(' ')}`.toLowerCase();
    if (!hay.includes(state.query.toLowerCase())) return false;
  }
  return true;
}

// Render a source citation, turning named sources with a verified URL into links.
function renderSourceCitation(text) {
  const frag = document.createDocumentFragment();
  frag.append('Source: ');
  let rest = text;
  while (rest.length) {
    let earliest = null;
    for (const [name, url] of SOURCE_LINKS) {
      const at = rest.indexOf(name);
      if (at !== -1 && (earliest === null || at < earliest.at)) earliest = { at, name, url };
    }
    if (!earliest) {
      frag.append(rest);
      break;
    }
    if (earliest.at > 0) frag.append(rest.slice(0, earliest.at));
    const a = document.createElement('a');
    a.href = earliest.url;
    a.rel = 'noopener';
    a.textContent = earliest.name;
    frag.append(a);
    rest = rest.slice(earliest.at + earliest.name.length);
  }
  return frag;
}

function badge(text, cls) {
  const s = document.createElement('span');
  s.className = `badge ${cls}`;
  s.textContent = text;
  return s;
}

function renderTrophy(trophy) {
  const card = document.createElement('article');
  card.className = 'trophy';
  card.id = `trophy-${trophy.id}`;
  card.dataset.name = trophy.name;
  if (earned.has(trophy.name)) card.classList.add('earned');
  if (trophy.missable) card.classList.add('missable-card');

  const head = document.createElement('div');
  head.className = 'trophy-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.name);
  box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(trophy.name);
    else earned.delete(trophy.name);
    saveProgress();
    renderAll();
  });
  head.append(box);

  const titleWrap = document.createElement('div');
  titleWrap.className = 'trophy-title';
  const h3 = document.createElement('h3');
  const num = document.createElement('span');
  num.className = 'trophy-num';
  num.textContent = `#${trophy.id}`;
  h3.append(num);
  h3.append(isSpoilerHidden(trophy) ? 'Hidden story trophy' : trophy.name);
  titleWrap.append(h3);
  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = isSpoilerHidden(trophy)
    ? 'Hidden on PlayStation until earned — turn spoiler mode off, or earn it, to reveal it.'
    : trophy.description;
  titleWrap.append(desc);

  const badges = document.createElement('div');
  badges.className = 'badges';
  badges.append(badge(gradeLabel(trophy.grade), trophy.grade));
  badges.append(badge(kindLabel(trophy.kind), 'kind'));
  if (trophy.count) badges.append(badge(`Count: ${trophy.count}`, 'count'));
  if (trophy.hidden) badges.append(badge('Hidden on PS5', 'hidden-flag'));
  if (trophy.missable) badges.append(badge('Missable', 'missable'));
  badges.append(badge(`Roadmap stage ${trophy.stage}`, 'stage'));
  if (earned.has(trophy.name)) badges.append(badge('Earned', 'earned-flag'));
  titleWrap.append(badges);
  head.append(titleWrap);
  card.append(head);

  if (isSpoilerHidden(trophy)) {
    const veil = document.createElement('p');
    veil.className = 'spoiler-veil';
    veil.textContent = 'Spoiler mode is on: this story trophy’s name, description and guide stay hidden until you tick it earned.';
    card.append(veil);
  } else {
    const guide = document.createElement('p');
    guide.className = 'trophy-guide';
    guide.textContent = trophy.guide;
    card.append(guide);
    if (trophy.steps && trophy.steps.length) {
      const ol = document.createElement('ol');
      ol.className = 'trophy-steps';
      for (const step of trophy.steps) {
        const li = document.createElement('li');
        li.textContent = step;
        ol.append(li);
      }
      card.append(ol);
    }
    const source = document.createElement('p');
    source.className = 'trophy-source';
    source.append(renderSourceCitation(trophy.source));
    card.append(source);
  }
  return card;
}

function renderRoadmap() {
  const grid = document.getElementById('stageGrid');
  grid.replaceChildren();
  for (const stage of data.roadmap) {
    const inStage = trophies.filter((t) => t.stage === stage.stage);
    const done = inStage.filter((t) => earned.has(t.name)).length;
    const card = document.createElement('div');
    card.className = 'stage-card';
    const h3 = document.createElement('h3');
    const num = document.createElement('span');
    num.className = 'stage-num';
    num.textContent = stage.stage;
    h3.append(num, stage.title);
    card.append(h3);
    const p = document.createElement('p');
    p.textContent = stage.text;
    card.append(p);
    const count = document.createElement('p');
    count.className = 'stage-count';
    count.textContent = inStage.length ? `${done}/${inStage.length} trophies earned in this stage` : 'Read this before you start playing';
    card.append(count);
    grid.append(card);
  }
}

function renderKindRow() {
  const row = document.getElementById('kindRow');
  row.replaceChildren();
  for (const [kind, label] of KINDS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'kind-btn';
    btn.setAttribute('aria-pressed', String(state.kind === kind));
    const count = kind === 'all' ? trophies.length
      : kind === 'missable' ? trophies.filter((t) => t.missable).length
      : kind === 'online' ? 0
      : trophies.filter((t) => t.kind === kind).length;
    btn.textContent = `${label} (${count})`;
    btn.addEventListener('click', () => {
      state.kind = kind;
      writeStateToHash();
      renderAll();
    });
    row.append(btn);
  }
}

function renderSources() {
  const ul = document.getElementById('sourceList');
  ul.replaceChildren();
  for (const s of data.sources) {
    const li = document.createElement('li');
    if (s.url) {
      const a = document.createElement('a');
      a.href = s.url;
      a.rel = 'noopener';
      a.textContent = s.name;
      li.append(a);
    } else {
      li.textContent = s.name;
    }
    ul.append(li);
  }
}

function renderProgress() {
  const total = trophies.length;
  const done = earned.size;
  document.getElementById('progressText').textContent = `${done} of ${total} earned`;
  document.getElementById('progressPct').textContent = `${Math.round((done / total) * 100)}%`;
  document.getElementById('progressFill').style.width = `${(done / total) * 100}%`;
  document.title = done ? `(${done}/55) Leonida Trophy Guide — GTA VI` : 'Leonida Trophy Guide — GTA VI: all 55 trophies, roadmap & tracker';
  const parts = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const all = trophies.filter((t) => t.grade === g).length;
    const got = trophies.filter((t) => t.grade === g && earned.has(t.name)).length;
    return `${gradeLabel(g)} ${got}/${all}`;
  });
  document.getElementById('progressGrades').textContent = parts.join(' · ');
}

function renderAll() {
  renderProgress();
  renderRoadmap();
  renderKindRow();
  const shown = trophies.filter(trophyMatches);
  listEl.replaceChildren(...shown.map(renderTrophy));
  emptyEl.hidden = shown.length > 0;
  if (state.kind === 'online') {
    emptyEl.hidden = false;
    emptyEl.textContent = 'No online trophies — every one of the 55 is single-player. (GTA Vice City Hub, CryptoGames.)';
  } else {
    emptyEl.textContent = 'No trophies match these filters.';
  }
  shownEl.textContent = `Showing ${shown.length} of ${trophies.length} trophies`;
}

searchEl.value = state.query;
gradeEl.value = state.grade;
spoilerEl.checked = state.spoiler;
hideEarnedEl.checked = state.hideEarned;
searchEl.addEventListener('input', () => {
  state.query = searchEl.value.trim();
  writeStateToHash();
  renderAll();
});
gradeEl.addEventListener('change', () => {
  state.grade = gradeEl.value;
  writeStateToHash();
  renderAll();
});
spoilerEl.addEventListener('change', () => {
  state.spoiler = spoilerEl.checked;
  writeStateToHash();
  renderAll();
});
hideEarnedEl.addEventListener('change', () => {
  state.hideEarned = hideEarnedEl.checked;
  writeStateToHash();
  renderAll();
});

document.getElementById('exportBtn').addEventListener('click', () => {
  const payload = { game: 'Grand Theft Auto VI', exportedAt: new Date().toISOString(), earned: [...earned].sort() };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = EXPORT_NAME;
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('importInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const names = Array.isArray(parsed) ? parsed : parsed.earned;
    const valid = names.filter((n) => trophies.some((t) => t.name === n));
    if (!valid.length && names.length) throw new Error('no known trophy names in file');
    earned = new Set(valid);
    saveProgress();
    renderAll();
  } catch {
    alert('That file is not a trophy-progress export from this guide.');
  }
  e.target.value = '';
});
document.getElementById('resetBtn').addEventListener('click', () => {
  if (confirm('Clear all earned trophies?')) {
    earned = new Set();
    saveProgress();
    renderAll();
  }
});

renderSources();
renderAll();
