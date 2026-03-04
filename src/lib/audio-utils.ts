export const playNotificationSound = (url: string = '/sounds/hr-one-donuts.mp3') => {
  if (typeof window === 'undefined') return;

  try {
    const audio = new Audio(url);
    audio.play().catch((error) => {
      console.warn("Autoplay audio diblokir oleh browser. User perlu berinteraksi dengan halaman terlebih dahulu.", error);
    });
  } catch (error) {
    console.error("Gagal memutar audio:", error);
  }
};
