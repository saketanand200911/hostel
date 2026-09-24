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
    menu: Menu | null;
    timeZone: string;
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
    const [uploadMessage, setUploadMessage] = useState('');
    const today = useMemo(() => new Date(), []);
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long', timeZone: appTimeZone }) as keyof typeof menuByDay;
    const formattedDate = today.toLocaleDateString('en-IN', {
        timeZone: appTimeZone,
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
    const todaysMenu = dateMenu || menuByDay[dayName];
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
        const date = getDateKey(today);
        fetch(`${apiBaseUrl}/calendar/menu?date=${date}`)
            .then((response) => response.ok ? response.json() as Promise<StoredCalendarResponse> : Promise.reject())
            .then((result) => setDateMenu(result.menu))
            .catch(() => setUploadMessage('Backend calendar is offline; showing the weekday menu.'));
    }, [apiBaseUrl, today]);

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
            setUploadMessage('Calendar saved to the backend. Add menuByDate entries to show date-specific meals.');
            const date = getDateKey(today);
            const menuResponse = await fetch(`${apiBaseUrl}/calendar/menu?date=${date}`);
            const menuResult = await menuResponse.json() as StoredCalendarResponse;
            setDateMenu(menuResult.menu);
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
                        <p className="text-xs uppercase tracking-widest font-mono-draft text-slate-500">Today</p>
                        <h2 className="text-2xl font-bold font-draft text-[var(--ink)]">{formattedDate}</h2>
                    </div>
                    <span className="text-3xl" aria-hidden="true">🍽️</span>
                </div>
                <h3 className="text-lg font-bold font-draft text-[var(--ink)] mb-3">Mess menu · {dayName}</h3>
                <div className="space-y-2 text-sm font-hand">
                    {Object.entries(todaysMenu).map(([meal, item]) => (
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
        </section>
    );
};