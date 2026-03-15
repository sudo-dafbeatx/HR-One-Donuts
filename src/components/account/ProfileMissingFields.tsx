"use client";

import Link from "next/link";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

export interface MissingField {
  label: string;
  field: string;
}

interface ProfileMissingFieldsProps {
  fields: MissingField[];
}

export default function ProfileMissingFields({ fields }: ProfileMissingFieldsProps) {
  if (fields.length === 0) return null;

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500 delay-150">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1">
        Lengkapi data berikut:
      </p>
      <div className="grid gap-2">
        {fields.map((field, index) => (
          <Link
            key={field.field}
            href="/settings/account/edit"
            className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-slate-100 hover:border-primary/20 transition-all group active:scale-[0.98]"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className="size-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
              <span className="text-xs font-bold text-slate-700">{field.label}</span>
            </div>
            <ChevronRightIcon className="size-3.5 text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  );
}
