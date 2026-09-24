import React from 'react';
import { Link } from 'react-router-dom';

const timetable = [
    ['Monday', 'Data Structures', 'Operating Systems', 'Library / Study Hall', 'Web Engineering'],
    ['Tuesday', 'Database Systems', 'Computer Networks', 'Sports & Wellness', 'Data Structures Lab'],
    ['Wednesday', 'Web Engineering', 'Database Systems', 'Project Studio', 'Operating Systems'],
    ['Thursday', 'Computer Networks', 'Data Structures', 'Mentor Hour', 'Database Systems Lab'],
    ['Friday', 'Operating Systems', 'Project Studio', 'Computer Networks', 'Open Elective'],
    ['Saturday', 'Residence Assembly', 'Study Hall', 'Club Activities', 'Weekend Check-in'],
];

const cardClass = 'sketch-card p-5';

export const WeeklyTimetable: React.FC = () => (
    <StudentPageShell eyebrow="Resident schedule" title="Weekly timetable" description="Your planned academic and residence activities, Monday through Saturday.">
        <div className="overflow-x-auto sketch-card p-4">
            <table className="w-full min-w-[720px] text-left font-hand">
                <thead>
                    <tr className="border-b-2 border-[var(--sketch-border)] font-draft text-[var(--ink)]">
                        <th className="p-3">Day</th>
                        <th className="p-3">09:00</th>
                        <th className="p-3">11:00</th>
                        <th className="p-3">14:00</th>
                        <th className="p-3">16:00</th>
                    </tr>
                </thead>
                <tbody>
                    {timetable.map(([day, ...sessions]) => (
                        <tr key={day} className="border-b border-[var(--grid-line)] last:border-0">
                            <th className="p-3 font-bold text-[var(--ink)]">{day}</th>
                            {sessions.map((session) => <td key={session} className="p-3 text-slate-700">{session}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </StudentPageShell>
);

export const NoticesPage: React.FC = () => (
    <StudentPageShell eyebrow="Residence desk" title="Notices & announcements" description="The latest updates from your warden and campus team.">
        <div className="grid gap-4 md:grid-cols-2">
            <Notice title="Water tank maintenance" date="Today · 6:00 PM" text="Water supply may be interrupted for 30 minutes while the west wing tank is serviced." />
            <Notice title="Saturday residence assembly" date="26 September · 10:00 AM" text="All residents should report to the common hall for the monthly safety briefing." />
            <Notice title="Mess feedback window" date="Open until Friday" text="Share your meal feedback from the resident portal so the kitchen team can plan next week." />
            <Notice title="Curfew reminder" date="Every day · 10:00 PM" text="Keep your digital gate pass ready when entering after evening study hours." />
        </div>
    </StudentPageShell>
);

export const HelpDeskPage: React.FC = () => (
    <StudentPageShell eyebrow="Support" title="Help desk" description="Reach the right team quickly when you need help around campus.">
        <div className="grid gap-5 md:grid-cols-3">
            <ContactCard title="Warden desk" detail="Govind · +91 85097 04392" action="tel:+918509704392" />
            <ContactCard title="Gate security" detail="Available 24/7 · 112" action="tel:112" />
            <ContactCard title="Campus clinic" detail="Health support · 9876543211" action="tel:9876543211" />
        </div>
        <div className="mt-6 sketch-card-alt p-6">
            <h2 className="text-xl font-bold font-draft text-[var(--ink)]">Need a room fix?</h2>
            <p className="mt-1 text-sm text-slate-700 font-hand">Open the maintenance form from your resident dashboard to report plumbing, electrical, carpentry, or WiFi issues.</p>
            <Link to="/student" className="inline-block mt-4 sketch-btn px-4 py-2 text-sm font-bold">Open resident dashboard</Link>
        </div>
    </StudentPageShell>
);

const StudentPageShell: React.FC<React.PropsWithChildren<{ eyebrow: string; title: string; description: string }>> = ({ eyebrow, title, description, children }) => (
    <main className="min-h-screen overflow-y-auto p-4 sm:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
            <header className="sketch-card p-6 sm:p-8 relative">
                <div className="washi-tape"></div>
                <p className="text-xs uppercase tracking-widest font-mono-draft text-slate-500">{eyebrow}</p>
                <h1 className="text-3xl sm:text-4xl font-bold font-draft text-[var(--ink)] mt-1">{title}</h1>
                <p className="text-sm text-slate-700 mt-2 font-hand">{description}</p>
            </header>
            {children}
        </div>
    </main>
);

const Notice: React.FC<{ title: string; date: string; text: string }> = ({ title, date, text }) => (
    <article className={cardClass}>
        <p className="text-xs uppercase tracking-widest font-mono-draft text-slate-500">{date}</p>
        <h2 className="text-xl font-bold font-draft text-[var(--ink)] mt-2">{title}</h2>
        <p className="text-sm text-slate-700 mt-2 font-hand">{text}</p>
    </article>
);

const ContactCard: React.FC<{ title: string; detail: string; action: string }> = ({ title, detail, action }) => (
    <article className={cardClass}>
        <h2 className="text-xl font-bold font-draft text-[var(--ink)]">{title}</h2>
        <p className="text-sm text-slate-700 mt-2 font-hand">{detail}</p>
        <a href={action} className="inline-block mt-4 sketch-btn px-4 py-2 text-sm font-bold">Call desk</a>
    </article>
);