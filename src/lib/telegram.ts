/**
 * Telegram Bot API utility for HR-One Donuts
 * Sends messages via the Telegram Bot API (100% free, no library needed)
 */

const TELEGRAM_API = 'https://api.telegram.org/bot';

interface TelegramSendResult {
  ok: boolean;
  description?: string;
}

/**
 * Send a message to a specific Telegram chat
 */
export async function sendTelegramMessage(
  chatId: string,
  text: string,
  parseMode: 'HTML' | 'Markdown' = 'HTML'
): Promise<TelegramSendResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.warn('[Telegram] TELEGRAM_BOT_TOKEN is not set. Skipping message.');
    return { ok: false, description: 'Bot token not configured' };
  }

  try {
    const response = await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
      }),
    });

    const result = await response.json();

    if (!result.ok) {
      console.error('[Telegram] Failed to send message:', result.description);
    }

    return result;
  } catch (error) {
    console.error('[Telegram] Error sending message:', error);
    return { ok: false, description: (error as Error).message };
  }
}

/**
 * Send a notification to the admin chat
 */
export async function sendAdminNotification(text: string): Promise<TelegramSendResult> {
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!chatId) {
    console.warn('[Telegram] TELEGRAM_ADMIN_CHAT_ID is not set. Skipping admin notification.');
    return { ok: false, description: 'Admin chat ID not configured' };
  }

  return sendTelegramMessage(chatId, text);
}
