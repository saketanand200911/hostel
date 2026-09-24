import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../components/ThemeProvider';

export const HomePage: React.FC = () => {
  const { institution, gender } = useTheme();
  const authUserStr = localStorage.getItem('campushaven_user');
  const authUser = authUserStr ? JSON.parse(authUserStr) : null;
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const institutionLabel = institution === 'hi-tech' ? 'Hi-Tech University' : 'Mirai Institute of Technology';
  const hostelLabel = gender === 'boys' ? "Men's Residential Hall" : "Women's Residential Hall";

  return (
    <div className="min-h-screen overflow-y-auto flex flex-col justify-between transition-colors duration-300">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col justify-center">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto mb-14 relative">
          {authUser && (
            <p className="text-sm font-bold text-emerald-700 mb-3 font-mono-draft">
              {timeOfDay}, {authUser.name || 'Resident'}! Your hostel desk is ready.
            </p>
          )}
          {/* Sketch Stamp Badge */}
          <div className="inline-block mb-4">
            <span className="stamp-badge text-xs">
              ★ OFFICIAL RESIDENCE BLUEPRINT 2026 ★
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[var(--ink)] mb-4 font-draft leading-tight">
            Welcome to <span className="highlighter">{institution === 'hi-tech' ? 'Hi-Tech' : 'Mirai'} CampusHaven</span>
          </h1>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white sketch-box text-xs font-bold text-[var(--ink)] mb-6 font-mono-draft">
            <span>📍 Active Wing: {hostelLabel}</span>
          </div>

          <p className="text-lg sm:text-2xl text-slate-700 leading-relaxed mb-8 font-hand">
            The hand-drafted hostel hub for living space management, instant QR gate pass verification,
            quick maintenance tickets, and residential ward control.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/login"
              style={{ backgroundColor: 'var(--accent)', color: '#0f172a' }}
              className="px-8 py-3.5 text-base font-bold sketch-btn shadow-lg transform hover:scale-105"
            >
              🚀 Access Resident & Staff Portal →
            </Link>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto w-full">
          {/* Card 1: Key Metrics */}
          <div className="relative sketch-card p-7">
            {/* Washi tape pin */}
            <div className="washi-tape"></div>

            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 sketch-box flex items-center justify-center text-slate-900 font-bold"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                📊
              </div>
              <h2 className="text-2xl font-bold font-draft" style={{ color: 'var(--ink)' }}>
                Key Metrics <span className="text-xs font-mono-draft font-normal opacity-60">(Telemetry)</span>
              </h2>
            </div>

            <p className="text-slate-600 text-sm mb-6 font-hand">
              Live operational metrics across all {institutionLabel} dorm blocks.
            </p>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[var(--paper)] sketch-box p-3 text-center">
                <span className="block text-2xl sm:text-3xl font-black font-draft text-[var(--ink)]">2,400+</span>
                <span className="text-xs text-slate-600 font-hand font-bold">Residents</span>
              </div>
              <div className="bg-[var(--paper)] sketch-box p-3 text-center">
                <span className="block text-2xl sm:text-3xl font-black font-draft text-[var(--ink)]">98%</span>
                <span className="text-xs text-slate-600 font-hand font-bold">Satisfaction</span>
              </div>
              <div className="bg-[var(--paper)] sketch-box p-3 text-center">
                <span className="block text-2xl sm:text-3xl font-black font-draft text-[var(--ink)]">24/7</span>
                <span className="text-xs text-slate-600 font-hand font-bold">Security</span>
              </div>
            </div>

            <div className="mt-5 p-2 bg-[var(--highlighter)]/50 rounded-lg text-xs font-mono-draft text-slate-800 border-l-4 border-[var(--accent)]">
              ✓ Audit status: All dorm blocks operating at peak capacity.
            </div>
          </div>

          {/* Card 2: Facilities */}
          <div className="relative sketch-card-alt p-7">
            {/* Washi tape pin */}
            <div className="washi-tape-accent"></div>

            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 sketch-box flex items-center justify-center text-slate-900 font-bold"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                🏢
              </div>
              <h2 className="text-2xl font-bold font-draft" style={{ color: 'var(--ink)' }}>
                Facilities <span className="text-xs font-mono-draft font-normal opacity-60">(Amenities)</span>
              </h2>
            </div>

            <p className="text-slate-600 text-sm mb-6 font-hand">
              Modern campus infrastructure built for comfort, athletic fitness, and study.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 bg-[var(--paper)] sketch-box p-3">
                <span className="text-2xl">📚</span>
                <div>
                  <h4 className="text-sm font-bold font-draft text-[var(--ink)]">Study Pods</h4>
                  <p className="text-xs text-slate-500 font-hand">Quiet acoustic pods</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[var(--paper)] sketch-box p-3">
                <span className="text-2xl">🧺</span>
                <div>
                  <h4 className="text-sm font-bold font-draft text-[var(--ink)]">Laundry</h4>
                  <p className="text-xs text-slate-500 font-hand">Smart app washers</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[var(--paper)] sketch-box p-3">
                <span className="text-2xl">🏋️‍♂️</span>
                <div>
                  <h4 className="text-sm font-bold font-draft text-[var(--ink)]">Gym & Fitness</h4>
                  <p className="text-xs text-slate-500 font-hand">Full athletic suite</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[var(--paper)] sketch-box p-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <h4 className="text-sm font-bold font-draft text-[var(--ink)]">Fiber WiFi</h4>
                  <p className="text-xs text-slate-500 font-hand">1 Gbps low latency</p>
                </div>
              </div>
            </div>

            <div className="mt-5 p-2 bg-[var(--highlighter)]/50 rounded-lg text-xs font-mono-draft text-slate-800 border-l-4 border-[var(--accent)]">
              ✓ 100% solar backup powering all study lounges and hubs.
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[var(--sketch-border)] py-6 text-center text-xs text-slate-600 bg-white font-mono-draft">
        <div className="max-w-7xl mx-auto px-4">
          CampusHaven Sketch Edition • Drafting Sheet #CH-2026 • {institutionLabel}
        </div>
      </footer>
    </div>
  );
};
