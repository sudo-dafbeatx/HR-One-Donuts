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

/**
 * Interface for the return value of getEventTiming
 */
export interface EventTiming {
  isActive: boolean;
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
 * Calculates event status and countdown timings based on Asia/Jakarta time.
 */
export function getEventTiming(
  activeWeekday: number, // 1-7 (Monday-Sunday)
  startTime: string = '00:00',
  endTime: string = '23:59',
  eventTitle: string = 'Event'
): EventTiming {
  const now = getJakartaDate();
  const currentWeekday = now.getDay() === 0 ? 7 : now.getDay(); // Normalize Sunday to 7
  
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const activeDayName = ID_DAYS[activeWeekday % 7];
  
  // Calculate today's start and end times
  const todayStart = new Date(now);
  todayStart.setHours(startHour, startMin, 0, 0);
  
  const todayEnd = new Date(now);
  todayEnd.setHours(endHour, endMin, 59, 999);
  
  const isActiveDay = currentWeekday === activeWeekday;
  const isWithinTime = now >= todayStart && now <= todayEnd;
  const isActive = isActiveDay && isWithinTime;
  
  // Calculate next occurrence
  const nextOccurrence = new Date(now);
  let daysUntil = (activeWeekday - currentWeekday + 7) % 7;
  
  if (daysUntil === 0 && now > todayEnd) {
    daysUntil = 7; // Already past today's event, next is next week
  }
  
  nextOccurrence.setDate(now.getDate() + daysUntil);
  nextOccurrence.setHours(startHour, startMin, 0, 0);
  
  const secondsUntilNext = Math.max(0, Math.floor((nextOccurrence.getTime() - now.getTime()) / 1000));
  const secondsUntilEnd = isActive ? Math.max(0, Math.floor((todayEnd.getTime() - now.getTime()) / 1000)) : 0;
  
  let message = '';
  if (!isActive) {
    message = `Event ini hanya berlangsung setiap hari ${activeDayName}. Silakan kembali lagi hari ${activeDayName} untuk klaim ${eventTitle}.`;
  }
  
  return {
    isActive,
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
