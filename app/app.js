// Leonida Trophy Guide — offline checklist + tracker for the 55 GTA VI trophies.
// All data comes from data/trophies.json in this same folder; progress lives in
// localStorage only, and export/import moves it as a plain JSON file.
const STORE_KEY = 'gta6-leonida-guide-v1';
const KINDS = [
  { id: 'all', label: 'All 55' },
  { id: 'story', label: 'Story' },
  { id: 'missable', label: 'Missable' },
  { id: 'collectibles', label: 'Collectibles' },
  { id: 'activities', label: 'Activities' },
  { id: 'online', label: 'Online' },
  { id: 'platinum', label: 'Platinum' },
];

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));

// ---------- state ----------
let saved = { earned: [], spoiler: true };
try {
  const raw = JSON.parse(localStorage.getItem(STORE_KEY) ?? 'null');
  if (raw && typeof raw === 'object') saved = { earned: Array.isArray(raw.earned) ? raw.earned : [], spoiler: raw.spoiler !== false };
} catch { /* corrupted save: start fresh */ }
let earned = new Set(saved.earned.filter((id) => byId.has(id)));
let spoilerOn = saved.spoiler;
let kindFilter = 'all';
let selectedId = trophies[0].id;

const $ = (id) => document.getElementById(id);
const listEl = $('trophyList');
const detailEl = $('detailCol');

function persist() {
  localStorage.setItem(STORE_KEY, JSON.stringify({ earned: [...earned].sort((a, b) => a - b), spoiler: spoilerOn }));
}

function gradeLetter(grade) {
  return { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' }[grade] ?? '?';
}
function difficultyLabel(d) {
  return d <= 2 ? 'Easy' : d === 3 ? 'Medium' : 'Hard';
}
function difficultyDots(d) {
  return '●'.repeat(d) + '○'.repeat(5 - d);
}
// A story trophy is masked while spoilers are hidden and it is not earned yet.
function isMasked(t) {
  return spoilerOn && t.kind === 'story' && !earned.has(t.id);
}
function displayName(t) {
  return isMasked(t) ? 'Hidden story trophy' : t.name;
}
function displayDescription(t) {
  return isMasked(t) ? 'Hidden on PlayStation until earned — finish the story to reveal it.' : t.description;
}

// ---------- progress ----------
function renderProgress() {
  const total = trophies.length;
  const done = earned.size;
  $('progressText').textContent = `${done} of ${total} earned`;
  const byGrade = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `${earnedCount(g)}/${trophies.filter((t) => t.grade === g).length} ${g}`)
    .join(' · ');
  $('progressByGrade').textContent = byGrade;
  $('progressFill').style.width = `${(done / total) * 100}%`;
  $('progressBar').setAttribute('aria-valuenow', String(done));
  const remaining = trophies.filter((t) => !earned.has(t.id));
  const missableLeft = remaining.filter((t) => t.missable);
  $('progressNote').textContent =
    done === total
      ? 'Platinum complete — you are a Leonida Legend.'
      : missableLeft.length > 0
        ? 'Do this first: Positive Mental Attitude has a Chapter 1 meditation that may be missable.'
        : `${remaining.length} to go — next milestone: ${nextMilestone(remaining)}`;
}
function earnedCount(grade) {
  return trophies.filter((t) => t.grade === grade && earned.has(t.id)).length;
}
function nextMilestone(remaining) {
  if (remaining.some((t) => t.kind === 'story')) return 'finish the story (12 story trophies)';
  if (remaining.some((t) => t.id === 14)) return 'the 100% Completion Checklist (A Long Road)';
  if (remaining.some((t) => t.id === 25)) return 'the 8 Strangers & Freaks strands';
  return 'the last few trophies on the list';
}

