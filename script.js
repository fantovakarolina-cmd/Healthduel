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
const SOLO_GOAL = 150; // Týdenní cíl v Solo módu (dřív 100 – bylo příliš snadné)

const CORE_HABITS = [
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

// V Solo módu se z hlavních návyků zobrazí jen tyto základní pilíře (zbytek je jen v Duelu).
const SOLO_CORE_IDS = ["water", "sleep", "steps", "veggies", "nosugar"];
const SOLO_CORE = CORE_HABITS.filter(h => SOLO_CORE_IDS.includes(h.id));

const HABIT_POOL = {
    wellness: [
        { id:"meditation",  label:"Meditace",          points:2, icon:"🧘",  max:1, tip:"5 minut v tichu, soustřeď se jen na dech." },
        { id:"gratitude",   label:"Vděčnost",          points:2, icon:"🙏",  max:1, tip:"Zapiš si 3 věci, za které jsi dnes vděčná." },
        { id:"offline",     label:"Offline ráno",      points:3, icon:"📵",  max:1, tip:"První hodinu po probuzení bez telefonu." },
        { id:"breathing",   label:"Dechové cvičení",   points:2, icon:"🌬️", max:1, tip:"4 s nádech, 4 s zádrž, 4 s výdech – opakuj 5×." },
        { id:"journaling",  label:"Deník",             points:2, icon:"📓",  max:1, tip:"Napiš pár vět o tom, jak ses dnes cítila." },
        { id:"screenNight", label:"Večer bez displeje",points:3, icon:"🌙",  max:1, tip:"Hodinu před spaním žádné obrazovky." },
        { id:"affirmation", label:"Afirmace",          points:1, icon:"💬",  max:1, tip:"Řekni si nahlas jednu povzbudivou větu." }
    ],

    health: [
        { id:"tea",             label:"Čaj",                points:1, icon:"🍵", max:2, tip:"Bylinkový nebo zelený místo slazeného nápoje." },
        { id:"vitamins",        label:"Vitamíny",           points:1, icon:"💊", max:1, tip:"Vezmi si své denní doplňky stravy." },
        { id:"protein",         label:"Protein",            points:2, icon:"🍗", max:1, tip:"Zařaď do jídla bílkovinu (maso, tofu, luštěniny)." },
        { id:"healthyBreakfast",label:"Zdravá snídaně",     points:2, icon:"🥣", max:1, tip:"Ovesná kaše, vejce nebo jogurt s ovocem." },
        { id:"extraWater",      label:"Sklenice vody navíc",points:1, icon:"🚰", max:3, tip:"Vypij navíc sklenici čisté vody." },
        { id:"noAlcohol",       label:"Den bez alkoholu",   points:3, icon:"🚱", max:1, tip:"Dnešek zvládni úplně bez alkoholu." },
        { id:"earlyDinner",     label:"Večeře do 19:00",    points:2, icon:"🍽️",max:1, tip:"Poslední velké jídlo dne sněz brzy." },
        { id:"fiber",           label:"Vláknina",           points:1, icon:"🌾", max:1, tip:"Přidej celozrnné potraviny, semínka nebo luštěniny." }
    ],

    home: [
        { id:"bed",       label:"Ustlat postel",  points:1, icon:"🛏️",max:1, tip:"Hned po probuzení ustel postel." },
        { id:"declutter", label:"Úklid 10 minut", points:2, icon:"🧹", max:1, tip:"Ukliď jednu plochu nebo místnost, stačí 10 minut." },
        { id:"plants",    label:"Zalít kytky",    points:1, icon:"🪴", max:1, tip:"Zkontroluj a zalij pokojové rostliny." },
        { id:"laundry",   label:"Prádlo",         points:1, icon:"🧺", max:1, tip:"Pusť pračku nebo slož a ukliď jednu dávku." },
        { id:"cleanSink", label:"Prázdný dřez",   points:1, icon:"🧽", max:1, tip:"Umyj nádobí a nech dřez čistý a prázdný." },
        { id:"mealPlan",  label:"Naplánuj jídlo", points:1, icon:"📝", max:1, tip:"Rozmysli si dopředu, co budeš zítra jíst." }
    ],

    outside: [
        { id:"sunlight",      label:"Ranní slunce",    points:2, icon:"☀️",max:1, tip:"10 minut na denním světle brzy po ránu." },
        { id:"nature",        label:"Příroda",         points:2, icon:"🌳", max:1, tip:"Buď chvíli venku v parku nebo v přírodě." },
        { id:"stretch",       label:"Strečink",        points:2, icon:"🤸", max:1, tip:"5–10 minut protažení celého těla." },
        { id:"freshAir",      label:"Vyvětrat",        points:1, icon:"🪟", max:1, tip:"Pořádně vyvětrej celý byt." },
        { id:"activeCommute", label:"Aktivní přesun",  points:2, icon:"🚲", max:1, tip:"Aspoň část cesty ujdi pěšky nebo jeď na kole." },
        { id:"outdoorMove",   label:"Pohyb venku",     points:3, icon:"🏃‍♀️",max:1, tip:"Krátký běh nebo trénink na čerstvém vzduchu." }
    ]
};
function shuffle(array, seed) {

    const arr = [...array];

    for (let i = arr.length - 1; i > 0; i--) {

        const j = (seed + i * 17) % (i + 1);

        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
}

function getTodayHabits() {

    const isSolo = document.body.classList.contains("solo-active");

    if (!isSolo) {
        return CORE_HABITS;
    }

    const today = new Date().toDateString();

    if (todayHabits && habitsDay === today) {
        return todayHabits;
    }

    const daySeed = Math.floor(new Date(today).getTime() / 86400000);

if (!state.dailySoloHabits || state.dailySoloHabits.length === 0) {

    state.dailySoloHabits = [

        ...shuffle(HABIT_POOL.wellness, daySeed).slice(0,1),

        ...shuffle(HABIT_POOL.health, daySeed+1).slice(0,1),

        ...shuffle(HABIT_POOL.home, daySeed+2).slice(0,1),

        ...shuffle(HABIT_POOL.outside, daySeed+3).slice(0,1)

    ];

}

    habitsDay = today;

    todayHabits = [
        ...SOLO_CORE,
        ...state.dailySoloHabits
    ];
    return todayHabits;
} // <-- OPRAVENO: chyběla tato uzavírací závorka funkce getTodayHabits()

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

// Cache dnešních návyků (Solo mód). Musí být na úrovni modulu,
// aby k nim viděly funkce getTodayHabits(), checkTime() i render().
let todayHabits = null;
let habitsDay = null;

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff)).toDateString();
}

