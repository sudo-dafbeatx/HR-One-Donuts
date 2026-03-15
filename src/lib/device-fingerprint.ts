const STORAGE_KEY = 'hr_device_id';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server';

  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;

  const id = generateUUID();
  localStorage.setItem(STORAGE_KEY, id);
  return id;
}
