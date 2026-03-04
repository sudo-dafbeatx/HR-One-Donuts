import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

// Initialize bot without polling since we use webhooks
export const telegramBot = token ? new TelegramBot(token, { polling: false }) : null;

interface TelegramSendResult {
  ok: boolean;
  description?: string;
}

/**
 * Send a message to a specific Telegram chat
 */
export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  parseMode: 'HTML' | 'Markdown' = 'HTML',
  replyMarkup?: TelegramBot.InlineKeyboardMarkup
): Promise<TelegramSendResult> {
  if (!telegramBot) {
    console.warn('[Telegram] TELEGRAM_BOT_TOKEN is not set. Skipping message.');
    return { ok: false, description: 'Bot token not configured' };
  }

  try {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const message = await telegramBot.sendMessage(chatId, text, {
      parse_mode: parseMode,
      reply_markup: replyMarkup
    });
    /* eslint-enable @typescript-eslint/no-unused-vars */

    return { ok: true, description: 'Message sent' };
  } catch (error) {
    console.error('[Telegram] Error sending message:', error);
    return { ok: false, description: (error as Error).message };
  }
}

/**
 * Send a notification to the admin chat
 */
export async function sendAdminNotification(
  text: string,
  replyMarkup?: TelegramBot.InlineKeyboardMarkup
): Promise<TelegramSendResult> {
  if (!chatId) {
    console.warn('[Telegram] TELEGRAM_ADMIN_CHAT_ID is not set. Skipping admin notification.');
    return { ok: false, description: 'Admin chat ID not configured' };
  }

  return sendTelegramMessage(chatId, text, 'HTML', replyMarkup);
}
