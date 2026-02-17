/**
 * Date and Time Utilities for HR-One Donuts
 * Focused on Asia/Jakarta (WIB) timezone correctness.
 */

/**
 * Returns the current date/time adjusted to Asia/Jakarta (UTC+7)
 */
export function getJakartaDate(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 3600000 * 7);
}

const WEEKDAY_MAP: Record<string, number> = {
  'SUNDAY': 0, 'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3, 'THURSDAY': 4, 'FRIDAY': 5, 'SATURDAY': 6
};

/**
 * Interface for the return value of getEventTiming
 */
export interface EventTiming {
  isActive: boolean;
  isExpired: boolean;
  message: string;
  nextOccurrence: Date;
  secondsUntilNext: number;
  secondsUntilEnd: number;
  activeDayName: string;
}

/**
 * Days of the week in Indonesian
 */
const ID_DAYS = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
];

/**
 * Checks if an event is active based on weekday and time range in Asia/Jakarta.
 */
export function isEventActive(
  eventDay: string, // TUESDAY | FRIDAY etc.
  startTime: string = '00:00',
  endTime: string = '23:59'
): boolean {
  const timing = getEventTiming(eventDay, startTime, endTime);
  return timing.isActive;
}

/**
 * Calculates event status and countdown timings based on Asia/Jakarta time.
 */
export function getEventTiming(
  eventDay: string, 
  startTime: string = '00:00',
  endTime: string = '23:59',
  eventTitle: string = 'Event'
): EventTiming {
  const now = getJakartaDate();
  const activeWeekday = WEEKDAY_MAP[eventDay.toUpperCase()] ?? 0;
  const currentWeekday = now.getDay();
  
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const activeDayName = ID_DAYS[activeWeekday];
  
  const todayStart = new Date(now);
  todayStart.setHours(startHour, startMin, 0, 0);
  
  const todayEnd = new Date(now);
  todayEnd.setHours(endHour, endMin, 59, 999);
  
  const isActiveDay = currentWeekday === activeWeekday;
  const isWithinTime = now >= todayStart && now <= todayEnd;
  const isPastTime = now > todayEnd;
  
  const isActive = isActiveDay && isWithinTime;
  const isExpired = isActiveDay && isPastTime;
  
  // Calculate next occurrence
  const nextOccurrence = new Date(now);
  let daysUntil = (activeWeekday - currentWeekday + 7) % 7;
  
  if (daysUntil === 0 && now > todayEnd) {
    daysUntil = 7; 
  }
  
  nextOccurrence.setDate(now.getDate() + daysUntil);
  nextOccurrence.setHours(startHour, startMin, 0, 0);
  
  const secondsUntilNext = Math.max(0, Math.floor((nextOccurrence.getTime() - now.getTime()) / 1000));
  const secondsUntilEnd = isActive ? Math.max(0, Math.floor((todayEnd.getTime() - now.getTime()) / 1000)) : 0;
  
  let message = '';
  if (isExpired) {
    message = 'Promo hari ini sudah berakhir. Coba lagi minggu depan.';
  } else if (!isActive) {
    message = `Event ${eventTitle} hanya berlangsung setiap hari ${activeDayName}. Silakan cek kembali di hari ${activeDayName} untuk klaim promo.`;
  }
  
  return {
    isActive,
    isExpired,
    message,
    nextOccurrence,
    secondsUntilNext,
    secondsUntilEnd,
    activeDayName
  };
}

/**
 * Formats seconds into HH:MM:SS or "X hari Y jam"
 */
export function formatCountdown(seconds: number): string {
  if (seconds > 86400) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days} hari ${hours} jam`;
  }
  
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}
