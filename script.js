const BIN_ID = 'fdf54930b04517ca8352';
const API_URL = `https://api.npoint.io/${BIN_ID}`;
const GOAL = 300;

const HABITS = [
  { id:"water",    label:"2L vody",      points:2, icon:"💧", max:1 },
  { id:"sleep",    label:"8h spánek",    points:2, icon:"🌙", max:1 },
  { id:"steps",    label:"10 000 kroků", points:3, icon:"👟", max:1 },
  { id:"stairs",   label:"Schody",       points:2, icon:"🪜", max:1 },
  { id:"veggies",  label:"Zelenina",     points:2, icon:"🥦", max:1 },
  { id:"fruit",    label:"Ovoce",        points:1, icon:"🍎", max:1 },
  { id:"nosugar",  label:"Bez sladkého", points:3, icon:"🍬", max:1 },
  { id:"walk",     label:"Venčení",      points:1, icon:"🐕", max:3 },
  { id:"dishes",   label:"Nádobí",       points:1, icon:"🍽️", max:3 }
];

const SIDE_QUESTS = [
  "Ledoborec (30s studená sprcha) 🧊",
  "Zen master (10 min jóga) 🧘‍♀️",
  "Offline zóna (1h bez mobilu před spaním) 📵",
  "Knihomol (Přečíst 10 stran knihy) 📖",
  "Zelená vlna (Zelenina ke každému jídlu) 🥗",
  "30 angličáků během dne 💪",
  "Chůze alespoň 5 km v kuse 🚶",
  "Uklidit pokoj/pracovní stůl 🧹",
  "Vydržet v planku 2 minuty ⏳",
  "Uvařit si zdravé domácí jídlo 🍳",
  "Masáž obličeje / Skincare routine 🧖‍♀️",
  "50 dřepů navíc 🏋️‍♀️",
  "Alespoň 5 minut řízené meditace 🧘",
  "Jít dnes spát před 22:30 🛌",
  "Celý den absolutně bez alkoholu 🥂🚫",
  "Jít do lesa s 🐕 alespoň na 1 hodinu",
  "Vyžehlit alespoň 10ks prádla 🧺",
  "Večer bez televize 📺"
];

const EZO_QUOTES = [
  "Tvé tělo je chrám tvé duše, vymeť z něj prach disciplínou. ✨",
  "Vesmír ti nenadělí výzvu, kterou bys nedokázala zdolat. 🌌",
  "Dnešní pot je slzami tvého starého já, které odchází. 🌸",
  "Kdo ovládne své ráno, ovládne svou manifestaci. ☀️",
  "Tvá energie proudí tam, kam zaměřuješ pozornost. ✨",
  "V tichu mezi nádechy najdeš sílu udělat další angličák. 🌬️",
  "Buď jako voda – měkká navenek, ale schopná prorazit skálu. 🌊",
];

let currentUser = localStorage.getItem('activeUser') || 'userA';
let isSaving = false;

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff)).toDateString();
}

let state = {
  userA: { weeklyPoints:0, checkedHabits:{}, questDone:false, log:[], totalWins:0 },
  userB: { weeklyPoints:0, checkedHabits:{}, questDone:false, log:[], totalWins:0 },
  lastWinner: null, lastUpdated:0, currentDay: new Date().toDateString(),
  currentWeek: getMonday(new Date())
};

function renderDate() {
  const dny = ['Neděle','Pondělí','Úterý','Středa','Čtvrtek','Pátek','Sobota'];
  const d = new Date();
  document.getElementById('date-display').textContent = `${dny[d.getDay()]}, ${d.getDate()}. ${d.getMonth()+1}.`;
}

