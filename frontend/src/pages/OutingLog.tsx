import React, { useEffect, useState } from 'react';

interface OutingRecord {
  id: string;
  residentName?: string;
  roomNumber?: string;
  floor?: string;
  destination?: string;
  reason?: string;
  leaveDate?: string;
  leaveTime?: string;
  returnDate?: string;
  returnTime?: string;
  approvalReasons?: string[];
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'logged';
}

function getCurrentIndiaDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export const OutingLog: React.FC = () => {
  const [entryDate, setEntryDate] = useState(getCurrentIndiaDate);
  const [refreshCount, setRefreshCount] = useState(0);
  const [outings, setOutings] = useState<OutingRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [status, setStatus] = useState('');
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
  let userRole: string | undefined;
  try {
    userRole = JSON.parse(localStorage.getItem('campushaven_user') || 'null')?.role;
  } catch {
    userRole = undefined;
  }

  useEffect(() => {
    const token = localStorage.getItem('campushaven_token');
    if (!token) {
      setOutings([]);
      setLoaded(false);
      setStatus('Sign in again to load the outing log.');
      return;
    }

    const controller = new AbortController();
    setLoaded(false);
    setStatus('Loading outing records…');
    fetch(`${apiBaseUrl}/outpasses?date=${encodeURIComponent(entryDate)}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Could not load the outing log.');
        if (!Array.isArray(result.outings)) throw new Error('The server returned an invalid outing log.');
        setOutings(result.outings);
        setLoaded(true);
        setStatus(`Showing ${result.outings.length} entr${result.outings.length === 1 ? 'y' : 'ies'} submitted on ${entryDate}.`);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setOutings([]);
        setLoaded(false);
        setStatus(error instanceof TypeError
          ? `Cannot reach the backend at ${apiBaseUrl}. Confirm it is running and retry.`
          : error instanceof Error ? error.message : 'Could not load the outing log.');
      });
    return () => controller.abort();
  }, [apiBaseUrl, entryDate, refreshCount]);

  const decideOuting = async (id: string, decision: 'approved' | 'rejected') => {
    const token = localStorage.getItem('campushaven_token');
    if (!token) {
      setStatus('Sign in again to update outing approvals.');
      return;
    }
    setDecidingId(id);
    setStatus(`${decision === 'approved' ? 'Approving' : 'Rejecting'} outing…`);
    try {
      const response = await fetch(`${apiBaseUrl}/outpasses/${encodeURIComponent(id)}/decision`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ decision }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Could not update the outing.');
      setOutings((current) => current.map((outing) => outing.id === id
        ? { ...outing, status: result.outing.status }
        : outing));
      setStatus(`Outing ${decision}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not update the outing.');
    } finally {
      setDecidingId(null);
    }
  };

  return (
    <main className="min-h-screen overflow-y-auto p-4 sm:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
        <section className="sketch-card p-6 sm:p-8">
          <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase mb-2 bg-[var(--paper)] text-[var(--ink)] border border-[var(--sketch-border)] font-mono-draft">
            Staff records
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--ink)] font-draft">Outing Log</h1>
          <p className="text-sm text-slate-700 mt-1 font-hand">
            Live outing records for the selected submission date, including resident, room, reason, and submission time.
          </p>
        </section>

        <section className="sketch-card p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-lg font-bold font-draft text-[var(--ink)]">Submitted outing records</h2>
            <div className="flex items-end gap-2">
              <label className="text-xs font-bold text-slate-700">
                Submission date
                <input
                  type="date"
                  value={entryDate}
                  onChange={(event) => setEntryDate(event.target.value)}
                  className="ml-2 sketch-input px-2 py-1"
                />
              </label>
              <button
                type="button"
                onClick={() => setRefreshCount((count) => count + 1)}
                className="px-3 py-2 sketch-btn text-xs font-bold"
              >
                Refresh log
              </button>
            </div>
          </div>
          <p className="text-xs font-bold text-slate-600" role="status" aria-live="polite">{status}</p>
          {loaded && outings.length === 0 ? (
            <p className="text-sm text-slate-500">No outing entries are available for this date.</p>
          ) : (
            <div className="space-y-3">
              {outings.map((outing) => (
                <article key={outing.id} className="sketch-box p-4 bg-white space-y-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-bold text-[var(--ink)]">
                      {outing.residentName || 'Resident'} · Room {outing.floor ? `${outing.floor}-` : ''}{outing.roomNumber || 'Not set'}
                    </h3>
                    <span className="text-xs font-bold capitalize">{outing.status === 'logged' ? 'Recorded' : outing.status}</span>
                  </div>
                  <p className="text-xs text-slate-700">
                    Destination: {outing.destination || '—'} · Departure: {outing.leaveDate || '—'} {outing.leaveTime || ''}
                    {' · Return: '}{outing.returnDate || '—'} {outing.returnTime || ''}
                  </p>
                  <p className="text-xs text-slate-700">Reason: {outing.reason || '—'}</p>
                  {outing.status === 'pending' && (
                    <p className="text-xs font-bold text-amber-800">
                      Approval required: {(outing.approvalReasons || []).map((value) =>
                        value === 'after-curfew' ? 'after curfew' : value === 'multi-day' ? 'longer than 24 hours' : value
                      ).join(' and ') || 'staff review'}
                    </p>
                  )}
                  <p className="text-xs text-slate-600">
                    Submitted: {new Date(outing.submittedAt).toLocaleString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                  {outing.status === 'pending' && ['admin', 'warden'].includes(userRole || '') && (
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => decideOuting(outing.id, 'approved')}
                        disabled={decidingId === outing.id}
                        className="px-3 py-1.5 sketch-btn text-xs font-bold disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => decideOuting(outing.id, 'rejected')}
                        disabled={decidingId === outing.id}
                        className="px-3 py-1.5 sketch-btn text-xs font-bold disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};
