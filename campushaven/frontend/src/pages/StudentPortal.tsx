import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useTheme } from '../components/ThemeProvider';
import { CalendarMenu } from '../components/CalendarMenu';

interface QuickActionModal {
  type: 'leave' | 'ticket' | 'feedback' | 'parcel' | null;
  title: string;
}

export const StudentPortal: React.FC = () => {
  const { institution, gender } = useTheme();
  const authUserStr = localStorage.getItem('campushaven_user');
  const user = authUserStr ? JSON.parse(authUserStr) : {
    name: 'Alex Chen',
    role: 'student',
    floor: 'GF',
    roomNumber: '101',
    institution: institution,
    gender: gender
  };

  const [activeModal, setActiveModal] = useState<QuickActionModal>({ type: null, title: '' });
  const [notification, setNotification] = useState<string | null>(null);

  // Form states for quick actions
  const [leaveDays, setLeaveDays] = useState('2');
  const [leaveReason, setLeaveReason] = useState('Home visit over weekend');
  const [ticketCategory, setTicketCategory] = useState('Electrical (Light/Fan)');
  const [ticketDescription, setTicketDescription] = useState('Ceiling fan regulator not working');
  const [messRating, setMessRating] = useState('4');
  const [messComment, setMessComment] = useState('Dinner menu quality is great this week.');
  const [messAttachment, setMessAttachment] = useState<File | null>(null);

  // Gate pass token data
  const passData = JSON.stringify({
    passId: `GP-${user.roomNumber || '101'}-${Date.now().toString().slice(-6)}`,
    resident: user.name,
    room: `${user.floor || 'GF'}-${user.roomNumber || '101'}`,
    campus: institution === 'hi-tech' ? 'Hi-Tech Campus' : 'Mirai Institute',
    wing: gender === 'boys' ? "Men's Hostel" : "Women's Hostel",
    validUntil: new Date(Date.now() + 86400000).toLocaleDateString(),
    status: 'AUTHORIZED',
  });

  const showSuccessNotice = (msg: string) => {
    setNotification(msg);
    setActiveModal({ type: null, title: '' });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="min-h-screen overflow-y-auto p-4 sm:p-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome & Profile Header */}
        <div className="sketch-card p-6 sm:p-8 relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="washi-tape"></div>

          <div>
            <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase mb-2 bg-[var(--paper)] text-[var(--ink)] border border-[var(--sketch-border)] font-mono-draft">
              {gender === 'boys' ? "👦 Men's Resident Wing" : "👧 Women's Resident Wing"}
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--ink)] font-draft">
              Resident Sketch Portal
            </h1>
            <p className="text-sm text-slate-700 mt-1 font-hand">
              Logged in as <span className="font-bold text-[var(--ink)]">{user.name}</span> • Room <span className="font-bold text-[var(--ink)] font-mono-draft">{user.floor || 'GF'}-{user.roomNumber || '101'}</span> ({institution === 'hi-tech' ? 'Hi-Tech Campus' : 'Mirai Institute'})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="stamp-badge text-xs bg-emerald-50 text-emerald-800 border-emerald-700">
              ✓ ACTIVE RESIDENT
            </span>
          </div>
        </div>

        <div className="sketch-card-alt p-6 sm:p-8 relative">
          <div className="washi-tape"></div>
          <p className="text-xs uppercase tracking-widest font-mono-draft text-slate-500">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}</p>
          <h2 className="text-3xl sm:text-4xl font-bold font-draft text-[var(--ink)] mt-1">Welcome back, {user.name}.</h2>
          <p className="text-sm text-slate-700 mt-2 font-hand">Your residence desk is ready with today&apos;s menu and schedule.</p>
        </div>

        <CalendarMenu />

        {notification && (
          <div className="bg-amber-100 border-2 border-amber-600 text-amber-900 px-4 py-3 sketch-box flex items-center justify-between shadow-md font-hand text-base">
            <span>📢 {notification}</span>
            <button onClick={() => setNotification(null)} className="font-bold text-lg hover:text-black">✕</button>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* QR Gate Pass Section (5 cols) */}
          <div className="lg:col-span-5 sketch-card p-6 sm:p-8 flex flex-col justify-between relative">
            <div className="washi-tape-accent"></div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold font-draft text-[var(--ink)]">
                  Digital Gate Pass
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 bg-[var(--highlighter)] text-slate-900 border border-[var(--sketch-border)] font-mono-draft rounded">
                  Turnstile Ready
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-6 font-hand">
                Scan at turnstiles or present physical scan to guard post desk.
              </p>

              <div className="bg-white p-4 sketch-box flex flex-col items-center justify-center shadow-inner mx-auto max-w-[230px]">
                <QRCodeSVG
                  value={passData}
                  size={180}
                  level="H"
                  includeMargin={true}
                  fgColor="#0f172a"
                />
              </div>

              <div className="mt-6 bg-[var(--paper)] sketch-box p-3 space-y-1.5 text-xs font-mono-draft">
                <div className="flex justify-between">
                  <span className="text-slate-500">Pass Type:</span>
                  <span className="font-bold text-[var(--ink)]">Daily Outpass</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-emerald-600">Verified & Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hostel Curfew:</span>
                  <span className="font-bold text-amber-700">10:00 PM IST</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-center text-slate-500 mt-4 font-script text-base">
              ~ Cryptographically verified with turnstile firmware v4.2 ~
            </p>
          </div>

          {/* Quick-Action List (7 cols) */}
          <div className="lg:col-span-7 sketch-card-alt p-6 sm:p-8 relative">
            <div className="washi-tape"></div>

            <h2 className="text-xl font-bold mb-2 font-draft text-[var(--ink)]">
              Quick Actions & Sticky Requests
            </h2>
            <p className="text-xs text-slate-600 mb-6 font-hand">
              File student welfare, leaves, and room repair forms directly to the warden ledger.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-hand">
              {/* Action 1: Leave Request */}
              <button
                type="button"
                onClick={() => setActiveModal({ type: 'leave', title: 'Submit Leave Request' })}
                className="p-5 sketch-box bg-white hover:bg-amber-50/70 text-left transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="text-3xl mb-2">🗓️</div>
                  <h3 className="font-bold text-lg text-[var(--ink)] group-hover:text-amber-700 font-draft">
                    Leave Request
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Apply for weekend leave, vacation outpass, or medical absence.
                  </p>
                </div>
                <span className="text-xs font-bold mt-4 text-[var(--ink)] font-draft flex items-center gap-1">
                  ✏️ File Outpass →
                </span>
              </button>

              {/* Action 2: Maintenance Ticket */}
              <button
                type="button"
                onClick={() => setActiveModal({ type: 'ticket', title: 'Create Maintenance Ticket' })}
                className="p-5 sketch-box bg-white hover:bg-amber-50/70 text-left transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="text-2xl mb-2">🔧</div>
                  <h3 className="font-bold text-lg text-[var(--ink)] group-hover:text-amber-700 font-draft">
                    Maintenance Ticket
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Report plumbing, electrical, carpentry, or WiFi room issues.
                  </p>
                </div>
                <span className="text-xs font-bold mt-4 text-[var(--ink)] font-draft flex items-center gap-1">
                  ✏️ Raise Ticket →
                </span>
              </button>

              {/* Action 3: Mess Feedback */}
              <button
                type="button"
                onClick={() => setActiveModal({ type: 'feedback', title: 'Submit Mess & Food Feedback' })}
                className="p-5 sketch-box bg-white hover:bg-amber-50/70 text-left transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="text-2xl mb-2">🍽️</div>
                  <h3 className="font-bold text-lg text-[var(--ink)] group-hover:text-amber-700 font-draft">
                    Mess Feedback
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Rate meals, suggest menu enhancements, and report hygiene.
                  </p>
                </div>
                <span className="text-xs font-bold mt-4 text-[var(--ink)] font-draft flex items-center gap-1">
                  ✏️ Review Food →
                </span>
              </button>

              {/* Action 4: Parcel Status */}
              <button
                type="button"
                onClick={() => setActiveModal({ type: 'parcel', title: 'Deliveries & Parcel Status' })}
                className="p-5 sketch-box bg-white hover:bg-amber-50/70 text-left transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="text-2xl mb-2">📦</div>
                  <h3 className="font-bold text-lg text-[var(--ink)] group-hover:text-amber-700 font-draft">
                    Parcel Status
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Track packages delivered at the guard house security desk.
                  </p>
                </div>
                <span className="text-xs font-bold mt-4 text-[var(--ink)] font-draft flex items-center gap-1">
                  ✏️ Check Desk →
                </span>
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="mt-6 p-4 bg-[var(--paper)] sketch-box flex flex-wrap items-center justify-between text-xs font-mono-draft gap-2">
              <span>Active Leave: <strong className="text-[var(--ink)]">None</strong></span>
              <span>Open Tickets: <strong className="text-amber-700">1 Pending</strong></span>
              <span>Parcels at Desk: <strong className="text-emerald-700">1 Ready</strong></span>
              <span>Gate Security: <a href="tel:112" className="text-rose-600 font-bold underline">112</a></span>
            </div>
          </div>
        </div>

        {/* Interactive Modals for Quick Actions */}
        {activeModal.type && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white sketch-card w-full max-w-md p-6 space-y-4 relative">
              <div className="flex justify-between items-center border-b-2 border-[var(--sketch-border)] pb-3">
                <h3 className="font-bold text-xl font-draft text-[var(--ink)]">
                  {activeModal.title}
                </h3>
                <button
                  onClick={() => setActiveModal({ type: null, title: '' })}
                  className="font-bold text-xl text-slate-600 hover:text-black"
                >
                  ✕
                </button>
              </div>

              {activeModal.type === 'leave' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    showSuccessNotice(`Leave request for ${leaveDays} day(s) submitted for Warden review!`);
                  }}
                  className="space-y-3 font-hand"
                >
                  <div>
                    <label className="block text-xs font-bold text-[var(--ink)] mb-1 font-draft">Duration (Days)</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={leaveDays}
                      onChange={(e) => setLeaveDays(e.target.value)}
                      className="w-full sketch-input px-3 py-2 text-sm font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--ink)] mb-1 font-draft">Reason for Leave</label>
                    <textarea
                      value={leaveReason}
                      onChange={(e) => setLeaveReason(e.target.value)}
                      rows={3}
                      className="w-full sketch-input px-3 py-2 text-sm font-bold"
                      required
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-2 font-draft">
                    <button
                      type="button"
                      onClick={() => setActiveModal({ type: null, title: '' })}
                      className="px-4 py-2 sketch-btn bg-slate-100 text-slate-700 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ backgroundColor: 'var(--accent)', color: '#0f172a' }}
                      className="px-4 py-2 sketch-btn text-xs font-bold"
                    >
                      Submit Leave Request
                    </button>
                  </div>
                </form>
              )}

              {activeModal.type === 'ticket' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    showSuccessNotice(`Maintenance ticket #${Math.floor(1000 + Math.random() * 9000)} logged successfully!`);
                  }}
                  className="space-y-3 font-hand"
                >
                  <div>
                    <label className="block text-xs font-bold text-[var(--ink)] mb-1 font-draft">Issue Category</label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      className="w-full sketch-input px-3 py-2 text-sm font-bold"
                    >
                      <option>Electrical (Light/Fan)</option>
                      <option>Plumbing / Restroom</option>
                      <option>Carpentry / Furniture</option>
                      <option>WiFi & LAN Connectivity</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--ink)] mb-1 font-draft">Description & Room details</label>
                    <textarea
                      value={ticketDescription}
                      onChange={(e) => setTicketDescription(e.target.value)}
                      rows={3}
                      className="w-full sketch-input px-3 py-2 text-sm font-bold"
                      required
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-2 font-draft">
                    <button
                      type="button"
                      onClick={() => setActiveModal({ type: null, title: '' })}
                      className="px-4 py-2 sketch-btn bg-slate-100 text-slate-700 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ backgroundColor: 'var(--accent)', color: '#0f172a' }}
                      className="px-4 py-2 sketch-btn text-xs font-bold"
                    >
                      Raise Ticket
                    </button>
                  </div>
                </form>
              )}

              {activeModal.type === 'feedback' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const feedback = {
                      rating: Number(messRating),
                      description: messComment,
                      attachmentName: messAttachment?.name || null,
                      submittedAt: new Date().toISOString(),
                    };
                    localStorage.setItem('campushaven_meal_feedback', JSON.stringify(feedback));
                    showSuccessNotice(`Thanks! Your ${messRating}-star meal feedback${messAttachment ? ' and attachment' : ''} has been recorded.`);
                  }}
                  className="space-y-3 font-hand"
                >
                  <div>
                    <span className="block text-xs font-bold text-[var(--ink)] mb-1 font-draft">Rate today&apos;s meal</span>
                    <div className="flex items-center gap-1" role="radiogroup" aria-label="Meal rating">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          role="radio"
                          aria-checked={Number(messRating) === rating}
                          aria-label={`${rating} star${rating === 1 ? '' : 's'}`}
                          onClick={() => setMessRating(String(rating))}
                          className={`text-3xl leading-none transition-transform hover:scale-110 ${rating <= Number(messRating) ? 'text-amber-500' : 'text-slate-300'}`}
                        >
                          ★
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-bold text-slate-600">{messRating}/5</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--ink)] mb-1 font-draft">Description / Suggestions</label>
                    <textarea
                      value={messComment}
                      onChange={(e) => setMessComment(e.target.value)}
                      rows={3}
                      className="w-full sketch-input px-3 py-2 text-sm font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--ink)] mb-1 font-draft" htmlFor="meal-attachment">Upload a meal photo or document</label>
                    <input
                      id="meal-attachment"
                      type="file"
                      accept="image/*,.pdf,.txt"
                      onChange={(e) => setMessAttachment(e.target.files?.[0] || null)}
                      className="w-full sketch-input px-3 py-2 text-xs font-bold"
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-2 font-draft">
                    <button
                      type="button"
                      onClick={() => setActiveModal({ type: null, title: '' })}
                      className="px-4 py-2 sketch-btn bg-slate-100 text-slate-700 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ backgroundColor: 'var(--accent)', color: '#0f172a' }}
                      className="px-4 py-2 sketch-btn text-xs font-bold"
                    >
                      Submit Feedback
                    </button>
                  </div>
                </form>
              )}

              {activeModal.type === 'parcel' && (
                <div className="space-y-3 font-hand">
                  <p className="text-sm text-slate-700">Deliveries awaiting resident pickup at the Main Gate Desk:</p>
                  <div className="bg-[var(--paper)] sketch-box p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-[var(--ink)] font-draft">📦 Amazon Logistics #8492</p>
                        <p className="text-xs text-slate-500 font-mono-draft">Arrived: Today, 11:20 AM</p>
                      </div>
                      <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-900 border border-amber-600 rounded font-mono-draft">
                        Ready
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2 font-draft">
                    <button
                      type="button"
                      onClick={() => setActiveModal({ type: null, title: '' })}
                      style={{ backgroundColor: 'var(--accent)', color: '#0f172a' }}
                      className="px-4 py-2 sketch-btn text-xs font-bold"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