function checkTime() {
  const today = new Date().toDateString();
  const thisMonday = getMonday(new Date());
  let needsSave = false;

  if (state.userA.totalWins === undefined) state.userA.totalWins = 0;
  if (state.userB.totalWins === undefined) state.userB.totalWins = 0;
  if (!state.currentWeek) { state.currentWeek = thisMonday; needsSave = true; }

  if (state.currentWeek !== thisMonday) {
    let winner = 'Remíza!';
    if (state.userA.weeklyPoints > state.userB.weeklyPoints) {
      winner = 'Lůca 🔥';
      state.userA.totalWins++;
    } else if (state.userB.weeklyPoints > state.userA.weeklyPoints) {
      winner = 'Kája 🔥';
      state.userB.totalWins++;
    }

    state.lastWinner = winner;
    state.userA.weeklyPoints = 0; state.userA.checkedHabits = {}; state.userA.questDone = false; state.userA.log = [];
    state.userB.weeklyPoints = 0; state.userB.checkedHabits = {}; state.userB.questDone = false; state.userB.log = [];
    
    state.currentWeek = thisMonday;
    state.currentDay = today;
    needsSave = true;
  } 
  else if (state.currentDay !== today) {
    state.userA.checkedHabits = {}; state.userA.questDone = false;
    state.userB.checkedHabits = {}; state.userB.questDone = false;
    state.currentDay = today;
    needsSave = true;
  }

  if (needsSave) save();
}

