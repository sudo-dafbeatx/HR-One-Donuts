'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { useLoading } from '@/context/LoadingContext';
import Link from 'next/link';

import { logTraffic } from '@/app/actions/traffic-actions';
import { verifyCaptcha } from '@/app/actions/verify-captcha';
import { logAuthEvent } from '@/app/actions/auth-log-action';
import { normalizePhoneToID } from '@/lib/phone';

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const redirectingRef = useRef(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [phoneDuplicate, setPhoneDuplicate] = useState(false);
  const [phoneChecking, setPhoneChecking] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const phoneDebounceRef = useRef<NodeJS.Timeout | null>(null);
  
  const { setIsLoading } = useLoading();

  // New State for Registration & OTP
  const [isRegistering, setIsRegistering] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [throttleWarning, setThrottleWarning] = useState(false);
  const lastSubmitRef = useRef<number>(0);
  const THROTTLE_MS = 2500; // 2.5 second cooldown

  // Throttle guard — returns true if the action is allowed
  const canSubmit = () => {
    const now = Date.now();
    if (now - lastSubmitRef.current < THROTTLE_MS) {
      // Show throttle warning briefly
      setThrottleWarning(true);
      setTimeout(() => setThrottleWarning(false), 2000);
      return false;
    }
    lastSubmitRef.current = now;
    return true;
  };

  // Sync local loading with global loading
  useEffect(() => {
    setIsLoading(loading || checking, isRegistering ? 'Mendaftarkan akun...' : 'Sedang memproses...');
  }, [loading, checking, setIsLoading, isRegistering]);
  
  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [birthDate, setBirthDate] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const redirectTo = searchParams.get('next') || '/';

  const checkPhoneDuplicate = useCallback(async (phoneValue: string) => {
    if (!phoneValue || phoneValue.length < 8) {
      setPhoneDuplicate(false);
      return;
    }
    setPhoneChecking(true);
    try {
      const res = await fetch(`/api/check-phone?phone=${encodeURIComponent(phoneValue)}`);
      const data = await res.json();
      setPhoneDuplicate(data.exists === true);
    } catch {
      setPhoneDuplicate(false);
    } finally {
      setPhoneChecking(false);
    }
  }, []);

  const handlePhoneChange = useCallback((value: string) => {
    setPhone(value);
    setPhoneDuplicate(false);
    if (phoneDebounceRef.current) clearTimeout(phoneDebounceRef.current);
    phoneDebounceRef.current = setTimeout(() => checkPhoneDuplicate(value), 500);
  }, [checkPhoneDuplicate]);

  const handleRedirection = useCallback(async (userId: string, isAutoOnMount = false) => {
    if (redirectingRef.current) return;
    redirectingRef.current = true;
    const attemptFetchAndRedirect = async (): Promise<void> => {
      try {
        if (isAutoOnMount) {
          redirectingRef.current = false;
          setIsLoading(false);
          return;
        }
        
        const target = redirectTo.startsWith('http') ? new URL(redirectTo).pathname : redirectTo;
        router.push(target || '/');
        setTimeout(() => router.refresh(), 100);
      } catch (err) {
        console.error('Critical Redirection error:', err);
        redirectingRef.current = false;
        router.push('/');
      }
    };

    return attemptFetchAndRedirect();
  }, [router, redirectTo, setIsLoading]);

  useEffect(() => {
    const checkUser = async () => {
      const isSyncing = window.location.hash || window.location.search.includes('code');
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        if (isSyncing) setIsLoading(true, 'Menyinkronkan akun...');
        // Pass true to indicate this is an auto-check on mount
        handleRedirection(user.id, true);
      } else {
        logTraffic({
          event_type: 'login_view',
          path: '/login',
        });
      }
      setChecking(false);
    };
    checkUser();
  }, [supabase.auth, handleRedirection, setIsLoading]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpStep && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpStep, countdown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit()) return;
    setError('');
    setLoading(true);

    if (TURNSTILE_SITE_KEY) {
      if (!captchaToken) {
        setError('Silakan selesaikan verifikasi CAPTCHA.');
        setLoading(false);
        return;
      }
      const captchaResult = await verifyCaptcha(captchaToken);
      if (!captchaResult.success) {
        setError(captchaResult.error || 'Verifikasi CAPTCHA gagal.');
        setCaptchaToken(null);
        turnstileRef.current?.reset();
        setLoading(false);
        return;
      }
    }

    if (isRegistering) {
      if (password !== confirmPassword) {
        setError('Password dan konfirmasi password tidak cocok.');
        setLoading(false);
        return;
      }
      if (phoneDuplicate) {
        setError('Nomor HP sudah terdaftar. Gunakan nomor lain.');
        setLoading(false);
        return;
      }
      if (password.length < 8) {
        setError('Password minimal 8 karakter.');
        setLoading(false);
        return;
      }

      const normalizedPhone = normalizePhoneToID(phone);

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: normalizedPhone,
            address: address,
            birth_date: birthDate,
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback?next=${redirectTo}`,
        }
      });

      if (signUpError) {
        console.error('Sign Up Error:', signUpError);
        // Catch constraint violation from the trigger
        if (signUpError.message.includes('already exists') || signUpError.message.includes('unique constraint') || signUpError.message.includes('23505')) {
          setError('Nomor HP ini sudah terdaftar. Pakai nomor lain.');
        } else {
          setError(`Gagal mendaftar: ${signUpError.message}`);
        }
        setLoading(false);
      } else if (signUpData.user) {
        setOtpStep(true);
        setCountdown(60);
        setLoading(false);
        setSuccess(`Kode verifikasi telah dikirim ke ${email}`);
      }
      return;
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Email atau password salah. Silakan coba lagi.');
      setLoading(false);
    } else if (authData.user) {
      await Promise.all([
        logTraffic({
          event_type: 'login_success',
          path: '/login',
          user_id: authData.user.id,
        }),
        logAuthEvent(authData.user.id, 'login'),
      ]);
      // Explicit login, pass false
      handleRedirection(authData.user.id, false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit()) return;
    setError('');
    setLoading(true);

    const token = otpCode.join('');
    if (token.length < 6) {
      setError('Harap masukkan kode verifikasi lengkap (6 angka)');
      setLoading(false);
      return;
    }

    const { data: authData, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: isRegistering ? 'signup' : 'magiclink'
    });

    if (verifyError) {
      console.error('OTP Verify Error:', verifyError);
      setError('Kode verifikasi salah atau sudah kedaluwarsa. Silakan coba lagi.');
      setLoading(false);
    } else if (authData.user) {
      setLoading(false);
      finishOtpLogin(authData.user.id);
    }
  };

  const finishOtpLogin = async (userId: string) => {
    await Promise.all([
      logTraffic({
        event_type: 'login_success',
        path: '/login',
        user_id: userId,
      }),
      logAuthEvent(userId, 'otp_login'),
    ]);
    // Explicit login, pass false
    handleRedirection(userId, false);
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setLoading(true);
    setError('');
    setSuccess('');
    const { error: resendError } = await supabase.auth.resend({
      type: isRegistering ? 'signup' : 'signup',
      email,
    });
    setLoading(false);
    if (resendError) {
      setError(`Gagal mengirim ulang: ${resendError.message}`);
    } else {
      setSuccess('Kode baru telah dikirim!');
      setCountdown(60);
      setOtpCode(['', '', '', '', '', '']);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...otpCode];
    newCode[index] = value.slice(-1);
    setOtpCode(newCode);
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
    if (!canSubmit()) return;
    setError('');
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback?next=${redirectTo}`,
      },
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  };

  if (checking) return null;

  if (otpStep) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-10 animate-in fade-in duration-500">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800">Verifikasi Email</h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">Masukkan 6 digit kode yang dikirim ke <span className="font-bold text-gray-800">{email}</span></p>
        </div>
        {error && <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">{error}</div>}
        {success && <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 rounded-lg text-sm">{success}</div>}
        <form onSubmit={handleVerifyOtp} className="space-y-8">
          <div className="flex justify-between gap-2">
            {otpCode.map((digit, index) => (
              <input key={index} id={`otp-${index}`} type="text" maxLength={1} value={digit} onChange={(e) => handleOtpChange(index, e.target.value)} onKeyDown={(e) => handleKeyDown(index, e)} className="w-full h-14 text-center text-xl font-bold bg-white border border-gray-300 rounded-md focus:border-primary focus:outline-none" autoFocus={index === 0} />
            ))}
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-md bg-primary px-6 py-3 font-medium text-white transition hover:bg-primary/90 disabled:opacity-50">{loading ? 'Memverifikasi...' : 'Verifikasi & Lanjut'}</button>
        </form>
        <div className="mt-8 text-center text-sm text-gray-600">
          {countdown > 0 ? (<span>Kirim ulang dalam <span className="text-primary font-bold">{countdown}s</span></span>) : (<button onClick={handleResendOtp} disabled={loading} className="text-primary font-bold hover:underline">Kirim ulang</button>)}
          <div className="mt-4">
            <a href={`https://wa.me/${process.env.NEXT_PUBLIC_ADMIN_WA_NUMBER || '6285810658117'}`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-primary hover:underline">
              Butuh bantuan? Hubungi Admin
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (isRegistering) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-10 animate-in fade-in duration-500">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800">Daftar Akun</h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">Ayo bergabung dan nikmati donat spesial kami.</p>
        </div>
        {error && <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleLogin} noValidate className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Nama</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-md border border-gray-300 p-3 text-base" required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Tanggal Lahir</label>
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full rounded-md border border-gray-300 p-3 text-base text-gray-700" required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">WhatsApp</label>
              <input type="tel" value={phone} onChange={(e) => handlePhoneChange(e.target.value)} className={`w-full rounded-md border p-3 text-base ${phoneDuplicate ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} placeholder="Contoh: 0812..." required />
              {phoneChecking && <p className="mt-1 text-xs text-gray-400">Memeriksa nomor...</p>}
              {phoneDuplicate && <p className="mt-1 text-xs font-bold text-red-500">Nomor HP sudah terdaftar</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-gray-300 p-3 text-base" required />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Alamat</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-md border border-gray-300 p-3 text-base" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border border-gray-300 p-3 text-base" required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Konfirmasi</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-md border border-gray-300 p-3 text-base" required />
            </div>
          </div>
          {TURNSTILE_SITE_KEY && (<div className="flex justify-center"><Turnstile ref={turnstileRef} siteKey={TURNSTILE_SITE_KEY} onSuccess={(token) => setCaptchaToken(token)} /></div>)}
          <button type="submit" disabled={loading || phoneDuplicate} className="relative z-10 w-full rounded-md bg-primary px-6 py-3 font-medium text-white transition hover:bg-primary/90 disabled:opacity-50">{loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}</button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600">Sudah punya akun? <button onClick={() => setIsRegistering(false)} className="text-primary font-bold hover:underline">Masuk</button></div>
        <div className="mt-4 text-center">
          <a href={`https://wa.me/${process.env.NEXT_PUBLIC_ADMIN_WA_NUMBER || '6285810658117'}`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-primary hover:underline">
            Butuh bantuan? Hubungi Admin
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-10 animate-in fade-in duration-500">
      {throttleWarning && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-amber-50 text-amber-800 px-4 py-2 rounded-md shadow-lg border border-amber-200 text-sm font-semibold">Tunggu sebentar...</div>
      )}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Selamat Datang</h2>
        <p className="mt-2 text-sm text-gray-500 font-medium">Silakan masuk ke akun Anda untuk memesan.</p>
      </div>
      {error && <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">{error}</div>}
      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-600">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-gray-300 p-3 text-base focus:border-primary focus:outline-none" required />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-600">Password</label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline" tabIndex={-1}>
              Lupa Password?
            </Link>
          </div>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border border-gray-300 p-3 pr-10 text-base focus:border-primary focus:outline-none" required />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>
        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 font-medium">
            Ingat Saya
          </label>
        </div>
        {TURNSTILE_SITE_KEY && (<div className="flex justify-center"><Turnstile ref={turnstileRef} siteKey={TURNSTILE_SITE_KEY} onSuccess={(token) => setCaptchaToken(token)} /></div>)}
        <button type="submit" disabled={loading} className="w-full rounded-md bg-primary px-6 py-3 font-medium text-white transition hover:bg-primary/90 disabled:opacity-50">{loading ? 'Sedang Masuk...' : 'Sign In'}</button>
      </form>
      <div className="mt-8 pt-8 border-t border-gray-100"><button onClick={handleGoogleLogin} disabled={loading} className="w-full flex items-center justify-center gap-3 h-12 rounded-md border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-all"><GoogleIcon /> Masuk dengan Google</button></div>
      <div className="mt-8 text-center text-sm text-gray-600">Belum punya akun? <button onClick={() => setIsRegistering(true)} className="text-primary font-bold hover:underline">Daftar sekarang</button></div>
      <div className="mt-10 pt-6 border-t border-gray-50 text-center">
        <a href={`https://wa.me/${process.env.NEXT_PUBLIC_ADMIN_WA_NUMBER || '6285810658117'}`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-primary hover:underline mb-4 block">
          Butuh bantuan? Hubungi Admin
        </a>
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest" suppressHydrationWarning>© {new Date().getFullYear()} HR-One Donuts. All rights reserved.</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
      <LoginContent />
    </Suspense>
  );
}