// ---------- list ----------
function matchesFilters(t) {
  const q = $('search').value.trim().toLowerCase();
  if (q) {
    const hay = `${t.name} ${t.description} ${t.guide} ${t.when}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (kindFilter === 'story' && t.kind !== 'story') return false;
  if (kindFilter === 'missable' && !t.missable) return false;
  if (kindFilter === 'collectibles' && t.kind !== 'collectibles') return false;
  if (kindFilter === 'activities' && t.kind !== 'activities') return false;
  if (kindFilter === 'online' && t.kind !== 'online') return false;
  if (kindFilter === 'platinum' && t.kind !== 'platinum') return false;
  const grade = $('gradeFilter').value;
  if (grade !== 'all' && t.grade !== grade) return false;
  const diff = $('difficultyFilter').value;
  if (diff === 'easy' && t.difficulty > 2) return false;
  if (diff === 'medium' && t.difficulty !== 3) return false;
  if (diff === 'hard' && t.difficulty < 4) return false;
  if ($('earnedOnly').checked && !earned.has(t.id)) return false;
  return true;
}

function trophyRow(t) {
  const li = document.createElement('li');
  li.className = `trophy${earned.has(t.id) ? ' earned' : ''}${selectedId === t.id ? ' selected' : ''}`;
  li.dataset.id = String(t.id);

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', `Mark ${displayName(t)} as earned`);
  box.addEventListener('click', (event) => event.stopPropagation());
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id);
    else earned.delete(t.id);
    persist();
    renderAll();
  });

  const badge = document.createElement('span');
  badge.className = `grade-badge grade-${t.grade}`;
  badge.textContent = gradeLetter(t.grade);
  badge.title = t.grade;

  const name = document.createElement('span');
  name.className = 'trophy-name';
  name.textContent = displayName(t);

  const desc = document.createElement('span');
  desc.className = 'trophy-desc';
  desc.textContent = displayDescription(t);

  const tags = document.createElement('span');
  tags.className = 'trophy-tags';
  const tagTexts = [];
  if (t.missable) tagTexts.push(['missable', '⚠ Missable']);
  if (t.hidden) tagTexts.push(['hidden', 'Hidden']);
  tagTexts.push([`kind-${t.kind}`, t.kind]);
  tagTexts.push(['difficulty', `${difficultyDots(t.difficulty)} ${difficultyLabel(t.difficulty)}`]);
  if (t.target) tagTexts.push(['target', `${t.target} ${t.unit ?? ''}`.trim()]);
  tagTexts.push(['stage', `Stage ${t.stage}`]);
  for (const [cls, text] of tagTexts) {
    const tag = document.createElement('span');
    tag.className = `tag ${cls}`;
    tag.textContent = text;
    tags.append(tag);
  }

  li.append(box, badge, name, desc, tags);
  li.addEventListener('click', () => {
    selectedId = t.id;
    renderAll();
    if (window.innerWidth <= 900) detailEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  return li;
}

function renderList() {
  const visible = trophies.filter(matchesFilters);
  listEl.replaceChildren(...visible.map(trophyRow));
  $('emptyState').hidden = visible.length > 0;
  $('listMeta').textContent =
    visible.length === trophies.length
      ? `Showing all ${trophies.length} trophies — click one to read its guide.`
      : `Showing ${visible.length} of ${trophies.length} trophies.`;
  if (visible.length > 0 && !visible.some((t) => t.id === selectedId)) selectedId = visible[0].id;
}

// ---------- detail panel ----------
function renderDetail() {
  const t = byId.get(selectedId) ?? trophies[0];
  const masked = isMasked(t);
  const wrap = document.createElement('div');
  wrap.className = 'detail';

  const title = document.createElement('h2');
  title.textContent = displayName(t);
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = `“${displayDescription(t)}”`;
  const gradeRow = document.createElement('div');
  gradeRow.className = 'grade-row';
  const badge = document.createElement('span');
  badge.className = `grade-badge grade-${t.grade}`;
  badge.textContent = gradeLetter(t.grade);
  const gradeText = document.createElement('span');
  gradeText.textContent = `${t.grade[0].toUpperCase()}${t.grade.slice(1)} trophy · Stage ${t.stage} · ${difficultyLabel(t.difficulty)} ${difficultyDots(t.difficulty)}`;
  gradeRow.append(badge, gradeText);
  wrap.append(title, official, gradeRow);

  if (t.missable) {
    const warn = document.createElement('p');
    warn.className = 'warn-box';
    warn.innerHTML = '<strong>⚠ Possibly missable.</strong> ';
    warn.append(document.createTextNode('This is the only trophy in the game flagged as potentially missable. Read the timing note below before you play past Chapter 1.'));
    wrap.append(warn);
  }
  if (t.target) {
    const target = document.createElement('p');
    target.className = 'target';
    target.innerHTML = 'Target: ';
    const b = document.createElement('b');
    b.textContent = `${t.target} ${t.unit ?? ''}`.trim();
    target.append(b);
    wrap.append(target);
  }

  if (masked) {
    const note = document.createElement('p');
    note.className = 'detail-empty';
    note.textContent = 'This is a story trophy, hidden here while spoilers are on. Earn it in the game — or turn “Hide story spoilers” off — to read its guide.';
    wrap.append(note);
  } else {
    const guideHead = document.createElement('h3');
    guideHead.textContent = 'How to get it';
    const guide = document.createElement('p');
    guide.textContent = t.guide;
    wrap.append(guideHead, guide);

    if (t.steps && t.steps.length > 0) {
      const stepsHead = document.createElement('h3');
      stepsHead.textContent = 'Steps';
      const steps = document.createElement('ol');
      for (const step of t.steps) {
        const li = document.createElement('li');
        li.textContent = step;
        steps.append(li);
      }
      wrap.append(stepsHead, steps);
    }

    const whenHead = document.createElement('h3');
    whenHead.textContent = 'When to do it';
    const when = document.createElement('p');
    when.className = 'when';
    when.textContent = t.when;
    wrap.append(whenHead, when);

    const srcHead = document.createElement('h3');
    srcHead.textContent = 'Sources';
    const srcList = document.createElement('ul');
    srcList.className = 'sources';
    for (const s of t.sources) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = s.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = s.site;
      li.append(a);
      srcList.append(li);
    }
    wrap.append(srcHead, srcList);
  }

  const earnedRow = document.createElement('p');
  const earnedBtn = document.createElement('button');
  earnedBtn.type = 'button';
  earnedBtn.className = 'mark-btn';
  earnedBtn.textContent = earned.has(t.id) ? '✓ Earned — click to unmark' : 'Mark as earned';
  earnedBtn.addEventListener('click', () => {
    if (earned.has(t.id)) earned.delete(t.id);
    else earned.add(t.id);
    persist();
    renderAll();
  });
  earnedRow.append(earnedBtn);
  wrap.append(earnedRow);

  detailEl.replaceChildren(wrap);
}

// ---------- roadmap ----------
function renderRoadmap() {
  const intro = $('roadmapIntro');
  const m = doc.meta;
  intro.replaceChildren(
    ...[
      `Difficulty ${m.difficulty}`,
      m.time_to_platinum,
      `${m.playthroughs} playthrough`,
      `${m.online_trophies} online trophies`,
      m.missable_trophies,
    ].map((text) => {
      const s = document.createElement('span');
      s.className = 'stat';
      s.textContent = text;
      return s;
    }),
  );
  const list = $('roadmapList');
  list.replaceChildren(
    ...doc.roadmap.map((stage) => {
      const li = document.createElement('li');
      li.className = 'stage';
      const head = document.createElement('div');
      head.className = 'stage-head';
      const num = document.createElement('span');
      num.className = 'stage-num';
      num.textContent = String(stage.stage);
      const h = document.createElement('h3');
      h.textContent = stage.title;
      const hours = document.createElement('span');
      hours.className = 'stage-hours';
      hours.textContent = stage.hours;
      head.append(num, h, hours);
      const p = document.createElement('p');
      p.textContent = stage.text;
      const chips = document.createElement('div');
      chips.className = 'stage-trophies';
      for (const id of stage.trophies) {
        const t = byId.get(id);
        if (!t) continue;
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = `${earned.has(id) ? '✓ ' : ''}${displayName(t)}`;
        b.addEventListener('click', () => {
          selectedId = id;
          showView('checklist');
          renderAll();
        });
        chips.append(b);
      }
      li.append(head, p, chips);
      return li;
    }),
  );
}

// ---------- sources ----------
function renderSources() {
  $('sourceList').replaceChildren(
    ...doc.sources.map((s) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = s.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = s.site;
      const p = document.createElement('p');
      p.textContent = s.what;
      li.append(a, p);
      return li;
    }),
  );
}

// ---------- hero stats ----------
function renderHeroStats() {
  const counts = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `${trophies.filter((t) => t.grade === g).length} ${g}`)
    .join(' · ');
  const facts = [
    `55 trophies: ${counts}`,
    '28 hidden until earned',
    '0 online trophies',
    'About 200 hours to platinum',
    'Difficulty 4/10',
  ];
  $('heroStats').replaceChildren(
    ...facts.map((f) => {
      const s = document.createElement('span');
      s.className = 'stat';
      s.textContent = f;
      return s;
    }),
  );
}

// ---------- views ----------
function showView(view) {
  for (const v of ['checklist', 'roadmap', 'sources']) {
    $(`view${v[0].toUpperCase()}${v.slice(1)}`).hidden = v !== view;
    $(`tab${v[0].toUpperCase()}${v.slice(1)}`).classList.toggle('active', v === view);
  }
  $('toolbar').style.display = view === 'checklist' ? '' : 'none';
  if (view === 'roadmap') renderRoadmap();
  if (view === 'sources') renderSources();
  const hash = view === 'checklist' ? '#/checklist' : `#/${view}`;
  if (location.hash !== hash) history.replaceState(null, '', hash);
}

// ---------- render all ----------
function renderAll() {
  renderProgress();
  renderList();
  renderDetail();
}

// ---------- wiring ----------
function buildKindChips() {
  $('kindChips').replaceChildren(
    ...KINDS.map((k) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `chip${kindFilter === k.id ? ' active' : ''}`;
      b.textContent = k.label;
      b.addEventListener('click', () => {
        kindFilter = k.id;
        buildKindChips();
        renderAll();
      });
      return b;
    }),
  );
}

