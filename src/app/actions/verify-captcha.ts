'use server';

export async function verifyCaptcha(token: string): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.warn('TURNSTILE_SECRET_KEY not set — skipping CAPTCHA verification');
    return { success: true };
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    const data = await response.json();

    if (data.success) {
      return { success: true };
    } else {
      return { success: false, error: 'Verifikasi CAPTCHA gagal. Silakan coba lagi.' };
    }
  } catch (err) {
    console.error('CAPTCHA verification error:', err);
    return { success: false, error: 'Gagal memverifikasi CAPTCHA. Silakan coba lagi.' };
  }
}
