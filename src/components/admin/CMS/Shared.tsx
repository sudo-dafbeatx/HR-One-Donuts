import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export function AdminButton({ variant = 'primary', isLoading, children, className, ...props }: ButtonProps) {
  const baseStyles = "flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-50";
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90 shadow-sm",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    danger: "bg-red-500 text-white hover:bg-red-600",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-100",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} disabled={isLoading} {...props}>
      {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" /> : children}
    </button>
  );
}

type FormInputBaseProps = {
  label: string;
  error?: string;
};

type FormInputAsInputProps = FormInputBaseProps & {
  multiline?: false;
} & React.InputHTMLAttributes<HTMLInputElement>;

type FormInputAsTextAreaProps = FormInputBaseProps & {
  multiline: true;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export type FormInputProps = FormInputAsInputProps | FormInputAsTextAreaProps;

export function AdminInput(props: FormInputProps) {
  const { label, error, className = '', multiline, ...rest } = props;
  
  const commonClasses = "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800";

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-sm font-semibold text-slate-700">{label}</label>
      {multiline ? (
        <textarea
          className={commonClasses}
          {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          className={commonClasses}
          {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

export function AdminCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="font-bold text-slate-800 text-sm sm:text-base">{title}</h3>
      </div>
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
}

export function AdminSelect({ 
  label, 
  options, 
  error, 
  className = '', 
  ...props 
}: { 
  label: string; 
  options: { label: string; value: string }[]; 
  error?: string; 
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-sm font-semibold text-slate-700">{label}</label>
      <select
        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800"
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}
export function AdminCurrencyInput({ 
  label, 
  value, 
  onChange, 
  error, 
  className = '',
  ...props 
}: { 
  label: string; 
  value: number; 
  onChange: (value: number) => void;
  error?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  
  const formatDisplay = (val: number) => {
    return val.toLocaleString('id-ID');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-digits
    const rawValue = e.target.value.replace(/\D/g, '');
    const numericValue = rawValue === '' ? 0 : parseInt(rawValue, 10);
    onChange(numericValue);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none group-focus-within:text-primary transition-colors">
          Rp
        </span>
        <input
          type="text"
          className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 font-bold"
          value={formatDisplay(value)}
          onChange={handleChange}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}
