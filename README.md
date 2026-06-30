# Health Duel ⚔️

A motivational web application designed for a friendly lifestyle duel between two users (Lůca and Kája). The goal is to collect points for healthy habits, complete daily challenges, and avoid penalties. Everything synchronizes in real-time!

## 🌟 Core Features

* **Road to Victory:** A visual score indicator with a target of XY points per week.
* **Daily Habits:** A checklist for regular activities (hydration, sleep, steps, diet) with varying point values.
* **Daily Side Quest:** A generated daily challenge for an extra point boost (e.g., cold shower, yoga, reading).
* **Penalties:** The option to deduct points for slip-ups (alcohol, sugar, junk food).
* **Custom Activities:** Add specific workouts or activities for +10 points.
* **Smart History & Statistics:** A log of all actions and automatic calculation of gained/lost points for the current week.
* **Real-time Synchronization:** Instant score updates across devices without needing a page refresh.

## 🛠️ Technology & Structure

The project is built on pure web technologies without heavy frameworks (the Vanilla stack), making it lightning-fast.

* **Frontend:** HTML5, CSS3 (custom modern Glassmorphism UI with animations), Vanilla JavaScript (ES6 Modules).
* **Backend / Database:** Google Firebase (Realtime Database) for instant data synchronization and state management.
* **Hosting:** Vercel for fast deployment and automatic updates from GitHub.

**Repository Structure:**
* `index.html` - Application skeleton and layout.
* `style.css` - All visuals, colors, and CSS animations.
* `script.js` - Application logic, calculations, and Firebase API integration.
* `icon.png` - App icon for mobile home screens.

## 🚀 Installation & Setup

The app runs entirely in the browser; just open the hosted URL. 

**For Developers (Local Setup):**
1. Clone this repository: `git clone <repository-url>`
2. Set up your own project in Google Firebase and create a Realtime Database in test mode.
3. In the `script.js` file, replace the `firebaseConfig` object with your own API keys from the Firebase console.
4. Open `index.html` in the browser via a local server (e.g., using the Live Server extension in VS Code to ensure ES6 modules work properly).

---
*Made with ☕ and 💻 for a better and healthier self!*
