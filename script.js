// 1. IMPORTY FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js";
import { getAuth, signInWithRedirect, getRedirectResult, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

// 2. TVOJE FIREBASE KONFIGURACE
const firebaseConfig = {
  apiKey: "AIzaSyBL7E5EBcbZD-PSmCcQ7WzxQWG_JlBQqt8",
  authDomain: "healthduel.vercel.app", 
  databaseURL: "https://health-duel-6ef13-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "health-duel-6ef13",
  storageBucket: "health-duel-6ef13.firebasestorage.app",
  messagingSenderId: "559742355193",
  appId: "1:559742355193:web:a2ece11d46565b76c40428"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const dbRef = ref(db, 'healthDuelState');

const loginScreen = document.getElementById('login-screen');
const appScreen = document.querySelector('.app');
const loadingScreen = document.getElementById('loading-screen'); 

let isAppStarted = false; 
let isSyncing = true; 

// 3. HLÍDAČ STAVU (Jsme přihlášení?)
onAuthStateChanged(auth, (user) => {
    if (user) {
        const allowedEmails = ["pokyna15@gmail.com", "fantova.karolina@gmail.com"];
        const currentEmail = user.email.toLowerCase();
        
        if (allowedEmails.includes(currentEmail)) {
            if (loginScreen) loginScreen.style.display = 'none';
            if (appScreen) appScreen.style.display = ''; 
            
            if (!isAppStarted) {
                startApp();
                isAppStarted = true;
            }
        } else {
            alert("Pozor! Neznámý e-mail: " + user.email);
            auth.signOut();
        }
    } else {
        if (loadingScreen) loadingScreen.style.display = 'none';
        if (loginScreen) loginScreen.style.display = 'flex';
        if (appScreen) appScreen.style.display = 'none';
    }
});

const loginBtn = document.getElementById('login-btn');
if (loginBtn) {
    loginBtn.addEventListener('click', () => signInWithRedirect(auth, provider));
}

getRedirectResult(auth).catch((error) => console.error("Chyba při přihlášení:", error));

function startApp() {
    onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        isSyncing = false; 
        if (loadingScreen) loadingScreen.style.display = 'none';

        if (data) {
            state = data;
            localStorage.setItem('healthDuelCache', JSON.stringify(state));
            checkTime(); 
            render();
        } else { save(); }
    });
}

// 4. HERNÍ LOGIKA A DATA
const GOAL = 200;
const SOLO_GOAL = 150; // Cíl pro týdenní výzvu

const HABITS = [
  { id:"water",    label:"2L vody",      points:2, icon:"💧", max:1 },
  { id:"sleep",    label:"8h spánek",    points:2, icon:"🌙", max:1 },
  { id:"steps",    label:"10 000 kroků", points:3, icon:"👟", max:1 },
  { id:"stairs",   label:"Schody",       points:2, icon:"🪜", max:1 },
  { id:"veggies",  label:"Zelenina",     points:2, icon:"🥦", max:1 },
  { id:"fruit",    label:"Ovoce",        points:1, icon:"🍎", max:1 },
  { id:"nosugar",  label:"Bez sladkého", points:3, icon:"🍬", max:1 },
  { id:"walk",     label:"Venčení",      points:1, icon:"🐕", max:3 },
  { id:"dishes",   label:"Nádobí",       points:1, icon:"🍽️", max:3 },
  { id:"cooking",  label:"Příprava jídla",points:1, icon:"🍲", max:5 }
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
  "Večer bez televize 📺",
  "Dnešek bez IG 📵",
  "Ranní ptáče (První hodina po probuzení bez mobilu) 🌅📵",
  "Pán schodů (Vyhýbat se dnes všem výtahům) 🧗‍♀️",
  "Krok za krokem (Překonat 15 000 kroků) 👟🔥",
  "Hydratační rituál (Voda hned po probuzení) 🚰",
  "Pružná jako proutek (15 min strečink) 🤸‍♀️",
  "Společenský motýl (Zavolat někomu) 📞",
  "Cukrový detox (Ani gram přidaného cukru) 🚫🧁"
];

