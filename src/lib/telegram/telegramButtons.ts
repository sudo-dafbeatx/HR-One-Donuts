import TelegramBot from 'node-telegram-bot-api';

export const VALID_ORDER_STATUSES = ['confirmed', 'processing', 'shipping', 'ready', 'completed'];

const STATUS_LABELS: Record<string, string> = {
  confirmed: '✅ Confirmed',
  processing: '👨‍🍳 Processing',
  shipping: '🚚 Shipping',
  ready: '📦 Ready',
  completed: '✔️ Completed',
};

/**
 * Generates an inline keyboard for updating order status.
 * Replaces the button for the current status with a disabled/indicator button.
 */
export function getOrderStatusKeyboard(orderId: string, currentStatus?: string) {
  const keyboard: TelegramBot.InlineKeyboardButton[][] = [];
  let row: TelegramBot.InlineKeyboardButton[] = [];

  VALID_ORDER_STATUSES.forEach((status, index) => {
    // If this is the current status, show it differently and don't make it clickable
    if (status === currentStatus) {
      row.push({
        text: `📍 ${STATUS_LABELS[status]}`,
        callback_data: 'ignore' // Dummy callback data
      });
    } else {
      row.push({
        text: STATUS_LABELS[status],
        callback_data: `update_${orderId}_${status}`
      });
    }

    // 2 buttons per row looks good on mobile
    if (row.length === 2 || index === VALID_ORDER_STATUSES.length - 1) {
      keyboard.push(row);
      row = [];
    }
  });

  return {
    inline_keyboard: keyboard
  };
}
