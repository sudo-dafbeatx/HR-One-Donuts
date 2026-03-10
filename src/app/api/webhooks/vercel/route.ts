import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendAdminNotification } from '@/lib/telegram';

// Vercel Webhook Secret - set this in Vercel environment variables
const VERCEL_WEBHOOK_SECRET = process.env.VERCEL_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('x-vercel-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const bodyText = await req.text();
    let payload;
    try {
      payload = JSON.parse(bodyText);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // Verify signature if secret is provided
    if (VERCEL_WEBHOOK_SECRET) {
      const hmac = crypto.createHmac('sha1', VERCEL_WEBHOOK_SECRET);
      const computedSignature = hmac.update(bodyText).digest('hex');
      
      if (signature !== computedSignature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
      }
    } else {
      console.warn('⚠️ VERCEL_WEBHOOK_SECRET is not set. Webhook verification skipped.');
    }

    // Process the webhook payload
    const { type, payload: deployPayload } = payload;
    
    // We only care about deployment events
    if (type?.startsWith('deployment.')) {
      const { name, url, state, deployment } = deployPayload;
      
      // Determine emoji based on state
      let stateEmoji = '⏳';
      if (state === 'READY') stateEmoji = '✅';
      else if (state === 'ERROR' || state === 'CANCELED') stateEmoji = '❌';

      const branch = deployment?.meta?.githubCommitRef || 'unknown branch';
      const commitMsg = deployment?.meta?.githubCommitMessage || 'No commit message';

      const message = `
🚀 <b>Deployment Info</b>
---------------------------
📦 <b>Project:</b> ${name}
🌱 <b>Branch:</b> ${branch}
📝 <b>Commit:</b> <i>${commitMsg}</i>
📊 <b>Status:</b> ${stateEmoji} ${state}
🔗 <b>URL:</b> <a href="https://${url}">${url}</a>
---------------------------
<i>Sistem Webhook Vercel</i>
`;

      await sendAdminNotification(message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
