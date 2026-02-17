'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  getProvinces, 
  getCities, 
  getDistricts, 
  type Province, 
  type City, 
  type District 
} from '@/lib/territory-api';
import { ChevronDownIcon, MagnifyingGlassIcon, CheckIcon } from '@heroicons/react/24/outline';

interface GeoDropdownProps {
  onProvinceChange: (id: string, name: string) => void;
  onCityChange: (id: string, name: string) => void;
  onDistrictChange: (id: string, name: string) => void;
  errors?: {
    province?: string;
    city?: string;
    district?: string;
  };
}

export default function GeoDropdown({ onProvinceChange, onCityChange, onDistrictChange, errors }: GeoDropdownProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<{ id: string; name: string } | null>(null);
  const [selectedCity, setSelectedCity] = useState<{ id: string; name: string } | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<{ id: string; name: string } | null>(null);

  const [loading, setLoading] = useState({
    provinces: false,
    cities: false,
    districts: false
  });

  const [openDropdown, setOpenDropdown] = useState<'province' | 'city' | 'district' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProvinces = async () => {
      setLoading(prev => ({ ...prev, provinces: true }));
      setFetchError(null);
      try {
        const data = await getProvinces();
        setProvinces(data);
      } catch (err) {
        console.error(err);
        setFetchError('Gagal memuat daftar provinsi');
      } finally {
        setLoading(prev => ({ ...prev, provinces: false }));
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedProvince) {
        setCities([]);
        return;
      }
      setLoading(prev => ({ ...prev, cities: true }));
      setFetchError(null);
      try {
        const data = await getCities(selectedProvince.id);
        if (data && data.length > 0) {
          setCities(data);
          setFetchError(null);
        } else {
          setFetchError(`Data kota untuk ${selectedProvince.name} tidak tersedia`);
          setCities([]);
        }
      } catch (err) {
        console.error(err);
        setFetchError('Gagal memuat daftar kota. Silakan coba pilih provinsi lagi.');
        setCities([]);
      } finally {
        setLoading(prev => ({ ...prev, cities: false }));
      }
    };
    fetchCities();
  }, [selectedProvince]);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (!selectedCity) {
        setDistricts([]);
        return;
      }
      setLoading(prev => ({ ...prev, districts: true }));
      setFetchError(null);
      try {
        const data = await getDistricts(selectedCity.id);
        if (data && data.length > 0) {
          setDistricts(data);
          setFetchError(null);
        } else {
          setFetchError(`Data kecamatan untuk ${selectedCity.name} tidak tersedia`);
          setDistricts([]);
        }
      } catch (err) {
        console.error(err);
        setFetchError('Gagal memuat daftar kecamatan. Silakan coba pilih kota lagi.');
        setDistricts([]);
      } finally {
        setLoading(prev => ({ ...prev, districts: false }));
      }
    };
    fetchDistricts();
  }, [selectedCity]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProvinceSelect = (id: string, name: string) => {
    setSelectedProvince({ id, name });
    setSelectedCity(null);
    setSelectedDistrict(null);
    onProvinceChange(id, name);
    onCityChange('', '');
    onDistrictChange('', '');
    setOpenDropdown(null);
    setSearchTerm('');
  };

  const handleCitySelect = (id: string, name: string) => {
    setSelectedCity({ id, name });
    setSelectedDistrict(null);
    onCityChange(id, name);
    onDistrictChange('', '');
    setOpenDropdown(null);
    setSearchTerm('');
  };

  const handleDistrictSelect = (id: string, name: string) => {
    setSelectedDistrict({ id, name });
    onDistrictChange(id, name);
    setOpenDropdown(null);
    setSearchTerm('');
  };

  const renderDropdown = (
    type: 'province' | 'city' | 'district',
    label: string,
    items: (Province | City | District)[],
    selected: { id: string; name: string } | null,
    onSelect: (id: string, name: string) => void,
    disabled: boolean,
    error?: string,
    isLoading?: boolean
  ) => {
    const filteredItems = items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="relative">
        <label className="block text-sm font-semibold text-slate-700 mb-2 pl-1">{label}</label>
        <button
          type="button"
          onClick={() => !disabled && setOpenDropdown(openDropdown === type ? null : type)}
          disabled={disabled}
          className={`group flex w-full items-center justify-between rounded-full border px-6 py-4 text-left transition-all outline-none ${
            error 
              ? 'border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-primary focus:ring-primary/20'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white'}`}
        >
          <span className={`truncate ${selected ? 'font-semibold' : 'text-slate-400'}`}>
            {isLoading ? 'Memuat...' : selected ? selected.name : `Pilih ${label}`}
          </span>
          <ChevronDownIcon className={`size-5 text-slate-400 transition-transform ${openDropdown === type ? 'rotate-180' : ''}`} />
        </button>

        {openDropdown === type && (
          <div className="absolute z-50 mt-2 w-full max-h-64 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="sticky top-0 bg-white p-3 border-b border-slate-50">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={`Cari ${label}...`}
                  autoFocus
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 pl-10 pr-4 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 border-none"
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-48 scrollbar-thin scrollbar-thumb-slate-200">
              {fetchError ? (
                <div className="px-5 py-8 text-center text-red-500 text-xs font-bold uppercase tracking-tight">
                  {fetchError}
                </div>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelect(item.id, item.name)}
                    className={`flex w-full items-center justify-between px-5 py-3 text-sm text-left hover:bg-blue-50 transition-colors ${
                      selected?.id === item.id ? 'bg-primary/5 text-primary font-bold' : 'text-slate-600'
                    }`}
                  >
                    <span>{item.name}</span>
                    {selected?.id === item.id && <CheckIcon className="size-4" />}
                  </button>
                ))
              ) : (
                <div className="px-5 py-8 text-center text-slate-400 text-sm">
                  Tidak ditemukan
                </div>
              )}
            </div>
          </div>
        )}
        {error && <p className="mt-1.5 ml-1 text-[11px] font-bold text-red-500 uppercase tracking-wider">{error}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-5" ref={dropdownRef}>
      {renderDropdown(
        'province', 
        'Provinsi', 
        provinces, 
        selectedProvince, 
        handleProvinceSelect, 
        loading.provinces,
        errors?.province,
        loading.provinces
      )}
      
      {renderDropdown(
        'city', 
        'Kota/Kabupaten', 
        cities, 
        selectedCity, 
        handleCitySelect, 
        !selectedProvince || loading.cities,
        errors?.city,
        loading.cities
      )}
      
      {renderDropdown(
        'district', 
        'Kecamatan', 
        districts, 
        selectedDistrict, 
        handleDistrictSelect, 
        !selectedCity || loading.districts,
        errors?.district,
        loading.districts
      )}
    </div>
  );
}