const EZO_QUOTES = [
  "Tvé tělo je chrám tvé duše, vymeť z něj prach disciplínou.",
  "Vesmír ti nenadělí výzvu, kterou bys nedokázala zdolat.",
  "Dnešní pot je slzami tvého starého já, které odchází.",
  "Kdo ovládne své ráno, ovládne svou manifestaci.",
  "Tvá energie proudí tam, kam zaměřuješ pozornost.",
  "V tichu mezi nádechy najdeš sílu udělat další angličák.",
  "Buď jako voda – měkká navenek, ale schopná prorazit skálu.",
  "Tvá vnitřní bohyně se neživí výmluvami, ale činy a zeleným čajem.",
  "Nepočítej dny, ať dny počítají s tebou.",
  "Karma je zdarma, ale za pevný zadek a čistou mysl se platí dřepem.",
  "Odhoď toxické myšlenky tak, jako odhazuješ deku při ranním vstávání.",
  "Vibruj na vyšší frekvenci.",
  "Krystal nezáří, dokud ho nevyleštíš. Tvoje aura nezáří, dokud si nedáš ten salát.",
  "Zastav se. Nadechni se. Uvědom si, že jsi tvůrcem své reality.",
  "Měsíc v úplňku tahá oceány, ty přece dokážeš zvednout sama sebe z gauče.",
  "Když se ti nechce, cvičíš pro tělo. Když to překonáš, cvičíš pro svou duši.",
  "Tvůj metabolismus je jako posvátný oheň – přikládej do něj s láskou."
];

let currentUser = localStorage.getItem('activeUser') || 'userA';

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

const lokalniData = localStorage.getItem('healthDuelCache');
if (lokalniData) {
    state = JSON.parse(lokalniData);
    if (loadingScreen) loadingScreen.style.display = 'none';
    if (appScreen) appScreen.style.display = '';
    checkTime(true); 
    render();
}

async function save() {
  if (isSyncing) return;
  state.lastUpdated = Date.now();
  localStorage.setItem('healthDuelCache', JSON.stringify(state)); 
  render(); 
  try { await set(dbRef, state); } 
  catch(e) { console.error('Chyba při ukládání:', e); showToast('❌ Chyba připojení'); }
}

function renderDate() {
  const dny = ['Neděle','Pondělí','Úterý','Středa','Čtvrtek','Pátek','Sobota'];
  const d = new Date();
  const display = document.getElementById('date-display');
  if (display) display.textContent = `${dny[d.getDay()]}, ${d.getDate()}. ${d.getMonth()+1}.`;
}