let state = {
  userA: { weeklyPoints:0, checkedHabits:{}, questDone:false, log:[], totalWins:0 },
  userB: { weeklyPoints:0, checkedHabits:{}, questDone:false, log:[], totalWins:0 },
  lastWinner: null, lastUpdated:0, 
  currentDay: new Date().toDateString(),
  currentWeek: getMonday(new Date()),
  dailySoloHabits: []
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
    state.dailySoloHabits = [];
    todayHabits = null;
    needsSave = true;
  }
  if (needsSave && !skipSave) save();
}

// VÝPOČET STREAKU (Počet dní v kuse s alespoň 10 body nebo zachráněným dnem)
function calculateStreak(logs) {
    if (!logs || logs.length === 0) return 0;

    const dailyPoints = {};
    const repairedDays = new Set();

    logs.forEach(l => {
        const dateKey = new Date(l.ts).toDateString();
        if (!dailyPoints[dateKey]) dailyPoints[dateKey] = 0;
        if (l.d > 0) dailyPoints[dateKey] += l.d; 
        
        // Pokud je to záchrana, opravuje to den PŘED jejím splněním
        if (l.icon === '🩹') {
            let targetDate = new Date(l.ts);
            targetDate.setDate(targetDate.getDate() - 1);
            repairedDays.add(targetDate.toDateString());
        }
    });

    let streak = 0;
    let checkDate = new Date();
    checkDate.setHours(0,0,0,0);

    let todayKey = checkDate.toDateString();
    
    // Pokud dnes ještě nemáš 10 bodů, zkontrolujeme včerejšek
    if ((dailyPoints[todayKey] || 0) < 10 && !repairedDays.has(todayKey)) {
        checkDate.setDate(checkDate.getDate() - 1);
        let yesterdayKey = checkDate.toDateString();
        if ((dailyPoints[yesterdayKey] || 0) < 10 && !repairedDays.has(yesterdayKey)) {
            return 0; // Ani včera nebylo splněno a opraveno
        }
    }

    while (true) {
        let dateStr = checkDate.toDateString();
        if ((dailyPoints[dateStr] || 0) >= 10 || repairedDays.has(dateStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break; 
        }
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
  if (scA) { scA.textContent = sA; scA.classList.toggle('negative', sA < 0); }
  if (scB) { scB.textContent = sB; scB.classList.toggle('negative', sB < 0); }

  const currentGoal = isSolo ? SOLO_GOAL : GOAL;
  const pA = sA >= 0 ? Math.min((sA / currentGoal) * 100, 100) : 0;
  const pB = sB >= 0 ? Math.min((sB / currentGoal) * 100, 100) : 0;
  
  const barA = document.getElementById('bar-a');
  const barB = document.getElementById('bar-b');
  if (barA) { barA.style.width = pA + '%'; document.getElementById('bar-a-val').textContent = isSolo ? `${sA} / ${currentGoal}` : sA; }
  if (barB) { barB.style.width = pB + '%'; document.getElementById('bar-b-val').textContent = sB; }

  const trackTitle = document.querySelector('.track-title');
  const trackGoal = document.querySelector('.track-goal');
  const trackCard = document.querySelector('.track-card');
  
  let tracker = document.getElementById('solo-week-tracker');
  let streakBarContainer = document.getElementById('streak-bar-container');

  if (isSolo && trackCard) {
      // Zajišťuje, že se načítají data pro aktuálně zvolenou uživatelku
      const logs = state[currentUser].log || [];
      const myStreak = calculateStreak(logs);
      const STREAK_GOAL = 30; // Cíl měsíční výzvy
      
      // Přepíšeme nadpis na dynamický Streak
      if (trackTitle) trackTitle.innerHTML = `🔥 STREAK: <span style="color:#F97316">${myStreak} DNÍ</span>`;
      if (trackGoal) trackGoal.textContent = `🎯 Cíl: ${currentGoal} bodů`; // Odebrána tečka
      
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
          tracker.after(streakBarContainer);
      }
      
      // Předpočítáme si zachráněné dny pro UI
      const uiRepairedDays = new Set();
      logs.forEach(l => {
          if (l.icon === '🩹') {
              let d = new Date(l.ts);
              d.setDate(d.getDate() - 1);
              uiRepairedDays.add(d.toDateString());
          }
      });

      // Bezpečná logika pro generování 7 koleček (Po - Ne) - bez milisekundových chyb
      const todayIdx = (new Date().getDay() + 6) % 7; 
      const thisMonday = new Date(getMonday(new Date()));
      
      let daysHtml = '';
      const dayNames = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
      
      for(let i=0; i<7; i++) {
          let loopDate = new Date(thisMonday);
          loopDate.setDate(loopDate.getDate() + i);
          let dayString = loopDate.toDateString();
          
          let dayPts = 0;
          logs.forEach(l => {
              if (new Date(l.ts).toDateString() === dayString && l.d > 0) {
                  dayPts += l.d;
              }
          });
          
          const isSuccess = dayPts >= 10 || uiRepairedDays.has(dayString);
          let sClass = isSuccess ? 'active' : (i === todayIdx ? 'today' : (i > todayIdx ? 'future' : 'missed'));
          
          let content = isSuccess ? '🔥' : dayNames[i];
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

      // --- LOGIKA PRO TLAČÍTKO ZÁCHRANY STREAKU ---
      let repairBtnContainer = document.getElementById('repair-streak-container');
      if (!repairBtnContainer) {
          repairBtnContainer = document.createElement('div');
          repairBtnContainer.id = 'repair-streak-container';
          repairBtnContainer.style.textAlign = 'center'; 
          repairBtnContainer.style.width = '100%';
          repairBtnContainer.innerHTML = `<button onclick="recoverStreak()" style="background: rgba(255,255,255,0.05); color: var(--muted); border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; padding: 10px 18px; font-weight: 800; font-family: 'Nunito', sans-serif; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; cursor: pointer; margin-top: 10px; margin-bottom: 10px; transition: all 0.2s;">🩹 Zachránit včerejšek</button>`;
          streakBarContainer.after(repairBtnContainer);
      }

      let yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      let yesterdayStr = yesterday.toDateString();
      
      let yesterdayPts = 0;
      logs.forEach(l => {
          if (new Date(l.ts).toDateString() === yesterdayStr && l.d > 0) {
              yesterdayPts += l.d;
          }
      });

      if (yesterdayPts < 10 && !uiRepairedDays.has(yesterdayStr)) {
          repairBtnContainer.style.display = 'inline-block';
      } else {
          repairBtnContainer.style.display = 'none';
      }

  } else {
      // Návrat do Duel módu - schováme Solo prvky
      if (trackTitle) trackTitle.textContent = 'Trať k vítězství';
      if (trackGoal) trackGoal.textContent = `🎯 Cíl: ${GOAL} bodů`;
      if (tracker) tracker.style.display = 'none';
      if (streakBarContainer) streakBarContainer.style.display = 'none';
      
      let repairBtnContainer = document.getElementById('repair-streak-container');
      if (repairBtnContainer) repairBtnContainer.style.display = 'none';
  }

  const wb = document.getElementById('winner-bar');
  if (wb) {
    if (state.lastWinner && !isSolo) {
      wb.style.display = 'flex';
      document.getElementById('last-winner-name').textContent = state.lastWinner;
    } else { wb.style.display = 'none'; }
  }

  // (Cache proměnné todayHabits/habitsDay jsou nyní deklarovány na úrovni modulu.)
  
  // Vykreslí pole návyků do daného kontejneru (sdíleno hlavní a náhodnou sekcí)
  const renderHabitsInto = (container, habits) => {
      if (!container) return;
      container.innerHTML = '';
      habits.forEach(h => {
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
        const tipHtml = h.tip ? `<span class="habit-tip">${h.tip}</span>` : '';
        div.innerHTML = `${checkVisual}<span class="habit-icon">${h.icon}</span><div class="habit-text"><span class="habit-name">${h.label}</span>${tipHtml}</div><span class="habit-pts">+${h.points}</span>`;
        container.appendChild(div);
      });
  };

  // Hlavní návyky: v Duelu všechny, v Solo jen základní pilíře
  renderHabitsInto(document.getElementById('habit-list'), isSolo ? SOLO_CORE : CORE_HABITS);

  // Náhodné návyky mají v Solo módu vlastní sekci; v Duelu jsou skryté
  const randomSection = document.getElementById('random-section');
  if (isSolo) {
      getTodayHabits(); // zajistí, že state.dailySoloHabits je pro dnešek vyplněné
      if (randomSection) randomSection.style.display = 'block';
      renderHabitsInto(document.getElementById('random-habit-list'), state.dailySoloHabits || []);
  } else if (randomSection) {
      randomSection.style.display = 'none';
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
  const h = getTodayHabits().find(x => x.id === id);
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

window.recoverStreak = function() {
  if (isSyncing) { showToast('⏳ Synchronizuji data, vteřinku...'); return; }
  checkTime();

  // Seznam možných trestů / výzev pro záchranu streaku
  const REPAIR_TASKS = [
      "udělat 50 dřepů v kuse",
      "vydržet 2 minuty v planku",
      "dát si 1 minutu studenou sprchu",
      "udělat 30 angličáků (burpees)",
      "jít na 20 minut svižnou procházku bez mobilu",
      "vydržet 1 minutu v sedu u zdi (wall sit)",
      "udělat 40 výpadů (20 na každou nohu)"
  ];

  // Vybere náhodný trest
  const randomTask = REPAIR_TASKS[Math.floor(Math.random() * REPAIR_TASKS.length)];

  const quest = `🔥 TRESTNÁ VÝZVA 🔥\n\nPro záchranu streaku musíš ${randomTask}.\n\nKlikni na OK, teprve až to budeš mít za sebou!`;
  if (!confirm(quest)) {
      showToast('❌ Trest nesplněn, streak zůstává přerušen.');
      return;
  }

  if (!state[currentUser].log) state[currentUser].log = [];

  state[currentUser].log.unshift({
      u: currentUser === 'userA' ? 'Lůca' : 'Kája',
      a: 'Záchrana streaku (Trest splněn)! 🦸‍♀️',
      d: 0,
      icon: '🩹',
      ts: Date.now()
  });

  showToast('🩹 Streak zachráněn!');
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
