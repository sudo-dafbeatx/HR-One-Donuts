'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  UserCircleIcon, 
  MapPinIcon, 
  ShoppingBagIcon,
  ArrowRightOnRectangleIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useLoading } from '@/context/LoadingContext';
import { uploadAvatar, setPredefinedAvatar } from '@/app/actions/avatar-actions';
import { normalizePhoneToID } from '@/lib/phone';
import { getOrderStatus } from '@/lib/order-status';
import UserDailyNotification from "@/components/UserDailyNotification";
import Image from 'next/image';
import { CameraIcon, PhotoIcon, SparklesIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';
import styled from "styled-components";
import Pattern from "@/components/Pattern";
import { useTranslation } from '@/context/LanguageContext';
import { useErrorPopup } from '@/context/ErrorPopupContext';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  username?: string;
  phone: string | null;
  address: string | null;
  avatar_url: string | null;
  role: string;
  // Extended fields from user_profiles
  gender?: string;
  age?: number;
  province_name?: string;
  city_name?: string;
  district_name?: string;
  address_detail?: string;
  is_verified?: boolean;
  birth_place?: string;
}

interface OrderItem {
  product_id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  total_items: number;
  items: OrderItem[];
  delivery_method?: string;
  shipping_fee?: number;
  status: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  
  const { setIsLoading } = useLoading();
  const { t } = useTranslation();
  const { showError } = useErrorPopup();
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const predefinedAvatars = [
    { id: '1', name: 'Classic Pink', url: '/avatars/classic.png' },
    { id: '2', name: 'Strawberry Wink', url: '/avatars/strawberry.png' },
    { id: '3', name: 'Matcha Cool', url: '/avatars/matcha.png' },
    { id: '4', name: 'Caramel Smile', url: '/avatars/caramel.png' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login?next=/profile');
        return;
      }

      // Fetch both profile tables to ensure we have avatar_url (which only exists in legacy profiles)
      // and new detailed data (which exists in user_profiles)
      const { data: legacyProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profileData) {
        // Merge them so we get `avatar_url` from legacy metadata but detailed info from new standard
        setProfile({
          ...legacyProfile,
          ...profileData
        } as unknown as Profile);
        
        setEditFullName(profileData.full_name || legacyProfile?.full_name || '');
        setEditPhone(legacyProfile?.phone || ''); 
        setEditAddress(profileData.address_detail || legacyProfile?.address || '');
      } else if (legacyProfile) {
        // Fallback to legacy profiles only
        setProfile(legacyProfile as unknown as Profile);
        setEditFullName(legacyProfile.full_name || '');
        setEditPhone(legacyProfile.phone || '');
        setEditAddress(legacyProfile.address || '');
      }

      // Fetch Recent Orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setOrders(ordersData || []);
      setLoading(false);
    };

