import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTheme } from './ThemeProvider';
import { Institution, Gender } from '../theme';

export const StickyNav: React.FC = () => {
  const { institution, setInstitution, gender, setGender } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const authUserStr = localStorage.getItem('campushaven_user');
  const authUser = authUserStr ? JSON.parse(authUserStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('campushaven_user');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[var(--paper)]/95 backdrop-blur-sm border-b-2 border-[var(--sketch-border)] transition-colors duration-300 shadow-sm">
      {/* Top drafting ruler markers decoration */}
      <div className="h-1.5 w-full bg-[var(--sketch-border)] flex justify-between px-2 opacity-30">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className={`w-0.5 bg-white ${i % 5 === 0 ? 'h-full' : 'h-1'}`} />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Handwritten Title */}
        <Link to="/" className="flex items-center gap-3 group">
          <div
            className="w-10 h-10 sketch-box flex items-center justify-center font-bold text-lg text-slate-900 shadow-sm transition-transform group-hover:rotate-3 group-hover:scale-105"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <span className="font-draft">CH</span>
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-[var(--ink)] block leading-tight font-draft">
              CampusHaven
            </span>
            <span className="text-xs text-slate-600 font-hand">
              ✏️ {institution === 'hi-tech' ? 'Hi-Tech Campus' : 'Mirai Institute'} • {gender === 'boys' ? "Boys' Wing" : "Girls' Wing"}
            </span>
          </div>
        </Link>

        {/* Controls & Hand-drawn Dropdowns */}
        <div className="flex items-center gap-2 sm:gap-4 font-hand">
          {/* Institution Selector */}
          <div className="flex items-center">
            <select
              aria-label="Select Institution"
              value={institution}
              onChange={(e) => setInstitution(e.target.value as Institution)}
              className="sketch-input text-xs sm:text-sm px-2.5 py-1.5 font-bold cursor-pointer"
            >
              <option value="hi-tech">🏛️ Hi-Tech Univ</option>
              <option value="mirai">📐 Mirai Institute</option>
            </select>
          </div>

          {/* Gender / Wing Selector */}
          <div className="flex items-center">
            <select
              aria-label="Select Wing Gender"
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
              className="sketch-input text-xs sm:text-sm px-2.5 py-1.5 font-bold cursor-pointer"
            >
              <option value="boys">👦 Boys Hostel</option>
              <option value="girls">👧 Girls Hostel</option>
            </select>
          </div>

          {/* Auth Action */}
          {authUser ? (
            <div className="flex items-center gap-2 font-draft">
              {authUser.role === 'student' && (
                <>
                  <nav className="hidden lg:flex items-center gap-1" aria-label="Resident pages">
                    <Link to="/student" className={`px-2 py-1 text-xs font-bold ${location.pathname === '/student' ? 'text-[var(--accent)]' : 'text-[var(--ink)]'}`}>Dashboard</Link>
                    <Link to="/student/timetable" className={`px-2 py-1 text-xs font-bold ${location.pathname === '/student/timetable' ? 'text-[var(--accent)]' : 'text-[var(--ink)]'}`}>Timetable</Link>
                    <Link to="/student/notices" className={`px-2 py-1 text-xs font-bold ${location.pathname === '/student/notices' ? 'text-[var(--accent)]' : 'text-[var(--ink)]'}`}>Notices</Link>
                    <Link to="/student/help" className={`px-2 py-1 text-xs font-bold ${location.pathname === '/student/help' ? 'text-[var(--accent)]' : 'text-[var(--ink)]'}`}>Help</Link>
                  </nav>
                  <select
                    aria-label="Open resident page"
                    value={location.pathname}
                    onChange={(event) => navigate(event.target.value)}
                    className="lg:hidden sketch-input text-xs px-2 py-1.5 font-bold"
                  >
                    <option value="/student">Dashboard</option>
                    <option value="/student/timetable">Timetable</option>
                    <option value="/student/notices">Notices</option>
                    <option value="/student/help">Help desk</option>
                  </select>
                </>
              )}
              <Link
                to={authUser.role === 'student' ? '/student' : '/admin'}
                className="hidden sm:inline-flex items-center px-3 py-1.5 text-xs font-bold sketch-btn bg-[var(--highlighter)] text-[var(--ink)]"
              >
                👤 {authUser.name.split(' ')[0]} ({authUser.role})
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs font-bold sketch-btn bg-white text-[var(--ink)] hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              style={{
                backgroundColor: location.pathname === '/login' ? '#ffffff' : 'var(--accent)',
                color: '#0f172a',
              }}
              className="px-4 py-1.5 text-xs sm:text-sm font-bold sketch-btn"
            >
              🔑 Portal Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
