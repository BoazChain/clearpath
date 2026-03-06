# ClearPath — Local Setup Guide

A mindful sobriety tracker with live supporter messaging.
Zero cost. Runs entirely on your machine.

---

## Requirements

- **Node.js** (v18 or newer) → https://nodejs.org  
  To check if you have it: open Terminal and run `node -v`

---

## Setup (one time only)

```bash
# 1. Unzip the project folder, then open Terminal inside it
cd clearpath

# 2. Install dependencies (~30 seconds)
npm install

# 3. Start the app
npm run dev
```

You'll see output like:
```
  VITE v5  ready in 300ms
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

---

## Running the demo (2 instances)

Open **two browser tabs** both pointing to:
```
http://localhost:5173
```

- **Tab 1** → Choose "I'm on a journey" (the tracker)
- **Tab 2** → Choose "I'm a supporter" → enter code `CLRP-7423`

Send a message from Tab 2. It appears in Tab 1's Messages tab **instantly** — no refresh needed.

> Messages sync via `localStorage` + `BroadcastChannel`.  
> Data persists between browser sessions on the same machine.

---

## Demo on the same Wi-Fi network (phone + laptop)

Use the **Network** URL shown in your terminal (e.g. `http://192.168.1.5:5173`).

- Open it on your laptop as the tracker
- Open it on your phone as the supporter

> Note: cross-device sync requires a backend (Firebase etc).  
> For same-machine demo, two browser tabs work perfectly.

---

## Stop the server

Press `Ctrl + C` in your terminal.

## Restart anytime

```bash
npm run dev
```

---

## File structure

```
clearpath/
├── index.html          ← HTML shell
├── package.json        ← dependencies
├── vite.config.js      ← build config
└── src/
    ├── main.jsx        ← React entry point
    └── App.jsx         ← entire application
```
