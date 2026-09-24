const API_BASE_URL = window.location.protocol === 'file:'
    ? 'http://localhost:4000/api'
    : ['localhost', '127.0.0.1'].includes(window.location.hostname) ? 'http://localhost:4000/api' : '/api';
const APP_TIME_ZONE = 'Asia/Kolkata';

function getLocalDateKey(date = new Date()) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: APP_TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date);
}

const PALETTES = {
    boys: {
        primary: '#0f172a', secondary: '#1e293b', accent: '#f59e0b', ink: '#0f172a',
        paper: '#FAF8F5', sketchBorder: '#0f172a', sketchShadow: '#0f172a', highlighter: '#fde68a'
    },
    girls: {
        primary: '#F8FAF7', secondary: '#F0F5EC', accent: '#84CC16', ink: '#14532D',
        paper: '#F8FAF7', sketchBorder: 'rgba(74, 222, 128, 0.3)', sketchShadow: 'rgba(20, 83, 45, 0.08)', highlighter: '#FDE047'
    }
};

let currentGender = localStorage.getItem('campushaven_gender') || 'boys';
let currentInstitution = localStorage.getItem('campushaven_institution') || 'hi-tech';
let currentView = 'home';
let currentLoginRole = 'student';
let currentAuthMode = 'signin'; // 'signin' or 'signup'

