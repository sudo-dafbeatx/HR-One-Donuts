'use client';

import { CheckIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

interface ToDoAdminWidgetProps {
  checks: {
    hasProducts: boolean;
    hasLogo: boolean;
    hasDescription: boolean;
    hasActivePromo: boolean;
  }
}

export default function ToDoAdminWidget({ checks }: ToDoAdminWidgetProps) {
  const tasks = [
    { id: 'product', label: 'Tambah produk pertama', completed: checks.hasProducts },
    { id: 'logo', label: 'Upload logo website', completed: checks.hasLogo },
    { id: 'desc', label: 'Lengkapi deskripsi toko', completed: checks.hasDescription },
    { id: 'promo', label: 'Aktifkan promo/event', completed: checks.hasActivePromo },
  ];

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = (completedCount / tasks.length) * 100;

  return (
    <div className="bg-white rounded-lg shadow-[0_0_28px_0_rgba(82,63,105,0.08)] border border-slate-100/50 p-4 md:p-5 h-fit max-h-[260px] md:max-h-[380px] flex flex-col transition-all hover:shadow-[0_0_28px_0_rgba(82,63,105,0.12)]">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <ClipboardDocumentListIcon className="w-4 h-4 text-indigo-500" />
          Setup Checklist
        </h4>
        <div className="text-[11px] font-bold text-slate-400">
          {completedCount}/{tasks.length} Selesai
        </div>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-1 mb-4 overflow-hidden shrink-0">
        <div 
          className="bg-indigo-600 h-1 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      <div className="space-y-2 overflow-y-auto pr-1 shrink">
        {tasks.map((task) => (
          <div 
            key={task.id} 
            className={clsx(
              "flex items-center gap-2.5 p-2 rounded-lg border transition-all duration-200",
              task.completed 
                ? "bg-emerald-50/50 border-emerald-100/50" 
                : "bg-white border-slate-100 opacity-70 grayscale-[0.5]"
            )}
          >
            <div className={clsx(
              "w-4 h-4 rounded-md flex items-center justify-center border transition-all shrink-0",
              task.completed 
                ? "bg-emerald-500 border-emerald-500 text-white" 
                : "bg-white border-slate-200 text-transparent"
            )}>
              <CheckIcon className="w-2.5 h-2.5 stroke-3" />
            </div>
            <span className={clsx(
              "text-[11px] font-bold transition-all leading-tight",
              task.completed ? "text-emerald-700" : "text-slate-500"
            )}>
              {task.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
