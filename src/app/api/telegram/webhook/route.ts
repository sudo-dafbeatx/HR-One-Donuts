import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface TelegramMessage {
  message_id: number;
  from: { id: number; first_name: string };
  chat: { id: number; type: string };
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

export async function POST(request: NextRequest) {
  try {
    const body: TelegramUpdate = await request.json();
    const message = body.message;

    if (!message?.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id.toString();
    const text = message.text.trim();
    const command = text.toLowerCase();
    const isAdmin = chatId === process.env.TELEGRAM_ADMIN_CHAT_ID;

    // --- /start ---
    if (command === '/start') {
      await sendTelegramMessage(
        chatId,
        `🍩 <b>Selamat datang di HR-One Donuts Bot!</b>\n\n` +
        `Saya bisa membantu Anda:\n\n` +
        `📋 /menu — Lihat menu donat kami\n` +
        `📦 /status &lt;kode&gt; — Cek status pesanan\n` +
        `🎉 /promo — Lihat promo aktif\n` +
        `❓ /help — Bantuan\n\n` +
        `Atau kunjungi website kami untuk memesan! 🛒`
      );
      return NextResponse.json({ ok: true });
    }

    // --- /help ---
    if (command === '/help') {
      await sendTelegramMessage(
        chatId,
        `❓ <b>Bantuan HR-One Donuts Bot</b>\n\n` +
        `Perintah yang tersedia:\n\n` +
        `📋 /menu — Tampilkan daftar menu donat\n` +
        `📦 /status &lt;kode&gt; — Cek status pesanan Anda\n` +
        `   Contoh: /status ABC123\n` +
        `🎉 /promo — Lihat promo yang sedang berlangsung\n\n` +
        `💬 Hubungi admin: 081211110515 (WhatsApp)`
      );
      return NextResponse.json({ ok: true });
    }

    // --- /menu ---
    if (command === '/menu') {
      try {
        const supabase = await createServerSupabaseClient();
        const { data: products } = await supabase
          .from('products')
          .select('name, price, category')
          .eq('is_active', true)
          .order('category')
          .order('name');

        if (!products || products.length === 0) {
          await sendTelegramMessage(chatId, '😅 Menu sedang kosong. Silakan cek kembali nanti!');
          return NextResponse.json({ ok: true });
        }

        // Group by category
        const grouped: Record<string, typeof products> = {};
        for (const p of products) {
          const cat = p.category || 'Lainnya';
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(p);
        }

        let menuText = '🍩 <b>Menu HR-One Donuts</b>\n\n';
        for (const [category, items] of Object.entries(grouped)) {
          menuText += `<b>📂 ${category}</b>\n`;
          for (const item of items) {
            menuText += `  • ${item.name} — Rp ${item.price.toLocaleString('id-ID')}\n`;
          }
          menuText += '\n';
        }
        menuText += '🛒 Pesan di website kami atau hubungi WhatsApp!';

        await sendTelegramMessage(chatId, menuText);
      } catch (err) {
        console.error('[Telegram Webhook] Menu fetch error:', err);
        await sendTelegramMessage(chatId, '⚠️ Gagal memuat menu. Coba lagi nanti ya!');
      }
      return NextResponse.json({ ok: true });
    }

    // --- /status <order_id> ---
    if (command.startsWith('/status')) {
      const parts = text.split(' ');
      if (parts.length < 2) {
        await sendTelegramMessage(
          chatId,
          '📦 Gunakan format: /status &lt;kode_pesanan&gt;\n\nContoh: /status ABC123'
        );
        return NextResponse.json({ ok: true });
      }

      const orderId = parts[1].trim();

      try {
        const supabase = await createServerSupabaseClient();
        const { data: order } = await supabase
          .from('orders')
          .select('id, status, total_amount, total_items, delivery_method, created_at')
          .ilike('id', `%${orderId}%`)
          .limit(1)
          .maybeSingle();

        if (!order) {
          await sendTelegramMessage(chatId, `❌ Pesanan dengan kode "<b>${orderId}</b>" tidak ditemukan.`);
          return NextResponse.json({ ok: true });
        }

        const statusEmojis: Record<string, string> = {
          pending: '⏳ Menunggu Konfirmasi',
          confirmed: '✅ Dikonfirmasi',
          processing: '👨‍🍳 Sedang Dibuat',
          shipping: '🚚 Sedang Dikirim',
          ready: '📦 Siap Diambil',
          completed: '✔️ Selesai',
        };

        const statusText = statusEmojis[order.status] || order.status;
        const date = new Date(order.created_at).toLocaleDateString('id-ID', {
          day: 'numeric', month: 'long', year: 'numeric'
        });

        await sendTelegramMessage(
          chatId,
          `📦 <b>Status Pesanan</b>\n\n` +
          `🆔 Kode: <b>#${order.id.slice(0, 8).toUpperCase()}</b>\n` +
          `📊 Status: ${statusText}\n` +
          `💰 Total: Rp ${order.total_amount.toLocaleString('id-ID')}\n` +
          `📦 Jumlah: ${order.total_items} item\n` +
          `🚗 Metode: ${order.delivery_method === 'pickup' ? 'Ambil di Toko' : 'Delivery'}\n` +
          `📅 Tanggal: ${date}`
        );
      } catch (err) {
        console.error('[Telegram Webhook] Status check error:', err);
        await sendTelegramMessage(chatId, '⚠️ Gagal mengecek status. Coba lagi nanti!');
      }
      return NextResponse.json({ ok: true });
    }

    // --- /promo ---
    if (command === '/promo') {
      try {
        const supabase = await createServerSupabaseClient();
        const { data: events } = await supabase
          .from('promo_events')
          .select('headline, discount_percent, event_slug')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(5);

        if (!events || events.length === 0) {
          await sendTelegramMessage(chatId, '😅 Belum ada promo aktif saat ini. Pantau terus ya!');
          return NextResponse.json({ ok: true });
        }

        let promoText = '🎉 <b>Promo Aktif HR-One Donuts</b>\n\n';
        for (const event of events) {
          promoText += `🔥 <b>${event.headline}</b>`;
          if (event.discount_percent) {
            promoText += ` — DISKON ${event.discount_percent}%`;
          }
          promoText += '\n';
        }
        promoText += '\n🛒 Kunjungi website kami untuk memesan!';

        await sendTelegramMessage(chatId, promoText);
      } catch (err) {
        console.error('[Telegram Webhook] Promo fetch error:', err);
        await sendTelegramMessage(chatId, '⚠️ Gagal memuat promo. Coba lagi nanti!');
      }
      return NextResponse.json({ ok: true });
    }

    // ==========================================
    // ADMIN ONLY COMMANDS
    // ==========================================
    if (isAdmin) {
      // --- /admin ---
      if (command === '/admin') {
        await sendTelegramMessage(
          chatId,
          `👑 <b>Menu Admin HR-One Donuts</b>\n\n` +
          `📊 /summary — Ringkasan penjualan hari ini\n` +
          `📦 /orders — 5 pesanan terbaru\n` +
          `⚙️ /help — Bantuan perintah umum`
        );
        return NextResponse.json({ ok: true });
      }

      // --- /orders ---
      if (command === '/orders') {
        try {
          const supabase = await createServerSupabaseClient();
          const { data: orders } = await supabase
            .from('orders')
            .select('id, status, total_amount, created_at')
            .order('created_at', { ascending: false })
            .limit(5);

          if (!orders || orders.length === 0) {
            await sendTelegramMessage(chatId, '📭 Belum ada riwayat pesanan.');
            return NextResponse.json({ ok: true });
          }

          let ordersText = '📦 <b>5 Pesanan Terbaru</b>\n\n';
          for (const order of orders) {
            const date = new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            ordersText += `• <code>#${order.id.slice(0, 8).toUpperCase()}</code> — Rp ${order.total_amount.toLocaleString('id-ID')} (${order.status}) [${date}]\n`;
          }
          await sendTelegramMessage(chatId, ordersText);
        } catch (err) {
          console.error('[Telegram Webhook] Admin orders error:', err);
          await sendTelegramMessage(chatId, '⚠️ Gagal mengambil data pesanan.');
        }
        return NextResponse.json({ ok: true });
      }

      // --- /summary ---
      if (command === '/summary') {
        try {
          const supabase = await createServerSupabaseClient();
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const { data: dailyOrders } = await supabase
            .from('orders')
            .select('total_amount, total_items')
            .gte('created_at', today.toISOString());

          if (!dailyOrders || dailyOrders.length === 0) {
            await sendTelegramMessage(chatId, '📉 Belum ada penjualan hari ini. Tetap semangat! 💪');
            return NextResponse.json({ ok: true });
          }

          const totalSales = dailyOrders.reduce((sum, o) => sum + o.total_amount, 0);
          const totalItems = dailyOrders.reduce((sum, o) => sum + o.total_items, 0);

          await sendTelegramMessage(
            chatId,
            `📊 <b>Ringkasan Penjualan Hari Ini</b>\n\n` +
            `💰 Total Omzet: <b>Rp ${totalSales.toLocaleString('id-ID')}</b>\n` +
            `📦 Total Item: <b>${totalItems} donat</b>\n` +
            `🧾 Total Transaksi: <b>${dailyOrders.length}</b>\n\n` +
            `📅 Per tanggal: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}`
          );
        } catch (err) {
          console.error('[Telegram Webhook] Sales summary error:', err);
          await sendTelegramMessage(chatId, '⚠️ Gagal menghitung ringkasan penjualan.');
        }
        return NextResponse.json({ ok: true });
      }
    }

    // --- Unknown command / free text ---
    await sendTelegramMessage(
      chatId,
      `🤔 Maaf, saya tidak mengerti perintah itu.\n\nKetik /help untuk melihat perintah yang tersedia.`
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Telegram Webhook] Error processing update:', error);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}
