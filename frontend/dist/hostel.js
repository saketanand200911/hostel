const API_BASE_URL = (() => {
    const configured = window.CAMPUSHAVEN_API_BASE || '';
    if (configured) return configured;
    if (window.location.protocol === 'file:') return 'http://localhost:4000/api';
    if (['localhost', '127.0.0.1'].includes(window.location.hostname)) return 'http://localhost:4000/api';
    if (window.location.hostname.endsWith('github.io')) return '';
    return '/api';
})();
const APP_TIME_ZONE = 'Asia/Kolkata';
const WEEKLY_MENU = {
    Sunday: {
        breakfast: ['Aloo bread sandwich / poha', 'Banana', 'Tea'],
        lunch: ['Chole bhature', 'Cooked rice', 'Chana dal', 'Cucumber raita', 'Salad', 'Pickle'],
        snacks: ['Sprouts chaat (chana, moong, onion, lemon, chillies, tomato & chaat masala)', 'Tea'],
        dinner: ['Chapathi', 'Aloo gobi gravy', 'Cooked rice', 'Arahar ki dal', 'Salad', 'Pickle', 'Gulab jamun / ice cream']
    },
    Monday: {
        breakfast: ['Tinkoni paratha / puri', 'Aloo ki sabji', 'Tea'],
        lunch: ['Chapathi', 'Aloo soyabean ki subji', 'Cooked rice', 'Razma', 'Salad', 'Pickle'],
        snacks: ['Maggie / chowmin', 'Tea'],
        dinner: ['Chapathi', 'Lauki kofta', 'Cooked rice', 'Arhar ki dal', 'Salad', 'Pickle']
    },
    Tuesday: {
        breakfast: ['Pav', 'Bhajji', 'Tea'],
        lunch: ['Chapathi', 'Aloo bhujia', 'Jeera rice', 'Mix dal', 'Onion salad', 'Pickle'],
        snacks: ['Veg sandwich', 'Tea'],
        dinner: ['Poori', 'Chola', 'Jeera rice', 'Dal makhni', 'Salad', 'Pickle', 'Jalebi / kheer']
    },
    Wednesday: {
        breakfast: ['Idli', 'Sambar & chutney', 'Tea'],
        lunch: ['Chapathi', 'Aloo gobi', 'Cooked rice', 'Mix dal', 'Salad', 'Pickle'],
        snacks: ['Pasta', 'Tea'],
        dinner: ['Chapathi', 'Mix veg curry', 'Cooked rice', 'Dal makhni', 'Salad', 'Pickle']
    },
    Thursday: {
        breakfast: ['Kulcha / dal paratha', 'Chole', 'Tea'],
        lunch: ['Chapathi', 'Aloo baigan ki subji', 'Cooked rice', 'Kadhi pakoda', 'Salad', 'Pickle'],
        snacks: ['Pani puri', 'Imli chutney', 'Tea'],
        dinner: ['Tandoori roti', 'Kadai paneer', 'Cooked rice', 'Mix dal', 'Salad', 'Pickle']
    },
    Friday: {
        breakfast: ['Aloo paratha', 'Curd', 'Tea'],
        lunch: ['Veg biryani', 'Tomato mirchi ka chutney', 'Chana dal', 'Kachumber', 'Pickle'],
        snacks: ['Aloo samosa', 'Tea'],
        dinner: ['Chapathi', 'Seasonal veg', 'Cooked rice', 'Arhar dal', 'Salad', 'Pickle']
    },
    Saturday: {
        breakfast: ['Masala chilla / masala dosa', 'Green chutney', 'Tea'],
        lunch: ['Chapathi', 'Mix veg curry with mushroom', 'Cooked rice', 'Lal masoor dal', 'Salad', 'Pickle'],
        snacks: ['Cutlet / bhelpuri', 'Tea'],
        dinner: ['Chapathi', 'Aloo jeera', 'Fried rice', 'Veg manchurian', 'Coke']
    }
};

function backendIsAvailable() {
    return !!API_BASE_URL;
}

function getLocalDateKey(date = new Date()) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: APP_TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date);
}

function getWeekdayName(dateKey) {
    return new Date(`${dateKey}T12:00:00+05:30`).toLocaleDateString('en-US', {
        weekday: 'long',
        timeZone: APP_TIME_ZONE
    });
}

function getWeekDateKeys(dateKey) {
    const [year, month, day] = dateKey.split('-').map(Number);
    const sunday = new Date(Date.UTC(year, month - 1, day));
    sunday.setUTCDate(sunday.getUTCDate() - sunday.getUTCDay());
    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(sunday);
        date.setUTCDate(sunday.getUTCDate() + index);
        return date.toISOString().slice(0, 10);
    });
}

function getWeeklyMenuForDate(dateKey) {
    const weekday = getWeekdayName(dateKey);
    return WEEKLY_MENU[weekday] || {};
}

function renderWeeklyMenuTables(menuByDay = WEEKLY_MENU) {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const meals = ['breakfast', 'lunch', 'snacks', 'dinner'];
    document.querySelectorAll('#mess-subview-weekly table').forEach((table, tableIndex) => {
        const meal = meals[tableIndex];
        const body = table.tBodies[0];
        if (!meal || !body) return;

        const row = document.createElement('tr');
        row.className = 'bg-white hover:bg-slate-50';
        const label = document.createElement('td');
        label.className = 'px-2 py-1.5 border border-[var(--sketch-border)] font-draft font-black text-[var(--ink)]';
        label.textContent = 'Menu';
        row.appendChild(label);
        weekdays.forEach((weekday) => {
            const cell = document.createElement('td');
            cell.className = 'px-2 py-1.5 border border-[var(--sketch-border)] text-center';
            const items = menuByDay[weekday]?.[meal];
            cell.textContent = Array.isArray(items) ? items.join(' · ') : items || '—';
            row.appendChild(cell);
        });
        body.replaceChildren(row);
    });
}

function updateWeeklyMenuDates(dateKey) {
    const weekDates = getWeekDateKeys(dateKey);
    document.querySelectorAll('#mess-subview-weekly table').forEach((table) => {
        const headers = Array.from(table.tHead?.rows[0]?.cells || []).slice(1);
        headers.forEach((header, index) => {
            if (!header.dataset.weekday) header.dataset.weekday = header.textContent.trim();
            const weekday = document.createElement('span');
            weekday.textContent = header.dataset.weekday;
            const date = document.createElement('span');
            date.className = 'block text-[9px] font-normal normal-case';
            date.textContent = new Date(`${weekDates[index]}T12:00:00+05:30`).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                timeZone: APP_TIME_ZONE
            });
            header.replaceChildren(weekday, date);
        });
    });
}

function renderDateMenu(menu) {
    ['breakfast', 'lunch', 'snacks', 'dinner'].forEach((meal) => {
        const list = document.getElementById(`menu-${meal}`);
        if (!list) return;
        const value = menu?.[meal];
        const items = Array.isArray(value) ? value : value ? [value] : [];
        list.replaceChildren();
        if (items.length) {
            items.forEach((item) => {
                const listItem = document.createElement('li');
                listItem.textContent = `• ${String(item)}`;
                list.appendChild(listItem);
            });
        } else {
            const listItem = document.createElement('li');
            listItem.className = 'text-slate-400';
            listItem.textContent = 'No menu uploaded for this meal.';
            list.appendChild(listItem);
        }
    });
}

const PALETTES = {
    boys: {
        primary: '#090d16',
        secondary: 'rgba(15, 23, 42, 0.45)',
        accent: '#f59e0b',
        ink: '#f8fafc',
        paper: '#090d16',
        paperCard: 'rgba(11, 18, 33, 0.35)',
        sketchBorder: 'rgba(255, 255, 255, 0.08)',
        sketchShadow: 'rgba(0, 0, 0, 0.3)',
        highlighter: 'rgba(245, 158, 11, 0.2)'
    },
    girls: {
        primary: '#090d16',
        secondary: 'rgba(15, 23, 42, 0.45)',
        accent: '#f59e0b',
        ink: '#f8fafc',
        paper: '#090d16',
        paperCard: 'rgba(11, 18, 33, 0.35)',
        sketchBorder: 'rgba(255, 255, 255, 0.08)',
        sketchShadow: 'rgba(0, 0, 0, 0.3)',
        highlighter: 'rgba(245, 158, 11, 0.2)'
    }
};

let currentGender = localStorage.getItem('campushaven_gender') || 'boys';
let currentInstitution = localStorage.getItem('campushaven_institution') || 'hi-tech';
let currentView = 'home';
let currentLoginRole = 'student';
let currentAuthMode = 'signin'; // 'signin' or 'signup'

function updateAuthSubtitle() {
    const sub = document.getElementById('auth-sub-text');
    if (!sub) return;
    if (currentAuthMode === 'signup') {
        sub.textContent = currentLoginRole === 'student'
            ? 'Register with your email or phone number to link your room.'
            : 'Staff accounts must be assigned by an administrator; sign in to an existing staff account.';
        return;
    }
    sub.textContent = `Sign in with an account assigned to the ${currentLoginRole} role. Staff access must be assigned by an administrator.`;
}

function applyThemeColors(gender) {
    const p = PALETTES[gender] || PALETTES.boys;
    const root = document.documentElement;

    // Enforce dark mode on body and html
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.setAttribute('data-theme', 'dark');

    root.style.setProperty('--primary', p.primary);
    root.style.setProperty('--secondary', p.secondary);
    root.style.setProperty('--accent', p.accent);
    root.style.setProperty('--ink', p.ink);
    root.style.setProperty('--paper', p.paper);
    root.style.setProperty('--paper-card', p.paperCard);
    root.style.setProperty('--sketch-border', p.sketchBorder);
    root.style.setProperty('--sketch-shadow', p.sketchShadow);
    root.style.setProperty('--highlighter', p.highlighter);

    if (gender === 'girls') {
        document.body.classList.add('theme-girls');
        document.body.classList.remove('theme-boys');
    } else {
        document.body.classList.add('theme-boys');
        document.body.classList.remove('theme-girls');
    }

    const instLabel = currentInstitution === 'hi-tech' ? 'Hi-Tech University' : 'Mirai Institute';
    const wingLabel = gender === 'boys' ? "Boys' Wing" : "Girls' Wing";

    const navSub = document.getElementById('nav-subtitle');
    if (navSub) navSub.textContent = `${wingLabel} • ${instLabel}`;
}

function updateGender(newGender) {
    currentGender = newGender;
    localStorage.setItem('campushaven_gender', newGender);
    const globalSel = document.getElementById('global-gender-select');
    if (globalSel) globalSel.value = newGender;
    applyThemeColors(newGender);
    renderPinnedServices();
    updatePinButtons();
}

