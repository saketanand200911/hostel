import React, { useEffect, useMemo, useState } from 'react';

interface GoogleEvent {
    summary?: string;
    start?: {
        date?: string;
        dateTime?: string;
    };
}

interface GoogleCalendarResponse {
    result: {
        items?: GoogleEvent[];
    };
}

interface Menu {
    breakfast: string;
    lunch: string;
    dinner: string;
}

interface StoredCalendarResponse {
    date: string;
    weekday: string;
    menu: Menu | null;
    timeZone: string;
}

interface WeeklyMenuEntry {
    date: string;
    weekday: string;
    menu: Menu;
}

interface GoogleApiClient {
    init: (config: { apiKey: string; discoveryDocs: string[] }) => Promise<void>;
    getToken: () => { access_token: string } | null;
    setToken: (token: { access_token: string }) => void;
    calendar: {
        events: {
            list: (request: Record<string, string | number | boolean>) => Promise<GoogleCalendarResponse>;
        };
    };
}

interface GoogleApiWindow extends Window {
    gapi?: {
        load: (name: string, callback: () => void) => void;
        client: GoogleApiClient;
    };
    google?: {
        accounts: {
            oauth2: {
                initTokenClient: (config: {
                    client_id: string;
                    scope: string;
                    callback: (response: { error?: string; access_token?: string }) => void;
                }) => { requestAccessToken: (options: { prompt: string }) => void };
            };
        };
    };
}

const googleWindow = window as GoogleApiWindow;
const discoveryDoc = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const calendarScope = 'https://www.googleapis.com/auth/calendar.readonly';
const appTimeZone = 'Asia/Kolkata';

const getDateKey = (date: Date) => new Intl.DateTimeFormat('en-CA', {
    timeZone: appTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
}).format(date);

const getWeekDateKeys = (dateKey: string) => {
    const [year, month, day] = dateKey.split('-').map(Number);
    const sunday = new Date(Date.UTC(year, month - 1, day));
    sunday.setUTCDate(sunday.getUTCDate() - sunday.getUTCDay());
    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(sunday);
        date.setUTCDate(sunday.getUTCDate() + index);
        return date.toISOString().slice(0, 10);
    });
};

const getWeekday = (dateKey: string) => new Date(`${dateKey}T12:00:00+05:30`)
    .toLocaleDateString('en-US', { weekday: 'long', timeZone: appTimeZone });

const menuByDay = {
    Sunday: { breakfast: 'Pancakes & fruit', lunch: 'Veg biryani & raita', dinner: 'Paneer curry & roti' },
    Monday: { breakfast: 'Idli, sambar & chutney', lunch: 'Dal, rice & seasonal vegetables', dinner: 'Aloo paratha & curd' },
    Tuesday: { breakfast: 'Poha & boiled egg', lunch: 'Rajma, rice & salad', dinner: 'Vegetable noodles & soup' },
    Wednesday: { breakfast: 'Toast, omelette & fruit', lunch: 'Chole, rice & roti', dinner: 'Mixed veg pulao & raita' },
    Thursday: { breakfast: 'Upma & banana', lunch: 'Sambar rice & poriyal', dinner: 'Chicken curry or soy chaap & roti' },
    Friday: { breakfast: 'Paratha & curd', lunch: 'Dal makhani & jeera rice', dinner: 'Pizza night & salad' },
    Saturday: { breakfast: 'Poori, bhaji & fruit', lunch: 'Veg thali & sweet', dinner: 'Fried rice & manchurian' },
} as const;

