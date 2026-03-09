'use client';

import { useState, useCallback } from 'react';

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  variant?: 'default' | 'icon' | 'card';
  className?: string;
}

export default function ShareButton({ title, text, url, variant = 'default', className = '' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = useCallback(() => {
    if (url) return url;
    if (typeof window !== 'undefined') return window.location.href;
    return '';
  }, [url]);

  const handleShare = async () => {
    const shareUrl = getShareUrl();

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
        return;
      } catch (err) {
        if ((err as DOMException).name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleShare(); }}
        className={`p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white transition-all active:scale-90 ${className}`}
        aria-label="Bagikan"
        title="Bagikan"
      >
        {copied ? (
          <span className="material-symbols-outlined text-lg text-green-300">check</span>
        ) : (
          <span className="material-symbols-outlined text-lg">share</span>
        )}
      </button>
    );
  }

  if (variant === 'card') {
    return (
      <button
        onClick={handleShare}
        className={`flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-primary/30 hover:shadow-md rounded-2xl text-sm font-bold text-slate-600 hover:text-primary transition-all active:scale-95 ${className}`}
      >
        {copied ? (
          <>
            <span className="material-symbols-outlined text-green-500 text-lg">check_circle</span>
            Link Tersalin!
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-lg">share</span>
            Bagikan
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      className={`flex items-center justify-center gap-3 bg-white rounded-3xl p-6 shadow-xl border border-slate-100 hover:border-primary/30 hover:shadow-2xl transition-all font-black text-lg active:scale-95 ${
        copied ? 'text-green-600 border-green-200' : 'text-slate-700 hover:text-primary'
      } ${className}`}
    >
      {copied ? (
        <>
          <span className="material-symbols-outlined text-green-500">check_circle</span>
          Link Tersalin!
        </>
      ) : (
        <>
          <span className="material-symbols-outlined">share</span>
          Bagikan Event
        </>
      )}
    </button>
  );
}
