import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../components/ThemeProvider';
import { Gender, Institution } from '../theme';

type Role = 'student' | 'warden' | 'admin';

export const LoginPage: React.FC = () => {
  const { institution, setInstitution, gender, setGender } = useTheme();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>('student');
  const [floor, setFloor] = useState<'GF' | '1F'>('GF');
  const [roomNumber, setRoomNumber] = useState<string>('101');
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('••••••••');
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionToken = params.get('google_session');
    const googleError = params.get('google_error');
    if (googleError) alert(`Google login failed: ${googleError}`);
    if (!sessionToken) return;

    fetch(`${apiBaseUrl}/auth/google/session?token=${encodeURIComponent(sessionToken)}`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then(({ user, welcomeEmailSent }) => {
        localStorage.setItem('campushaven_user', JSON.stringify(user));
        if (welcomeEmailSent) alert(`Welcome, ${user.name}! A welcome email was sent to ${user.email}.`);
        navigate('/student');
      })
      .catch(() => alert('Google login session could not be completed.'));
  }, [apiBaseUrl, navigate]);

  const handleLogin = (
    loginRole: Role = role,
    customData?: {
      name: string;
      institution: Institution;
      gender: Gender;
      floor?: 'GF' | '1F';
      roomNumber?: string;
    }
  ) => {
    const activeInstitution = customData?.institution || institution;
    const activeGender = customData?.gender || gender;
    const activeFloor = customData?.floor || floor;
    const activeRoom = customData?.roomNumber || roomNumber;
    const activeName = customData?.name || name || (loginRole === 'student' ? 'Resident Student' : loginRole === 'warden' ? 'Chief Warden' : 'Campus Administrator');

    setInstitution(activeInstitution);
    setGender(activeGender);

    const authObject = {
      name: activeName,
      role: loginRole,
      institution: activeInstitution,
      gender: activeGender,
      floor: loginRole === 'student' ? activeFloor : undefined,
      roomNumber: loginRole === 'student' ? activeRoom : undefined,
      loginTime: new Date().toISOString(),
    };

    localStorage.setItem('campushaven_user', JSON.stringify(authObject));

    if (loginRole === 'student') {
      navigate('/student');
    } else {
      navigate('/admin');
    }
  };

  const handleGoogleLogin = () => {
    const returnTo = `${window.location.origin}/login`;
    window.location.assign(`${apiBaseUrl}/auth/google/start?returnTo=${encodeURIComponent(returnTo)}`);
  };

  return (
    <div className="min-h-screen overflow-y-auto flex items-center justify-center p-4 sm:p-6 transition-colors duration-300">
      <div className="w-full max-w-lg sketch-card p-6 sm:p-8 relative my-8">
        {/* Washi tape header */}
        <div className="washi-tape"></div>

        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="w-12 h-12 sketch-box mx-auto flex items-center justify-center font-black text-xl text-slate-900 shadow-md mb-3"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <span className="font-draft">CH</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--ink)] font-draft">
            Resident Authentication
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-hand mt-1">
            ✍️ Please enter credentials or select a quick demo profile below
          </p>
        </div>

        {/* Sign-up fields (email / phone) and Google login */}
        <div className="mb-6 bg-[var(--paper)] sketch-box p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider font-mono-draft">
              📧 Sign‑up
            </span>
          </div>
          <div className="grid gap-2">
            <input
              type="email"
              placeholder="Email address"
              className="w-full sketch-input px-3 py-2 text-sm font-bold"
            />
            <input
              type="tel"
              placeholder="Phone number"
              className="w-full sketch-input px-3 py-2 text-sm font-bold"
            />
            <button
              type="button"
              onClick={() => alert('Sign‑up not implemented')}
              className="w-full py-2 sketch-btn bg-white hover:bg-gray-50 text-[var(--ink)] font-bold"
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-2 sketch-btn bg-white hover:bg-gray-50 text-[var(--ink)] font-bold"
            >
              Continue with Google
            </button>
          </div>
        </div>

        {/* Role Tabs */}
        <div className="flex bg-[var(--paper)] sketch-box p-1 mb-6 font-draft">
          {(['student', 'warden', 'admin'] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-1.5 text-xs sm:text-sm font-bold rounded-lg capitalize transition-all ${role === r
                ? 'bg-[var(--accent)] text-slate-900 shadow-sm border border-[var(--sketch-border)]'
                : 'text-slate-600 hover:text-[var(--ink)]'
                }`}
            >
              {r === 'student' ? '🎒 Student' : r === 'warden' ? '📋 Warden' : '🛡️ Admin'}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="space-y-4 font-hand text-sm"
        >
          {/* Institution Selector */}
          <div>
            <label className="block text-xs font-bold text-[var(--ink)] mb-1 font-draft">
              Institution / Campus
            </label>
            <select
              value={institution}
              onChange={(e) => setInstitution(e.target.value as Institution)}
              className="w-full sketch-input px-3 py-2 text-sm font-bold"
            >
              <option value="hi-tech">🏛️ Hi-Tech University Campus</option>
              <option value="mirai">📐 Mirai Institute of Technology</option>
            </select>
          </div>

          {/* Gender / Wing Selector */}
          <div>
            <label className="block text-xs font-bold text-[var(--ink)] mb-1 font-draft">
              Hostel Wing
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
              className="w-full sketch-input px-3 py-2 text-sm font-bold"
            >
              <option value="boys">👦 Boys Hostel Wing</option>
              <option value="girls">👧 Girls Hostel Wing</option>
            </select>
          </div>

          {/* Floor and Room Number (Student Specific) */}
          {role === 'student' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[var(--ink)] mb-1 font-draft">
                  Floor
                </label>
                <select
                  value={floor}
                  onChange={(e) => setFloor(e.target.value as 'GF' | '1F')}
                  className="w-full sketch-input px-3 py-2 text-sm font-bold"
                >
                  <option value="GF">Ground Floor (GF)</option>
                  <option value="1F">First Floor (1F)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--ink)] mb-1 font-draft">
                  Room Number
                </label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. 101, 203"
                  required
                  className="w-full sketch-input px-3 py-2 text-sm font-bold font-mono-draft"
                />
              </div>
            </div>
          )}

          {/* Name/ID */}
          <div>
            <label className="block text-xs font-bold text-[var(--ink)] mb-1 font-draft">
              {role === 'student' ? 'Student Full Name / ID' : 'Staff Name / Designation'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={role === 'student' ? 'e.g. Alex Chen' : 'e.g. Govind'}
              className="w-full sketch-input px-3 py-2 text-sm font-bold"
            />
          </div>

          {/* Password (Mock) */}
          <div>
            <label className="block text-xs font-bold text-[var(--ink)] mb-1 font-draft">
              Security PIN / Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full sketch-input px-3 py-2 text-sm font-bold tracking-widest font-mono-draft"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{ backgroundColor: 'var(--accent)', color: '#0f172a' }}
            className="w-full py-3 text-base font-bold sketch-btn shadow-md mt-6"
          >
            ✓ Enter {role === 'student' ? 'Student Resident Portal' : 'Admin Console'}
          </button>
        </form>
      </div>
    </div>
  );
};