function checkTime(skipSave = false) {
  const today = new Date().toDateString();
  const thisMonday = getMonday(new Date());
  let needsSave = false;

  if (state.userA.totalWins === undefined) state.userA.totalWins = 0;
  if (state.userB.totalWins === undefined) state.userB.totalWins = 0;
  if (!state.currentWeek) { state.currentWeek = thisMonday; needsSave = true; }

  if (state.currentWeek !== thisMonday) {
    let winner = 'Remíza!';
    if (state.userA.weeklyPoints > state.userB.weeklyPoints) { winner = 'Lůca 🔥'; state.userA.totalWins++; } 
    else if (state.userB.weeklyPoints > state.userA.weeklyPoints) { winner = 'Kája 🔥'; state.userB.totalWins++; }

    state.lastWinner = winner;
    state.userA.weeklyPoints = 0; state.userA.checkedHabits = {}; state.userA.questDone = false;
    state.userB.weeklyPoints = 0; state.userB.checkedHabits = {}; state.userB.questDone = false;
    const thirtyDaysAgo = Date.now() - 2592000000;
    state.userA.log = (state.userA.log || []).filter(l => l.ts >= thirtyDaysAgo);
    state.userB.log = (state.userB.log || []).filter(l => l.ts >= thirtyDaysAgo);
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
  if (needsSave && !skipSave) save();
}

// VÝPOČET STREAKU (Počet dní v kuse, kdy jsi získala alespoň 1 bod)
function calculateStreak(logs) {
    if (!logs || logs.length === 0) return 0;
    const daysWithPoints = new Set();
    logs.forEach(l => { if (l.d > 0) daysWithPoints.add(new Date(l.ts).toDateString()); });
    
    const sortedDays = Array.from(daysWithPoints).sort((a,b) => new Date(b) - new Date(a));
    let streak = 0;
    let checkDate = new Date();
    checkDate.setHours(0,0,0,0);

    // Pokud dnes ještě nemáš body, zkontrolujeme včerejšek
    if (!sortedDays.includes(checkDate.toDateString())) {
        checkDate.setDate(checkDate.getDate() - 1);
        if (!sortedDays.includes(checkDate.toDateString())) return 0; 
    }

    while (sortedDays.includes(checkDate.toDateString())) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
}

function calculateStats(userLog) {
  let gained = 0, lost = 0, quests = 0, habits = 0, custom = 0;
  const penaltyIcons = ['🍷', '😴', '🍩', '🍔']; 
  if (!userLog) return { gained:0, lost:0, quests:0, habits:0, custom:0 };
  userLog.forEach(l => {
    if (l.d > 0) {
      gained += l.d;
      if (l.icon === '⚡') quests += l.d;
      else if (l.icon === '🏋️') custom += l.d; 
      else habits += l.d; 
    } else if (l.d < 0) {
      if (penaltyIcons.includes(l.icon)) lost += Math.abs(l.d); 
    }
  });
  return { gained, lost, quests, habits, custom };
}

function render() {
  renderDate();
  const isSolo = document.body.classList.contains('solo-active');
  const theme = currentUser === 'userA' ? 'theme-luca' : 'theme-kaja';
  document.body.classList.remove('theme-luca', 'theme-kaja');
  document.body.classList.add(theme);

  const bA = document.getElementById('btn-userA');
  const bB = document.getElementById('btn-userB');
  if (bA) bA.classList.toggle('active', currentUser === 'userA');
  if (bB) bB.classList.toggle('active', currentUser === 'userB');

  const lA = document.getElementById('label-userA');
  const lB = document.getElementById('label-userB');
  
  // 1. Očištění horní karty v Solo módu
  if (lA) {
      if (isSolo) {
          lA.innerHTML = `Lůca`;
      } else {
          lA.innerHTML = `Lůca <span class="win-crown" style="color:var(--gold); margin-left:4px; font-size:11px;">👑 ${state.userA.totalWins || 0}</span>`;
      }
  }
  if (lB) lB.innerHTML = `Kája <span class="win-crown" style="color:var(--gold); margin-left:4px; font-size:11px;">👑 ${state.userB.totalWins || 0}</span>`;

  const sA = state.userA.weeklyPoints || 0;
  const sB = state.userB.weeklyPoints || 0;

  const scA = document.getElementById('score-userA');
  const scB = document.getElementById('score-userB');
  if (scA) scA.textContent = sA;
  if (scB) scB.textContent = sB;

  const currentGoal = isSolo ? SOLO_GOAL : GOAL;
  const pA = sA >= 0 ? Math.min((sA / currentGoal) * 100, 100) : 0;
  const pB = sB >= 0 ? Math.min((sB / currentGoal) * 100, 100) : 0;
  
  const barA = document.getElementById('bar-a');
  const barB = document.getElementById('bar-b');
  // Přidáno hezčí zobrazení čísel (např. 25 / 70)
  if (barA) { barA.style.width = pA + '%'; document.getElementById('bar-a-val').textContent = isSolo ? `${sA} / ${currentGoal}` : sA; }
  if (barB) { barB.style.width = pB + '%'; document.getElementById('bar-b-val').textContent = sB; }

 // 2. NOVÝ SOLO TRACKER PRO TÝDEN (7 DNÍ) A MĚSÍČNÍ STREAK
  const trackTitle = document.querySelector('.track-title');
  const trackGoal = document.querySelector('.track-goal');
  const trackCard = document.querySelector('.track-card');
  
  let tracker = document.getElementById('solo-week-tracker');
  let streakBarContainer = document.getElementById('streak-bar-container');

  if (isSolo && trackCard) {
      const myStreak = calculateStreak(state.userA.log);
      const STREAK_GOAL = 30; // Cíl měsíční výzvy
      
      // Přepíšeme nadpis na dynamický Streak
      if (trackTitle) trackTitle.innerHTML = `🔥 STREAK: <span style="color:#F97316">${myStreak} DNÍ</span>`;
      if (trackGoal) trackGoal.textContent = `🎯 Cíl: ${currentGoal} bodů`;
      
      // Vytvoříme obal pro dny v týdnu, pokud tam ještě není
      if (!tracker) {
          tracker = document.createElement('div');
          tracker.id = 'solo-week-tracker';
          trackCard.insertBefore(tracker, document.querySelector('.track-row.luca'));
      }

      // Vytvoříme druhou lištu pro Měsíční Streak výzvu pod dny
      if (!streakBarContainer) {
          streakBarContainer = document.createElement('div');
          streakBarContainer.id = 'streak-bar-container';
          streakBarContainer.innerHTML = `
              <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); font-weight: 800; margin-bottom: 8px; text-transform: uppercase; margin-top: 10px;">
                  <span>Měsíční výzva přežití</span>
                  <span id="streak-bar-text" style="color: #F97316;">0 / 30 🔥</span>
              </div>
              <div class="track-bg" style="width: 100%; height: 12px; border-radius: 8px; margin: 0;">
                  <div id="streak-bar-fill" class="track-fill" style="width: 0%; background: linear-gradient(90deg, #F97316, #FB923C); border-radius: 8px; transition: width 0.5s ease;"></div>
              </div>
          `;
          // Vložíme to hned pod dny v týdnu
          tracker.after(streakBarContainer);
      }
      
      // Logika pro generování 7 koleček (Po - Ne) s OHNÍČKY
      const todayIdx = (new Date().getDay() + 6) % 7; 
      const logs = state.userA.log || [];
      const thisMondayMs = new Date(getMonday(new Date())).setHours(0,0,0,0);
      
      let daysHtml = '';
      const dayNames = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
      for(let i=0; i<7; i++) {
          const dayMs = thisMondayMs + (i * 86400000);
          const hasPoints = logs.some(l => l.d > 0 && l.ts >= dayMs && l.ts < dayMs + 86400000);
          let sClass = hasPoints ? 'active' : (i === todayIdx ? 'today' : (i > todayIdx ? 'future' : 'missed'));
          
          // Pokud je splněno, zobraz ohníček. Jinak název dne.
          let content = hasPoints ? '🔥' : dayNames[i];
          daysHtml += `<div class="day-circle ${sClass}">${content}</div>`;
      }
      tracker.innerHTML = daysHtml;
      tracker.style.display = 'flex';

      // Aktualizace nové Streak lišty
      if (streakBarContainer) {
          streakBarContainer.style.display = 'block';
          const streakPct = Math.min((myStreak / STREAK_GOAL) * 100, 100);
          document.getElementById('streak-bar-fill').style.width = streakPct + '%';
          document.getElementById('streak-bar-text').textContent = `${myStreak} / ${STREAK_GOAL} 🔥`;
      }

  } else {
      // Návrat do Duel módu - schováme Solo prvky
      if (trackTitle) trackTitle.textContent = 'Trať k vítězství';
      if (trackGoal) trackGoal.textContent = `🎯 Cíl: ${GOAL} bodů`;
      if (tracker) tracker.style.display = 'none';
      if (streakBarContainer) streakBarContainer.style.display = 'none';
  }
  const wb = document.getElementById('winner-bar');
  if (wb) {
    if (state.lastWinner && !isSolo) {
      wb.style.display = 'flex';
      document.getElementById('last-winner-name').textContent = state.lastWinner;
    } else { wb.style.display = 'none'; }
  }

  const list = document.getElementById('habit-list');
  if (list) {
      list.innerHTML = '';
      HABITS.forEach(h => {
        let count = state[currentUser].checkedHabits ? (state[currentUser].checkedHabits[h.id] || 0) : 0;
        const isFullyChecked = count === h.max;
        const div = document.createElement('div');
        div.className = 'habit-item' + (isFullyChecked ? ' checked' : '');
        div.onclick = () => window.toggleHabit(h.id); 
        
        let checkVisual = '';
        if (h.max === 1) {
          checkVisual = `<div class="habit-check">${count > 0 ? '✓' : ''}</div>`;
        } else {
          checkVisual = `<div class="habit-dots">`;
          for(let i=1; i<=h.max; i++) checkVisual += `<div class="h-dot ${count >= i ? 'filled' : ''}"></div>`;
          checkVisual += `</div>`;
        }
        div.innerHTML = `${checkVisual}<span class="habit-icon">${h.icon}</span><span class="habit-name">${h.label}</span><span class="habit-pts">+${h.points}</span>`;
        list.appendChild(div);
      });
  }

  const daySeed = Math.floor(new Date().getTime() / 86400000);
  const questEl = document.getElementById('today-quest');
  if (questEl) questEl.textContent = SIDE_QUESTS[(daySeed * 7) % SIDE_QUESTS.length];
  
  const quoteEl = document.getElementById('ezo-quote');
  if (quoteEl) quoteEl.textContent = `„${EZO_QUOTES[(new Date().getDay() + 6) % 7 % EZO_QUOTES.length]}"`;

  const qBtn = document.getElementById('quest-btn');
  if (qBtn) {
    if (state[currentUser].questDone) qBtn.classList.add('done');
    else qBtn.classList.remove('done');
    qBtn.textContent = state[currentUser].questDone ? '✓ Splněno (zrušit)' : 'Splnit výzvu';
  }

  const logDiv = document.getElementById('log-list');
  if (logDiv) {
      const startOfToday = new Date().setHours(0,0,0,0);
      const allLogs = [...(state.userA.log || []), ...(state.userB.log || [])]
        .filter(l => l.ts >= startOfToday)
        .sort((a,b) => b.ts - a.ts);

      if (allLogs.length === 0) {
        logDiv.innerHTML = '<div class="log-empty">Zatím žádné akce dnes…</div>';
      } else {
        logDiv.innerHTML = allLogs.map(l => `
          <div class="log-item">
            <div class="log-dot ${l.u === 'Lůca' ? 'luca' : 'kaja'}"></div>
            <div class="log-text">${l.icon} <strong>${l.u}</strong>: ${l.a}</div>
            <div class="log-pts ${l.d > 0 ? 'pos' : 'neg'}">${l.d > 0 ? '+' : ''}${l.d}</div>
          </div>`).join('');
      }
  }

  const thisMondayMs = new Date(getMonday(new Date())).setHours(0,0,0,0);
  const statsA = calculateStats((state.userA.log || []).filter(l => l.ts >= thisMondayMs));
  const statsB = calculateStats((state.userB.log || []).filter(l => l.ts >= thisMondayMs));

  const updateStats = (pref, s) => {
    const g = document.getElementById(`stat-${pref}-gained`);
    if (g) {
        g.textContent = '+' + s.gained;
        document.getElementById(`stat-${pref}-lost`).textContent = '-' + s.lost;
        document.getElementById(`stat-${pref}-habits`).textContent = s.habits;
        document.getElementById(`stat-${pref}-custom`).textContent = s.custom;
        document.getElementById(`stat-${pref}-quests`).textContent = s.quests;
    }
  };
  updateStats('a', statsA); updateStats('b', statsB);
}

// --- FUNKCE PRO HTML ---
window.switchUser = function(id) { 
  currentUser = id; 
  localStorage.setItem('activeUser', id); 
  render(); 
};

window.toggleHabit = function(id) {
  if (isSyncing) { showToast('⏳ Synchronizuji data, vteřinku...'); return; }
  checkTime();
  const h = HABITS.find(x => x.id === id);
  if(!state[currentUser].checkedHabits) state[currentUser].checkedHabits = {};
  if(!state[currentUser].log) state[currentUser].log = [];
  
  let count = Number(state[currentUser].checkedHabits[id]) || 0;
  let delta = 0, newCount = 0;

  if (h.max > 1) {
    if (count < h.max) { newCount = count + 1; delta = h.points; }
    else { newCount = 0; delta = -(h.points * h.max); }
  } else {
    newCount = count === 0 ? 1 : 0;
    delta = newCount === 1 ? h.points : -h.points;
  }

  state[currentUser].checkedHabits[id] = newCount;
  state[currentUser].weeklyPoints += delta;
  
  if (delta < 0) {
    let ptsRem = Math.abs(delta), today = new Date().setHours(0,0,0,0), i = 0;
    while (i < state[currentUser].log.length && ptsRem > 0) {
      let l = state[currentUser].log[i];
      if (l.icon === h.icon && l.d > 0 && l.ts >= today) { ptsRem -= l.d; state[currentUser].log.splice(i, 1); }
      else i++;
    }
  } else {
    state[currentUser].log.unshift({ u: currentUser==='userA'?'Lůca':'Kája', a: h.max > 1 ? `${h.label} (${newCount}/${h.max})` : h.label, d: delta, icon: h.icon, ts: Date.now() });
  }
  showToast(`${delta > 0 ? '✅' : '↩️'} ${h.label}`);
  save();
};

window.completeQuest = function() {
  if (isSyncing) { showToast('⏳ Synchronizuji data, vteřinku...'); return; }
  checkTime();
  if (!state[currentUser].log) state[currentUser].log = [];

  if (state[currentUser].questDone) {
    state[currentUser].questDone = false; state[currentUser].weeklyPoints -= 15;
    let today = new Date().setHours(0,0,0,0);
    let idx = state[currentUser].log.findIndex(l => l.icon === '⚡' && l.ts >= today);
    if (idx !== -1) state[currentUser].log.splice(idx, 1);
  } else {
    state[currentUser].questDone = true; state[currentUser].weeklyPoints += 15;
    state[currentUser].log.unshift({ u: currentUser==='userA'?'Lůca':'Kája', a: `Side Quest: ${document.getElementById('today-quest').textContent}`, d: 15, icon: '⚡', ts: Date.now() });
  }
  save();
};

window.addPenalty = function(label, delta, icon) {
  if (isSyncing) { showToast('⏳ Synchronizuji data, vteřinku...'); return; }
  if (!state[currentUser].log) state[currentUser].log = [];
  state[currentUser].weeklyPoints += delta;
  state[currentUser].log.unshift({ u:currentUser==='userA'?'Lůca':'Kája', a:label, d:delta, icon:icon, ts:Date.now() });
  save();
};

window.addCustom = function() {
  if (isSyncing) { showToast('⏳ Synchronizuji data, vteřinku...'); return; }
  const val = document.getElementById('custom-input').value.trim();
  if (!val) return;
  if (!state[currentUser].log) state[currentUser].log = [];
  state[currentUser].weeklyPoints += 10;
  state[currentUser].log.unshift({ u:currentUser==='userA'?'Lůca':'Kája', a:val, d:10, icon:'🏋️', ts:Date.now() });
  document.getElementById('custom-input').value = '';
  save();
};

window.confirmDailyReset = function() {
  if (isSyncing) { showToast('⏳ Synchronizuji data, vteřinku...'); return; }
  const today = new Date().setHours(0,0,0,0);
  let pts = 0;
  (state[currentUser].log || []).forEach(l => { if(l.ts >= today) pts += l.d; });
  state[currentUser].weeklyPoints -= pts;
  state[currentUser].log = (state[currentUser].log || []).filter(l => l.ts < today);
  state[currentUser].checkedHabits = {}; state[currentUser].questDone = false;
  window.hideDailyReset(); save();
};

window.showDailyReset = function() { 
  document.getElementById('daily-reset-name').textContent = currentUser === 'userA' ? 'Lůca' : 'Kája';
  document.getElementById('modal-daily').classList.add('show'); 
};
window.hideDailyReset = function() { document.getElementById('modal-daily').classList.remove('show'); };
window.showHistory = function() {
  const allLogs = [...(state.userA.log || []), ...(state.userB.log || [])].sort((a,b) => b.ts - a.ts);
  const content = document.getElementById('history-content');
  if (content) {
      content.innerHTML = allLogs.length === 0 ? '<div class="log-empty">Historie je prázdná</div>' : allLogs.map(l => {
        const d = new Date(l.ts);
        return `<div class="log-item"><div class="log-dot ${l.u === 'Lůca' ? 'luca' : 'kaja'}"></div><div class="log-text" style="font-size:12px;"><span style="opacity:0.5; font-size:10px;">[${d.getDate()}.${d.getMonth()+1}.]</span> ${l.icon} <strong>${l.u}</strong>: ${l.a}</div><div class="log-pts ${l.d > 0 ? 'pos' : 'neg'}">${l.d > 0 ? '+' : ''}${l.d}</div></div>`;
      }).join('');
  }
  document.getElementById('modal-history').classList.add('show');
};
window.hideHistory = function() { document.getElementById('modal-history').classList.remove('show'); };

// --- SYSTÉMOVÉ FUNKCE ---
window.forceRefresh = function() {
    showToast('🔄 Obnovuji připojení...');
    setTimeout(() => { window.location.reload(); }, 500);
};

window.logoutUser = function() {
    if (confirm("Opravdu se chceš odhlásit?")) {
        signOut(auth).then(() => {
            localStorage.removeItem('healthDuelCache'); 
            localStorage.removeItem('activeUser');
            window.location.href = window.location.origin + window.location.pathname;
        }).catch((error) => {
            console.error("Chyba při odhlášení:", error);
            showToast('❌ Chyba při odhlášení');
        });
    }
};

window.toggleSoloMode = function() {
    const body = document.body;
    body.classList.toggle('solo-active');
    const isSolo = body.classList.contains('solo-active');
    localStorage.setItem('healthDuel_isSolo', isSolo);
    
    const btn = document.getElementById('solo-toggle-btn');
    if (btn) {
        btn.innerHTML = isSolo ? '⚔️ Zpět na Duel' : '🧘‍♀️ Zapnout Solo';
        btn.style.background = isSolo ? 'rgba(255, 255, 255, 0.15)' : 'rgba(138, 43, 226, 0.9)';
        btn.style.border = isSolo ? '1px solid rgba(255, 255, 255, 0.3)' : 'none';
    }
    
    render(); // Překreslení grafiky pro aktivaci Solo módu
    showToast(isSolo ? 'Vítej v Solo módu! 🧘‍♀️' : 'Zpět v Duelu! ⚔️');
};

document.addEventListener('DOMContentLoaded', () => {
    const isSolo = localStorage.getItem('healthDuel_isSolo') === 'true';
    if (isSolo) {
        document.body.classList.add('solo-active');
        const btn = document.getElementById('solo-toggle-btn');
        if (btn) {
            btn.innerHTML = '⚔️ Zpět na Duel';
            btn.style.background = 'rgba(255, 255, 255, 0.15)';
            btn.style.border = '1px solid rgba(255, 255, 255, 0.3)';
        }
    }
});

const modDaily = document.getElementById('modal-daily');
if (modDaily) modDaily.onclick = e => { if(e.target === e.currentTarget) window.hideDailyReset(); };
const modHist = document.getElementById('modal-history');
if (modHist) modHist.onclick = e => { if(e.target === e.currentTarget) window.hideHistory(); };

let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (t) {
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
  }
}