export const CalendarMenu: React.FC = () => {
    const [events, setEvents] = useState<GoogleEvent[]>([]);
    const [calendarMessage, setCalendarMessage] = useState('Connect Google Calendar to see your upcoming events.');
    const [isConnecting, setIsConnecting] = useState(false);
    const [dateMenu, setDateMenu] = useState<Menu | null>(null);
    const [weeklyMenus, setWeeklyMenus] = useState<WeeklyMenuEntry[]>([]);
    const [uploadMessage, setUploadMessage] = useState('');
    const [calendarVersion, setCalendarVersion] = useState(0);
    const today = useMemo(() => new Date(), []);
    const [selectedDate, setSelectedDate] = useState(() => getDateKey(new Date()));
    const [dayName, setDayName] = useState(() => getWeekday(getDateKey(new Date())));
    const formattedDate = new Date(`${selectedDate}T12:00:00+05:30`).toLocaleDateString('en-IN', {
        timeZone: appTimeZone,
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
    const selectedMenu = dateMenu || menuByDay[dayName as keyof typeof menuByDay];
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

    useEffect(() => {
        if (!clientId || !apiKey) return;

        ['https://apis.google.com/js/api.js', 'https://accounts.google.com/gsi/client'].forEach((src) => {
            if (!document.querySelector(`script[src="${src}"]`)) {
                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);
            }
        });
    }, [apiKey, clientId]);

    useEffect(() => {
        let cancelled = false;
        setDateMenu(null);
        fetch(`${apiBaseUrl}/calendar/menu?date=${selectedDate}`)
            .then((response) => response.ok ? response.json() as Promise<StoredCalendarResponse> : Promise.reject())
            .then((result) => {
                if (cancelled) return;
                setDayName(result.weekday);
                setDateMenu(result.menu);
            })
            .catch(() => {
                if (cancelled) return;
                setDayName(getWeekday(selectedDate));
                setUploadMessage('Backend calendar is offline; showing the weekday menu.');
            });
        return () => { cancelled = true; };
    }, [apiBaseUrl, selectedDate]);

    useEffect(() => {
        let cancelled = false;
        const loadWeeklyMenus = async () => {
            const entries = await Promise.all(getWeekDateKeys(selectedDate).map(async (date) => {
                try {
                    const response = await fetch(`${apiBaseUrl}/calendar/menu?date=${date}`);
                    if (!response.ok) throw new Error('Calendar menu request failed');
                    const result = await response.json() as StoredCalendarResponse;
                    const weekday = result.weekday || getWeekday(date);
                    return { date, weekday, menu: result.menu || menuByDay[weekday as keyof typeof menuByDay] };
                } catch {
                    const weekday = getWeekday(date);
                    return { date, weekday, menu: menuByDay[weekday as keyof typeof menuByDay] };
                }
            }));
            if (!cancelled) setWeeklyMenus(entries);
        };
        void loadWeeklyMenus();
        return () => { cancelled = true; };
    }, [apiBaseUrl, calendarVersion, selectedDate]);

    const uploadCalendar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const payload = JSON.parse(await file.text()) as object;
            const response = await fetch(`${apiBaseUrl}/calendar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error('Upload failed');
            setUploadMessage('Calendar saved. Menus use the selected date or its weekday.');
            const menuResponse = await fetch(`${apiBaseUrl}/calendar/menu?date=${selectedDate}`);
            const menuResult = await menuResponse.json() as StoredCalendarResponse;
            setDayName(menuResult.weekday);
            setDateMenu(menuResult.menu);
            setCalendarVersion((version) => version + 1);
        } catch {
            setUploadMessage('Upload a valid calendar JSON file.');
        } finally {
            event.target.value = '';
        }
    };

    const connectCalendar = () => {
        if (!clientId || !apiKey || !googleWindow.gapi || !googleWindow.google) {
            setCalendarMessage('Add VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_API_KEY to enable Google Calendar.');
            return;
        }

        setIsConnecting(true);
        googleWindow.gapi.load('client', async () => {
            await googleWindow.gapi!.client.init({ apiKey, discoveryDocs: [discoveryDoc] });
            const tokenClient = googleWindow.google!.accounts.oauth2.initTokenClient({
                client_id: clientId,
                scope: calendarScope,
                callback: async (response) => {
                    if (response.error || !response.access_token) {
                        setCalendarMessage('Google Calendar authorization was not completed.');
                        setIsConnecting(false);
                        return;
                    }

                    try {
                        googleWindow.gapi!.client.setToken({ access_token: response.access_token });
                        const result = await googleWindow.gapi!.client.calendar.events.list({
                            calendarId: 'primary',
                            timeMin: today.toISOString(),
                            showDeleted: false,
                            singleEvents: true,
                            maxResults: 5,
                            orderBy: 'startTime',
                        });
                        setEvents(result.result.items ?? []);
                        setCalendarMessage('');
                    } catch {
                        setCalendarMessage('Unable to load upcoming calendar events.');
                    } finally {
                        setIsConnecting(false);
                    }
                },
            });

            tokenClient.requestAccessToken({ prompt: googleWindow.gapi!.client.getToken() ? '' : 'consent' });
        });
    };

    return (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 sketch-card p-6 relative">
                <div className="washi-tape-accent"></div>
                <div className="flex items-start justify-between gap-3 mb-5">
                    <div>
                        <label htmlFor="menu-date" className="text-xs uppercase tracking-widest font-mono-draft text-slate-500">Menu date</label>
                        <input id="menu-date" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="block mt-1 sketch-input px-2 py-1 text-sm font-bold" />
                        <h2 className="text-2xl font-bold font-draft text-[var(--ink)]">{formattedDate}</h2>
                    </div>
                    <span className="text-3xl" aria-hidden="true">🍽️</span>
                </div>
                <h3 className="text-lg font-bold font-draft text-[var(--ink)] mb-3">Mess menu · {dayName}</h3>
                <div className="space-y-2 text-sm font-hand">
                    {Object.entries(selectedMenu).map(([meal, item]) => (
                        <div key={meal} className="flex items-center justify-between gap-4 bg-[var(--paper)] sketch-box px-3 py-2">
                            <span className="font-bold capitalize text-[var(--ink)]">{meal}</span>
                            <span className="text-right text-slate-700">{item}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-5 border-t border-[var(--grid-line)] pt-4">
                    <label htmlFor="calendar-upload" className="sketch-btn inline-block px-3 py-2 text-xs font-bold cursor-pointer">
                        Upload calendar JSON
                    </label>
                    <input id="calendar-upload" type="file" accept="application/json,.json" onChange={uploadCalendar} className="sr-only" />
                    <p className="mt-2 text-xs text-slate-500">Use `menuByDate` with `YYYY-MM-DD` keys for date-specific meals.</p>
                    {uploadMessage && <p className="mt-2 text-xs font-bold text-emerald-700">{uploadMessage}</p>}
                </div>
            </div>

            <div className="lg:col-span-7 sketch-card-alt p-6 relative">
                <div className="washi-tape"></div>
                <div className="flex items-center justify-between gap-3 mb-2">
                    <div>
                        <p className="text-xs uppercase tracking-widest font-mono-draft text-slate-500">Schedule</p>
                        <h2 className="text-2xl font-bold font-draft text-[var(--ink)]">Upcoming calendar</h2>
                    </div>
                    <button type="button" onClick={connectCalendar} disabled={isConnecting} className="sketch-btn px-3 py-2 text-xs font-bold">
                        {isConnecting ? 'Connecting...' : 'Connect calendar'}
                    </button>
                </div>
                {events.length > 0 ? (
                    <div className="mt-5 space-y-2 font-hand">
                        {events.map((event, index) => (
                            <div key={`${event.summary}-${index}`} className="bg-white sketch-box px-3 py-2 flex justify-between gap-4">
                                <span className="font-bold text-[var(--ink)]">{event.summary || 'Untitled event'}</span>
                                <span className="text-sm text-slate-600">
                                    {new Date(event.start?.dateTime || event.start?.date || today).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="mt-5 bg-[var(--paper)] sketch-box p-4 text-sm text-slate-600 font-hand">{calendarMessage}</p>
                )}
            </div>

            <div className="lg:col-span-12 sketch-card p-4 relative overflow-x-auto">
                <div className="washi-tape-accent"></div>
                <h2 className="text-xl font-bold font-draft text-[var(--ink)] mb-3">Weekly mess menu</h2>
                <table className="w-full min-w-[900px] text-left text-sm font-hand">
                    <thead>
                        <tr className="border-b-2 border-[var(--sketch-border)] text-[var(--ink)]">
                            <th className="p-2">Meal</th>
                            {weeklyMenus.map(({ date, weekday }) => (
                                <th key={date} className="p-2 text-center">
                                    <span className="block font-bold">{weekday}</span>
                                    <span className="text-xs font-normal text-slate-500">{new Date(`${date}T12:00:00+05:30`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: appTimeZone })}</span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {(['breakfast', 'lunch', 'dinner'] as const).map((meal) => (
                            <tr key={meal} className="border-b border-[var(--grid-line)] last:border-0">
                                <th className="p-2 capitalize text-[var(--ink)]">{meal}</th>
                                {weeklyMenus.map(({ date, menu }) => (
                                    <td key={date} className="p-2 text-center text-slate-700">{menu[meal]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};