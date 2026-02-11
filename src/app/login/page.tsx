'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { logTraffic } from '@/app/actions/traffic-actions';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const redirectTo = searchParams.get('next') || '/';

  const handleRedirection = useCallback(async (userId: string) => {
    try {
      // Check user role in profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (profile?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push(redirectTo);
      }
      router.refresh();
    } catch (err) {
      console.error('Redirection error:', err);
      router.push('/');
    }
  }, [supabase, router, redirectTo]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        handleRedirection(user.id);
      } else {
        logTraffic({
          event_type: 'login_view',
          path: '/login',
        });
      }
      setChecking(false);
    };
    checkUser();
  }, [supabase.auth, handleRedirection]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Email atau password salah. Silakan coba lagi.');
      setLoading(false);
    } else if (authData.user) {
      await logTraffic({
        event_type: 'login_success',
        path: '/login',
        user_id: authData.user.id,
      });
      handleRedirection(authData.user.id);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-white">
      {/* Left Decoration - Desktop Only */}
      <div className="hidden md:flex md:w-1/2 bg-slate-50 items-center justify-center p-12 border-r border-slate-100">
        <div className="max-w-md text-center">
          <div className="size-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 text-primary">
            <svg className="size-12" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z" fill="currentColor"></path>
            </svg>
          </div>
          <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">HR-One <span className="text-primary">Donuts</span></h2>
          <p className="text-slate-500 text-lg leading-relaxed">
            Hadirkan kebahagiaan di setiap gigitan. Login sekarang untuk mulai memesan donat artisan favorit keluarga Anda.
          </p>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[400px]">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-black text-slate-900 mb-2">Masuk ke HR-One Donuts</h1>
            <p className="text-slate-500 font-medium tracking-tight">Login dulu biar bisa pesan donat</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold animate-shake">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-14 bg-white border-2 border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-all rounded-2xl flex items-center justify-center gap-3 font-bold text-slate-700 shadow-sm active:scale-95 disabled:opacity-50"
            >
              <svg className="size-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Masuk dengan Google
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-xs uppercase font-black text-slate-300 tracking-widest bg-white px-4">Atau</div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Email</label>
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all font-medium"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all font-medium"
                  required
                  disabled={loading}
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-2"
              >
                {loading ? 'Sedang masuk...' : 'Masuk dengan Email'}
                {!loading && <svg className="size-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>}
              </button>
            </form>

            <div className="pt-8 text-center">
              <Link 
                href="/" 
                className="text-sm font-bold text-slate-400 hover:text-primary transition-colors flex items-center justify-center gap-2 group"
              >
                Lihat-lihat dulu, tanpa login
                <svg className="size-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