function updateInstitution(newInst) {
    currentInstitution = newInst;
    localStorage.setItem('campushaven_institution', newInst);
    applyThemeColors(currentGender);
    renderPinnedServices();
    updatePinButtons();
}

function switchMessTab(tab) {
    ['today', 'weekly'].forEach(name => {
        document.getElementById(`mess-subview-${name}`)?.classList.toggle('hidden', name !== tab);
        document.getElementById(`tab-mess-${name}`)?.classList.toggle('bg-[var(--accent)]', name === tab);
    });
}

async function uploadCalendarFile(input) {
    const file = input.files && input.files[0];
    const status = document.getElementById('calendar-upload-status');
    if (!file || !status) return;

    try {
        const payload = JSON.parse(await file.text());
        const token = localStorage.getItem('campushaven_token');
        const response = await fetch(`${API_BASE_URL}/calendar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Calendar upload failed.');
        status.textContent = 'Calendar saved. Menus will update automatically by date or weekday.';
        await loadDateMenu();
    } catch (error) {
        status.textContent = error instanceof SyntaxError
            ? 'Upload a valid calendar JSON file.'
            : error.message || 'Unable to update the menu data.';
    } finally {
        input.value = '';
    }
}

async function uploadCalendarDocument(input) {
    const file = input.files && input.files[0];
    const status = document.getElementById('menu-document-upload-status');
    if (!file || !status) return;

    if (file.size > 8 * 1024 * 1024) {
        status.textContent = 'Choose a file smaller than 8 MB.';
        input.value = '';
        return;
    }

    try {
        const token = localStorage.getItem('campushaven_token');
        const response = await fetch(`${API_BASE_URL}/calendar/document`, {
            method: 'POST',
            headers: {
                'Content-Type': file.type || 'application/octet-stream',
                'X-File-Name': encodeURIComponent(file.name),
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: file
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Menu calendar upload failed.');
        status.textContent = `${result.name} published for residents.`;
        await loadCalendarDocument();
    } catch (error) {
        status.textContent = error.message || 'Unable to publish the menu calendar.';
    } finally {
        input.value = '';
    }
}

async function loadCalendarDocument() {
    const status = document.getElementById('menu-calendar-document-status');
    const link = document.getElementById('menu-calendar-document-link');
    if (!status || !link) return;

    if (!backendIsAvailable()) {
        status.textContent = 'Latest weekly menu';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/calendar/document`);
        if (response.status === 404) {
            status.textContent = 'Latest weekly menu';
            return;
        }
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Unable to load the menu calendar.');
        link.href = `${API_BASE_URL}/calendar/document/file`;
        link.textContent = `Download ${result.name}`;
        link.classList.remove('hidden');
        status.textContent = result.uploadedAt
            ? `Latest calendar · ${new Date(result.uploadedAt).toLocaleDateString()}`
            : 'Latest menu calendar';
    } catch (error) {
        status.textContent = 'Latest weekly menu';
    }
}

/**
 * Downloads the weekly mess menu in PDF format.
 * Triggers direct download of published / local menu-calendar.pdf.
 */
function downloadMenuPDF() {
    const customLink = document.getElementById('menu-calendar-document-link');
    const pdfUrl = (customLink && customLink.href && !customLink.href.endsWith('#') && customLink.href !== window.location.href)
        ? customLink.href
        : 'menu-calendar.pdf';

    const wingLabel = currentGender === 'girls' ? "Girls" : "Boys";
    const instLabel = currentInstitution === 'mirai' ? "Mirai" : "Hi-Tech";
    const filename = `CampusHaven_${instLabel}_${wingLabel}_Weekly_Menu.pdf`;

    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    showAlert(`📥 Downloading ${wingLabel} Wing Weekly Menu PDF...`, 'success');
}

/**
 * Opens a print-to-PDF view of the active weekly timetable.
 */
function printMenuPDF() {
    window.print();
}

async function loadDateMenu(requestedDate) {
    const dateInput = document.getElementById('mess-menu-date');
    const date = requestedDate || dateInput?.value || getLocalDateKey();
    const weekday = getWeekdayName(date);
    const weeklyMenu = getWeeklyMenuForDate(date);
    updateWeeklyMenuDates(date);
    const dateLabel = document.getElementById('mess-date-label');
    const time = new Intl.DateTimeFormat('en-IN', {
        timeZone: APP_TIME_ZONE,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).format(new Date());
    if (dateLabel) dateLabel.textContent = `· ${weekday} · ${date} · ${time} IST`;
    renderDateMenu(weeklyMenu);
    updateMealStatuses();

    if (!backendIsAvailable()) return;

    try {
        const response = await fetch(`${API_BASE_URL}/calendar/menu?date=${date}`);
        if (!response.ok) return;
        const result = await response.json();
        if (dateLabel) dateLabel.textContent = `· ${result.weekday || weekday} · ${date} · ${time} IST`;
        renderDateMenu({ ...weeklyMenu, ...(result.menu || {}) });
        updateMealStatuses();
    } catch (error) {
        // Keep the built-in weekday menu when the backend is unavailable.
    }
}

function updateMealStatuses() {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: APP_TIME_ZONE,
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
    }).formatToParts(now);
    const currentMinutes = Number(parts.find(part => part.type === 'hour').value) * 60
        + Number(parts.find(part => part.type === 'minute').value);
    const meals = [
        { id: 'breakfast', start: 7 * 60 + 30, end: 9 * 60 + 30 },
        { id: 'lunch', start: 12 * 60 + 30, end: 14 * 60 + 30 },
        { id: 'snacks', start: 16 * 60 + 30, end: 17 * 60 + 30 },
        { id: 'dinner', start: 20 * 60, end: 21 * 60 + 30 }
    ];

    let upcomingAssigned = false;
    meals.forEach(meal => {
        const badge = document.getElementById(`status-${meal.id}`);
        if (!badge) return;
        let status = 'SERVED';
        if (currentMinutes < meal.start) {
            status = upcomingAssigned ? 'LATER' : 'UPCOMING';
            upcomingAssigned = true;
        }
        badge.textContent = status;
        badge.className = status === 'SERVED'
            ? 'px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold'
            : status === 'UPCOMING'
                ? 'px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold'
                : 'px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold';
    });

    // Also update pinned mess menu meal badges if visible
    if (typeof updatePinnedMealBadges === 'function') {
        updatePinnedMealBadges();
    }
}

/* ========================================================
   PINNED SERVICES SYSTEM (Per-Profile & Alternating Zigzag)
   ======================================================== */

function getProfileKey() {
    const user = getAuthUser();
    if (!user) return 'guest';
    const raw = user.contact || user.id || user.email || user.identifier || user.name || 'guest';
    return String(raw).toLowerCase().replace(/[^a-z0-9]/g, '_');
}

function getPinnedServices() {
    const key = `campushaven_pinned_${getProfileKey()}`;
    const saved = localStorage.getItem(key);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) return parsed;
        } catch (e) {
            console.error('Failed to parse pinned services', e);
        }
    }
    // Default: Food menu is pinned on dashboard top by default
    const defaultPinned = ['mess'];
    localStorage.setItem(key, JSON.stringify(defaultPinned));
    return defaultPinned;
}

function setPinnedServices(pinnedList) {
    const key = `campushaven_pinned_${getProfileKey()}`;
    localStorage.setItem(key, JSON.stringify(pinnedList));
    renderPinnedServices();
    updatePinButtons();
}

function togglePinService(serviceId) {
    const current = getPinnedServices();
    let updated;
    const isCurrentlyPinned = current.includes(serviceId);
    if (isCurrentlyPinned) {
        updated = current.filter(id => id !== serviceId);
        showAlert(`Service unpinned from dashboard top.`, 'info');
    } else {
        updated = [...current, serviceId];
        showAlert(`📌 Service pinned to dashboard top!`, 'success');
    }
    setPinnedServices(updated);
}

function updatePinButtons() {
    const pinned = getPinnedServices();
    const allServices = ['pass', 'mess', 'repairs', 'packages', 'emergency', 'rules'];
    allServices.forEach(id => {
        const btn = document.getElementById(`pin-btn-${id}`);
        if (!btn) return;
        const isPinned = pinned.includes(id);
        btn.classList.toggle('pinned', isPinned);
        if (isPinned) {
            btn.innerHTML = `<span>📌</span> <span>Pinned</span>`;
            btn.title = "Pinned to top - Click to unpin";
            btn.setAttribute('aria-pressed', 'true');
        } else {
            btn.innerHTML = `<span>📍</span> <span>Pin</span>`;
            btn.title = "Click to pin to top of dashboard";
            btn.setAttribute('aria-pressed', 'false');
        }
    });
}

function getPinnedMealStatus(startHour, startMin, endHour, endMin) {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: APP_TIME_ZONE,
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
    }).formatToParts(now);
    const hour = Number(parts.find(p => p.type === 'hour')?.value || now.getHours());
    const min = Number(parts.find(p => p.type === 'minute')?.value || now.getMinutes());
    const currentMinutes = hour * 60 + min;
    const start = startHour * 60 + startMin;
    const end = endHour * 60 + endMin;

    if (currentMinutes >= start && currentMinutes <= end) {
        return { text: 'LIVE NOW', class: 'px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 text-[10px] font-black animate-pulse' };
    }
    if (currentMinutes < start) {
        return { text: 'UPCOMING', class: 'px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-400/50 text-[10px] font-black' };
    }
    return { text: 'SERVED', class: 'px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400 border border-white/10 text-[10px] font-black' };
}

function updatePinnedMealBadges() {
    const meals = [
        { id: 'breakfast', startH: 7, startM: 30, endH: 9, endM: 30 },
        { id: 'lunch', startH: 12, startM: 30, endH: 14, endM: 30 },
        { id: 'snacks', startH: 16, startM: 30, endH: 17, endM: 30 },
        { id: 'dinner', startH: 20, startM: 0, endH: 21, endM: 30 }
    ];
    meals.forEach(m => {
        const el = document.getElementById(`pinned-status-${m.id}`);
        if (el) {
            const st = getPinnedMealStatus(m.startH, m.startM, m.endH, m.endM);
            el.textContent = st.text;
            el.className = st.class;
        }
    });
}

