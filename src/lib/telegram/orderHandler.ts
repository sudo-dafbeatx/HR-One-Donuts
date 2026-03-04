import TelegramBot from 'node-telegram-bot-api';
import { updateOrderStatusInDb } from './orderStatusUpdater';
import { getOrderStatusKeyboard } from './telegramButtons';

/**
 * Handles incoming callback_queries from Inline Keyboards
 */
export async function handleOrderCallbackQuery(bot: TelegramBot, callbackQuery: TelegramBot.CallbackQuery) {
  const data = callbackQuery.data;
  const message = callbackQuery.message;

  // Answer callback query quickly to remove loading state on button
  const answerCb = (text: string, showAlert = false) => {
    bot.answerCallbackQuery(callbackQuery.id, {
      text,
      show_alert: showAlert
    }).catch(console.error);
  };

  if (!data || !message) {
    answerCb('Error: Invalid data');
    return;
  }

  // Handle dummy buttons
  if (data === 'ignore') {
    answerCb('Status already selected.');
    return;
  }

  // Handle "update_{order_id}_{status}" format
  if (data.startsWith('update_')) {
    const parts = data.split('_');
    if (parts.length < 3) {
      answerCb('Error: Malformed callback data');
      return;
    }

    const orderIdSegment = parts[1];
    const targetStatus = parts[2];

    // Inform user we're processing
    answerCb(`Updating to ${targetStatus}...`);

    // Process update in DB
    const result = await updateOrderStatusInDb(orderIdSegment, targetStatus);
    
    // If update failed (or was duplicate), try to just answer
    if (!result.success) {
      // We don't need to show a huge alert, just quietly fail or log
      console.log(`[Telegram] Status update blocked/failed: ${result.message}`);
      // Send a quick temporary message if it failed for a real reason
      if (!result.message.includes('already')) {
         bot.sendMessage(message.chat.id, result.message).catch(console.error);
      }
      return;
    }

    // Successful update. Edit the existing message to reflect new state.
    try {
      // We append a small confirmation to the existing text so they know it worked
      // Or we can rebuild the message. The simplest is editing the reply markup (keyboard).
      
      const updatedKeyboard = getOrderStatusKeyboard(result.orderId || orderIdSegment, result.newStatus);
      
      const newText = message.text ? `${message.text}\n\n${result.message}` : result.message;

      // Edit message text (and keyboard)
      await bot.editMessageText(newText, {
        chat_id: message.chat.id,
        message_id: message.message_id,
        reply_markup: updatedKeyboard,
        parse_mode: 'HTML' // Ensure HTML mode is kept if old text had it
      });

    } catch (e: unknown) {
      if (e instanceof Error && !e.message?.includes('message is not modified')) {
        console.error('[Telegram] Failed to edit callback message:', e);
      }
    }
  } else {
    answerCb('Unknown command');
  }
}
