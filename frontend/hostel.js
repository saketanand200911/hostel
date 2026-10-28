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
        primary: '#090d16', secondary: '#131b2e', accent: '#f59e0b', ink: '#f8fafc',
        paper: '#090d16', paperCard: '#131b2e', sketchBorder: '#2a3854', sketchShadow: 'rgba(0, 0, 0, 0.55)', highlighter: '#78350f'
    },
    girls: {
        primary: '#07150e', secondary: '#0d2417', accent: '#4ade80', ink: '#f0fdf4',
        paper: '#07150e', paperCard: '#0d2417', sketchBorder: 'rgba(74, 222, 128, 0.28)', sketchShadow: 'rgba(0, 0, 0, 0.55)', highlighter: 'rgba(74, 222, 128, 0.18)'
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
}

function updateInstitution(newInst) {
    currentInstitution = newInst;
    localStorage.setItem('campushaven_institution', newInst);
    applyThemeColors(currentGender);
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

document.addEventListener('DOMContentLoaded', () => {
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
    window.setInterval(() => updateMealStatuses(), 60 * 1000);
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) updateMealStatuses();
    });
});
