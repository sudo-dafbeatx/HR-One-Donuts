'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  targetDate: string;
  className?: string;
}

export default function CountdownTimer({ targetDate, className = '' }: CountdownTimerProps) {
  const calculateTimeLeft = () => {
    const difference = new Date(targetDate).getTime() - new Date().getTime();

    if (difference > 0) {
      return {
        hours: Math.floor((difference / (1000 * 60 * 60))),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false,
      };
    } else {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
      };
    }
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const pad = (num: number) => num.toString().padStart(2, '0');

  if (timeLeft.isExpired) return null;

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1 hidden sm:inline-block">Berakhir dalam:</span>
      
      {/* Hours */}
      <div className="flex flex-col items-center">
        <div className="bg-slate-900 text-white rounded px-1.5 py-1 min-w-[24px] text-center shadow-sm">
          <span className="font-mono text-xs md:text-sm font-bold leading-none">{pad(timeLeft.hours)}</span>
        </div>
      </div>
      
      <span className="text-slate-900 font-bold text-xs">:</span>
      
      {/* Minutes */}
      <div className="flex flex-col items-center">
        <div className="bg-slate-900 text-white rounded px-1.5 py-1 min-w-[24px] text-center shadow-sm">
          <span className="font-mono text-xs md:text-sm font-bold leading-none">{pad(timeLeft.minutes)}</span>
        </div>
      </div>
      
      <span className="text-slate-900 font-bold text-xs">:</span>
      
      {/* Seconds */}
      <div className="flex flex-col items-center">
        <div className="bg-primary text-white rounded px-1.5 py-1 min-w-[24px] text-center shadow-sm">
          <span className="font-mono text-xs md:text-sm font-bold leading-none">{pad(timeLeft.seconds)}</span>
        </div>
      </div>
    </div>
  );
}
