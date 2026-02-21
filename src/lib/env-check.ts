/**
 * Environment variable validation.
 * Import this module in the root server layout to ensure
 * all required env vars are present at startup.
 */

const requiredPublicVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const;

const recommendedServerVars = [
  'SUPABASE_SERVICE_ROLE_KEY',
] as const;

function validateEnv() {
  const missing: string[] = [];

  for (const key of requiredPublicVars) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `[ENV] Missing required environment variables:\n${missing.map(k => `  - ${k}`).join('\n')}\n` +
      'Please check your .env.local file.'
    );
  }

  // Warn about recommended server vars (non-fatal)
  for (const key of recommendedServerVars) {
    if (!process.env[key]) {
      console.warn(
        `[ENV] Warning: ${key} is not set. Admin features like force-logout will not work.`
      );
    }
  }
}

// Run validation on import
validateEnv();

export {};
