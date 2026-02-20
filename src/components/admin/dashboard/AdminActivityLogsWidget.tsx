'use client';

import { ClockIcon, UserCircleIcon } from '@heroicons/react/24/outline';

interface Log {
  id: string;
  created_at: string;
  action: string;
  details: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface AdminActivityLogsWidgetProps {
  logs: Log[];
}

export default function AdminActivityLogsWidget({ logs }: AdminActivityLogsWidgetProps) {
  return (
    <div className="bg-white rounded-lg shadow-[0_0_28px_0_rgba(82,63,105,0.08)] border border-slate-100/50 overflow-hidden h-full flex flex-col transition-all hover:shadow-[0_0_28px_0_rgba(82,63,105,0.12)]">
      <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <ClockIcon className="w-4 h-4 text-slate-500" />
          Recent Activity Logs
        </h4>
        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">Realtime</span>
      </div>
      
      <div className="flex-1 overflow-y-auto max-h-[400px]">
        {logs.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50/50 transition-colors group">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 mt-1">
                    <UserCircleIcon className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-black text-indigo-600 uppercase tracking-tight">
                        {log.action?.replace(/_/g, ' ') || 'ACTION'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                        {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed truncate">
                      {log.details}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                       <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                       <span className="text-[10px] text-slate-400 font-semibold truncate">
                         By: {log.profiles?.full_name || log.profiles?.email || 'Unknown'}
                       </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-12 h-12 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <ClockIcon className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-slate-400 text-xs font-bold">No recent activities found.</p>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-slate-50/50 border-t border-slate-50 text-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">End of Recent Activity</p>
      </div>
    </div>
  );
}
