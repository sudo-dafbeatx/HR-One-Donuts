'use client';

import { CheckCircleIcon, XCircleIcon, CommandLineIcon } from '@heroicons/react/24/solid';

interface SystemHealthWidgetProps {
  dbStatus: 'OK' | 'ERROR';
}

export default function SystemHealthWidget({ dbStatus }: SystemHealthWidgetProps) {
  const isOk = dbStatus === 'OK';

  return (
    <div className="bg-white rounded-lg shadow-[0_0_28px_0_rgba(82,63,105,0.08)] border border-slate-100/50 p-4 shrink h-fit max-h-[250px] transition-all hover:shadow-[0_0_28px_0_rgba(82,63,105,0.12)]">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-50">
        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <CommandLineIcon className="w-3.5 h-3.5 text-slate-500" />
          System Health
        </h4>
        <div className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-tight uppercase ${isOk ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {isOk ? 'Healthy' : 'Degraded'}
        </div>
      </div>

      <div className="space-y-3">
        {/* Database Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${isOk ? 'bg-green-50' : 'bg-red-50'}`}>
              {isOk ? (
                <CheckCircleIcon className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <XCircleIcon className="w-3.5 h-3.5 text-red-500" />
              )}
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-700 leading-tight">Supabase DB</p>
              <p className="text-[9px] text-slate-400 font-medium">Cloud Connection</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold ${isOk ? 'text-green-600' : 'text-red-600'}`}>
            {isOk ? 'OK' : 'ERROR'}
          </span>
        </div>

        {/* API Status (Simulated as OK if client loads) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-green-50">
              <CheckCircleIcon className="w-3.5 h-3.5 text-green-500" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-700 leading-tight">Next.js API</p>
              <p className="text-[9px] text-slate-400 font-medium">Edge Runtime</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-green-600">OK</span>
        </div>
      </div>
      
      <div className="mt-4 p-1.5 flex justify-center items-center rounded-md bg-slate-50 border border-slate-100">
        <div className="text-[9px] text-slate-400 font-medium">
          Verified at: {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}
