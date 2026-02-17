'use client';

const BASE_URL = 'https://emsifa.github.io/api-wilayah-indonesia/api';

export interface Province {
  id: string;
  name: string;
}

export interface City {
  id: string;
  province_id: string;
  name: string;
}

export interface District {
  id: string;
  regency_id: string;
  name: string;
}

const CACHE_KEY_PREFIX = 'geo_indo_cache_';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Minimal fallback list if API is down
const FALLBACK_PROVINCES: Province[] = [
  { id: '31', name: 'DKI JAKARTA' },
  { id: '32', name: 'JAWA BARAT' },
  { id: '33', name: 'JAWA TENGAH' },
  { id: '35', name: 'JAWA TIMUR' },
  { id: '36', name: 'BANTEN' },
  { id: '51', name: 'BALI' },
  { id: '11', name: 'ACEH' },
  { id: '12', name: 'SUMATERA UTARA' },
  { id: '13', name: 'SUMATERA BARAT' },
  { id: '14', name: 'RIAU' },
  { id: '15', name: 'JAMBI' },
  { id: '16', name: 'SUMATERA SELATAN' },
  { id: '17', name: 'BENGKULU' },
  { id: '18', name: 'LAMPUNG' },
  { id: '19', name: 'KEPULAUAN BANGKA BELITUNG' },
  { id: '21', name: 'KEPULAUAN RIAU' },
  { id: '34', name: 'DI YOGYAKARTA' },
  { id: '52', name: 'NUSA TENGGARA BARAT' },
  { id: '53', name: 'NUSA TENGGARA TIMUR' },
  { id: '61', name: 'KALIMANTAN BARAT' },
  { id: '62', name: 'KALIMANTAN TENGAH' },
  { id: '63', name: 'KALIMANTAN SELATAN' },
  { id: '64', name: 'KALIMANTAN TIMUR' },
  { id: '65', name: 'KALIMANTAN UTARA' },
  { id: '71', name: 'SULAWESI UTARA' },
  { id: '72', name: 'SULAWESI TENGAH' },
  { id: '73', name: 'SULAWESI SELATAN' },
  { id: '74', name: 'SULAWESI TENGGARA' },
  { id: '75', name: 'GORONTALO' },
  { id: '76', name: 'SULAWESI BARAT' },
  { id: '81', name: 'MALUKU' },
  { id: '82', name: 'MALUKU UTARA' },
  { id: '91', name: 'PAPUA BARAT' },
  { id: '94', name: 'PAPUA' }
];

const getCached = <T,>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  try {
    const cached = localStorage.getItem(CACHE_KEY_PREFIX + key);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_KEY_PREFIX + key);
      return null;
    }
    return data;
  } catch (e) {
    console.error('Cache read error:', e);
    return null;
  }
};

const setCached = (key: string, data: Province[] | City[] | District[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.warn('Cache write error (possibly quota exceeded):', e);
  }
};

export async function getProvinces(): Promise<Province[]> {
  try {
    const cached = getCached<Province[]>('provinces');
    if (cached) return cached;

    const res = await fetch(`${BASE_URL}/provinces.json`);
    if (!res.ok) throw new Error('Failed to fetch provinces');
    const data = await res.json();
    setCached('provinces', data);
    return data;
  } catch (err) {
    console.error('getProvinces error:', err);
    // Return fallback provinces list if API fails
    return FALLBACK_PROVINCES;
  }
}

export async function getCities(provinceId: string): Promise<City[]> {
  if (!provinceId) return [];
  try {
    const cacheKey = `cities_${provinceId}`;
    const cached = getCached<City[]>(cacheKey);
    if (cached) return cached;

    const res = await fetch(`${BASE_URL}/regencies/${provinceId}.json`);
    if (!res.ok) throw new Error('Failed to fetch cities');
    const data = await res.json();
    setCached(cacheKey, data);
    return data;
  } catch (err) {
    console.error('getCities error:', err);
    return [];
  }
}

export async function getDistricts(cityId: string): Promise<District[]> {
  if (!cityId) return [];
  try {
    const cacheKey = `districts_${cityId}`;
    const cached = getCached<District[]>(cacheKey);
    if (cached) return cached;

    const res = await fetch(`${BASE_URL}/districts/${cityId}.json`);
    if (!res.ok) throw new Error('Failed to fetch districts');
    const data = await res.json();
    setCached(cacheKey, data);
    return data;
  } catch (err) {
    console.error('getDistricts error:', err);
    return [];
  }
}