    fetchData();
  }, [supabase, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setIsLoading(true, t('profile.update_loading'));
    
    try {
      const normalizedPhone = normalizePhoneToID(editPhone);

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editFullName,
          phone: normalizedPhone,
          address: editAddress
        })
        .eq('id', profile.id);

      if (error) {
        if (error.code === '23505' || error.message.toLowerCase().includes('unique')) {
          throw new Error(t('profile.phone_taken'));
        }
        throw error;
      }

      setProfile({
        ...profile,
        full_name: editFullName,
        phone: normalizedPhone,
        address: editAddress
      });
      setIsEditing(false);
      // Success feedback would be nice, but keeping it simple as per request
      await new Promise(r => setTimeout(r, 600));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('common.error_generic');
      showError('Gagal Update', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarSelect = async (url: string) => {
    if (!profile) return;
    setIsLoading(true, t('profile.avatar_setting'));
    try {
      await setPredefinedAvatar(url);
      setProfile({ ...profile, avatar_url: url });
      setShowAvatarSelector(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('common.error_generic');
      showError('Gagal', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsLoading(true, t('profile.avatar_uploading'));
    try {
      const result = await uploadAvatar(formData);
      if (result.success) {
        setProfile({ ...profile, avatar_url: result.url });
        setShowAvatarSelector(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('profile.upload_fail', { message: '' });
      showError('Gagal Upload', message);
    } finally {
      setIsLoading(false);
      // Reset input value so same file can be selected again
      if (e.target) e.target.value = '';
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };


  if (loading) {
    return (
      <div className="fixed inset-0 z-60 flex h-dvh items-center justify-center bg-white">
        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Wrapper>
      <Pattern />
      <Content>
        <div className="min-h-screen pb-32 overflow-x-hidden">
          {/* Premium Header with Gradient */}
          <div className="relative bg-linear-to-br from-primary via-blue-600 to-cyan-500">
            {/* Abstract shapes for premium feel (Hidden on mobile to optimize scroll performance) */}
            <div className="hidden md:block absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 anim-pulse pointer-events-none"></div>
            <div className="hidden md:block absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
            
            <div className="max-w-5xl mx-auto px-4 md:px-6 pt-10 md:pt-12 pb-20 md:pb-24 relative z-10">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10">
                {/* Profile Avatar with premium border */}
                <div className="relative group shrink-0">
                  <div className="size-24 md:size-32 bg-white/20 md:backdrop-blur-md rounded-2xl md:rounded-3xl border-2 border-white/30 flex items-center justify-center text-white shadow-xl md:shadow-2xl transition-all duration-500 overflow-hidden relative">
                    {profile?.avatar_url ? (
                      <Image 
                        src={profile.avatar_url} 
                        alt="Avatar" 
                        fill 
                        className="object-cover"
                      />
                    ) : (
                      <UserCircleIcon className="size-16 md:size-20" />
                    )}
                    
                    {/* Hover Overlay */}
                    <button 
                      onClick={() => setShowAvatarSelector(true)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1"
                    >
                      <CameraIcon className="size-6 text-white" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">{t('profile.change_photo')}</span>
                    </button>
                  </div>
                  
                  <div className="absolute -bottom-2 -right-2 bg-green-400 size-6 rounded-full border-4 border-primary shadow-lg animate-pulse"></div>
                  
                  {/* Mobile Change Button */}
                  <button 
                    onClick={() => setShowAvatarSelector(true)}
                    className="md:hidden absolute -top-1 -right-1 size-8 bg-white text-primary rounded-full shadow-lg flex items-center justify-center active:scale-95"
                  >
                    <CameraIcon className="size-4" />
                  </button>
                </div>
                
                <div className={`flex-1 min-w-0 flex flex-col items-center md:items-start w-full ${!profile?.is_verified ? 'text-center' : 'text-center md:text-left'} text-white`}>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 md:backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 border border-white/10">
                    <span className="size-1.5 bg-cyan-300 rounded-full animate-ping"></span>
                    {t('profile.customer')}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-1 drop-shadow-sm truncate flex flex-wrap items-center gap-2">
                    <span className="truncate">{profile?.full_name || t('profile.default_name')}</span>
                    {profile?.is_verified && (
                      <div className="hidden md:flex items-center justify-center bg-blue-500 rounded-full p-1 shadow-md shrink-0 mb-1 z-10" title={t('profile.verified')}>
                        <CheckBadgeIcon className="size-5 md:size-6 text-white" />
                      </div>
                    )}
                    {profile?.full_name && profile?.username && profile?.address_detail && (
                      <div className="md:hidden flex items-center justify-center rounded-full shadow-md shrink-0 mb-1 z-10" title={t('profile.complete_data')}>
                        <CheckBadgeIcon className="size-6 text-white" />
                      </div>
                    )}
                  </h1>
                  <p className="text-blue-50/80 font-medium mb-1 opacity-90 text-sm md:text-base truncate">{profile?.email}</p>
                  <p className="text-[10px] md:text-xs text-blue-100/70 italic opacity-80 mt-1">&quot;{
                    t(`profile.quotes.${new Date().getDay()}`)
                  }&quot;</p>
                </div>
              </div>
            </div>
          </div>

          {/* Avatar Selection Modal/Overlay */}
          {showAvatarSelector && (
            <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
              <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={() => setShowAvatarSelector(false)}
              ></div>
              
              <div className="relative w-full max-w-md bg-white rounded-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">{t('profile.avatar_modal.title')}</h3>
                      <p className="text-sm text-slate-500 font-medium italic">{t('profile.avatar_modal.subtitle')}</p>
                    </div>
                    <button 
                      onClick={() => setShowAvatarSelector(false)}
                      className="size-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200"
                    >
                      <span className="material-symbols-outlined text-slate-500">close</span>
                    </button>
                  </div>

                  {/* Predefined Avatars */}
                  <div className="mb-10">
                    <div className="flex items-center gap-2 mb-4">
                      <SparklesIcon className="size-4 text-primary" />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('profile.avatar_modal.character_title')}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      {predefinedAvatars.map((avatar) => (
                        <button
                          key={avatar.id}
                          onClick={() => handleAvatarSelect(avatar.url)}
                          type="button"
                          className="relative grow aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 hover:border-primary transition-all active:scale-95 group"
                        >
                          <Image 
                            src={avatar.url} 
                            alt={avatar.name} 
                            fill 
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Upload */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <PhotoIcon className="size-4 text-primary" />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('profile.avatar_modal.upload_title')}</span>
                    </div>
                    
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="absolute opacity-0 pointer-events-none" 
                      accept="image/*"
                      onChange={handleFileUpload}
                    />

                    <button 
                      onClick={triggerFileUpload}
                      type="button"
                      className="flex items-center justify-center gap-3 w-full h-20 border-2 border-dashed border-slate-200 rounded-3xl hover:border-primary hover:bg-primary/5 cursor-pointer transition-all group active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3">
                        <CameraIcon className="size-8 text-slate-400 group-hover:text-primary" />
                        <span className="font-bold text-slate-600 group-hover:text-primary">{t('profile.avatar_modal.upload_cta')}</span>
                      </div>
                    </button>
                    <p className="text-[10px] text-center text-slate-400 font-medium uppercase tracking-tight">{t('profile.avatar_modal.upload_note')}</p>
                  </div>
                </div>
                
                <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                  <button 
                    onClick={() => setShowAvatarSelector(false)}
                    className="text-sm font-bold text-slate-400 hover:text-slate-600"
                  >
                    {t('profile.avatar_modal.cancel')}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="max-w-5xl mx-auto px-4 md:px-6 -mt-8 md:-mt-12 relative z-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
              
              {/* Main Content Info */}
              <div className="lg:col-span-8 space-y-6">
                {/* Desktop "Informasi Pribadi" is HIDDEN on Mobile */}
                <div className="hidden md:block bg-white rounded-4xl shadow-xl shadow-slate-200/50 p-8 border border-white">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-slate-800">{t('profile.info.title')}</h2>
                      <p className="text-xs md:text-sm text-slate-500 font-medium italic">{t('profile.info.subtitle')}</p>
                    </div>
                    {!isEditing && (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 text-primary font-bold text-xs md:text-sm bg-primary/5 px-4 md:px-5 py-2 md:py-2.5 rounded-xl hover:bg-primary/10 transition-all shrink-0"
                      >
                        <span className="material-symbols-outlined text-[16px] md:text-[18px]">edit</span>
                        {t('profile.info.edit')}
                      </button>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 ml-1">{t('profile.info.labels.name')}</label>
                          <input 
                            type="text" 
                            value={editFullName}
                            onChange={(e) => setEditFullName(e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                            placeholder={t('profile.info.placeholders.name')}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 ml-1">{t('profile.info.labels.phone')}</label>
                          <input 
                            type="tel" 
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                            placeholder={t('profile.info.placeholders.phone')}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">{t('profile.info.labels.address')}</label>
                        <textarea 
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium min-h-[120px]"
                          placeholder={t('profile.info.placeholders.address')}
                          required
                        />
                      </div>
                      <div className="flex gap-3 justify-end pt-2">
                        <button 
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-6 py-3 font-bold text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          {t('profile.info.cancel')}
                        </button>
                        <button 
                          type="submit"
                          className="px-8 py-3 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]"
                        >
                          {t('profile.info.save')}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-50">
                        <div className="size-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                          <UserCircleIcon className="size-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{t('profile.info.identity_title')}</p>
                          <p className="font-bold text-slate-700">
                            {profile?.gender ? (profile.gender === 'male' ? t('profile.info.gender.male') : t('profile.info.gender.female')) : '-'} 
                            {profile?.age ? `, ${t('profile.info.age_suffix', { age: profile.age })}` : ''}
                          </p>
                        </div>
                      </div>

                      {profile?.birth_place && (
                        <div className="flex items-start gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-50">
                          <div className="size-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0 text-primary">
                            <span className="material-symbols-outlined text-[20px]">cake</span>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Tempat Lahir</p>
                            <p className="font-bold text-slate-700 leading-snug">{profile.birth_place}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-50">
                        <div className="size-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0 text-primary">
                          <span className="material-symbols-outlined text-[20px]">location_on</span>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{t('profile.info.region_title')}</p>
                          <p className="font-bold text-slate-700 leading-snug">
                            {profile?.district_name ? `${profile.district_name}, ${profile.city_name}` : (profile?.address || t('profile.info.not_set'))}
                          </p>
                        </div>
                      </div>

                      {profile?.address_detail && (
                        <div className="col-span-1 md:col-span-2 flex items-start gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-50">
                          <div className="size-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                             <MapPinIcon className="size-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{t('profile.info.address_detail_title')}</p>
                            <p className="font-bold text-slate-700 leading-snug">{profile.address_detail}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Order History */}
                <div className="space-y-4 pt-6 md:pt-8 mt-6 md:mt-8 border-t border-slate-100">
                  <div className="flex items-center justify-between px-1">
                    <h2 className="text-[11px] md:text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <ShoppingBagIcon className="size-4 md:size-5" />
                       {t('orders.title')}
                    </h2>
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] md:text-xs font-extrabold rounded-full">
                       {t('orders.count', { count: orders.length })}
                    </span>
                  </div>

                  {orders.length === 0 ? (
                    <div className="bg-white rounded-4xl border border-dashed border-slate-200 p-12 text-center shadow-sm">
                      <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                        <ShoppingBagIcon className="size-8" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mb-2">{t('orders.empty_title')}</h3>
                      <p className="text-slate-500 mb-8 max-w-xs mx-auto text-sm font-medium">
                        {t('orders.empty_subtitle')}
                      </p>
                      <Link 
                        href="/catalog" 
                        className="inline-flex h-11 md:h-12 items-center px-6 md:px-8 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 text-sm md:text-base"
                      >
                        {t('orders.empty_cta')}
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {orders.map((order) => (
                        <div 
                          key={order.id}
                          className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 md:border-white shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 md:gap-5 group cursor-default"
                        >
                          <div className="flex items-center gap-4 md:gap-5 min-w-0">
                            <div className="size-10 md:size-14 bg-blue-50/50 rounded-xl md:rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                              <ShoppingBagIcon className="size-5 md:size-7" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center flex-wrap gap-2 mb-0.5">
                                <p className="font-extrabold text-slate-800 truncate text-sm md:text-base">#{order.id.slice(0, 8).toUpperCase()}</p>
                                {(() => {
                                  const status = getOrderStatus(order.status);
                                  return (
                                    <span className={`text-[8px] md:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${status.bgColor} ${status.textColor} rounded-md flex items-center gap-1`}>
                                      <status.icon className="size-2.5 md:size-3" />
                                      {t(`orders.status.${order.status}`)}
                                    </span>
                                  );
                                })()}
                              </div>
                              <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[10px] md:text-xs font-semibold text-slate-400">
                                <span className="flex items-center gap-1">
                                  <CalendarDaysIcon className="size-3 md:size-3.5" />
                                  {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                                </span>
                                <span className="hidden sm:inline size-1 bg-slate-200 rounded-full"></span>
                                <span className="flex items-center gap-1">
                                  {order.delivery_method === 'pickup' ? (
                                    <>
                                      <span className="material-symbols-outlined text-[14px]">storefront</span>
                                      {t('orders.reception.pickup')}
                                    </>
                                  ) : (
                                    <>
                                      <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                                      {t('orders.reception.delivery')}
                                    </>
                                  )}
                                </span>
                                <span className="hidden sm:inline size-1 bg-slate-200 rounded-full"></span>
                                <span>{t('orders.items_count', { count: order.total_items })}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center gap-1 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                             <p className="font-black text-slate-900 text-base md:text-lg">Rp {order.total_amount.toLocaleString('id-ID')}</p>
                             <Link href={`/profile/orders/${order.id}`} className="text-[9px] md:text-[10px] font-bold text-primary uppercase tracking-widest hover:underline px-2 py-1 flex items-center gap-1 active:scale-95 transition-transform">
                               {t('orders.detail_cta')} <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                             </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile-Only Activity Overview */}
                <div className="md:hidden grid grid-cols-2 gap-4 mt-6">
                  {/* Total Spending */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col justify-center">
                    <div className="size-8 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center mb-3">
                      <CurrencyDollarIcon className="size-5" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 mt-auto">{t('activity.spending')}</p>
                    <p className="font-black text-slate-800 text-sm truncate">
                      Rp {orders.reduce((sum, order) => sum + order.total_amount, 0).toLocaleString('id-ID')}
                    </p>
                  </div>
                  
                  {/* Reviews Summary */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col justify-center">
                    <div className="size-8 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center mb-3">
                      <StarIcon className="size-5" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 mt-auto">{t('activity.reviews')}</p>
                    <p className="font-black text-slate-800 text-sm truncate">
                      {t('activity.reviews_count', { count: 0 })}
                    </p>
                  </div>

                  {/* Location Info */}
                  <div className="col-span-2 bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="size-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center shrink-0">
                      <MapPinIcon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('activity.location')}</p>
                      <p className="font-bold text-slate-800 text-sm truncate">
                        {profile?.district_name && profile?.city_name ? `${profile.district_name}, ${profile.city_name}` : t('profile.info.not_filled')}
                      </p>
                    </div>
                    <Link href="/settings/address" className="shrink-0 p-2 text-primary hover:bg-primary/5 rounded-xl transition-colors">
                       <ArrowRightOnRectangleIcon className="size-5 rotate-180" />
                    </Link>
                  </div>
                </div>

              </div>

              {/* Sidebar Area */}
              <div className="lg:col-span-4 space-y-6">
                <Link href="/catalog" className="relative block h-full min-h-[220px] bg-primary rounded-4xl shadow-xl shadow-primary/30 overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700 pointer-events-none hidden md:block"></div>
                  <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                    <div className="size-12 bg-white/20 md:backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                      <ShoppingBagIcon className="size-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-black mb-2 leading-tight">
                      {t('profile.sidebar.cta_title').split('\n').map((line, i) => (
                        <span key={i}>{line}{i === 0 && <br/>}</span>
                      ))}
                    </h3>
                    <p className="text-blue-50/70 font-bold text-sm flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                       {t('profile.sidebar.cta_sub')} <ArrowRightOnRectangleIcon className="size-4 rotate-180" />
                    </p>
                  </div>
                </Link>
              </div>

            </div>
          </div>
          <UserDailyNotification />
        </div>
      </Content>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
  min-height: 100vh;
  overflow: hidden;
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  padding: 0;
  color: #0f172a;
`;
