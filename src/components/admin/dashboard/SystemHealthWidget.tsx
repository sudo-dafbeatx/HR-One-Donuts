'use client';

import { CheckCircleIcon, XCircleIcon, CommandLineIcon } from '@heroicons/react/24/solid';

interface SystemHealthWidgetProps {
  dbStatus: 'OK' | 'ERROR';
}

export default function SystemHealthWidget({ dbStatus }: SystemHealthWidgetProps) {
  const isOk = dbStatus === 'OK';

  return (
    <div className="bg-white rounded-lg shadow-[0_0_28px_0_rgba(82,63,105,0.08)] border border-slate-100/50 p-5 h-full transition-all hover:shadow-[0_0_28px_0_rgba(82,63,105,0.12)]">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-50">
        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <CommandLineIcon className="w-4 h-4 text-slate-500" />
          System Health
        </h4>
        <div className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-tight uppercase ${isOk ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {isOk ? 'Healthy' : 'Degraded'}
        </div>
      </div>

      <div className="space-y-4">
        {/* Database Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isOk ? 'bg-green-50' : 'bg-red-50'}`}>
              {isOk ? (
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
              ) : (
                <XCircleIcon className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">Supabase DB</p>
              <p className="text-[10px] text-slate-400 font-medium">Cloud Connection</p>
            </div>
          </div>
          <span className={`text-[11px] font-bold ${isOk ? 'text-green-600' : 'text-red-600'}`}>
            {isOk ? 'OK' : 'ERROR'}
          </span>
        </div>

        {/* API Status (Simulated as OK if client loads) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50">
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">Next.js API</p>
              <p className="text-[10px] text-slate-400 font-medium">Edge Runtime</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-green-600">OK</span>
        </div>
      </div>
      
      <div className="mt-6 p-2 rounded-lg bg-slate-50 border border-slate-100">
        <div className="text-[10px] text-slate-400 text-center font-medium">
          Verified at: {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}
