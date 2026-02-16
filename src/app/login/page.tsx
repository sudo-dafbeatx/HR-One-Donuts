'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { useLoading } from '@/context/LoadingContext';

import { logTraffic } from '@/app/actions/traffic-actions';
import { verifyCaptcha } from '@/app/actions/verify-captcha';

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
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
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  
  const { setIsLoading } = useLoading();

  // New State for Registration & OTP
  const [isRegistering, setIsRegistering] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [profileCompletionStep, setProfileCompletionStep] = useState(false);
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
    // If we're checking user status or a form is submitting
    setIsLoading(loading || checking, isRegistering ? 'Mendaftarkan akun...' : 'Sedang memproses...');
  }, [loading, checking, setIsLoading, isRegistering]);
  
  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const redirectTo = searchParams.get('next') || '/';

  const handleRedirection = useCallback(async (userId: string) => {
    const attemptFetchAndRedirect = async (count: number): Promise<void> => {
      try {
        // Use maybeSingle to prevent "single() expected 1 row" errors if trigger is slow
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          console.error('Profile fetch error:', error);
        }

        // If profile is not found yet, it might be due to a slow trigger.
        // We retry up to 2 times (total 3 attempts) with a delay.
        if (!profile && count < 2) {
          console.log(`Profile not found for user ${userId}, retrying (${count + 1}/2)...`);
          await new Promise(r => setTimeout(r, 1500));
          return attemptFetchAndRedirect(count + 1);
        }

        if (profile?.role === 'admin') {
          router.push('/admin');
          setTimeout(() => router.refresh(), 100);
        } else if (!profile?.full_name && !profileCompletionStep) {
          setProfileCompletionStep(true);
        } else {
          // Ensure redirectTo is relative or same-origin
          const target = redirectTo.startsWith('http') ? new URL(redirectTo).pathname : redirectTo;
          router.push(target || '/');
          setTimeout(() => router.refresh(), 100);
        }
      } catch (err) {
        console.error('Critical Redirection error:', err);
        router.push('/');
      }
    };

    return attemptFetchAndRedirect(0);
  }, [supabase, router, redirectTo, profileCompletionStep]);

  useEffect(() => {
    const checkUser = async () => {
      // If we have a hash or code, it's likely a redirect from Google/Auth
      const isSyncing = window.location.hash || window.location.search.includes('code');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        if (isSyncing) setIsLoading(true, 'Menyinkronkan akun...');
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
  }, [supabase.auth, handleRedirection, setIsLoading]);

  // Timer Effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpStep && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpStep, countdown]);

  // Compute Password Strength during render
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: '', color: '' };

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { score, label: 'Lemah', color: 'bg-red-500' };
    if (score <= 2) return { score, label: 'Sedang', color: 'bg-orange-500' };
    return { score, label: 'Kuat', color: 'bg-green-500' };
  };

  const strength = getPasswordStrength();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit()) return;
    setError('');
    setLoading(true);

    // Verify CAPTCHA first
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
      // Validate password match
      if (password !== confirmPassword) {
        setError('Password dan konfirmasi password tidak cocok.');
        setLoading(false);
        return;
      }
      if (password.length < 8) {
        setError('Password minimal 8 karakter.');
        setLoading(false);
        return;
      }

      // Register with email + password
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            address: address,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
        }
      });

      if (signUpError) {
        console.error('Sign Up Error:', signUpError);
        setError(`Gagal mendaftar: ${signUpError.message}`);
        setLoading(false);
      } else if (signUpData.user) {
        // Profile will be automatically created by the trigger with metadata (name, phone, address)
        setOtpStep(true);
        setCountdown(60);
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
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', authData.user.id)
        .single();
      
      if (!profile?.full_name && !isRegistering) {
        setOtpStep(false);
        setProfileCompletionStep(true);
      } else {
        finishOtpLogin(authData.user.id);
      }
    }
  };

  const handleProfileCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit()) return;
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
        address
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Profile update error detail:', updateError);
      setError(`Gagal menyimpan profil: ${updateError.message} (Kode: ${updateError.code})`);
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

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    const { error: resendError } = await supabase.auth.resend({
      type: isRegistering ? 'signup' : 'signup', // Default to signup for this flow
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
        redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  };


  // ─── Initial Loading / Auth Check ───
  if (checking) {
    return (
      <div className="bg-[#f6f7f8] min-h-screen flex items-center justify-center p-6">
        {/* GlobalLoading is handled by LoadingProvider via the useEffect sync */}
      </div>
    );
  }

  // ─── Profile Completion Screen ───
  if (profileCompletionStep) {
    return (
      <div className="bg-[#f6f7f8] min-h-screen flex flex-col uiverse-bg">
        <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-[520px] bg-white shadow-xl rounded-[1rem] overflow-hidden border border-slate-100">
            <div className="px-8 pt-10 pb-6 text-center">
              {/* Logo */}
              <div className="flex items-center justify-center gap-2 mb-6 text-primary">
                <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-3xl">donut_large</span>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">HR-One Donuts</h1>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Lengkapi Profil</h2>
              <p className="text-slate-500 font-medium">Bantu kami mengenal Anda untuk pengiriman yang pas!</p>
            </div>

            <div className="px-8 pb-10">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-semibold">
                  {error}
                </div>
              )}

              <form onSubmit={handleProfileCompletion} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 pl-1">Nama Lengkap</label>
                  <input
                    type="text"
                    placeholder="Masukkan nama lengkap Anda"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full rounded-full border border-slate-200 bg-slate-50 px-6 py-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 pl-1">Nomor WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="0812xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full rounded-full border border-slate-200 bg-slate-50 px-6 py-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 pl-1">Alamat Pengiriman</label>
                  <textarea
                    placeholder="Alamat lengkap Anda"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="block w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none min-h-[120px]"
                    required
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full flex h-14 items-center justify-center rounded-full bg-primary px-8 text-base font-bold text-white shadow-lg shadow-primary/30 hover:bg-blue-600 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? 'Menyimpan...' : 'Selesai & Ke Beranda'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ─── OTP / Email Verification Screen ───
  if (otpStep) {
    return (
      <div className="bg-[#f6f7f8] min-h-screen flex flex-col uiverse-bg">
        <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-[520px] bg-white shadow-xl rounded-[1rem] overflow-hidden border border-slate-100">
            
            <div className="px-8 pt-10 pb-6 text-center">
              {/* Logo */}
              <div className="flex items-center justify-center gap-2 mb-6 text-primary">
                <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-3xl">donut_large</span>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">HR-One Donuts</h1>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 mb-2">Verifikasi Email</h2>
              <p className="text-slate-500 font-medium">
                {isRegistering 
                  ? <>Masukkan 6 digit kode pendaftaran yang dikirim ke <br/><span className="text-slate-900 font-bold">{email}</span></>
                  : <>Masukkan 6 digit kode masuk yang dikirim ke <br/><span className="text-slate-900 font-bold">{email}</span></>
                }
              </p>
              
              <div className="mt-8">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-semibold">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 rounded-2xl text-sm font-semibold text-center">
                    {success}
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
                        className="size-12 sm:size-14 text-center text-2xl font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-slate-900"
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full flex h-14 items-center justify-center rounded-full bg-primary px-8 text-base font-bold text-white shadow-lg shadow-primary/30 hover:bg-blue-600 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {loading ? 'Memverifikasi...' : 'Verifikasi & Lanjut'}
                    </button>
                  </div>
                </form>
              </div>

              <p className="mt-8 text-center text-sm font-medium text-slate-400">
                {countdown > 0 ? (
                  <span>Kirim ulang dalam <span className="text-primary font-bold">{countdown}s</span></span>
                ) : (
                  <>Belum menerima email? <button onClick={handleResendOtp} disabled={loading} className="text-primary font-bold hover:underline">Kirim ulang</button></>
                )}
              </p>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-8 py-6 border-t border-slate-100 text-center">
              <p className="text-sm font-medium text-slate-600">
                <button 
                  onClick={() => {
                    setOtpStep(false);
                    setSuccess('');
                    setError('');
                  }}
                  className="text-primary font-bold hover:underline flex items-center justify-center gap-2 mx-auto"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  Kembali ke {isRegistering ? 'halaman daftar' : 'halaman masuk'}
                </button>
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // ─── REGISTRATION SCREEN ───
  // ═══════════════════════════════════════════════════════
  if (isRegistering) {
    return (
      <div className="bg-[#f6f7f8] min-h-screen flex flex-col uiverse-bg">
        <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-[520px] bg-white shadow-xl rounded-[1rem] overflow-hidden border border-slate-100">
            <div className="px-8 pt-10 pb-6 text-center">
              {/* Logo */}
              <div className="flex items-center justify-center gap-2 mb-6 text-primary">
                <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-3xl">donut_large</span>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">HR-One Donuts</h1>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Buat Akun Baru</h2>
              <p className="text-slate-500 font-medium">Fresh and Smooth HR Management</p>
            </div>

            <div className="px-8 pb-10">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-semibold">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 rounded-2xl text-sm font-semibold">
                  {success}
                </div>
              )}

              {/* Social Registration */}
              <div className="mb-8">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="flex w-full cursor-pointer items-center justify-center rounded-full h-14 px-6 border border-slate-200 bg-white text-slate-700 gap-3 text-base font-semibold hover:bg-slate-50 transition-colors duration-200 disabled:opacity-50 active:scale-[0.98]"
                >
                  <GoogleIcon />
                  <span>Daftar dengan Google</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm font-medium">
                  <span className="bg-white px-4 text-slate-500">atau daftar dengan email</span>
                </div>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 pl-1" htmlFor="full_name">Nama Lengkap</label>
                    <input
                      id="full_name"
                      type="text"
                      placeholder="Nama lengkap sesuai KTP"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="block w-full rounded-full border border-slate-200 bg-slate-50 px-6 py-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 pl-1" htmlFor="phone">Nomor Telepon</label>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="Contoh: 08123456789"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="block w-full rounded-full border border-slate-200 bg-slate-50 px-6 py-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 pl-1" htmlFor="reg_email">Email</label>
                  <input
                    id="reg_email"
                    type="email"
                    placeholder="anda@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-full border border-slate-200 bg-slate-50 px-6 py-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 pl-1" htmlFor="address">Alamat Lengkap</label>
                  <textarea
                    id="address"
                    placeholder="Masukkan alamat pengiriman lengkap"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    className="block w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-3 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 pl-1" htmlFor="reg_password">Kata Sandi</label>
                    <div className="relative">
                      <input
                        id="reg_password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full rounded-full border border-slate-200 bg-slate-50 px-6 py-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        required
                        disabled={loading}
                      />
                    </div>
                    {password && (
                      <div className="mt-2 px-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Keamanan: {strength.label}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                          <div className={`h-full transition-all duration-500 ${strength.color}`} style={{ width: `${(strength.score / 4) * 100}%` }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 pl-1" htmlFor="confirm_password">Konfirmasi Sandi</label>
                    <input
                      id="confirm_password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full rounded-full border border-slate-200 bg-slate-50 px-6 py-4 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <p className="text-[12px] text-slate-500 px-2">Minimal 8 karakter dengan kombinasi huruf dan angka.</p>

                {/* CAPTCHA */}
                {TURNSTILE_SITE_KEY ? (
                  <div className="flex justify-center pt-2">
                    <Turnstile
                      ref={turnstileRef}
                      siteKey={TURNSTILE_SITE_KEY}
                      onSuccess={(token) => setCaptchaToken(token)}
                      onExpire={() => setCaptchaToken(null)}
                      options={{ theme: 'light', size: 'flexible' }}
                    />
                  </div>
                ) : (
                  process.env.NODE_ENV === 'development' && (
                    <div className="text-[10px] text-orange-400 text-center py-2 bg-orange-50 rounded-xl border border-orange-100 italic">
                      Turnstile Site Key belum dipasang di .env.local
                    </div>
                  )
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading || (!!TURNSTILE_SITE_KEY && !captchaToken)}
                    className="w-full flex h-14 items-center justify-center rounded-full bg-primary px-8 text-base font-bold text-white shadow-lg shadow-primary/30 hover:bg-blue-600 hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Mendaftar...' : 'Daftar Akun'}
                  </button>
                </div>
              </form>

              {/* Terms & Policy */}
              <p className="mt-6 text-center text-xs text-slate-500 leading-relaxed">
                Dengan mendaftar, Anda menyetujui <span className="text-primary font-semibold">Syarat &amp; Ketentuan</span> serta <span className="text-primary font-semibold">Kebijakan Privasi</span> kami.
              </p>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-8 py-6 border-t border-slate-100 text-center">
              <p className="text-sm font-medium text-slate-600">
                Sudah punya akun? 
                <button 
                  onClick={() => {
                    setIsRegistering(false);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-primary font-bold hover:underline ml-1"
                >
                  Masuk Sekarang
                </button>
              </p>
            </div>
          </div>
        </main>

        {/* Bottom Footer */}
        <footer className="py-8 text-center text-slate-400 text-sm">
          <p>© 2025 HR-One Donuts. Seluruh Hak Cipta Dilindungi.</p>
        </footer>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // ─── LOGIN SCREEN ───
  // ═══════════════════════════════════════════════════════
  return (
    <div className="bg-[#eef5ff] min-h-screen flex items-center justify-center p-6 uiverse-bg">
      {/* Throttle Warning Toast */}
      {throttleWarning && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500 text-base">hourglass_top</span>
            Tunggu sebentar, sedang diproses...
          </div>
        </div>
      )}
      <div className="relative z-10 w-full max-w-[480px]">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-4xl">donut_large</span>
          </div>
          <h1 className="text-primary font-bold text-2xl tracking-tight">HR-One Donuts</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Fresh and Smooth</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[1.5rem] shadow-2xl shadow-primary/5 p-8 md:p-10 border border-white/20">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-[#0e141b] text-3xl font-bold leading-tight tracking-tight">Selamat Datang</h2>
            <p className="text-slate-500 text-base mt-2">Silakan masuk ke akun Anda</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-semibold">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 rounded-2xl text-sm font-semibold">
              {success}
            </div>
          )}

          {/* SSO Button */}
          <div className="mb-6">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 h-14 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-[#0e141b] font-semibold text-base px-6 disabled:opacity-50 active:scale-[0.98]"
            >
              <GoogleIcon />
              Masuk dengan Google
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center mb-6">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-sm font-medium">atau masuk dengan email</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label className="text-[#0e141b] text-sm font-semibold ml-1">Email Address</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">mail</span>
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-[#f6f7f8] border border-slate-200 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-[#0e141b] placeholder:text-slate-400"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[#0e141b] text-sm font-semibold">Password</label>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 pl-12 pr-12 bg-[#f6f7f8] border border-slate-200 rounded-full focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-[#0e141b] placeholder:text-slate-400"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* CAPTCHA */}
            {TURNSTILE_SITE_KEY ? (
              <div className="flex justify-center pt-1">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={TURNSTILE_SITE_KEY}
                  onSuccess={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken(null)}
                  options={{ theme: 'light', size: 'flexible' }}
                />
              </div>
            ) : (
              process.env.NODE_ENV === 'development' && (
                <div className="text-[10px] text-orange-400 text-center py-2 bg-orange-50 rounded-xl border border-orange-100 italic">
                  Turnstile Site Key belum dipasang di .env.local
                </div>
              )
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || (!!TURNSTILE_SITE_KEY && !captchaToken)}
                className="w-full h-14 bg-primary hover:bg-[#145fb8] text-white font-bold text-lg rounded-full shadow-lg shadow-primary/30 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sabar ya...' : 'Masuk'}
              </button>
            </div>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              Belum punya akun?
              <button 
                onClick={() => {
                  setIsRegistering(true);
                  setError('');
                  setSuccess('');
                }}
                className="text-primary font-bold hover:underline ml-1"
              >
                Daftar sekarang
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-slate-400 text-xs font-medium">© 2025 HR-One Donuts. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="bg-[#f6f7f8] min-h-screen flex items-center justify-center p-6">
        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