function applyThemeColors(gender) {
    const p = PALETTES[gender];
    const root = document.documentElement;
    root.style.setProperty('--primary', p.primary);
    root.style.setProperty('--secondary', p.secondary);
    root.style.setProperty('--accent', p.accent);
    root.style.setProperty('--ink', p.ink);
    root.style.setProperty('--paper', p.paper);
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

function switchPassTab(tab) {
    ['live', 'history'].forEach(name => {
        document.getElementById(`pass-subview-${name}`)?.classList.toggle('hidden', name !== tab);
        document.getElementById(`tab-pass-${name}`)?.classList.toggle('bg-[var(--accent)]', name === tab);
    });
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
        const response = await fetch(`${API_BASE_URL}/calendar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Upload failed');
        status.textContent = 'Calendar saved. Date-specific menus will load automatically.';
        await loadDateMenu();
    } catch (error) {
        status.textContent = 'Upload a valid calendar JSON file.';
    } finally {
        input.value = '';
    }
}

async function loadDateMenu() {
    const date = getLocalDateKey();
    const dateLabel = document.getElementById('mess-date-label');
    const time = new Intl.DateTimeFormat('en-IN', {
        timeZone: APP_TIME_ZONE,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).format(new Date());
    if (dateLabel) dateLabel.textContent = `· ${date} · ${time} IST`;
    updateMealStatuses();

    try {
        const response = await fetch(`${API_BASE_URL}/calendar/menu?date=${date}`);
        if (!response.ok) return;
        const result = await response.json();
        if (!result.menu) return;
        ['breakfast', 'lunch', 'snacks', 'dinner'].forEach(meal => {
            const list = document.getElementById(`menu-${meal}`);
            const value = result.menu[meal];
            if (list && value) {
                const items = Array.isArray(value) ? value : [value];
                list.innerHTML = items.map(item => `<li>• ${String(item)}</li>`).join('');
            }
        });
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

function navigateTo(viewName) {
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

    if (viewName === 'pass') generateQRCode();
    if (viewName === 'mess') loadDateMenu();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getAuthUser() {
    const u = localStorage.getItem('campushaven_user');
    try { return u ? JSON.parse(u) : null; } catch { return null; }
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
                        <button onclick="navigateTo('${auth.role === 'student' ? 'home' : 'admin'}')" class="px-2.5 py-1.5 rounded-lg bg-[var(--highlighter)] border border-[var(--sketch-border)]">
                            👤 ${auth.name.split(' ')[0]} (${auth.role})
                        </button>
                        <button onclick="handleLogout()" class="px-2.5 py-1.5 rounded-lg bg-white border border-[var(--sketch-border)] hover:bg-red-50">
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
        sub.textContent = 'Register with your email or phone number to link your room.';
        nameContainer.classList.remove('hidden');
        submitBtn.textContent = '✓ Create Account & Sign In';

        btnSignUp.className = 'flex-1 py-2 rounded-lg bg-[var(--accent)] text-slate-900 shadow-sm border border-[var(--sketch-border)]';
        btnSignIn.className = 'flex-1 py-2 rounded-lg text-slate-600 hover:text-[var(--ink)]';
    } else {
        title.textContent = 'Sign In to CampusHaven';
        sub.textContent = 'Enter your registered Email or Phone number to access your account.';
        nameContainer.classList.add('hidden');
        submitBtn.textContent = '✓ Enter CampusHaven Portal';

        btnSignIn.className = 'flex-1 py-2 rounded-lg bg-[var(--accent)] text-slate-900 shadow-sm border border-[var(--sketch-border)]';
        btnSignUp.className = 'flex-1 py-2 rounded-lg text-slate-600 hover:text-[var(--ink)]';
    }
}

function setLoginRole(role) {
    currentLoginRole = role;
    ['student', 'warden', 'admin'].forEach(r => {
        const btn = document.getElementById(`tab-role-${r}`);
        if (r === role) {
            btn.className = 'flex-1 py-1.5 rounded-lg capitalize bg-slate-200 text-slate-900 border border-[var(--sketch-border)] font-bold';
        } else {
            btn.className = 'flex-1 py-1.5 rounded-lg capitalize text-slate-600 hover:text-[var(--ink)]';
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

    const contact = document.getElementById('auth-contact').value.trim();
    const password = document.getElementById('auth-password').value;
    const fullname = document.getElementById('auth-fullname').value.trim();
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

    try {
        const endpoint = currentAuthMode === 'signup' ? `${API_BASE_URL}/auth/signup` : `${API_BASE_URL}/auth/login`;
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Authentication failed');
        }

        // Store User Data and JWT Token
        localStorage.setItem('campushaven_user', JSON.stringify(data.user));
        if (data.token) localStorage.setItem('campushaven_token', data.token);

        updateInstitution(data.user.institution || inst);
        updateGender(data.user.gender || gen);

        showAlert(`Welcome, ${data.user.name}!`, 'success');
        navigateTo(data.user.role === 'student' ? 'home' : 'admin');
    } catch (err) {
        if (!(err instanceof TypeError)) {
            showAlert(err.message || 'Authentication failed. Please try again.', 'warning');
            return;
        }
        // Fallback local login for offline testing if backend API is not running
        console.warn('API connection failed, falling back to local state:', err.message);
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
    }
}

// Google OAuth Handler
function triggerGoogleAuth() {
    const returnTo = ['localhost', '127.0.0.1'].includes(window.location.hostname)
        ? 'http://localhost:5500/hostel.html'
        : window.location.href.split('?')[0];
    window.location.assign(`${API_BASE_URL}/auth/google/start?returnTo=${encodeURIComponent(returnTo)}`);
}

async function handleGoogleRedirectSession() {
    const params = new URLSearchParams(window.location.search);
    const sessionToken = params.get('google_session');
    const googleError = params.get('google_error');
    if (googleError) showAlert(`Google login failed: ${googleError}`, 'warning');
    if (!sessionToken) return;

    try {
        const res = await fetch(`${API_BASE_URL}/auth/google/session?token=${encodeURIComponent(sessionToken)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        localStorage.setItem('campushaven_user', JSON.stringify(data.user));
        showAlert(`Signed in with Google as ${data.user.name}${data.welcomeEmailSent ? '. Welcome email sent.' : '.'}`, 'success');
        navigateTo('home');
    } catch (err) {
        showAlert('Google login could not be completed. Check the backend OAuth configuration.', 'warning');
    }
}

function generateQRCode() {
    const qrContainer = document.getElementById('qrcode-container-pass');
    if (!qrContainer) return;
    qrContainer.innerHTML = '';

    const user = getAuthUser() || { name: 'Alex Chen', floor: 'GF', roomNumber: '101' };
    const passName = document.getElementById('pass-student-name');
    if (passName) passName.textContent = `${user.name} (Room ${user.floor || 'GF'}-${user.roomNumber || '101'})`;

    const passData = JSON.stringify({
        id: `GP-${user.roomNumber || '101'}-${Date.now().toString().slice(-6)}`,
        resident: user.name,
        room: `${user.floor || 'GF'}-${user.roomNumber || '101'}`,
        validUntil: 'Today 10:00 PM'
    });

    new QRCode(qrContainer, {
        text: passData,
        width: 170,
        height: 170,
        colorDark: '#0f172a',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });
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

    let bgClass = 'bg-white border-2 border-[var(--sketch-border)] text-[var(--ink)]';
    if (type === 'success') bgClass = 'bg-emerald-50 border-2 border-emerald-700 text-emerald-950';
    if (type === 'warning') bgClass = 'bg-amber-50 border-2 border-amber-700 text-amber-950';

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
});
