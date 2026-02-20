'use client';

import React from 'react';

interface GlobalLoadingProps {
  isVisible: boolean;
  message?: string;
}

export default function GlobalLoading({ isVisible, message = 'Please wait ...' }: GlobalLoadingProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/90 backdrop-blur-md transition-all duration-300">
      <div className="flex flex-col items-center justify-center gap-8 animate-fade-in">
        {/* New SVG Loader */}
        <div>
          <svg height="108px" width="108px" viewBox="0 0 128 128" className="loader">
            <defs>
              <clipPath id="loader-eyes">
                <circle transform="rotate(-40,64,64) translate(0,-56)" r="8" cy="64" cx="64" className="loader__eye1"></circle>
                <circle transform="rotate(40,64,64) translate(0,-56)" r="8" cy="64" cx="64" className="loader__eye2"></circle>
              </clipPath>
              <linearGradient y2="1" x2="0" y1="0" x1="0" id="loader-grad">
                <stop stopColor="#000" offset="0%"></stop>
                <stop stopColor="#fff" offset="100%"></stop>
              </linearGradient>
              <mask id="loader-mask">
                <rect fill="url(#loader-grad)" height="128" width="128" y="0" x="0"></rect>
              </mask>
            </defs>
            <g strokeDasharray="175.93 351.86" strokeWidth="12" strokeLinecap="round">
              <g>
                <rect clipPath="url(#loader-eyes)" height="64" width="128" fill="hsl(193,90%,50%)"></rect>
                <g stroke="hsl(193,90%,50%)" fill="none">
                  <circle transform="rotate(180,64,64)" r="56" cy="64" cx="64" className="loader__mouth1"></circle>
                  <circle transform="rotate(0,64,64)" r="56" cy="64" cx="64" className="loader__mouth2"></circle>
                </g>
              </g>
              <g mask="url(#loader-mask)">
                <rect clipPath="url(#loader-eyes)" height="64" width="128" fill="hsl(223,90%,50%)"></rect>
                <g stroke="hsl(223,90%,50%)" fill="none">
                  <circle transform="rotate(180,64,64)" r="56" cy="64" cx="64" className="loader__mouth1"></circle>
                  <circle transform="rotate(0,64,64)" r="56" cy="64" cx="64" className="loader__mouth2"></circle>
                </g>
              </g>
            </g>
          </svg>
        </div>
        
        {/* Loading Message */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-slate-900 font-display font-black text-2xl tracking-tight text-center">
            {message}
          </p>
          <div className="flex gap-1.5">
            <div className="size-1.5 bg-primary/40 rounded-full animate-pulse"></div>
            <div className="size-1.5 bg-primary/40 rounded-full animate-pulse [animation-delay:0.2s]"></div>
            <div className="size-1.5 bg-primary/40 rounded-full animate-pulse [animation-delay:0.4s]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
