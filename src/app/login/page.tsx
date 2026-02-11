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
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  
  // New State for Registration & OTP
  const [isRegistering, setIsRegistering] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [profileCompletionStep, setProfileCompletionStep] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  
  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const redirectTo = searchParams.get('next') || '/';

  const handleRedirection = useCallback(async (userId: string) => {
    try {
      // Check user role in profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', userId)
        .single();

      if (profile?.role === 'admin') {
        router.push('/admin');
        router.refresh();
      } else if (!profile?.full_name && !profileCompletionStep) {
        // Only if we haven't already decided to show the completion step
        setProfileCompletionStep(true);
      } else {
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err) {
      console.error('Redirection error:', err);
      router.push('/');
    }
  }, [supabase, router, redirectTo, profileCompletionStep]);

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

    if (isRegistering) {
      // Step 1: Send OTP for Registration
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
        }
      });

      if (otpError) {
        console.error('OTP Send Error:', otpError);
        setError(`Gagal mengirim kode: ${otpError.message}. (Tips: Cek apakah limit pengiriman email Supabase sudah habis, biasanya 3 email/jam jika belum pakai custom SMTP)`);
        setLoading(false);
      } else {
        setOtpStep(true);
        setLoading(false);
        setSuccess(`Kode verifikasi telah dikirim ke ${email}`);
      }
      return;
    }

    // Normal Login with Password
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

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const token = otpCode.join('');
    if (token.length < 6) {
      setError('Harap masukkan kode verifikasi lengkap (6 angka)');
      setLoading(false);
      return;
    }

    // Use 'email' type for OTP codes sent via signInWithOtp
    const { data: authData, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });

    if (verifyError) {
      console.error('OTP Verify Error:', verifyError);
      setError('Kode verifikasi salah atau sudah kedaluwarsa. Silakan coba lagi.');
      setLoading(false);
    } else if (authData.user) {
      setLoading(false);
      // Explicitly check for profile completion after OTP
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', authData.user.id)
        .single();
      
      if (!profile?.full_name) {
        setOtpStep(false);
        setProfileCompletionStep(true);
      } else {
        finishOtpLogin(authData.user.id);
      }
    }
  };

  const handleProfileCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Sesi telah berakhir. Silakan login kembali.');
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone,
        address,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Profile update error:', updateError);
      setError('Gagal menyimpan profil. Silakan coba lagi.');
      setLoading(false);
    } else {
      setLoading(false);
      finishOtpLogin(user.id);
    }
  };

  const finishOtpLogin = async (userId: string) => {
    await logTraffic({
      event_type: 'login_success',
      path: '/login',
      user_id: userId,
    });
    handleRedirection(userId);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...otpCode];
    newCode[index] = value.slice(-1);
    setOtpCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
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

  // Profile Completion Screen
  if (profileCompletionStep) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-6">
        <div className="w-full max-w-[440px]">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-black text-slate-900 mb-2">Lengkapi Profil</h1>
            <p className="text-slate-500 font-medium">Bantu kami mengenal Anda lebih baik untuk pengiriman Donat yang pas!</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleProfileCompletion} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Nama Lengkap</label>
              <input
                type="text"
                placeholder="Masukkan nama Anda"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all font-medium"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Nomor WhatsApp</label>
              <input
                type="tel"
                placeholder="0812xxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-14 px-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all font-medium"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Alamat Pengiriman</label>
              <textarea
                placeholder="Alamat lengkap Anda"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full min-h-[120px] p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all font-medium resize-none"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group"
            >
              {loading ? 'Menyimpan...' : 'Selesai & Ke Beranda'}
              {!loading && <svg className="size-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // OTP Verification Screen
  if (otpStep) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-6">
        <div className="w-full max-w-[400px]">
          <button 
            onClick={() => {
              setOtpStep(false);
              setSuccess('');
            }}
            className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-primary mb-8 transition-colors"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg>
            Kembali
          </button>

          <div className="mb-10 text-center">
            <h1 className="text-3xl font-black text-slate-900 mb-2">Verifikasi Email</h1>
            <p className="text-slate-500 font-medium">Masukkan 6 digit kode yang dikirim ke <br/><span className="text-slate-900 font-bold">{email}</span></p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-8">
            <div className="flex justify-between gap-2">
              {otpCode.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="size-12 sm:size-14 text-center text-2xl font-black bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
            >
              {loading ? 'Memverifikasi...' : 'Verifikasi & Lanjut'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-slate-400">
            Belum menerima kode? <button onClick={() => setOtpStep(false)} className="text-primary font-bold hover:underline">Kirim ulang</button>
          </p>
        </div>
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
            Hadirkan kebahagiaan di setiap gigitan. {isRegistering ? 'Daftar sekarang untuk mulai menikmati donat artisan kami.' : 'Login sekarang untuk mulai memesan donat artisan favorit keluarga Anda.'}
          </p>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[400px]">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-black text-slate-900 mb-2">
              {isRegistering ? 'Daftar Akun Baru' : 'Masuk ke HR-One Donuts'}
            </h1>
            <p className="text-slate-500 font-medium tracking-tight">
              {isRegistering ? 'Biar pesan donat makin gampang' : 'Login dulu biar bisa pesan donat'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold animate-shake">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 rounded-2xl text-sm font-bold">
              {success}
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
              {isRegistering ? 'Daftar dengan Google' : 'Masuk dengan Google'}
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

              {!isRegistering && (
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
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-2"
              >
                {loading ? 'Sabar ya...' : (isRegistering ? 'Kirim Kode Verifikasi' : 'Masuk dengan Email')}
                {!loading && <svg className="size-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>}
              </button>
            </form>

            <div className="pt-8 text-center space-y-4">
              <p className="text-sm font-medium text-slate-500">
                {isRegistering ? 'Sudah punya akun?' : 'Belum punya akun?'}
                <button 
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError('');
                    setSuccess('');
                  }}
                  className="ml-2 text-primary font-black hover:underline"
                >
                  {isRegistering ? 'Masuk Sekarang' : 'Daftar Sekarang'}
                </button>
              </p>

              <Link 
                href="/" 
                className="text-sm font-bold text-slate-400 hover:text-primary transition-colors flex items-center justify-center gap-2 group"
              >
                Liat-liat dulu, tanpa login
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
