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
    breakfast: string | readonly string[];
    lunch: string | readonly string[];
    snacks?: string | readonly string[];
    dinner: string | readonly string[];
}

interface StoredCalendarResponse {
    date: string;
    weekday: string;
    menu: Menu | null;
    timeZone: string;
}

interface MenuCalendarDocument {
    name: string;
    mimeType: string;
    uploadedAt?: string;
    source?: 'backend' | 'static';
}

const bundledMenuCalendar: MenuCalendarDocument = {
    name: 'HiTech Ghaziabad - Weekly Menu (2).pdf',
    mimeType: 'application/pdf',
    source: 'static',
};

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
    Sunday: {
        breakfast: ['Aloo bread sandwich / poha', 'Banana', 'Tea'],
        lunch: ['Chole bhature', 'Cooked rice', 'Chana dal', 'Cucumber raita', 'Salad', 'Pickle'],
        snacks: ['Sprouts chaat (chana, moong, onion, lemon, chillies, tomato & chaat masala)', 'Tea'],
        dinner: ['Chapathi', 'Aloo gobi gravy', 'Cooked rice', 'Arahar ki dal', 'Salad', 'Pickle', 'Gulab jamun / ice cream'],
    },
    Monday: {
        breakfast: ['Tinkoni paratha / puri', 'Aloo ki sabji', 'Tea'],
        lunch: ['Chapathi', 'Aloo soyabean ki subji', 'Cooked rice', 'Razma', 'Salad', 'Pickle'],
        snacks: ['Maggie / chowmin', 'Tea'],
        dinner: ['Chapathi', 'Lauki kofta', 'Cooked rice', 'Arhar ki dal', 'Salad', 'Pickle'],
    },
    Tuesday: {
        breakfast: ['Pav', 'Bhajji', 'Tea'],
        lunch: ['Chapathi', 'Aloo bhujia', 'Jeera rice', 'Mix dal', 'Onion salad', 'Pickle'],
        snacks: ['Veg sandwich', 'Tea'],
        dinner: ['Poori', 'Chola', 'Jeera rice', 'Dal makhni', 'Salad', 'Pickle', 'Jalebi / kheer'],
    },
    Wednesday: {
        breakfast: ['Idli', 'Sambar & chutney', 'Tea'],
        lunch: ['Chapathi', 'Aloo gobi', 'Cooked rice', 'Mix dal', 'Salad', 'Pickle'],
        snacks: ['Pasta', 'Tea'],
        dinner: ['Chapathi', 'Mix veg curry', 'Cooked rice', 'Dal makhni', 'Salad', 'Pickle'],
    },
    Thursday: {
        breakfast: ['Kulcha / dal paratha', 'Chole', 'Tea'],
        lunch: ['Chapathi', 'Aloo baigan ki subji', 'Cooked rice', 'Kadhi pakoda', 'Salad', 'Pickle'],
        snacks: ['Pani puri', 'Imli chutney', 'Tea'],
        dinner: ['Tandoori roti', 'Kadai paneer', 'Cooked rice', 'Mix dal', 'Salad', 'Pickle'],
    },
    Friday: {
        breakfast: ['Aloo paratha', 'Curd', 'Tea'],
        lunch: ['Veg biryani', 'Tomato mirchi ka chutney', 'Chana dal', 'Kachumber', 'Pickle'],
        snacks: ['Aloo samosa', 'Tea'],
        dinner: ['Chapathi', 'Seasonal veg', 'Cooked rice', 'Arhar dal', 'Salad', 'Pickle'],
    },
    Saturday: {
        breakfast: ['Masala chilla / masala dosa', 'Green chutney', 'Tea'],
        lunch: ['Chapathi', 'Mix veg curry with mushroom', 'Cooked rice', 'Lal masoor dal', 'Salad', 'Pickle'],
        snacks: ['Cutlet / bhelpuri', 'Tea'],
        dinner: ['Chapathi', 'Aloo jeera', 'Fried rice', 'Veg manchurian', 'Coke'],
    },
} as const;

export const CalendarMenu: React.FC = () => {
    const [events, setEvents] = useState<GoogleEvent[]>([]);
    const [calendarMessage, setCalendarMessage] = useState('Connect Google Calendar to see your upcoming events.');
    const [isConnecting, setIsConnecting] = useState(false);
    const [dateMenu, setDateMenu] = useState<Menu | null>(null);
    const [weeklyMenus, setWeeklyMenus] = useState<WeeklyMenuEntry[]>([]);
    const [calendarNotice, setCalendarNotice] = useState('');
    const [menuCalendarDocument, setMenuCalendarDocument] = useState<MenuCalendarDocument>(bundledMenuCalendar);
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
                setCalendarNotice('Backend calendar is offline; showing the weekday menu.');
            });
        return () => { cancelled = true; };
    }, [apiBaseUrl, selectedDate]);

    useEffect(() => {
        let cancelled = false;
        fetch(`${apiBaseUrl}/calendar/document`)
            .then(async (response) => {
                if (response.status === 404) return null;
                if (!response.ok) {
                    const result = await response.json();
                    throw new Error(result.message || 'Unable to load the published menu calendar.');
                }
                return response.json() as Promise<MenuCalendarDocument>;
            })
            .then((document) => {
                if (!cancelled && document) setMenuCalendarDocument({ ...document, source: 'backend' });
            })
            .catch((error: unknown) => {
                if (!cancelled) {
                    setCalendarNotice(error instanceof Error ? error.message : 'Unable to load the published menu calendar.');
                }
            });
        return () => { cancelled = true; };
    }, [apiBaseUrl]);

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
    }, [apiBaseUrl, selectedDate]);

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
                    {Object.entries(selectedMenu).map(([meal, items]) => (
                        <div key={meal} className="flex items-center justify-between gap-4 bg-[var(--paper)] sketch-box px-3 py-2">
                            <span className="font-bold capitalize text-[var(--ink)]">{meal}</span>
                            <span className="text-right text-slate-700">{Array.isArray(items) ? items.join(' · ') : items}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-5 border-t border-[var(--grid-line)] pt-4">
                    <p className="text-xs font-bold text-[var(--ink)]">Official Menu Calendar</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                        <a
                            href={menuCalendarDocument.source === 'backend'
                                ? `${apiBaseUrl}/calendar/document/file`
                                : `${import.meta.env.BASE_URL}menu-calendar.pdf`}
                            className="font-bold text-blue-800 underline"
                        >
                            Download {menuCalendarDocument.name}
                        </a>
                        {menuCalendarDocument.uploadedAt && (
                            <span className="text-slate-500">
                                Updated {new Date(menuCalendarDocument.uploadedAt).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                    {calendarNotice && <p className="mt-2 text-xs font-bold text-amber-800">{calendarNotice}</p>}
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