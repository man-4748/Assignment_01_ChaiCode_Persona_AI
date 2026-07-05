# ChaiCode AI Persona Simulator

Hey! Welcome to the ChaiCode AI Persona Simulator. This is a simple, premium web application built using standard HTML, CSS, and JS that lets you chat with two of India's favorite tech educators: **Hitesh Choudhary** (the voice behind *Chai aur Code*) and **Piyush Garg**. 

The app features custom design rooms for both educators (Warm Orange for Hitesh Sir, Neon Blue/Green for Piyush Sir) and simulates their speaking styles, teaching philosophies, and personalities.

---

## 🚀 Getting Started

Since this is a static frontend website, you can run it instantly without setting up any backend.

1. **Download/Clone** the folder.
2. Double-click `index.html` to open it in your browser (or use VS Code Live Server).
3. Open **Settings** (gear icon, bottom-left sidebar) to paste your **Google Gemini API Key** (Recommended) or **OpenAI API Key**.
4. Save configurations and select your educator from the sidebar to start chatting!

---

## 🧠 Under the Hood

### 1. Recreating Personalities
We studied YouTube videos and live streams to capture their true tone:
* **Hitesh Choudhary**: Calm, encouraging, mixes Hinglish naturally. Usually starts with *"Hello ji!"* and transitions with *"dekho yaar..."*. He focuses on building real project proofs over rote memory.
* **Piyush Garg**: Direct, high-energy, technical. Starts with *"Hey guys!"*. Talkative about real-world setups (Docker, scaling, databases) and likes to joke about hairline visionaries and self-obsessed comments.

### 2. Prompt Strategy & Context
* **System Prompts**: Loaded directly from [personas.js](personas.js). They guide the LLM to write Hinglish naturally and map specific educator responses (like the Physics Wallah build fail story or hairline jokes).
* **Context Caching**: Keeps separate chat histories for Hitesh Sir and Piyush Sir in your browser's `localStorage` so switching rooms doesn't wipe out your chats.
* **Smart Rolling History**: Feeds the last 10 messages to the API to keep responses fast and contextually aware without blowing up token limits.

---

## 💬 Quick Samples

### Hitesh Sir Vibe:
> **User**: *MERN seekhna AI ke zamane me worth hai?*
> **Hitesh**: **Hello ji!** **dekho yaar...** I think it is of the highest value now. Simple hai, agar code write nahi karna seekhoge to Claude se talk kaise karoge? I think this is the high time that everybody should learn software. Keep coding! ☕

### Piyush Sir Vibe:
> **User**: *Sir apki hairline kaisi hai ab?*
> **Piyush**: **Hey guys!** Hahaha! Meri hairline? Dekho yaar... visionary logon ki hairline thodi upar hi hoti hai, taaki dimaag ko aur space mile naye ideas sochne ke liye! 😉 stable hai ab toh. stress ho jata hai AI ke naye frameworks padhte-padhte, par tension nahi lene ka!
