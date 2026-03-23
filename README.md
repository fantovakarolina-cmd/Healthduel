# Health Duel ⚔️

Motivační webová aplikace navržená pro přátelský lifestylový souboj mezi dvěma uživatelkami (Lůca a Kája). Cílem je sbírat body za zdravé návyky, plnit denní výzvy a vyhýbat se penalizacím. Vše se synchronizuje v reálném čase!

## 🌟 Hlavní funkce

* **Trať k vítězství:** Vizuální ukazatel skóre s cílem XY bodů na týden.
* **Denní návyky:** Odškrtávání pravidelných aktivit (pitný režim, spánek, kroky, strava) s různým bodovým ohodnocením.
* **Side Quest dne:** Generovaná denní výzva pro extra přísun bodů (např. studená sprcha, jóga, čtení).
* **Penalizace:** Možnost odečíst body za prohřešky (alkohol, cukr, junk food).
* **Vlastní aktivity:** Přidávání specifických tréninků nebo aktivit za +10 bodů.
* **Chytrá historie a statistiky:** Záznam všech akcí (log) a automatické výpočty získaných/ztracených bodů za aktuální týden.
* **Real-time synchronizace:** Okamžitý přepis skóre mezi zařízeními bez nutnosti obnovovat stránku.

## 🛠️ Technologie a struktura

Projekt je postaven na čistých webových technologiích bez použití těžkých frameworků (tzv. Vanilla stack), díky čemuž je bleskově rychlý.

* **Frontend:** HTML5, CSS3 (vlastní moderní Glassmorphism UI s animacemi), Vanilla JavaScript (ES6 Modules).
* **Backend / Databáze:** Google Firebase (Realtime Database) pro bleskovou synchronizaci dat a ukládání stavu aplikace.
* **Hosting:** Vercel pro rychlé nasazení a automatické updaty z GitHubu.

**Struktura repozitáře:**
* `index.html` - Kostra aplikace a rozložení prvků.
* `style.css` - Veškerý vizuál, barvy a CSS animace.
* `script.js` - Logika aplikace, výpočty a napojení na Firebase API.
* `icon.png` - Ikonka aplikace pro domovskou obrazovku na mobilech.

## 🚀 Instalace a spuštění

Aplikace funguje čistě v prohlížeči, stačí ji otevřít přes hostovanou URL. 

**Pro vývojáře (lokální spuštění):**
1. Naklonujte si tento repozitář: `git clone <url-repozitare>`
2. Nastavte si vlastní projekt v Google Firebase a vytvořte Realtime Database v testovacím režimu.
3. V souboru `script.js` nahraďte objekt `firebaseConfig` vašimi vlastními API klíči z Firebase administrace.
4. Otevřete `index.html` v prohlížeči přes lokální server (např. pomocí rozšíření Live Server ve VS Code, aby správně fungovaly ES6 moduly).

---
*Vyrobeno s ☕ a 💻 pro lepší a zdravější já!*
