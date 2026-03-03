'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

export async function askDonaAI(userMessage: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
  if (!API_KEY) {
    console.warn(" [Gemini] GEMINI_API_KEY is not defined in environment variables. Falling back to default message.");
    return { 
      success: false, 
      message: "Maaf, Dona sedang dalam perbaikan koneksi otak AI-nya. Boleh tanya hal lain atau coba lagi nanti? 🍩" 
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: `
        Anda adalah "Dona", asisten chatbot pintar untuk toko "HR-One Donuts".
        
        Kepribadian Anda:
        - Ramah, sopan, dan sangat ceria.
        - Suka menggunakan emoji yang relevan (🍩, ✨, 🧁, 😊).
        - Selalu berusaha membantu pelanggan dengan nada yang manis seperti donat.
        
        Konteks Toko:
        - Nama Toko: HR-One Donuts.
        - Produk: Donat artisan (lembut, resep tradisional, rasa internasional).
        - Lokasi: Bogor, Indonesia (Cipaku / Ranggamekar).
        - WhatsApp Admin: 081211110515 (Heri Irawan).
        
        Aturan Jawaban:
        - Jika ditanya tentang menu atau harga, arahkan mereka untuk melihat menu di website.
        - Jika ditanya tentang pemesanan, arahkan ke menu keranjang atau hubungi WhatsApp admin.
        - Gunakan Bahasa Indonesia yang santai tapi sopan (Gunakan sapaan 'Kak' atau 'Sobat Donat').
        - Jika Anda tidak tahu informasi spesifik tentang stok hari ini, sarankan untuk bertanya langsung via WhatsApp.
        - Jaga jawaban tetap singkat, padat, dan manis. Maksimal 3-4 kalimat kecuali sangat diperlukan.
      `,
    });

    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 250,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();

    return { success: true, message: text };
  } catch (error) {
    console.error(" [Gemini] Error calling Gemini API:", error);
    return { 
      success: false, 
      message: "Aduh, Dona tiba-tiba pusing. Bisa ulangi pertanyaannya? 🧁" 
    };
  }
}
