'use client';

import { useState, useEffect } from 'react';

export default function SiteLockToggle() {
  const [locked, setLocked] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/site-lock');
      const data = await res.json();
      setLocked(data.locked);
      setReason(data.reason);
    } catch {
      setLocked(false);
      setReason('error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    setToggling(true);
    try {
      const res = await fetch('/api/site-lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locked: !locked }),
      });
      const data = await res.json();
      if (data.success) {
        setLocked(data.locked);
        setReason(data.locked ? 'manual' : 'admin_override');
      }
    } catch (err) {
      console.error('Failed to toggle site lock:', err);
    } finally {
      setToggling(false);
    }
  };

  const getReasonLabel = () => {
    switch (reason) {
      case 'auto_25th': return 'Otomatis (Tanggal 25)';
      case 'manual': return 'Dikunci Manual';
      case 'admin_override': return 'Dibuka oleh Admin';
      default: return 'Normal';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-[0_0_28px_0_rgba(82,63,105,0.08)] border border-slate-100/50 p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-100 rounded w-1/2" />
          <div className="h-10 bg-slate-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg shadow-[0_0_28px_0_rgba(82,63,105,0.08)] border p-6 transition-colors ${
      locked ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100/50'
    }`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          locked ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
        }`}>
          <span className="material-symbols-outlined text-xl">
            {locked ? 'lock' : 'lock_open'}
          </span>
        </div>
        <div>
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">
            Status Website
          </h4>
          <p className={`text-[10px] font-bold uppercase tracking-wider ${
            locked ? 'text-red-500' : 'text-emerald-500'
          }`}>
            {locked ? '🔒 TERKUNCI' : '🟢 AKTIF'}
          </p>
        </div>
      </div>

      {/* Reason */}
      <div className="mb-4 px-3 py-2 bg-slate-50 rounded-lg">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Alasan</p>
        <p className="text-xs font-semibold text-slate-600">{getReasonLabel()}</p>
      </div>

      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        disabled={toggling}
        className={`w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 ${
          locked
            ? 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600'
            : 'bg-red-500 text-white shadow-red-500/20 hover:bg-red-600'
        } ${toggling ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {toggling ? (
          <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <span className="material-symbols-outlined text-lg">
            {locked ? 'lock_open' : 'lock'}
          </span>
        )}
        {locked ? 'Aktifkan Website' : 'Kunci Website'}
      </button>

      {/* Info */}
      <p className="mt-3 text-[9px] text-slate-400 text-center font-medium leading-relaxed">
        Website otomatis terkunci setiap tanggal 25. Admin selalu bisa mengakses dashboard.
      </p>
    </div>
  );
}
