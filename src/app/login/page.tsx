'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { useLoading } from '@/context/LoadingContext';

import { logTraffic } from '@/app/actions/traffic-actions';
import { verifyCaptcha } from '@/app/actions/verify-captcha';
import { SiteSettings } from '@/types/cms';
import LogoBrand from '@/components/ui/LogoBrand';

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
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
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

  // Fetch Site Settings
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'site_info')
        .maybeSingle();
      
      if (data?.value) {
        setSiteSettings(data.value as unknown as SiteSettings);
      }
    };
    fetchSettings();
  }, [supabase]);

  const handleRedirection = useCallback(async (userId: string) => {
    const attemptFetchAndRedirect = async (count: number): Promise<void> => {
      try {
        // 1. Check existing profiles for role (admin)
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .maybeSingle();

        if (profile?.role === 'admin') {
          router.push('/admin');
          setTimeout(() => router.refresh(), 100);
          return;
        }

        // 2. Check new user_profiles for completeness
        const { data: userProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('is_profile_complete')
          .eq('id', userId)
          .maybeSingle();

        if (profileError) {
          console.error('User Profile fetch error:', profileError);
        }

        // If profile is not found, it might be a new user (especially Google Auth)
        if (!userProfile && count < 2) {
          console.log(`User profile not found for ${userId}, retrying...`);
          await new Promise(r => setTimeout(r, 1500));
          return attemptFetchAndRedirect(count + 1);
        }

        if (!userProfile?.is_profile_complete) {
          router.push('/onboarding/profile');
        } else {
          // Set cookie flag for middleware
          document.cookie = "hr_profile_complete=true; path=/; max-age=31536000; SameSite=Lax";
          
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
  }, [supabase, router, redirectTo]);

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
      <div className="bg-gray-100 min-h-screen flex items-center justify-center p-6 md:p-12 animate-in fade-in duration-500">
        <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl overflow-visible mt-12">
          {/* Circular Logo Header */}
          <div className="relative -mt-12 mb-4 flex justify-center">
            <LogoBrand 
              logoUrl="/images/logo-hr-one.png"
              size="lg"
              priority
            />
          </div>
          
          <div className="px-10 pb-10">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800">Lengkapi Profil</h2>
              <p className="mt-2 text-sm text-gray-500 font-medium">Bantu kami mengenal Anda untuk pengiriman yang pas!</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleProfileCompletion} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-600">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Nama lengkap Anda"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-3 text-sm text-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-600">Nomor WhatsApp</label>
                <input
                  type="tel"
                  placeholder="0812xxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-3 text-sm text-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-600">Alamat Pengiriman</label>
                <textarea
                  placeholder="Alamat lengkap Anda"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 p-3 text-sm text-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white transition-all resize-none"
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-indigo-600 px-6 py-3 font-medium text-white transition duration-300 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-opacity-50 disabled:opacity-50"
              >
                {loading ? 'Menyimpan...' : 'Selesai & Ke Beranda'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ─── OTP / Email Verification Screen ───
  if (otpStep) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center p-6 md:p-12 animate-in fade-in duration-500">
        <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl overflow-visible mt-12">
          {/* Circular Logo Header */}
          <div className="relative -mt-12 mb-4 flex justify-center">
            <LogoBrand 
              logoUrl="/images/logo-hr-one.png"
              size="lg"
              priority
            />
          </div>

          <div className="px-10 pb-10">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800">Verifikasi Email</h2>
              <p className="mt-2 text-sm text-gray-500 font-medium">
                {isRegistering 
                  ? <>Masukkan 6 digit kode yang dikirim ke <span className="font-bold text-gray-800">{email}</span></>
                  : <>Masukkan 6 digit kode masuk yang dikirim ke <span className="font-bold text-gray-800">{email}</span></>
                }
              </p>
            </div>
              
              <div className="mt-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 rounded-lg text-sm font-medium text-center">
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
                    className="w-full h-14 text-center text-xl font-bold bg-white border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all text-gray-800"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-indigo-600 px-6 py-3 font-medium text-white transition duration-300 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-opacity-50 disabled:opacity-50"
              >
                {loading ? 'Memverifikasi...' : 'Verifikasi & Lanjut'}
              </button>
            </form>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4">
              <p className="text-sm text-gray-600">
                {countdown > 0 ? (
                  <span>Kirim ulang dalam <span className="text-indigo-600 font-bold">{countdown}s</span></span>
                ) : (
                  <>Belum menerima email? <button onClick={handleResendOtp} disabled={loading} className="text-indigo-600 font-bold hover:underline">Kirim ulang</button></>
                )}
              </p>
              
              <button 
                onClick={() => {
                  setOtpStep(false);
                  setSuccess('');
                  setError('');
                }}
                className="text-sm text-gray-500 hover:text-indigo-600 font-medium flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Kembali
              </button>
          </div>
        </div>
      </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // ─── REGISTRATION SCREEN ───
  // ═══════════════════════════════════════════════════════
  if (isRegistering) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center p-6 md:p-12 animate-in fade-in duration-500">
        <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl overflow-visible mt-12">
          {/* Circular Logo Header */}
          <div className="relative -mt-12 mb-4 flex justify-center">
            <LogoBrand 
              logoUrl="/images/logo-hr-one.png"
              size="lg"
              priority
            />
          </div>

          <div className="px-10 pb-10">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800">Register now</h2>
              <p className="mt-2 text-sm text-gray-500 font-medium">Buat akun untuk mulai belanja donat favoritmu.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 rounded-lg text-sm font-medium">
                {success}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="flex gap-6">
                <div className="w-1/2">
                  <label className="mb-2 block text-sm font-medium text-gray-600">Nama Lengkap</label>
                  <input
                    type="text"
                    placeholder="Nama lengkap"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-md border border-gray-300 p-3 text-sm text-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white transition-all"
                    required
                  />
                </div>
                <div className="w-1/2">
                  <label className="mb-2 block text-sm font-medium text-gray-600">Nomor Telepon</label>
                  <input
                    type="tel"
                    placeholder="0812xxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-md border border-gray-300 p-3 text-sm text-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-600">Email</label>
                <input
                  type="email"
                  placeholder="anda@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-3 text-sm text-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-600">Alamat Lengkap (Awal)</label>
                <textarea
                  placeholder="Masukkan alamat pengiriman"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 p-3 text-sm text-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white transition-all resize-none"
                  required
                />
              </div>

              <div className="flex gap-6">
                <div className="w-1/2">
                  <label className="mb-2 block text-sm font-medium text-gray-600">Kata Sandi</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border border-gray-300 p-3 text-sm text-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white transition-all"
                    required
                  />
                </div>
                <div className="w-1/2">
                  <label className="mb-2 block text-sm font-medium text-gray-600">Konfirmasi Sandi</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-md border border-gray-300 p-3 text-sm text-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white transition-all"
                    required
                  />
                </div>
              </div>

              {TURNSTILE_SITE_KEY && (
                <div className="flex justify-center">
                  <Turnstile
                    ref={turnstileRef}
                    siteKey={TURNSTILE_SITE_KEY}
                    onSuccess={(token) => setCaptchaToken(token)}
                    onExpire={() => setCaptchaToken(null)}
                    options={{ theme: 'light', size: 'flexible' }}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading || (!!TURNSTILE_SITE_KEY && !captchaToken)}
                className="w-full rounded-md bg-indigo-600 px-6 py-3 font-medium text-white transition duration-300 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-opacity-50 disabled:opacity-50"
              >
                {loading ? 'Sedang Mendaftar...' : 'Daftar Akun'}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-100">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 h-12 rounded-md border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <GoogleIcon />
                Daftar dengan Google
              </button>
            </div>

            <p className="mt-8 text-center text-sm text-gray-600">
              Sudah punya akun? 
              <button onClick={() => setIsRegistering(false)} className="text-indigo-600 font-bold hover:underline ml-1">Masuk</button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // ─── LOGIN SCREEN ───
  // ═══════════════════════════════════════════════════════
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-6 md:p-12 animate-in fade-in duration-500">
      {/* Throttle Warning Toast */}
      {throttleWarning && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-5 py-3 rounded-md shadow-xl text-sm font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500 text-base">hourglass_top</span>
            Tunggu sebentar, sedang diproses...
          </div>
        </div>
      )}

      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl overflow-visible mt-12">
        {/* Circular Logo Header */}
        <div className="relative -mt-12 mb-4 flex justify-center">
          <LogoBrand 
            logoUrl="/images/logo-hr-one.png"
            size="lg"
            priority
          />
        </div>

        <div className="px-10 pb-10 pt-2">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800">Login to your account</h2>
            <p className="mt-2 text-sm text-gray-500 font-medium">Selamat datang kembali! Silakan masuk ke akun Anda.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 rounded-lg text-sm font-medium">
              {success}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-600">Email Address</label>
              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-3 text-sm text-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white transition-all"
                required
                disabled={loading}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-600">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {showPassword ? 'Sembunyikan' : 'Lihat Password'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password Anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 p-3 text-sm text-gray-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white transition-all"
                required
                disabled={loading}
              />
            </div>

            {TURNSTILE_SITE_KEY && (
              <div className="flex justify-center">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={TURNSTILE_SITE_KEY}
                  onSuccess={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken(null)}
                  options={{ theme: 'light', size: 'flexible' }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (!!TURNSTILE_SITE_KEY && !captchaToken)}
              className="w-full rounded-md bg-indigo-600 px-6 py-3 font-medium text-white transition duration-300 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:ring-opacity-50 disabled:opacity-50"
            >
              {loading ? 'Sedang Masuk...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 h-12 rounded-md border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <GoogleIcon />
              Masuk dengan Google
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            Belum punya akun?
            <button 
              onClick={() => {
                setIsRegistering(true);
                setError('');
                setSuccess('');
              }}
              className="text-indigo-600 font-bold hover:underline ml-1"
            >
              Daftar sekarang
            </button>
          </p>
        </div>

        <div className="bg-gray-50 p-6 text-center">
          <p className="text-xs text-gray-400 font-medium">
            © {new Date().getFullYear()} {siteSettings?.store_name || "HR-One Donuts"}. All rights reserved.
          </p>
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
