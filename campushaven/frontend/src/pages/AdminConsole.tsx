import React, { useState, useEffect } from 'react';
import { useTheme } from '../components/ThemeProvider';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface RoomData {
  id: string;
  floor: string;
  roomNumber: string;
  gender: string;
  institution: string;
  capacity: number;
  occupied: number;
  status: string;
}

export const AdminConsole: React.FC = () => {
  const { institution, gender } = useTheme();
  const [curfewActive, setCurfewActive] = useState(true);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [activeAlert, setActiveAlert] = useState<string | null>(null);
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Turnstile logs mock data
  const [auditLogs, setAuditLogs] = useState([
    { id: 'LOG-8821', student: 'Alex Chen', room: 'GF-101', action: 'ENTRY SCAN', time: '10:14 PM', status: 'Approved' },
    { id: 'LOG-8820', student: 'Ananya Sharma', room: '1F-203', action: 'EXIT SCAN', time: '09:45 PM', status: 'Approved' },
    { id: 'LOG-8819', student: 'Rohan Verma', room: '1F-202', action: 'ENTRY SCAN', time: '09:30 PM', status: 'Approved' },
    { id: 'LOG-8818', student: 'David Kim', room: 'GF-102', action: 'LATE ENTRY', time: '10:35 PM', status: 'Flagged (Curfew)' },
  ]);

  // Fetch mock rooms from backend
  useEffect(() => {
    setLoadingRooms(true);
    fetch(`/api/rooms?institution=${institution}&gender=${gender}`)
      .then((res) => {
        if (!res.ok) throw new Error('API fetch error');
        return res.json();
      })
      .then((data) => {
        setRooms(data);
        setLoadingRooms(false);
      })
      .catch(() => {
        setRooms([
          { id: 'GF-101', floor: 'GF', roomNumber: '101', gender, institution, capacity: 2, occupied: 2, status: 'Full' },
          { id: 'GF-102', floor: 'GF', roomNumber: '102', gender, institution, capacity: 2, occupied: 1, status: 'Available' },
          { id: '1F-201', floor: '1F', roomNumber: '201', gender, institution, capacity: 2, occupied: 1, status: 'Available' },
          { id: '1F-202', floor: '1F', roomNumber: '202', gender, institution, capacity: 2, occupied: 2, status: 'Full' }
        ]);
        setLoadingRooms(false);
      });
  }, [institution, gender]);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setActiveAlert(`Broadcast sent to all wings: "${broadcastMessage}"`);
    setBroadcastMessage('');
    setTimeout(() => setActiveAlert(null), 5000);
  };

  const handleAuditTrigger = () => {
    const newEntry = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      student: 'Samir Patel',
      room: 'GF-105',
      action: 'TURNSTILE AUDIT VERIFY',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Live Verified'
    };
    setAuditLogs([newEntry, ...auditLogs]);
    setActiveAlert('Live turnstile gate audit successfully synchronized.');
    setTimeout(() => setActiveAlert(null), 3000);
  };

  // Chart data
  const chartData = [
    { name: 'GF West', occupied: 45, capacity: 50 },
    { name: 'GF East', occupied: 48, capacity: 50 },
    { name: '1F West', occupied: 42, capacity: 50 },
    { name: '1F East', occupied: 49, capacity: 50 },
  ];

  return (
    <div className="min-h-screen overflow-y-auto p-4 sm:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="sketch-card p-6 sm:p-8 relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="washi-tape"></div>

          <div>
            <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase mb-2 bg-[var(--paper)] text-[var(--ink)] border border-[var(--sketch-border)] font-mono-draft">
              🛡️ Admin & Warden Command Console
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--ink)] font-draft">
              Hostel Command Center
            </h1>
            <p className="text-sm text-slate-700 mt-1 font-hand">
              Drafting Telemetry for <span className="font-bold text-[var(--ink)] capitalize">{gender} Wing</span> at <span className="font-bold text-[var(--ink)] capitalize">{institution === 'hi-tech' ? 'Hi-Tech University' : 'Mirai Institute'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 font-draft">
            <button
              onClick={handleAuditTrigger}
              className="px-4 py-2 sketch-btn bg-white text-[var(--ink)] text-xs font-bold flex items-center gap-2"
            >
              🔄 Refresh Audit Sync
            </button>
          </div>
        </div>

        {/* Global Broadcast Notification */}
        {activeAlert && (
          <div className="bg-amber-100 border-2 border-amber-600 text-amber-900 px-4 py-3 sketch-box flex items-center justify-between shadow-md font-hand text-base">
            <span>📢 {activeAlert}</span>
            <button onClick={() => setActiveAlert(null)} className="font-bold text-lg hover:text-black">✕</button>
          </div>
        )}

        {/* SECTION 1: Campus Overview */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight font-draft text-[var(--ink)]">
              1. Campus Overview <span className="text-xs font-mono-draft font-normal opacity-60">(Telemetry)</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono-draft">Updated Real-Time</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Occupancy */}
            <div className="sketch-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider font-mono-draft">Total Occupancy</span>
                <span className="text-lg">🛏️</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black font-draft text-[var(--ink)]">92.4%</span>
                <span className="text-xs text-emerald-700 font-bold font-hand">+1.8% vs last term</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 font-mono-draft">184 / 200 Beds Allocated</p>
            </div>

            {/* Metric 2: Active Leaves */}
            <div className="sketch-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider font-mono-draft">Active Leaves</span>
                <span className="text-lg">🌴</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black font-draft text-[var(--ink)]">18</span>
                <span className="text-xs text-slate-600 font-hand">Outpasses</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 font-mono-draft">4 Pending Approvals</p>
            </div>

            {/* Metric 3: Open Tickets */}
            <div className="sketch-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider font-mono-draft">Open Tickets</span>
                <span className="text-lg">🔧</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black font-draft text-amber-700">7</span>
                <span className="text-xs text-slate-600 font-hand">Maintenance</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 font-mono-draft">3 High Priority</p>
            </div>

            {/* Metric 4: Security Alerts */}
            <div className="sketch-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider font-mono-draft">Security Alerts</span>
                <span className="text-lg">🚨</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black font-draft text-emerald-700">0</span>
                <span className="text-xs text-emerald-700 font-bold font-hand">Breaches</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 font-mono-draft">6 Turnstiles Online</p>
            </div>
          </div>

          {/* Chart & Room Grid Sub-Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
            {/* Occupancy Chart */}
            <div className="lg:col-span-6 sketch-card p-6">
              <h3 className="text-base font-bold font-draft text-[var(--ink)] mb-4">
                📊 Wing Occupancy by Floor Block (Beds)
              </h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#0f172a" fontSize={12} fontFamily="Patrick Hand" />
                    <YAxis stroke="#0f172a" fontSize={12} fontFamily="Space Mono" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', border: '2px solid #0f172a', borderRadius: '8px', color: '#0f172a', fontFamily: 'Patrick Hand' }}
                    />
                    <Bar dataKey="occupied" radius={[4, 4, 0, 0]}>
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill="var(--accent)" stroke="#0f172a" strokeWidth={2} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Live Rooms Status via API */}
            <div className="lg:col-span-6 sketch-card-alt p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold font-draft text-[var(--ink)]">
                  Live Room Ledger (GF & 1F)
                </h3>
                <span className="text-xs font-mono-draft px-2 py-0.5 bg-[var(--paper)] sketch-box text-[var(--ink)]">
                  {loadingRooms ? 'Syncing...' : `${rooms.length} Units`}
                </span>
              </div>
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 font-hand">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between p-3 sketch-box bg-white text-xs"
                  >
                    <div>
                      <span className="font-bold text-[var(--ink)] font-draft text-sm mr-2">Room {room.roomNumber} ({room.floor})</span>
                      <span className="text-slate-500 capitalize font-mono-draft">{room.gender} • {room.institution}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-700 font-mono-draft">
                        {room.occupied}/{room.capacity} beds
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-mono-draft text-[10px] font-bold border ${room.status === 'Full'
                            ? 'bg-red-50 text-red-700 border-red-400'
                            : room.status === 'Available'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-400'
                              : 'bg-blue-50 text-blue-700 border-blue-400'
                          }`}
                      >
                        {room.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Controls */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight font-draft text-[var(--ink)]">
              2. Controls & Turnstile Security
            </h2>
            <span className="text-xs text-slate-500 font-mono-draft">Warden Operations</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Control 1: Curfew & Turnstiles (6 cols) */}
            <div className="lg:col-span-6 sketch-card p-6 space-y-6">
              {/* Curfew Enforcement Toggle */}
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-[var(--ink)] text-base font-draft">Curfew Enforcement Lock</h3>
                    <p className="text-xs text-slate-600 mt-0.5 font-hand">
                      Automatically flag turnstile entries after 10:00 PM IST.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !curfewActive;
                      setCurfewActive(next);
                      setActiveAlert(`Curfew lock protocol has been ${next ? 'ACTIVATED' : 'DEACTIVATED'}.`);
                    }}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full border-2 border-[var(--sketch-border)] transition-colors ${curfewActive ? 'bg-amber-400' : 'bg-slate-300'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-[var(--sketch-border)] transition-transform ${curfewActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                </div>
                <div className="mt-3 p-3 bg-[var(--paper)] sketch-box flex items-center justify-between text-xs font-mono-draft">
                  <span className="text-slate-600">Curfew Status:</span>
                  <span className={`font-bold ${curfewActive ? 'text-amber-800' : 'text-slate-500'}`}>
                    {curfewActive ? '🔒 Active (10:00 PM - 06:00 AM)' : '🔓 Lifted / Open Access'}
                  </span>
                </div>
              </div>

              {/* Broadcast Announcement Form */}
              <div>
                <h3 className="font-bold text-[var(--ink)] text-base mb-1 font-draft">Broadcast Notice</h3>
                <p className="text-xs text-slate-600 mb-3 font-hand">
                  Push instant notifications to resident portals in this wing.
                </p>
                <form onSubmit={handleBroadcast} className="space-y-3 font-hand">
                  <input
                    type="text"
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="e.g. Fire alarm drill scheduled for Saturday 11:00 AM"
                    className="w-full sketch-input px-3 py-2 text-sm font-bold"
                  />
                  <div className="flex justify-end font-draft">
                    <button
                      type="submit"
                      style={{ backgroundColor: 'var(--accent)', color: '#0f172a' }}
                      className="px-4 py-2 sketch-btn text-xs font-bold"
                    >
                      📢 Publish Broadcast
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Control 2: Turnstile Audit Logs (6 cols) */}
            <div className="lg:col-span-6 sketch-card-alt p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[var(--ink)] text-base font-draft">Turnstile Gate Audit Log</h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[var(--paper)] text-[var(--ink)] border border-[var(--sketch-border)] font-mono-draft">
                    Live Feed
                  </span>
                </div>
                <div className="space-y-2 font-hand">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 sketch-box bg-white text-xs"
                    >
                      <div>
                        <div className="font-bold text-[var(--ink)] font-draft text-sm">{log.student} <span className="text-slate-500 font-mono-draft text-xs">({log.room})</span></div>
                        <div className="text-[11px] text-slate-500 font-mono-draft">{log.action} • {log.time}</div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded font-mono-draft text-[10px] font-bold border ${log.status.includes('Flagged')
                            ? 'bg-red-100 text-red-800 border-red-500'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-500'
                          }`}
                      >
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t-2 border-[var(--sketch-border)] flex justify-between items-center text-[11px] text-slate-600 font-mono-draft mt-4">
                <span>Warden on Duty: Sgt. H. Miller</span>
                <span>Caretaker / Warden on Duty: Govind (+91 85097 04392)</span>
                <span className="text-emerald-700 font-bold">● Turnstile System Online</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