async function syncData(manual = false) {
  if (isSaving) return;
  const btn = document.getElementById('sync-btn');
  if (manual && btn) btn.textContent = '⏳ Načítám...';
  try {
    const res = await fetch(`${API_URL}?t=${Date.now()}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.userA) {
        if ((data.lastUpdated || 0) >= (state.lastUpdated || 0)) {
          state = data; checkTime(); render();
        }
      }
    }
  } catch(e) { console.error('Sync error', e); }
  if (manual && btn) btn.textContent = '🔄 Vynutit synchronizaci';
}

async function save() {
  state.lastUpdated = Date.now();
  render(); isSaving = true;
  try {
    await fetch(API_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(state) });
  } catch(e) { console.error('Save error', e); }
  isSaving = false;
}

function calculateStats(userLog) {
  let gained = 0, lost = 0, quests = 0, habits = 0, custom = 0;
  const penaltyIcons = ['🍷', '😴', '🍩', '🍔']; 
  
  userLog.forEach(l => {
    if (l.d > 0) {
      gained += l.d;
      // Zde už nesčítáme akce (quests++), ale reálné body (quests += l.d)
      if (l.icon === '⚡') quests += l.d;
      else if (l.icon === '🏋️') custom += l.d; 
      else habits += l.d; 
    } else if (l.d < 0) {
      if (penaltyIcons.includes(l.icon)) {
        lost += Math.abs(l.d); 
      }
    }
  });
  return { gained, lost, quests, habits, custom };
}

function applyTheme() {
  if (currentUser === 'userA') {
    document.body.classList.remove('theme-kaja');
    document.body.classList.add('theme-luca');
  } else {
    document.body.classList.remove('theme-luca');
    document.body.classList.add('theme-kaja');
  }
}

function render() {
  renderDate();
  applyTheme();

  document.getElementById('btn-userA').classList.toggle('active', currentUser === 'userA');
  document.getElementById('btn-userB').classList.toggle('active', currentUser === 'userB');

  document.getElementById('label-userA').innerHTML = `Lůca <span style="color:var(--gold); margin-left:4px; font-size:11px;">👑 ${state.userA.totalWins || 0}</span>`;
  document.getElementById('label-userB').innerHTML = `Kája <span style="color:var(--gold); margin-left:4px; font-size:11px;">👑 ${state.userB.totalWins || 0}</span>`;

  const sA = state.userA.weeklyPoints;
  const sB = state.userB.weeklyPoints;

  const elA = document.getElementById('score-userA');
  const elB = document.getElementById('score-userB');
  elA.textContent = sA;
  elB.textContent = sB;
  elA.classList.toggle('negative', sA < 0);
  elB.classList.toggle('negative', sB < 0);

  const pA = sA >= 0 ? Math.min((sA / GOAL) * 100, 100) : 0;
  const pB = sB >= 0 ? Math.min((sB / GOAL) * 100, 100) : 0;
  document.getElementById('bar-a').style.width = pA + '%';
  document.getElementById('bar-b').style.width = pB + '%';

  const valA = document.getElementById('bar-a-val');
  const valB = document.getElementById('bar-b-val');
  valA.textContent = sA;
  valB.textContent = sB;
  valA.classList.toggle('negative', sA < 0);
  valB.classList.toggle('negative', sB < 0);

  const wb = document.getElementById('winner-bar');
  if (state.lastWinner) {
    wb.style.display = 'flex';
    document.getElementById('last-winner-name').textContent = state.lastWinner;
  } else { wb.style.display = 'none'; }

  const list = document.getElementById('habit-list');
  list.innerHTML = '';
  HABITS.forEach(h => {
    let count = state[currentUser].checkedHabits[h.id];
    if (typeof count === 'boolean') count = count ? 1 : 0;
    else count = Number(count) || 0;

    const isFullyChecked = count === h.max;
    const div = document.createElement('div');
    div.className = 'habit-item' + (isFullyChecked ? ' checked' : '');
    div.onclick = () => toggleHabit(h.id);
    
    let checkVisual = '';
    if (h.max === 1) {
      checkVisual = `<div class="habit-check">${count > 0 ? '✓' : ''}</div>`;
    } else {
      checkVisual = `<div class="habit-dots">`;
      for(let i=1; i<=h.max; i++) {
        checkVisual += `<div class="h-dot ${count >= i ? 'filled' : ''}"></div>`;
      }
      checkVisual += `</div>`;
    }

    div.innerHTML = `
      ${checkVisual}
      <span class="habit-icon">${h.icon}</span>
      <span class="habit-name">${h.label}</span>
      <span class="habit-pts">+${h.points}</span>
    `;
    list.appendChild(div);
  });

  const daySeed = Math.floor(new Date().getTime() / 86400000);
  const randomQuestIndex = (daySeed * 7) % SIDE_QUESTS.length; 
  document.getElementById('today-quest').textContent = SIDE_QUESTS[randomQuestIndex];
  
  const dayIndex = (new Date().getDay() + 6) % 7;
  document.getElementById('ezo-quote').textContent = `„${EZO_QUOTES[dayIndex % EZO_QUOTES.length]}"`;

  const qBtn = document.getElementById('quest-btn');
  if (state[currentUser].questDone) {
    qBtn.classList.add('done');
    qBtn.textContent = '✓ Splněno (zrušit)';
  } else {
    qBtn.classList.remove('done');
    qBtn.textContent = 'Splnit výzvu';
  }

  const logDiv = document.getElementById('log-list');
  const startOfToday = new Date();
  startOfToday.setHours(0,0,0,0);
  const todayMs = startOfToday.getTime();

  const allLogs = [...state.userA.log, ...state.userB.log]
    .filter(l => l.ts >= todayMs)
    .sort((a,b) => b.ts - a.ts);

  if (allLogs.length === 0) {
    logDiv.innerHTML = '<div class="log-empty">Zatím žádné akce dnešní den…</div>';
  } else {
    logDiv.innerHTML = allLogs.map(l => {
      const who = l.u === 'Lůca' ? 'luca' : 'kaja';
      return `<div class="log-item">
        <div class="log-dot ${who}"></div>
        <div class="log-text">${l.icon} <strong>${l.u}</strong>: ${l.a}</div>
        <div class="log-pts ${l.d > 0 ? 'pos' : 'neg'}">${l.d > 0 ? '+' : ''}${l.d}</div>
      </div>`;
    }).join('');
  }

  const statsA = calculateStats(state.userA.log);
  const statsB = calculateStats(state.userB.log);

  document.getElementById('stat-a-gained').textContent = '+' + statsA.gained;
  document.getElementById('stat-a-lost').textContent = '-' + statsA.lost;
  document.getElementById('stat-a-habits').textContent = statsA.habits;
  document.getElementById('stat-a-custom').textContent = statsA.custom;
  document.getElementById('stat-a-quests').textContent = statsA.quests;

  document.getElementById('stat-b-gained').textContent = '+' + statsB.gained;
  document.getElementById('stat-b-lost').textContent = '-' + statsB.lost;
  document.getElementById('stat-b-habits').textContent = statsB.habits;
  document.getElementById('stat-b-custom').textContent = statsB.custom;
  document.getElementById('stat-b-quests').textContent = statsB.quests;
} 
  
function switchUser(id) { 
  currentUser = id; 
  localStorage.setItem('activeUser', id); 
  render(); 
}

function toggleHabit(id) {
  checkTime();
  const h = HABITS.find(x => x.id === id);
  
  let count = state[currentUser].checkedHabits[id];
  if (typeof count === 'boolean') count = count ? 1 : 0;
  else count = Number(count) || 0;

  let delta = 0;
  let newCount = count;

  if (h.max > 1) {
    if (count < h.max) {
      newCount = count + 1;
      delta = h.points;
    } else {
      newCount = 0; 
      delta = -(h.points * h.max);
    }
  } else {
    newCount = count === 0 ? 1 : 0;
    delta = newCount === 1 ? h.points : -h.points;
  }

  state[currentUser].checkedHabits[id] = newCount;
  state[currentUser].weeklyPoints += delta;
  
  let actionText = h.label;
  if (h.max > 1 && newCount > 0) actionText += ` (${newCount}/${h.max})`;

  // CHYTRÁ HISTORIE - mazání omylů
  if (delta < 0) {
    let pointsToRemove = Math.abs(delta);
    let todayStart = new Date().setHours(0,0,0,0);
    let i = 0;
    
    while (i < state[currentUser].log.length && pointsToRemove > 0) {
      let l = state[currentUser].log[i];
      if (l.icon === h.icon && l.d > 0 && l.ts >= todayStart) {
        pointsToRemove -= l.d;
        state[currentUser].log.splice(i, 1);
      } else {
        i++;
      }
    }
  } else {
    // Tady chyběl tento zápis do historie, když PŘIDÁVÁME body
    state[currentUser].log.unshift({ 
      u: currentUser==='userA'?'Lůca':'Kája', 
      a: actionText, 
      d: delta, 
      icon: h.icon, 
      ts: Date.now() 
    });
  }

  showToast(`${delta > 0 ? '✅' : '↩️'} ${h.label}: ${delta > 0 ? '+' : ''}${delta} bodů`);
  save();
}

function completeQuest() {
  checkTime();
  const currentQuestText = document.getElementById('today-quest').textContent;

  if (state[currentUser].questDone) {
    // ZRUŠENÍ QUESTU
    state[currentUser].questDone = false;
    state[currentUser].weeklyPoints -= 15;

    let todayStart = new Date().setHours(0,0,0,0);
    let logIndex = state[currentUser].log.findIndex(l => l.icon === '⚡' && l.ts >= todayStart);
    if (logIndex !== -1) {
      state[currentUser].log.splice(logIndex, 1);
    }
    showToast('↩️ Side Quest zrušen');
  } else {
    // SPLNĚNÍ QUESTU
    state[currentUser].questDone = true;
    state[currentUser].weeklyPoints += 15;

    state[currentUser].log.unshift({ 
      u: currentUser==='userA'?'Lůca':'Kája', 
      a: `Side Quest: ${currentQuestText}`, 
      d: 15, 
      icon: '⚡', 
      ts: Date.now() 
    });

    showToast('⚡ +15 bodů za Side Quest!');
  }
  save();
}

function addPenalty(label, delta, icon) {
  state[currentUser].weeklyPoints = state[currentUser].weeklyPoints + delta;
  state[currentUser].log.unshift({ u:currentUser==='userA'?'Lůca':'Kája', a:label, d:delta, icon:icon, ts:Date.now() });
  showToast(`${icon} ${label}: ${delta} bodů`);
  save();
}

function addCustom() {
  const val = document.getElementById('custom-input').value.trim();
  if (!val) return;
  state[currentUser].weeklyPoints += 10;
  state[currentUser].log.unshift({ u:currentUser==='userA'?'Lůca':'Kája', a:val, d:10, icon:'🏋️', ts:Date.now() });
  document.getElementById('custom-input').value = '';
  showToast(`🏋️ +10 bodů: ${val}`);
  save();
}

function showReset() { document.getElementById('modal').classList.add('show'); }
function hideReset() { document.getElementById('modal').classList.remove('show'); }
function confirmReset() {
  state = {
    userA: { weeklyPoints:0, checkedHabits:{}, questDone:false, log:[], totalWins:0 },
    userB: { weeklyPoints:0, checkedHabits:{}, questDone:false, log:[], totalWins:0 },
    lastWinner:null, lastUpdated:Date.now(), currentDay:new Date().toDateString(),
    currentWeek: getMonday(new Date())
  };
  hideReset();
  showToast('💣 Databáze byla resetována');
  save();
}

function showDailyReset() { 
  const name = currentUser === 'userA' ? 'Lůca' : 'Kája';
  document.getElementById('daily-reset-name').textContent = name;
  document.getElementById('modal-daily').classList.add('show'); 
}
function hideDailyReset() { document.getElementById('modal-daily').classList.remove('show'); }

function confirmDailyReset() {
  const startOfToday = new Date();
  startOfToday.setHours(0,0,0,0);
  const todayMs = startOfToday.getTime();

  let pointsToDeduct = 0;
  const userLog = state[currentUser].log;
  
  for (let i = 0; i < userLog.length; i++) {
    if (userLog[i].ts >= todayMs) {
      pointsToDeduct += userLog[i].d;
    }
  }

  state[currentUser].weeklyPoints -= pointsToDeduct;
  state[currentUser].log = state[currentUser].log.filter(l => l.ts < todayMs);
  
  state[currentUser].checkedHabits = {};
  state[currentUser].questDone = false;

  hideDailyReset();
  showToast(`🧹 Dnešní akce pro uživatelku byly smazány.`);
  save();
}

function showHistory() {
  const content = document.getElementById('history-content');
  const allLogs = [...state.userA.log, ...state.userB.log].sort((a,b) => b.ts - a.ts);
  
  if(allLogs.length === 0) {
    content.innerHTML = '<div class="log-empty">Zatím žádné akce tento týden…</div>';
  } else {
    content.innerHTML = allLogs.map(l => {
      const who = l.u === 'Lůca' ? 'luca' : 'kaja';
      const d = new Date(l.ts);
      const time = `${d.getDate()}.${d.getMonth()+1}. ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
      return `<div class="log-item">
        <div class="log-dot ${who}"></div>
        <div class="log-text" style="font-size:12px;">
          <span style="opacity:0.5; font-size:10px; margin-right:4px;">[${time}]</span> 
          ${l.icon} <strong>${l.u}</strong>: ${l.a}
        </div>
        <div class="log-pts ${l.d > 0 ? 'pos' : 'neg'}">${l.d > 0 ? '+' : ''}${l.d}</div>
      </div>`;
    }).join('');
  }
  document.getElementById('modal-history').classList.add('show');
}
function hideHistory() { document.getElementById('modal-history').classList.remove('show'); }

document.getElementById('modal').addEventListener('click', e => { if (e.target === e.currentTarget) hideReset(); });
document.getElementById('modal-daily').addEventListener('click', e => { if (e.target === e.currentTarget) hideDailyReset(); });
document.getElementById('modal-history').addEventListener('click', e => { if (e.target === e.currentTarget) hideHistory(); });

let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

syncData();
setInterval(() => syncData(false), 30000);
