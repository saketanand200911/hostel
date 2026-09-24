# CampusHaven - Sketch Edition Hostel Management Suite

**CampusHaven (Sketch Edition)** is a responsive residential housing and hostel management web application rendered with an architectural sketch & hand-drawn drafting aesthetic. It features dynamic theme switching, tactile paper-like cards, washi-tape pin decorators, digital QR gate pass generation, and real-time warden command controls.

---

## 🎨 Sketch Visual Design System

- **Hand-drawn & Drafting Typography**:
  - Headings: `Architects Daughter` & `Caveat`
  - Body copy & forms: `Patrick Hand`
  - Technical specs, timestamps & IDs: `Space Mono`
- **Sketch Textures & Materials**:
  - Graph/blueprint paper background grid (`24px x 24px`)
  - Asymmetric wobbly hand-drawn border radiuses (`rounded-[255px_15px_225px_15px/15px_225px_15px_255px]`)
  - Hard ink drop shadows (`4px 4px 0px 0px var(--sketch-shadow)`)
  - Semi-transparent washi tape headers and rubber-stamp badges
  - Highlighter marker text styling
- **Wing Palettes & Dual Aesthetics**:
  - **Boys Hostel Wing**: Clean architectural drafting & sketch style with Slate Graphite ink (`#0f172a`), Amber highlighter (`#f59e0b`), and warm paper grid (`#f8fafc`).
  - **Girls Hostel Wing**: Luxury Glassmorphism & Soft Gradients with off-white canvases (`#faf8f5`), ambient blush & rose radial glows, frosted glass cards (`backdrop-blur-xl`), rose gold gradients (`linear-gradient(#fb7185, #f43f5e, #e11d48)`), and elegant serif typography (`Playfair Display`, `Outfit`, `Plus Jakarta Sans`).

---

## 📁 Project Structure

```text
campushaven/
 ├── README.md                      # Complete setup & startup guide
 ├── backend/
 │   ├── index.js                   # Express API (health, mock rooms inventory)
 │   ├── package.json               # Backend dependencies (Express, CORS)
 │   ├── start.sh                   # Launch script
 │   └── .gitignore
 └── frontend/
     ├── index.html                 # HTML with Google Fonts (Patrick Hand, Architects Daughter, Space Mono)
     ├── vite.config.ts             # Vite bundler config with /api proxy to backend
     ├── tailwind.config.js         # Custom Tailwind theme setup
     ├── postcss.config.js          # PostCSS configuration
     ├── tsconfig.json              # TypeScript compiler configuration
     ├── package.json               # Frontend dependencies (React, Recharts, QRCode)
     ├── .gitignore
     └── src/
         ├── components/
         │   ├── ThemeProvider.tsx  # Dynamic sketch CSS variables context
         │   ├── StickyNav.tsx      # Top drafting ruler bar with wing/institution selectors
         │   └── ProtectedRoute.tsx # Route guard for /student and /admin
         ├── pages/
         │   ├── HomePage.tsx       # Sketch blueprint hero, Key Metrics, Facilities cards
         │   ├── LoginPage.tsx      # Multi-role login with demo profile stamp buttons
         │   ├── StudentPortal.tsx  # QR Gate pass & sticky quick-action request cards
         │   └── AdminConsole.tsx   # Blueprint command center, hatched chart & curfew toggle
         ├── App.tsx                # Root layout & route configuration
         ├── main.tsx               # React DOM entry point
         ├── index.css              # Sketch styles, washi tape, wobbly borders, paper textures
         └── theme.ts               # Theme palette constants and CSS variable applicator
```

---

## 🚀 Quick Start Guide

### Option 1: Standalone Direct HTML (No Build Required)
Double-click and open `hostel.html` directly in any web browser.

### Option 2: Full React + Vite + Node/Express Stack

#### 1. Start Backend Server (Port 4000)
```bash
cd campushaven/backend
npm install
npm start
```

#### 2. Start Frontend Development Server (Port 3000)
```bash
cd campushaven/frontend
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 1-Click Demo Profiles

On the Login Page (`/login`), click any of the preset demo buttons:

1. **Alex Chen** (Student) → Boys Hostel Wing, Ground Floor, Room 101, Hi-Tech Campus
2. **Ananya Sharma** (Student) → Girls Hostel Wing, 1st Floor, Room 203, Hi-Tech Campus
3. **Govind** (Caretaker / Warden: +91 85097 04392) → Full access to Warden & Security Command Center

---

## 🚨 Emergency & Help Desk Numbers

- **Main Gate Security Desk**: `112` (24/7 Direct Line)
- **Hostel Caretaker / Warden Govind**: `+91 85097 04392`
- **Campus Health Clinic**: `9876543211`
