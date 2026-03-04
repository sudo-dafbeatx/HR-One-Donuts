export const playNotificationSound = (url: string = '/sounds/hr-one-donuts.mp3') => {
  if (typeof window === 'undefined') return;

  try {
    const audio = new Audio(url);
    const promise = audio.play();
    if (promise !== undefined) {
      promise.catch((error) => {
        console.warn("Autoplay audio diblokir. Menunggu interaksi user...", error);
      });
      return promise;
    }
  } catch (error) {
    console.error("Gagal memutar audio:", error);
  }
};