$('search').addEventListener('input', renderAll);
$('gradeFilter').addEventListener('change', renderAll);
$('difficultyFilter').addEventListener('change', renderAll);
$('earnedOnly').addEventListener('change', renderAll);
$('spoilerToggle').checked = spoilerOn;
$('spoilerToggle').addEventListener('change', (event) => {
  spoilerOn = event.target.checked;
  persist();
  renderAll();
});
$('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned].sort((a, b) => a - b), exported_at: new Date().toISOString() }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
$('importInput').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(ids)) throw new Error('not a progress file');
    earned = new Set(ids.filter((id) => byId.has(id)));
    persist();
    renderAll();
  } catch {
    alert('That file is not a trophy-progress export from this guide.');
  }
  event.target.value = '';
});
$('resetBtn').addEventListener('click', () => {
  if (confirm('Clear all earned trophies in this browser?')) {
    earned = new Set();
    persist();
    renderAll();
  }
});
for (const v of ['checklist', 'roadmap', 'sources']) {
  $(`tab${v[0].toUpperCase()}${v.slice(1)}`).addEventListener('click', () => showView(v));
}
window.addEventListener('hashchange', () => {
  const view = location.hash.replace('#/', '') || 'checklist';
  if (['checklist', 'roadmap', 'sources'].includes(view)) showView(view);
});

// ---------- init ----------
renderHeroStats();
buildKindChips();
const startView = location.hash.replace('#/', '');
if (['roadmap', 'sources'].includes(startView)) showView(startView);
else showView('checklist');
const hashTrophy = location.hash.match(/^#\/trophy\/(\d+)$/);
if (hashTrophy && byId.has(Number(hashTrophy[1]))) selectedId = Number(hashTrophy[1]);
renderAll();
