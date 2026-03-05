"use server";

import { sendAdminNotification } from "@/lib/telegram";

export async function sendFeedbackToTelegram(feedback: string) {
  if (!feedback.trim()) {
    return { success: false, message: "Feedback cannot be empty." };
  }

  const message = `
<b>🌟 Masukan Baru dari Website</b>
---------------------------
<b>Isi Masukan:</b>
<i>${feedback}</i>

---------------------------
<i>Dikirim via Bot Dona 🍩</i>
  `;

  try {
    const result = await sendAdminNotification(message);
    if (result.ok) {
      return { success: true, message: "Feedback sent successfully." };
    } else {
      console.error("Telegram send failed:", result.description);
      return { success: false, message: "Failed to send feedback to Telegram." };
    }
  } catch (error) {
    console.error("Error in sendFeedbackToTelegram:", error);
    return { success: false, message: "An error occurred while sending feedback." };
  }
}