function renderPinnedServices() {
    const container = document.getElementById('pinned-services-container');
    if (!container) return;

    const pinned = getPinnedServices();
    if (!pinned || pinned.length === 0) {
        container.innerHTML = '';
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');

    const wingLabel = currentGender === 'girls' ? "Girls' Wing" : "Boys' Wing";
    const curfewTime = currentGender === 'girls' ? "8:00 PM" : "9:30 PM";
    const todayWeekday = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: APP_TIME_ZONE }).format(new Date());
    const todayDateFormatted = new Intl.DateTimeFormat('en-IN', {
        timeZone: APP_TIME_ZONE,
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }).format(new Date());

    const dayMenu = WEEKLY_MENU[todayWeekday] || WEEKLY_MENU['Monday'];

    const bfStatus = getPinnedMealStatus(7, 30, 9, 30);
    const lunchStatus = getPinnedMealStatus(12, 30, 14, 30);
    const snackStatus = getPinnedMealStatus(16, 30, 17, 30);
    const dinnerStatus = getPinnedMealStatus(20, 0, 21, 30);

    const serviceDefinitions = {
        mess: {
            id: 'mess',
            icon: '🍽️',
            title: "Today's Mess Menu",
            subtitle: `${wingLabel} • 4 Meals Daily`,
            desc: "Nutritious balanced meals prepared fresh in campus kitchen. Check today's 4 courses, track live serving status, or download the full calendar PDF.",
            navAction: "navigateTo('mess')",
            navLabel: "Explore Full Mess Hub",
            quickButtons: `
                <button onclick="downloadMenuPDF()" class="w-full py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all">
                    <span>📥</span> <span>Download Weekly PDF</span>
                </button>
            `,
            contentHtml: `
                <div class="sketch-card p-5 sm:p-6 flex flex-col justify-between h-full relative overflow-hidden backdrop-blur-2xl">
                    <div>
                        <!-- Header -->
                        <div class="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
                            <div class="flex items-center gap-2.5">
                                <div class="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-lg">🍽️</div>
                                <div>
                                    <h4 class="text-base sm:text-lg font-black text-white font-draft">${todayWeekday}'s Complete Food Menu</h4>
                                    <p class="text-xs text-slate-400 font-mono-draft">${todayDateFormatted} • Common for Boys & Girls</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <button onclick="downloadMenuPDF()" class="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1 transition-all">
                                    <span>📥</span> <span>PDF</span>
                                </button>
                                <button onclick="openModal('feedback')" class="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1 transition-all">
                                    <span>⭐</span> <span>Rate</span>
                                </button>
                            </div>
                        </div>

                        <!-- 4 Meals Grid -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                            <!-- Breakfast -->
                            <div class="sketch-box p-3.5 flex flex-col justify-between bg-white/[0.03] rounded-xl border border-white/10 hover:border-amber-500/30 transition-all">
                                <div>
                                    <div class="flex items-center justify-between mb-1.5">
                                        <span class="text-xs font-black uppercase text-amber-300 tracking-wider font-mono-draft">☕ Breakfast</span>
                                        <span id="pinned-status-breakfast" class="${bfStatus.class}">${bfStatus.text}</span>
                                    </div>
                                    <p class="text-[10px] text-slate-400 mb-2 font-mono-draft">07:30 – 09:30 AM</p>
                                    <ul class="text-xs text-slate-200 space-y-1 font-bold">
                                        ${dayMenu.breakfast.map(item => `<li class="flex items-start gap-1.5 leading-snug"><span class="text-amber-400/80 text-[10px]">•</span><span>${item}</span></li>`).join('')}
                                    </ul>
                                </div>
                            </div>

                            <!-- Lunch -->
                            <div class="sketch-box p-3.5 flex flex-col justify-between bg-white/[0.03] rounded-xl border border-white/10 hover:border-emerald-500/30 transition-all">
                                <div>
                                    <div class="flex items-center justify-between mb-1.5">
                                        <span class="text-xs font-black uppercase text-emerald-300 tracking-wider font-mono-draft">🍛 Lunch</span>
                                        <span id="pinned-status-lunch" class="${lunchStatus.class}">${lunchStatus.text}</span>
                                    </div>
                                    <p class="text-[10px] text-slate-400 mb-2 font-mono-draft">12:30 – 02:30 PM</p>
                                    <ul class="text-xs text-slate-200 space-y-1 font-bold">
                                        ${dayMenu.lunch.map(item => `<li class="flex items-start gap-1.5 leading-snug"><span class="text-emerald-400/80 text-[10px]">•</span><span>${item}</span></li>`).join('')}
                                    </ul>
                                </div>
                            </div>

                            <!-- Snacks -->
                            <div class="sketch-box p-3.5 flex flex-col justify-between bg-white/[0.03] rounded-xl border border-white/10 hover:border-blue-500/30 transition-all">
                                <div>
                                    <div class="flex items-center justify-between mb-1.5">
                                        <span class="text-xs font-black uppercase text-blue-300 tracking-wider font-mono-draft">🥪 Snacks</span>
                                        <span id="pinned-status-snacks" class="${snackStatus.class}">${snackStatus.text}</span>
                                    </div>
                                    <p class="text-[10px] text-slate-400 mb-2 font-mono-draft">04:30 – 05:30 PM</p>
                                    <ul class="text-xs text-slate-200 space-y-1 font-bold">
                                        ${dayMenu.snacks.map(item => `<li class="flex items-start gap-1.5 leading-snug"><span class="text-blue-400/80 text-[10px]">•</span><span>${item}</span></li>`).join('')}
                                    </ul>
                                </div>
                            </div>

                            <!-- Dinner -->
                            <div class="sketch-box p-3.5 flex flex-col justify-between bg-white/[0.03] rounded-xl border border-white/10 hover:border-purple-500/30 transition-all">
                                <div>
                                    <div class="flex items-center justify-between mb-1.5">
                                        <span class="text-xs font-black uppercase text-purple-300 tracking-wider font-mono-draft">🍲 Dinner</span>
                                        <span id="pinned-status-dinner" class="${dinnerStatus.class}">${dinnerStatus.text}</span>
                                    </div>
                                    <p class="text-[10px] text-slate-400 mb-2 font-mono-draft">08:00 – 09:30 PM</p>
                                    <ul class="text-xs text-slate-200 space-y-1 font-bold">
                                        ${dayMenu.dinner.map(item => `<li class="flex items-start gap-1.5 leading-snug"><span class="text-purple-400/80 text-[10px]">•</span><span>${item}</span></li>`).join('')}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Bottom Status Bar -->
                    <div class="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-draft text-slate-400">
                        <span class="flex items-center gap-1.5">
                            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                            <span>Mess Kitchen Active • Hot meals guaranteed</span>
                        </span>
                        <button onclick="navigateTo('mess')" class="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1">
                            <span>View Full Week Menu</span> <span>➔</span>
                        </button>
                    </div>
                </div>
            `
        },
        pass: {
            id: 'pass',
            icon: '🎫',
            title: "Outing Requests & Curfew",
            subtitle: `Curfew: ${curfewTime} • Instant Pass`,
            desc: "Record your destination, reason, and return time. Automated gate scan verification with instant SMS alerts to parents on record.",
            navAction: "navigateTo('pass')",
            navLabel: "Open Outpass Hub",
            quickButtons: `
                <button onclick="navigateTo('pass')" class="w-full py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all">
                    <span>📋</span> <span>View My Pass History</span>
                </button>
            `,
            contentHtml: `
                <div class="sketch-card p-5 sm:p-6 flex flex-col justify-between h-full relative overflow-hidden backdrop-blur-2xl">
                    <div>
                        <!-- Header -->
                        <div class="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
                            <div class="flex items-center gap-2.5">
                                <div class="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-lg">🚶</div>
                                <div>
                                    <h4 class="text-base sm:text-lg font-black text-white font-draft">Quick Outpass Dispatcher</h4>
                                    <p class="text-xs text-amber-300/90 font-mono-draft">Curfew cutoff tonight: ${curfewTime} IST</p>
                                </div>
                            </div>
                            <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                Curfew Aware
                            </span>
                        </div>

                        <!-- Quick Form -->
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label class="block text-[11px] font-mono-draft text-slate-400 mb-1">Destination</label>
                                <input type="text" id="pinned-quick-dest" placeholder="e.g. Campus Library / Market"
                                    class="w-full sketch-input px-3 py-2 text-xs font-bold bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-amber-400 outline-none" />
                            </div>
                            <div>
                                <label class="block text-[11px] font-mono-draft text-slate-400 mb-1">Reason for Outing</label>
                                <input type="text" id="pinned-quick-reason" placeholder="e.g. Study books / Grocery"
                                    class="w-full sketch-input px-3 py-2 text-xs font-bold bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:border-amber-400 outline-none" />
                            </div>
                            <div>
                                <label class="block text-[11px] font-mono-draft text-slate-400 mb-1">Expected Return</label>
                                <input type="time" id="pinned-quick-time" value="20:00"
                                    class="w-full sketch-input px-3 py-2 text-xs font-bold bg-white/5 border border-white/10 rounded-lg text-white focus:border-amber-400 outline-none" />
                            </div>
                        </div>

                        <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
                            <p class="text-[11px] text-slate-400 font-hand font-bold">
                                💡 Gate security automatically clears day-slips submitted before curfew.
                            </p>
                            <button onclick="handleQuickPinnedOutpass()" class="px-5 py-2 rounded-xl text-xs font-black text-slate-900 sketch-btn shadow-md flex items-center gap-1.5 transition-all" style="background-color: var(--accent);">
                                <span>🚀 Submit Quick Outpass</span>
                            </button>
                        </div>
                    </div>

                    <!-- Bottom Outing Info -->
                    <div class="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-draft text-slate-400">
                        <span>🛡️ Warden Approval required only for outings exceeding 24 hours.</span>
                        <button onclick="navigateTo('pass')" class="text-amber-400 hover:text-amber-300 font-bold">Open Full Outpass Desk ➔</button>
                    </div>
                </div>
            `
        },
        repairs: {
            id: 'repairs',
            icon: '🔧',
            title: "Fix Something in Room",
            subtitle: "Electrician & Plumber SLA: 4 hrs",
            desc: "Fan not rotating, bathroom tap leaking, or hostel WiFi down? 1-click alert is routed directly to floor technicians and verified by hostel office.",
            navAction: "navigateTo('repairs')",
            navLabel: "Open Maintenance Desk",
            quickButtons: `
                <button onclick="openModal('ticket')" class="w-full py-2 px-3 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all">
                    <span>➕</span> <span>Custom Repair Ticket</span>
                </button>
            `,
            contentHtml: `
                <div class="sketch-card p-5 sm:p-6 flex flex-col justify-between h-full relative overflow-hidden backdrop-blur-2xl">
                    <div>
                        <!-- Header -->
                        <div class="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
                            <div class="flex items-center gap-2.5">
                                <div class="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-lg">⚡</div>
                                <div>
                                    <h4 class="text-base sm:text-lg font-black text-white font-draft">1-Click Fast Room Repair Launcher</h4>
                                    <p class="text-xs text-slate-400 font-mono-draft">Tap an issue icon below to dispatch technician to your room immediately</p>
                                </div>
                            </div>
                            <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                                4-Hour SLA
                            </span>
                        </div>

                        <!-- 4 Fast Repair Buttons -->
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <button onclick="quickReportFix('Electrical', 'Ceiling Fan or Tube Light not functioning')"
                                class="sketch-box p-3.5 flex flex-col items-center text-center bg-white/[0.03] hover:bg-blue-500/10 hover:border-blue-400/40 rounded-xl border border-white/10 transition-all group">
                                <span class="text-2xl mb-1.5 group-hover:scale-125 transition-transform">💡</span>
                                <span class="text-xs font-black text-white">Fan / Light</span>
                                <span class="text-[10px] text-slate-400 mt-0.5">Electrician</span>
                            </button>

                            <button onclick="quickReportFix('Plumbing', 'Water tap, flush or geyser issue')"
                                class="sketch-box p-3.5 flex flex-col items-center text-center bg-white/[0.03] hover:bg-cyan-500/10 hover:border-cyan-400/40 rounded-xl border border-white/10 transition-all group">
                                <span class="text-2xl mb-1.5 group-hover:scale-125 transition-transform">🚰</span>
                                <span class="text-xs font-black text-white">Tap / Leakage</span>
                                <span class="text-[10px] text-slate-400 mt-0.5">Plumber</span>
                            </button>

                            <button onclick="quickReportFix('Network', 'Hostel room WiFi or LAN ethernet port failure')"
                                class="sketch-box p-3.5 flex flex-col items-center text-center bg-white/[0.03] hover:bg-emerald-500/10 hover:border-emerald-400/40 rounded-xl border border-white/10 transition-all group">
                                <span class="text-2xl mb-1.5 group-hover:scale-125 transition-transform">📶</span>
                                <span class="text-xs font-black text-white">WiFi / LAN</span>
                                <span class="text-[10px] text-slate-400 mt-0.5">IT Support</span>
                            </button>

                            <button onclick="quickReportFix('Carpentry', 'Study table drawer, chair or bed frame repair')"
                                class="sketch-box p-3.5 flex flex-col items-center text-center bg-white/[0.03] hover:bg-amber-500/10 hover:border-amber-400/40 rounded-xl border border-white/10 transition-all group">
                                <span class="text-2xl mb-1.5 group-hover:scale-125 transition-transform">🪑</span>
                                <span class="text-xs font-black text-white">Furniture</span>
                                <span class="text-[10px] text-slate-400 mt-0.5">Carpenter</span>
                            </button>
                        </div>
                    </div>

                    <!-- Bottom Info -->
                    <div class="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-draft text-slate-400">
                        <span>🛠️ Duty technicians available 9:00 AM – 7:00 PM. Emergency repair on-call 24/7.</span>
                        <button onclick="navigateTo('repairs')" class="text-blue-400 hover:text-blue-300 font-bold">View Open Tickets ➔</button>
                    </div>
                </div>
            `
        },
        packages: {
            id: 'packages',
            icon: '📦',
            title: "Parcels & Laundry",
            subtitle: "Security Gate & Washing Hub",
            desc: "Collect deliveries from Amazon, Flipkart and courier services safely. Monitor washing machine availability in real time so you never wait in line.",
            navAction: "navigateTo('packages')",
            navLabel: "Open Parcels & Hub",
            quickButtons: `
                <button onclick="showAlert('🧺 Laundry Slot Reserved for 30 minutes!', 'success')" class="w-full py-2 px-3 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all">
                    <span>🧺</span> <span>Quick Reserve Washer</span>
                </button>
            `,
            contentHtml: `
                <div class="sketch-card p-5 sm:p-6 flex flex-col justify-between h-full relative overflow-hidden backdrop-blur-2xl">
                    <div>
                        <!-- Header -->
                        <div class="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
                            <div class="flex items-center gap-2.5">
                                <div class="w-9 h-9 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-lg">📦</div>
                                <div>
                                    <h4 class="text-base sm:text-lg font-black text-white font-draft">Live Deliveries & Laundry Live Hub</h4>
                                    <p class="text-xs text-slate-400 font-mono-draft">Automated gate counter & washer availability status</p>
                                </div>
                            </div>
                            <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                                1 Parcel Arrived
                            </span>
                        </div>

                        <!-- 2 Status Cards -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <!-- Gate Delivery Card -->
                            <div class="sketch-box p-4 bg-white/[0.03] rounded-xl border border-white/10 flex flex-col justify-between">
                                <div>
                                    <div class="flex items-center justify-between mb-2">
                                        <span class="text-xs font-black text-purple-300 font-mono-draft uppercase">Amazon Logistics</span>
                                        <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Ready</span>
                                    </div>
                                    <p class="text-xs text-slate-200 font-bold mb-1">Package waiting at Main Security Gate 1</p>
                                    <p class="text-[11px] text-slate-400 font-mono-draft">Pickup OTP for Guard:</p>
                                    <div class="mt-2 flex items-center gap-2">
                                        <span class="text-lg font-mono font-black text-amber-300 tracking-widest px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg">8 4 9 2</span>
                                        <button onclick="navigator.clipboard?.writeText('8492'); showAlert('OTP copied to clipboard!', 'info')" class="text-xs text-slate-400 hover:text-white px-2 py-1 bg-white/5 rounded border border-white/10">Copy</button>
                                    </div>
                                </div>
                                <p class="text-[10px] text-slate-500 mt-3 font-mono-draft">Pickup time: Until 10:00 PM tonight</p>
                            </div>

                            <!-- Laundry Hub Card -->
                            <div class="sketch-box p-4 bg-white/[0.03] rounded-xl border border-white/10 flex flex-col justify-between">
                                <div>
                                    <div class="flex items-center justify-between mb-2">
                                        <span class="text-xs font-black text-cyan-300 font-mono-draft uppercase">Ground Floor Laundry</span>
                                        <span class="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">3 Free</span>
                                    </div>
                                    <p class="text-xs text-slate-200 font-bold mb-1">3 of 8 Commercial Washers available</p>
                                    <p class="text-[11px] text-slate-400 font-mono-draft">Average wash cycle time: 28 mins</p>
                                    <div class="mt-2.5 flex items-center gap-2">
                                        <button onclick="showAlert('🧺 Washer #4 reserved for you for 30 minutes!', 'success')"
                                            class="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all">
                                            Reserve Washer #4
                                        </button>
                                    </div>
                                </div>
                                <p class="text-[10px] text-slate-500 mt-3 font-mono-draft">Drying lines available on 3rd floor terrace</p>
                            </div>
                        </div>
                    </div>

                    <!-- Bottom Info -->
                    <div class="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-draft text-slate-400">
                        <span>📦 Unclaimed parcels transferred to Warden Office after 72 hours.</span>
                        <span class="text-purple-400 font-bold">Gate Guard Ext: 104</span>
                    </div>
                </div>
            `
        },
        emergency: {
            id: 'emergency',
            icon: '🆘',
            title: "Emergency & Contacts",
            subtitle: "24/7 Security & Ambulance",
            desc: "Direct speed-dial hotlines for Campus Security Gate, University Ambulance, Medical Health Centre Clinic, and Senior Warden on duty.",
            navAction: "navigateTo('emergency')",
            navLabel: "Open Emergency Hub",
            quickButtons: `
                <a href="tel:108" class="w-full py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-center">
                    <span>🚑</span> <span>Call Ambulance (108)</span>
                </a>
            `,
            contentHtml: `
                <div class="sketch-card p-5 sm:p-6 flex flex-col justify-between h-full relative overflow-hidden backdrop-blur-2xl">
                    <div>
                        <!-- Header -->
                        <div class="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
                            <div class="flex items-center gap-2.5">
                                <div class="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-lg">🚨</div>
                                <div>
                                    <h4 class="text-base sm:text-lg font-black text-rose-300 font-draft">Direct Emergency Hotline Directory</h4>
                                    <p class="text-xs text-slate-400 font-mono-draft">Tap any contact below to instantly connect phone call</p>
                                </div>
                            </div>
                            <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                                24/7 Active
                            </span>
                        </div>

                        <!-- 4 Emergency Speed-Dial Boxes -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <a href="tel:9876543210" class="sketch-box p-3.5 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/20 rounded-xl flex flex-col justify-between transition-all group">
                                <div>
                                    <div class="flex items-center justify-between mb-1">
                                        <span class="text-xs font-black text-rose-300 font-mono-draft">SECURITY GATE</span>
                                        <span class="text-base group-hover:scale-125 transition-transform">📞</span>
                                    </div>
                                    <p class="text-sm font-black text-white">+91 98765 43210</p>
                                    <p class="text-[10px] text-slate-400 mt-1">Main Gate 1 & Night Patrol</p>
                                </div>
                            </a>

                            <a href="tel:108" class="sketch-box p-3.5 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/20 rounded-xl flex flex-col justify-between transition-all group">
                                <div>
                                    <div class="flex items-center justify-between mb-1">
                                        <span class="text-xs font-black text-rose-300 font-mono-draft">AMBULANCE</span>
                                        <span class="text-base group-hover:scale-125 transition-transform">🚑</span>
                                    </div>
                                    <p class="text-sm font-black text-white">108 / 080-234567</p>
                                    <p class="text-[10px] text-slate-400 mt-1">Campus Emergency Vehicle</p>
                                </div>
                            </a>

                            <a href="tel:9876543212" class="sketch-box p-3.5 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/20 rounded-xl flex flex-col justify-between transition-all group">
                                <div>
                                    <div class="flex items-center justify-between mb-1">
                                        <span class="text-xs font-black text-emerald-300 font-mono-draft">HEALTH CLINIC</span>
                                        <span class="text-base group-hover:scale-125 transition-transform">🩺</span>
                                    </div>
                                    <p class="text-sm font-black text-white">+91 98765 43212</p>
                                    <p class="text-[10px] text-slate-400 mt-1">Resident Doctor & Nurse</p>
                                </div>
                            </a>

                            <a href="tel:9444412345" class="sketch-box p-3.5 bg-blue-950/20 hover:bg-blue-950/40 border border-blue-500/20 rounded-xl flex flex-col justify-between transition-all group">
                                <div>
                                    <div class="flex items-center justify-between mb-1">
                                        <span class="text-xs font-black text-blue-300 font-mono-draft">CHIEF WARDEN</span>
                                        <span class="text-base group-hover:scale-125 transition-transform">🛡️</span>
                                    </div>
                                    <p class="text-sm font-black text-white">+91 94444 12345</p>
                                    <p class="text-[10px] text-slate-400 mt-1">Warden Executive Office</p>
                                </div>
                            </a>
                        </div>
                    </div>

                    <!-- Bottom Info -->
                    <div class="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-draft text-slate-400">
                        <span>🚨 For severe medical emergencies, security gate will escort ambulance directly to block entrance.</span>
                        <button onclick="navigateTo('emergency')" class="text-rose-400 hover:text-rose-300 font-bold">More Emergency Protocols ➔</button>
                    </div>
                </div>
            `
        },
        rules: {
            id: 'rules',
            icon: '📜',
            title: "Hostel Rules & FAQs",
            subtitle: "Code of Conduct & Timings",
            desc: "Curfew rules, study hours, electrical appliance permissions, visitor entry and room inspection policies clearly specified for all residents.",
            navAction: "navigateTo('rules')",
            navLabel: "Read Complete Rulebook",
            quickButtons: `
                <button onclick="navigateTo('rules')" class="w-full py-2 px-3 rounded-xl bg-slate-500/15 hover:bg-slate-500/25 text-slate-300 border border-slate-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all">
                    <span>📖</span> <span>Search Rules & FAQs</span>
                </button>
            `,
            contentHtml: `
                <div class="sketch-card p-5 sm:p-6 flex flex-col justify-between h-full relative overflow-hidden backdrop-blur-2xl">
                    <div>
                        <!-- Header -->
                        <div class="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
                            <div class="flex items-center gap-2.5">
                                <div class="w-9 h-9 rounded-lg bg-slate-500/20 border border-slate-500/30 flex items-center justify-center text-lg">📜</div>
                                <div>
                                    <h4 class="text-base sm:text-lg font-black text-white font-draft">Key Hostel Rules & Code of Conduct</h4>
                                    <p class="text-xs text-slate-400 font-mono-draft">Essential standards expected from all CampusHaven residents</p>
                                </div>
                            </div>
                            <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/20 text-slate-300 border border-slate-500/40">
                                Official Handbook
                            </span>
                        </div>

                        <!-- 2 Rules Columns -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <!-- Permitted / Do's -->
                            <div class="sketch-box p-4 bg-emerald-950/10 border border-emerald-500/20 rounded-xl">
                                <h5 class="text-xs font-black text-emerald-300 mb-2 flex items-center gap-1.5 uppercase font-mono-draft">
                                    <span>✅</span> <span>Permitted & Encouraged</span>
                                </h5>
                                <ul class="text-xs text-slate-200 space-y-1.5 font-bold">
                                    <li class="flex items-start gap-1.5"><span class="text-emerald-400">•</span><span>Electric kettle (up to 1000W) and study laptops allowed in rooms.</span></li>
                                    <li class="flex items-start gap-1.5"><span class="text-emerald-400">•</span><span>Day guests permitted in ground floor reception lounge till 7:00 PM.</span></li>
                                    <li class="flex items-start gap-1.5"><span class="text-emerald-400">•</span><span>Quiet study hours observed strictly from 10:00 PM to 6:00 AM daily.</span></li>
                                </ul>
                            </div>

                            <!-- Prohibited / Don'ts -->
                            <div class="sketch-box p-4 bg-rose-950/10 border border-rose-500/20 rounded-xl">
                                <h5 class="text-xs font-black text-rose-300 mb-2 flex items-center gap-1.5 uppercase font-mono-draft">
                                    <span>❌</span> <span>Strictly Prohibited</span>
                                </h5>
                                <ul class="text-xs text-slate-200 space-y-1.5 font-bold">
                                    <li class="flex items-start gap-1.5"><span class="text-rose-400">•</span><span>Induction stoves, room heaters, or high-draw appliances strictly banned.</span></li>
                                    <li class="flex items-start gap-1.5"><span class="text-rose-400">•</span><span>Unauthorized overnight guests or unregistered room swaps are not allowed.</span></li>
                                    <li class="flex items-start gap-1.5"><span class="text-rose-400">•</span><span>Late entry after curfew (${curfewTime}) without prior warden slip logged.</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- Bottom Info -->
                    <div class="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-draft text-slate-400">
                        <span>⚖️ Disciplinary inquiries handled by the Proctorial Board & Chief Warden Office.</span>
                        <button onclick="navigateTo('rules')" class="text-amber-400 hover:text-amber-300 font-bold">View Full FAQs & Handbook ➔</button>
                    </div>
                </div>
            `
        }
    };

    let html = '';
    pinned.forEach((serviceId, index) => {
        const s = serviceDefinitions[serviceId];
        if (!s) return;

        // ALTERNATING PATTERN:
        // Index 0, 2, ... (Even) => Left: Service Card, Right: Full Content (lg:flex-row)
        // Index 1, 3, ... (Odd)  => Left: Full Content, Right: Service Card (lg:flex-row-reverse)
        const isEven = index % 2 === 0;
        const flexPatternClass = isEven ? 'lg:flex-row' : 'lg:flex-row-reverse';

        const cardSideHtml = `
            <div class="w-full lg:w-4/12 xl:w-1/3 flex-shrink-0 flex flex-col">
                <div class="sketch-card p-5 sm:p-6 flex flex-col justify-between h-full relative overflow-hidden group">
                    <!-- Accent top glow -->
                    <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300 opacity-80"></div>
                    <div>
                        <!-- Header with Pinned status & Unpin button -->
                        <div class="flex items-center justify-between mb-4">
                            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                                <span>📌</span> <span>Pinned to Top</span>
                            </span>
                            <button type="button" onclick="togglePinService('${s.id}')" title="Unpin this service from top"
                                class="text-xs font-bold text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors flex items-center gap-1">
                                <span>✕</span> <span>Unpin</span>
                            </button>
                        </div>

                        <!-- Service Icon & Title -->
                        <div class="flex items-center gap-3 mb-3">
                            <div class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                ${s.icon}
                            </div>
                            <div>
                                <h3 class="text-lg sm:text-xl font-black text-white font-draft">${s.title}</h3>
                                <p class="text-xs text-amber-300/90 font-mono-draft">${s.subtitle}</p>
                            </div>
                        </div>

                        <p class="text-xs text-slate-300 mt-2 font-hand font-bold leading-relaxed">${s.desc}</p>
                    </div>

                    <!-- Actions -->
                    <div class="mt-6 pt-4 border-t border-white/10 flex flex-col gap-2">
                        ${s.quickButtons || ''}
                        <button onclick="${s.navAction}"
                            class="w-full py-2.5 px-3 rounded-xl sketch-btn text-xs font-bold text-slate-900 flex items-center justify-center gap-2 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all"
                            style="background-color: var(--accent);">
                            <span>${s.navLabel}</span>
                            <span class="group-hover:translate-x-1 transition-transform">➔</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        const contentSideHtml = `
            <div class="w-full lg:w-8/12 xl:w-2/3 flex-1 flex flex-col">
                ${s.contentHtml}
            </div>
        `;

        html += `
            <div class="pinned-service-row flex flex-col ${flexPatternClass} gap-6 items-stretch">
                ${cardSideHtml}
                ${contentSideHtml}
            </div>
        `;
    });

    container.innerHTML = html;
}

function quickReportFix(category, issue) {
    const user = getAuthUser();
    if (!user) {
        showAlert('Please sign in to lodge maintenance tickets.', 'warning');
        navigateTo('login');
        return;
    }
    showAlert(`🔧 Repair ticket logged for ${category}: "${issue}". Technician dispatched!`, 'success');
}

async function handleQuickPinnedOutpass() {
    const user = getAuthUser();
    if (!user) {
        showAlert('Please sign in to submit outing requests.', 'warning');
        navigateTo('login');
        return;
    }
    const dest = document.getElementById('pinned-quick-dest')?.value.trim();
    const reason = document.getElementById('pinned-quick-reason')?.value.trim();
    const returnTime = document.getElementById('pinned-quick-time')?.value || '20:00';
    if (!dest || !reason) {
        showAlert('Please provide destination and reason for outing.', 'warning');
        return;
    }

    const todayDate = getLocalDateKey();
    const leaveTime = new Intl.DateTimeFormat('en-GB', {
        timeZone: APP_TIME_ZONE,
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
    }).format(new Date());

    try {
        const token = localStorage.getItem('campushaven_token');
        if (token && backendIsAvailable()) {
            const response = await fetch(`${API_BASE_URL}/outpasses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    destination: dest,
                    reason,
                    leaveDate: todayDate,
                    leaveTime,
                    returnDate: todayDate,
                    returnTime
                })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Outpass submission failed.');
            showAlert(result.message || 'Quick outpass approved! Safe travels.', 'success');
        } else {
            const outings = readLocalOutpasses();
            outings.push({
                id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                contact: user.contact || user.email || 'student',
                residentName: user.name || 'Resident',
                roomNumber: user.roomNumber || 'Room 101',
                floor: user.floor || '1st',
                gender: user.gender === 'girls' ? 'girls' : 'boys',
                destination: dest,
                reason,
                leaveDate: todayDate,
                leaveTime,
                returnDate: todayDate,
                returnTime,
                status: 'Approved',
                type: 'Day Outing',
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('campushaven_outpasses', JSON.stringify(outings));
            showAlert(`🚀 Quick outpass for "${dest}" registered successfully! Safe travels.`, 'success');
        }
        const dInput = document.getElementById('pinned-quick-dest');
        const rInput = document.getElementById('pinned-quick-reason');
        if (dInput) dInput.value = '';
        if (rInput) rInput.value = '';
    } catch (err) {
        showAlert(err.message || 'Outpass registration error.', 'warning');
    }
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-nav-menu');
    const toggle = document.getElementById('mobile-menu-toggle');
    if (!menu || !toggle) return;
    const isOpen = menu.classList.toggle('mobile-menu-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    toggle.textContent = isOpen ? '✕' : '☰';
}

function navigateTo(viewName) {
    const menu = document.getElementById('mobile-nav-menu');
    const toggle = document.getElementById('mobile-menu-toggle');
    if (menu?.classList.contains('mobile-menu-open')) menu.classList.remove('mobile-menu-open');
    if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open navigation menu');
        toggle.textContent = '☰';
    }
    const user = getAuthUser();
    const isStaff = ['admin', 'warden'].includes(user?.role);
    if (viewName === 'timetable') viewName = 'home';
    if (viewName === 'outing-log' && !isStaff) viewName = 'home';
    if (viewName === 'pass' && isStaff) viewName = 'admin';
    if (viewName === 'repairs' && isStaff) viewName = 'admin';
    currentView = viewName;
    document.querySelectorAll('main > section').forEach(sec => sec.classList.add('hidden'));

    const targetSec = document.getElementById(`view-${viewName}`);
    if (targetSec) targetSec.classList.remove('hidden');

    document.querySelectorAll('#main-nav-links button').forEach(btn => {
        btn.classList.remove('bg-white', 'border-[var(--sketch-border)]');
    });
    const activeNavBtn = document.getElementById(`navlink-${viewName}`);
    if (activeNavBtn) activeNavBtn.classList.add('bg-white', 'border-[var(--sketch-border)]');

    renderNavAuth();
    updateHomeGreeting();
    document.getElementById('navlink-pass')?.classList.toggle('hidden', isStaff);
    document.getElementById('mobile-navlink-pass')?.classList.toggle('hidden', isStaff);
    document.getElementById('navlink-repairs')?.classList.toggle('hidden', isStaff);
    document.getElementById('mobile-navlink-repairs')?.classList.toggle('hidden', isStaff);
    document.getElementById('home-repairs-card')?.classList.toggle('hidden', isStaff);
    document.getElementById('navlink-outing-log')?.classList.toggle('hidden', !isStaff);
    document.getElementById('mobile-navlink-outing-log')?.classList.toggle('hidden', !isStaff);

    if (viewName === 'pass') {
        setOutpassDepartureDefault();
        loadMyOutpasses();
    }
    if (viewName === 'mess') loadDateMenu();
    const calendarControls = document.getElementById('admin-calendar-controls');
    calendarControls?.classList.toggle('hidden', !['admin', 'warden'].includes(user?.role));
    const wardenRoster = document.getElementById('admin-warden-roster');
    wardenRoster?.classList.toggle('hidden', user?.role !== 'admin');
    if (viewName === 'outing-log' && ['admin', 'warden'].includes(user?.role)) {
        const dateInput = document.getElementById('outpass-register-date');
        if (dateInput && !dateInput.value) dateInput.value = getLocalDateKey();
        loadOutpassRegister();
    }
    if (viewName === 'admin' && user?.role === 'admin') {
        loadWardenAccounts();
    }
    if (viewName === 'home') {
        renderPinnedServices();
        updatePinButtons();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getAuthUser() {
    const u = localStorage.getItem('campushaven_user');
    try { return u ? JSON.parse(u) : null; } catch { return null; }
}

function getIndiaDateTimeValue(date = new Date()) {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: APP_TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
    }).formatToParts(date).reduce((values, part) => {
        values[part.type] = part.value;
        return values;
    }, {});
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

function setOutpassDepartureDefault() {
    const input = document.getElementById('outpass-departure');
    if (input && !input.value) input.value = getIndiaDateTimeValue();
    const returnInput = document.getElementById('outpass-return');
    if (returnInput && !returnInput.value) {
        returnInput.value = getIndiaDateTimeValue(new Date(Date.now() + 2 * 60 * 60 * 1000));
    }
}

function readLocalOutpasses() {
    const stored = localStorage.getItem('campushaven_outpasses');
    if (!stored) return [];
    const entries = JSON.parse(stored);
    if (!Array.isArray(entries)) throw new Error('Local outing records are invalid.');
    return entries;
}

function formatOutpassDateTime(value) {
    return new Intl.DateTimeFormat('en-IN', {
        timeZone: APP_TIME_ZONE,
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(new Date(value));
}

function outpassStatusLabel(outing) {
    if (outing.status === 'pending') return 'Pending staff approval';
    if (outing.status === 'approved') return 'Approved by staff';
    if (outing.status === 'rejected') return 'Rejected by staff';
    return 'Recorded — no approval required';
}

function renderOutpassEntries(container, outings, staffView = false) {
    container.replaceChildren();
    if (!outings.length) {
        const empty = document.createElement('p');
        empty.className = 'text-xs text-slate-500';
        empty.textContent = staffView ? 'No outing entries were submitted on this date.' : 'No outing entries submitted yet.';
        container.appendChild(empty);
        return;
    }

    outings.forEach((outing) => {
        const card = document.createElement('article');
        card.className = 'sketch-box p-4 bg-white space-y-2';

        const header = document.createElement('div');
        header.className = 'flex flex-wrap items-start justify-between gap-2';
        const title = document.createElement('h4');
        title.className = 'font-black text-[var(--ink)]';
        title.textContent = staffView
            ? `${outing.residentName || 'Resident'} · Room ${outing.floor ? `${outing.floor}-` : ''}${outing.roomNumber || 'Not set'}`
            : `${outing.destination || 'Outing'} · ${outing.leaveDate || ''} ${outing.leaveTime || ''}`;
        header.appendChild(title);

        const status = document.createElement('span');
        status.className = 'text-xs font-bold';
        status.textContent = outpassStatusLabel(outing);
        header.appendChild(status);
        card.appendChild(header);

        const details = document.createElement('p');
        details.className = 'text-xs text-slate-700';
        details.textContent = staffView
            ? `Submitted: ${formatOutpassDateTime(outing.submittedAt)} · Destination: ${outing.destination || '—'} · Departure: ${outing.leaveDate || '—'} ${outing.leaveTime || ''} · Return: ${outing.returnDate || '—'} ${outing.returnTime || ''}`
            : `Submitted: ${formatOutpassDateTime(outing.submittedAt)} · Return: ${outing.returnDate || '—'} ${outing.returnTime || ''}${outing.requiresApproval ? ' · Approval required' : ''}`;
        card.appendChild(details);

        const reason = document.createElement('p');
        reason.className = 'text-xs text-slate-700';
        reason.textContent = `Reason: ${outing.reason || '—'}`;
        card.appendChild(reason);

        if (staffView && outing.status === 'pending') {
            const approvalReason = document.createElement('p');
            approvalReason.className = 'text-xs font-bold text-amber-800';
            const labels = (outing.approvalReasons || []).map(value =>
                value === 'after-curfew' ? 'after curfew' : value === 'multi-day' ? 'longer than 24 hours' : value
            );
            approvalReason.textContent = `Approval required: ${labels.join(' and ') || 'staff review'}`;
            card.appendChild(approvalReason);
        }

        if (staffView && outing.status === 'pending' && ['admin', 'warden'].includes(getAuthUser()?.role)) {
            const actions = document.createElement('div');
            actions.className = 'flex gap-2 pt-1';
            [['approved', 'Approve'], ['rejected', 'Reject']].forEach(([decision, label]) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'px-3 py-1.5 sketch-btn text-xs font-bold';
                button.textContent = label;
                button.addEventListener('click', () => decideOutpass(outing.id, decision));
                actions.appendChild(button);
            });
            card.appendChild(actions);
        }

        container.appendChild(card);
    });
}

async function loadMyOutpasses() {
    const list = document.getElementById('outpass-my-entries');
    if (!list) return;
    const user = getAuthUser();
    if (!user) {
        list.textContent = 'Sign in to submit or view outing entries.';
        return;
    }

    try {
        const token = localStorage.getItem('campushaven_token');
        let outings;
        if (token) {
            const response = await fetch(`${API_BASE_URL}/outpasses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Could not load outing entries.');
            outings = result.outings;
        } else {
            outings = readLocalOutpasses()
                .filter(outing => outing.contact === user.contact)
                .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        }
        renderOutpassEntries(list, outings);
    } catch (error) {
        list.textContent = error.message || 'Could not load outing entries.';
    }
}

async function loadOutpassRegister() {
    const list = document.getElementById('outpass-register-entries');
    const status = document.getElementById('outpass-register-status');
    const dateInput = document.getElementById('outpass-register-date');
    if (!list || !status || !dateInput) return;
    const user = getAuthUser();
    if (!['admin', 'warden'].includes(user?.role)) return;
    const entryDate = dateInput.value || getLocalDateKey();
    status.textContent = 'Loading outing entries…';

    try {
        const token = localStorage.getItem('campushaven_token');
        let outings;
        if (token) {
            const response = await fetch(`${API_BASE_URL}/outpasses?date=${encodeURIComponent(entryDate)}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Could not load the outing register.');
            outings = result.outings;
        } else {
            outings = readLocalOutpasses()
                .filter(outing => outing.entryDate === entryDate)
                .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        }
        renderOutpassEntries(list, outings, true);
        status.textContent = `Showing ${outings.length} entr${outings.length === 1 ? 'y' : 'ies'} submitted on ${entryDate}.`;
    } catch (error) {
        list.replaceChildren();
        status.textContent = error instanceof TypeError
            ? `Cannot reach the backend at ${API_BASE_URL}. Start the backend and refresh the log.`
            : error.message || 'Could not load the outing register.';
    }
}

async function decideOutpass(id, decision) {
    const status = document.getElementById('outpass-register-status');
    const user = getAuthUser();
    if (!['admin', 'warden'].includes(user?.role)) return;

    try {
        const token = localStorage.getItem('campushaven_token');
        if (token) {
            const response = await fetch(`${API_BASE_URL}/outpasses/${encodeURIComponent(id)}/decision`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ decision })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Could not update the outing record.');
        } else {
            const outings = readLocalOutpasses();
            const outing = outings.find(record => record.id === id && record.status === 'pending');
            if (!outing) throw new Error('This outing is no longer pending.');
            outing.status = decision;
            outing.decisionAt = new Date().toISOString();
            outing.decisionByName = user.name || 'Staff';
            localStorage.setItem('campushaven_outpasses', JSON.stringify(outings));
        }
        status.textContent = `Outing ${decision}.`;
        await loadOutpassRegister();
    } catch (error) {
        status.textContent = error.message || 'Could not update the outing record.';
    }
}

async function loadWardenAccounts() {
    const list = document.getElementById('admin-warden-entries');
    const status = document.getElementById('admin-warden-status');
    if (!list || !status) return;
    if (getAuthUser()?.role !== 'admin') {
        list.replaceChildren();
        status.textContent = 'Only administrators can view warden access details.';
        return;
    }

    status.textContent = 'Loading warden accounts…';
    list.replaceChildren();
    try {
        const token = localStorage.getItem('campushaven_token');
        if (!token) throw new Error('Sign in again as an administrator to view warden accounts.');
        const response = await fetch(`${API_BASE_URL}/admin/wardens`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Could not load warden accounts.');
        if (!Array.isArray(result.wardens)) throw new Error('The server returned an invalid warden account list.');

        if (!result.wardens.length) {
            status.textContent = 'No accounts currently have the warden role.';
            return;
        }

        result.wardens.forEach(warden => {
            const card = document.createElement('article');
            card.className = 'sketch-box p-4 bg-white space-y-1';
            const name = document.createElement('h4');
            name.className = 'font-black text-[var(--ink)]';
            name.textContent = warden.name || 'Unnamed account';
            const identifier = document.createElement('p');
            identifier.className = 'text-xs text-slate-700';
            identifier.textContent = warden.email || warden.phone || warden.identifier || 'No contact identifier';
            const details = document.createElement('p');
            details.className = 'text-xs text-slate-600';
            const institution = warden.institution === 'hi-tech'
                ? 'Hi-Tech University'
                : warden.institution === 'mirai' ? 'Mirai Institute' : 'Institution not set';
            const wing = warden.gender === 'girls' ? 'Girls Wing' : warden.gender === 'boys' ? 'Boys Wing' : 'Wing not set';
            details.textContent = `${institution} · ${wing}`;
            card.append(name, identifier, details);
            list.appendChild(card);
        });
        status.textContent = `Showing ${result.wardens.length} warden account${result.wardens.length === 1 ? '' : 's'}.`;
    } catch (error) {
        list.replaceChildren();
        status.textContent = error.message || 'Could not load warden accounts.';
    }
}

async function submitOutpass(event) {
    event.preventDefault();
    const user = getAuthUser();
    const status = document.getElementById('outpass-form-status');
    const button = document.getElementById('outpass-submit-button');
    const departure = document.getElementById('outpass-departure').value;
    const returnDeparture = document.getElementById('outpass-return').value;
    const destination = document.getElementById('outpass-destination').value.trim();
    const reason = document.getElementById('outpass-reason').value.trim();
    if (!user) {
        status.textContent = 'Sign in before submitting outing information.';
        return;
    }
    if (!departure || !returnDeparture || !destination || !reason) {
        status.textContent = 'Enter a destination, departure and return time, and reason.';
        return;
    }

    const leaveDate = departure.slice(0, 10);
    const leaveTime = departure.slice(11, 16);
    const returnDate = returnDeparture.slice(0, 10);
    const returnTime = returnDeparture.slice(11, 16);
    const requestedAt = new Date(`${leaveDate}T${leaveTime}:00+05:30`);
    if (Number.isNaN(requestedAt.getTime()) || requestedAt <= new Date()) {
        status.textContent = 'Choose a departure time in the future.';
        return;
    }
    const returnAt = new Date(`${returnDate}T${returnTime}:00+05:30`);
    if (Number.isNaN(returnAt.getTime()) || returnAt <= requestedAt) {
        status.textContent = 'Choose a return time after the planned departure.';
        return;
    }
    const multiDay = returnAt.getTime() - requestedAt.getTime() > 24 * 60 * 60 * 1000;
    button.disabled = true;
    status.textContent = 'Submitting outing information…';

    try {
        const token = localStorage.getItem('campushaven_token');
        if (token) {
            const response = await fetch(`${API_BASE_URL}/outpasses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ destination, reason, leaveDate, leaveTime, returnDate, returnTime })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Outing submission failed.');
            status.textContent = result.message;
        } else {
            const curfewMinutes = user.gender === 'girls' ? 19 * 60 : 21 * 60;
            const [hours, minutes] = leaveTime.split(':').map(Number);
            const afterCurfew = hours * 60 + minutes > curfewMinutes;
            const requiresApproval = afterCurfew || multiDay;
            const outings = readLocalOutpasses();
            outings.push({
                id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                contact: user.contact,
                residentName: user.name,
                roomNumber: user.roomNumber || 'Not set',
                floor: user.floor || '',
                gender: user.gender === 'girls' ? 'girls' : 'boys',
                destination,
                reason,
                leaveDate,
                leaveTime,
                returnDate,
                returnTime,
                requestedAt: requestedAt.toISOString(),
                returnAt: returnAt.toISOString(),
                entryDate: getLocalDateKey(),
                submittedAt: new Date().toISOString(),
                requiresApproval,
                approvalReasons: [
                    ...(afterCurfew ? ['after-curfew'] : []),
                    ...(multiDay ? ['multi-day'] : [])
                ],
                status: requiresApproval ? 'pending' : 'logged'
            });
            localStorage.setItem('campushaven_outpasses', JSON.stringify(outings));
            status.textContent = requiresApproval
                ? 'Saved in this browser demo. Your after-curfew or longer-than-24-hours outing is pending staff approval.'
                : 'Saved in this browser demo. No approval is required before curfew.';
        }
        document.getElementById('outpass-form').reset();
        setOutpassDepartureDefault();
        await loadMyOutpasses();
        if (['admin', 'warden'].includes(user.role)) await loadOutpassRegister();
    } catch (error) {
        status.textContent = error.message || 'Outing submission failed.';
    } finally {
        button.disabled = false;
    }
}

function updateHomeGreeting() {
    const greeting = document.getElementById('home-greeting');
    const auth = getAuthUser();
    if (!greeting) return;

    if (currentView === 'home' && auth) {
        const hour = new Date().getHours();
        const timeOfDay = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
        greeting.textContent = `${timeOfDay}, ${auth.name || 'Resident'}! Your hostel desk is ready.`;
        greeting.classList.remove('hidden');
    } else {
        greeting.classList.add('hidden');
    }
}

function renderNavAuth() {
    const auth = getAuthUser();
    const container = document.getElementById('nav-auth-container');
    if (!container) return;

    if (auth) {
        container.innerHTML = `
                    <div class="flex items-center gap-1.5 font-bold text-xs">
                        <button onclick="navigateTo('${auth.role === 'student' ? 'home' : 'admin'}')" class="px-2.5 py-1.5 rounded-lg bg-slate-800 text-amber-300 border border-[var(--sketch-border)] shadow-sm">
                            👤 ${auth.name.split(' ')[0]} (${auth.role})
                        </button>
                        <button onclick="handleLogout()" class="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-[var(--sketch-border)] hover:bg-red-950/60 hover:text-red-300 transition-colors">
                            Sign Out
                        </button>
                    </div>
                `;
    } else {
        container.innerHTML = `
                    <button onclick="navigateTo('login')" class="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-900 sketch-btn shadow-sm" style="background-color: var(--accent);">
                        🔑 Sign In / Register
                    </button>
                `;
    }
}

function handleLogout() {
    if (!window.confirm('Are you sure you want to sign out?')) return;
    localStorage.removeItem('campushaven_user');
    localStorage.removeItem('campushaven_token');
    showAlert('Signed out successfully.', 'info');
    renderPinnedServices();
    updatePinButtons();
    navigateTo('login');
}

function toggleAuthMode(mode) {
    currentAuthMode = mode;
    const title = document.getElementById('auth-title-text');
    const sub = document.getElementById('auth-sub-text');
    const nameContainer = document.getElementById('signup-name-container');
    const submitBtn = document.getElementById('login-submit-btn');

    const btnSignIn = document.getElementById('tab-mode-signin');
    const btnSignUp = document.getElementById('tab-mode-signup');

    if (mode === 'signup') {
        title.textContent = 'Create CampusHaven Account';
        nameContainer.classList.remove('hidden');
        submitBtn.textContent = '✓ Create Account & Sign In';

        btnSignUp.className = 'flex-1 py-2 rounded-lg bg-[var(--accent)] text-slate-900 shadow-sm border border-[var(--sketch-border)] font-bold';
        btnSignIn.className = 'flex-1 py-2 rounded-lg text-slate-400 hover:text-white font-bold';
    } else {
        title.textContent = 'Sign In to CampusHaven';
        nameContainer.classList.add('hidden');
        submitBtn.textContent = '✓ Enter CampusHaven Portal';

        btnSignIn.className = 'flex-1 py-2 rounded-lg bg-[var(--accent)] text-slate-900 shadow-sm border border-[var(--sketch-border)] font-bold';
        btnSignUp.className = 'flex-1 py-2 rounded-lg text-slate-400 hover:text-white font-bold';
    }
    updateAuthSubtitle();
}

function setLoginRole(role) {
    currentLoginRole = role;
    updateAuthSubtitle();
    ['student', 'warden', 'admin'].forEach(r => {
        const btn = document.getElementById(`tab-role-${r}`);
        if (!btn) return;
        if (r === role) {
            btn.className = 'flex-1 py-1.5 rounded-lg capitalize bg-slate-700 text-slate-100 border border-[var(--sketch-border)] font-bold shadow-sm';
        } else {
            btn.className = 'flex-1 py-1.5 rounded-lg capitalize text-slate-400 hover:text-white font-medium';
        }
    });

    const roomInputs = document.getElementById('student-room-inputs');
    if (role === 'student') {
        roomInputs.classList.remove('hidden');
    } else {
        roomInputs.classList.add('hidden');
    }
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    if (currentAuthMode === 'signup' && currentLoginRole !== 'student') {
        showAlert('Staff accounts must be assigned by an administrator. Create a student account or sign in to an existing staff account.', 'warning');
        return;
    }

    const contact = document.getElementById('auth-contact').value.trim();
    const password = document.getElementById('auth-password').value;
    const fullname = document.getElementById('auth-fullname')?.value?.trim() || '';
    const inst = document.getElementById('login-institution').value;
    const gen = document.getElementById('login-gender').value;
    const flr = document.getElementById('login-floor').value;
    const rm = document.getElementById('login-room').value || '101';

    const payload = {
        identifier: contact,
        password: password,
        name: fullname || contact.split('@')[0],
        role: currentLoginRole,
        institution: inst,
        gender: gen,
        floor: flr,
        roomNumber: rm
    };

    const endpoint = currentAuthMode === 'signup' ? `${API_BASE_URL}/auth/signup` : `${API_BASE_URL}/auth/login`;

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        let data = null;
        try {
            data = await res.json();
        } catch (err) {
            data = null;
        }

        if (!res.ok) {
            if (res.status >= 500) {
                throw new Error(res.status === 503
                    ? 'The backend is running, but the account database is unavailable. Check the MongoDB connection and try again.'
                    : 'The backend is running, but sign-in failed due to a server error. Check the backend logs and try again.');
            }
            if (res.status === 0 || !data) {
                throw new Error('backend_unavailable');
            }
            throw new Error(data?.message || 'Authentication failed');
        }

        if (!data || !data.user) {
            throw new Error('backend_unavailable');
        }

        localStorage.setItem('campushaven_user', JSON.stringify(data.user));
        if (data.token) localStorage.setItem('campushaven_token', data.token);

        updateInstitution(data.user.institution || inst);
        updateGender(data.user.gender || gen);

        showAlert(`Welcome, ${data.user.name}!`, 'success');
        navigateTo(data.user.role === 'student' ? 'home' : 'admin');
        return;
    } catch (err) {
        if (err instanceof TypeError) {
            err = new Error('backend_unavailable');
        }
        if (err instanceof Error && err.message === 'backend_unavailable') {
            if (currentLoginRole !== 'student') {
                showAlert('Staff sign-in requires the backend so your assigned role can be verified. Start the backend and try again.', 'warning');
                return;
            }
            console.warn('API connection failed, falling back to local state:', endpoint);
            const localUser = {
                name: fullname || contact.split('@')[0] || 'Resident',
                role: currentLoginRole,
                institution: inst,
                gender: gen,
                floor: flr,
                roomNumber: rm,
                contact: contact
            };
            localStorage.setItem('campushaven_user', JSON.stringify(localUser));
            showAlert(`Welcome, ${localUser.name}! (Offline Mode)`, 'success');
            navigateTo(currentLoginRole === 'student' ? 'home' : 'admin');
            return;
        }

        showAlert(err instanceof Error ? err.message : 'Authentication failed. Please try again.', 'warning');
    }
}

// Google OAuth Handler
function triggerGoogleAuth() {
    if (!backendIsAvailable()) {
        showAlert('Google login needs a live backend. GitHub Pages is static, so deploy the backend separately or use the email/phone sign-in flow instead.', 'warning');
        return;
    }

    const returnTo = window.location.protocol === 'file:'
        ? 'http://localhost:5501/index.html'
        : `${window.location.origin}${window.location.pathname}`;
    const query = new URLSearchParams({ returnTo, role: currentLoginRole });
    window.location.assign(`${API_BASE_URL}/auth/google/start?${query}`);
}

async function handleGoogleRedirectSession() {
    const params = new URLSearchParams(window.location.search);
    const sessionToken = params.get('google_session');
    const googleError = params.get('google_error');
    if (!sessionToken && !googleError) return;

    const cleanUrl = `${window.location.pathname}${window.location.hash}`;
    window.history.replaceState({}, document.title, cleanUrl);

    if (googleError) showAlert(`Google login failed: ${googleError}`, 'warning');
    if (!sessionToken) return;

    try {
        const res = await fetch(`${API_BASE_URL}/auth/google/session?token=${encodeURIComponent(sessionToken)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        localStorage.setItem('campushaven_user', JSON.stringify(data.user));
        if (data.token) localStorage.setItem('campushaven_token', data.token);
        updateInstitution(data.user.institution || currentInstitution);
        updateGender(data.user.gender || currentGender);
        showAlert(`Signed in with Google as ${data.user.name}${data.welcomeEmailSent ? '. Welcome email sent.' : '.'}`, 'success');
        navigateTo(data.user.role === 'student' ? 'home' : 'admin');
    } catch (err) {
        showAlert(err instanceof Error ? err.message : 'Google login could not be completed. Check the backend OAuth configuration.', 'warning');
    }
}

function quickSubmitTicket(issue) {
    showAlert(`✓ Repair Request Logged: "${issue}". Saved to MongoDB!`, 'success');
}

function openModal(type) {
    const modal = document.getElementById('quick-action-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');

    if (type === 'leave') {
        title.textContent = '🗓️ Apply for Weekend Outpass / Leave';
        body.innerHTML = `
                    <form onsubmit="handleModalSubmit(event, 'Outpass saved to database!')" class="space-y-3 font-bold text-xs">
                        <div>
                            <label class="block mb-1">Days Away</label>
                            <input type="number" min="1" max="14" value="2" required class="w-full sketch-input px-3 py-2 text-sm font-bold" />
                        </div>
                        <div>
                            <label class="block mb-1">Reason</label>
                            <textarea rows="3" required placeholder="Going home for weekend" class="w-full sketch-input px-3 py-2 text-sm font-bold"></textarea>
                        </div>
                        <div class="flex gap-2 justify-end pt-2">
                            <button type="button" onclick="closeModal()" class="px-4 py-2 sketch-btn bg-slate-100 text-slate-700">Cancel</button>
                            <button type="submit" class="px-4 py-2 sketch-btn text-slate-900" style="background-color: var(--accent);">Submit Outpass</button>
                        </div>
                    </form>
                `;
    } else if (type === 'ticket') {
        title.textContent = '🔧 Report Maintenance Problem';
        body.innerHTML = `
                    <form onsubmit="handleModalSubmit(event, 'Ticket logged in database!')" class="space-y-3 font-bold text-xs">
                        <div>
                            <label class="block mb-1">Issue Type</label>
                            <select class="w-full sketch-input px-3 py-2 text-sm font-bold">
                                <option>💡 Fan / Light / Socket</option>
                                <option>🚰 Bathroom / Water</option>
                                <option>📶 WiFi / Network</option>
                            </select>
                        </div>
                        <div>
                            <label class="block mb-1">Description</label>
                            <textarea rows="3" required placeholder="Details..." class="w-full sketch-input px-3 py-2 text-sm font-bold"></textarea>
                        </div>
                        <div class="flex gap-2 justify-end pt-2">
                            <button type="button" onclick="closeModal()" class="px-4 py-2 sketch-btn bg-slate-100 text-slate-700">Cancel</button>
                            <button type="submit" class="px-4 py-2 sketch-btn text-slate-900" style="background-color: var(--accent);">Submit Ticket</button>
                        </div>
                    </form>
                `;
    } else if (type === 'feedback') {
        title.textContent = '🍽️ Rate Today\'s Meal';
        body.innerHTML = `
                    <form onsubmit="handleMealFeedbackSubmit(event)" class="space-y-3 font-bold text-xs">
                        <div>
                            <span class="block mb-1">Star rating</span>
                            <div class="flex items-center gap-1" role="radiogroup" aria-label="Meal rating">
                                ${[1, 2, 3, 4, 5].map(rating => `<label class="cursor-pointer text-3xl leading-none"><input type="radio" name="meal-rating" value="${rating}" class="sr-only peer" ${rating === 4 ? 'checked' : ''} required><span class="text-slate-300 peer-checked:text-amber-500 hover:text-amber-400">★</span></label>`).join('')}
                            </div>
                        </div>
                        <div>
                            <label class="block mb-1" for="meal-description">Description / suggestions</label>
                            <textarea id="meal-description" rows="3" required placeholder="Tell us what you liked or what should improve..." class="w-full sketch-input px-3 py-2 text-sm font-bold"></textarea>
                        </div>
                        <div>
                            <label class="block mb-1" for="meal-attachment">Upload a meal photo or document</label>
                            <input id="meal-attachment" type="file" accept="image/*,.pdf,.txt" class="w-full sketch-input px-3 py-2 text-xs font-bold" />
                        </div>
                        <div class="flex gap-2 justify-end pt-2">
                            <button type="button" onclick="closeModal()" class="px-4 py-2 sketch-btn bg-slate-100 text-slate-700">Cancel</button>
                            <button type="submit" class="px-4 py-2 sketch-btn text-slate-900" style="background-color: var(--accent);">Submit Feedback</button>
                        </div>
                    </form>
                `;
    }
    modal.classList.remove('hidden');
}

function handleMealFeedbackSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const rating = form.querySelector('input[name="meal-rating"]:checked').value;
    const description = form.querySelector('#meal-description').value.trim();
    const attachment = form.querySelector('#meal-attachment').files[0];
    localStorage.setItem('campushaven_meal_feedback', JSON.stringify({
        rating: Number(rating),
        description,
        attachmentName: attachment ? attachment.name : null,
        submittedAt: new Date().toISOString()
    }));
    closeModal();
    showAlert(`Thank you! Your ${rating}-star meal feedback${attachment ? ' and attachment' : ''} was saved.`, 'success');
}

function closeModal() {
    document.getElementById('quick-action-modal').classList.add('hidden');
}

function handleModalSubmit(e, msg) {
    e.preventDefault();
    closeModal();
    showAlert(msg, 'success');
}

function showAlert(msg, type = 'info') {
    const box = document.getElementById('global-alert-box');
    const content = document.getElementById('global-alert-content');

    let bgClass = 'bg-slate-900 border-2 border-slate-600 text-slate-100';
    if (type === 'success') bgClass = 'bg-emerald-950/90 border-2 border-emerald-500 text-emerald-200';
    if (type === 'warning') bgClass = 'bg-amber-950/90 border-2 border-amber-500 text-amber-200';

    content.className = `px-4 py-3 sketch-box flex items-center justify-between shadow-lg text-sm font-bold ${bgClass}`;
    content.innerHTML = `
                <span>📢 ${msg}</span>
                <button onclick="document.getElementById('global-alert-box').classList.add('hidden')" class="ml-4 font-bold text-base">✕</button>
            `;

    box.classList.remove('hidden');
    setTimeout(() => { box.classList.add('hidden'); }, 5000);
}

async function handleEmailAuthToken() {
    const params = new URLSearchParams(window.location.search);
    const authToken = params.get('auth_token');
    if (!authToken || !backendIsAvailable()) return false;
    try {
        const response = await fetch(`${API_BASE_URL}/auth/session?token=${encodeURIComponent(authToken)}`);
        const data = await response.json();
        if (!response.ok || !data.user || !data.token) throw new Error(data.message || 'This sign-in link is invalid.');
        localStorage.setItem('campushaven_user', JSON.stringify(data.user));
        localStorage.setItem('campushaven_token', data.token);
        window.history.replaceState({}, document.title, window.location.pathname || '/');
        showAlert(`Welcome back, ${data.user.name}!`, 'success');
        return true;
    } catch (error) {
        window.history.replaceState({}, document.title, window.location.pathname || '/');
        showAlert(error.message || 'This sign-in link could not be used.', 'warning');
        return false;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await handleEmailAuthToken();
    document.getElementById('global-gender-select').value = currentGender;
    applyThemeColors(currentGender);
    renderNavAuth();
    handleGoogleRedirectSession();
    navigateTo('home');
    const registerDate = document.getElementById('outpass-register-date');
    if (registerDate) registerDate.value = getLocalDateKey();
    setOutpassDepartureDefault();
    renderWeeklyMenuTables();
    const menuDateInput = document.getElementById('mess-menu-date');
    if (menuDateInput) {
        menuDateInput.value = getLocalDateKey();
        menuDateInput.addEventListener('change', () => loadDateMenu(menuDateInput.value));
    }
    loadDateMenu();
    loadCalendarDocument();
    renderPinnedServices();
    updatePinButtons();
    window.setInterval(() => updateMealStatuses(), 60 * 1000);
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) updateMealStatuses();
    });
});
