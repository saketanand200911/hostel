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
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

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

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed.');
      if (data.welcomeEmailSent) alert(`Welcome, ${data.user.name}! A welcome email was sent to ${data.user.email}.`);
      localStorage.setItem('campushaven_user', JSON.stringify(data.user));
      if (data.token) localStorage.setItem('campushaven_token', data.token);
      setInstitution(data.user.institution);
      setGender(data.user.gender);
      navigate(data.user.role === 'student' ? '/student' : '/admin');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    const returnTo = `${window.location.origin}/login`;
    window.location.assign(`${apiBaseUrl}/auth/google/start?returnTo=${encodeURIComponent(returnTo)}`);
  };

  const handleSignup = async () => {
    const signupIdentifier = signupEmail.trim() || signupPhone.trim();
    if (!signupIdentifier || !signupName.trim() || signupPassword.length < 8) {
      alert('Enter a name, email or phone number, and a password of at least 8 characters.');
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: signupIdentifier,
          password: signupPassword,
          name: signupName,
          institution,
          gender,
          floor,
          roomNumber,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Sign-up failed.');
      if (data.welcomeEmailSent) alert(`Welcome, ${data.user.name}! A welcome email was sent to ${data.user.email}.`);
      localStorage.setItem('campushaven_user', JSON.stringify(data.user));
      if (data.token) localStorage.setItem('campushaven_token', data.token);
      navigate('/student');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Sign-up failed.');
    }
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
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              className="w-full sketch-input px-3 py-2 text-sm font-bold"
            />
            <input
              type="tel"
              placeholder="Phone number"
              value={signupPhone}
              onChange={(e) => setSignupPhone(e.target.value)}
              className="w-full sketch-input px-3 py-2 text-sm font-bold"
            />
            <input
              type="text"
              placeholder="Full name"
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
              className="w-full sketch-input px-3 py-2 text-sm font-bold"
            />
            <input
              type="password"
              placeholder="Password (8+ characters)"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              minLength={8}
              className="w-full sketch-input px-3 py-2 text-sm font-bold"
            />
            <button
              type="button"
              onClick={handleSignup}
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
            handleLogin(e);
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
              Email or Phone Number
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. alex@example.com or +91..."
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
              minLength={8}
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
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};
