'use client';

import { useState } from 'react';
import { PromoEvent } from '@/types/cms';
import { AdminInput, AdminButton, AdminSelect, AdminCard } from './Shared';
import { saveEvent, deleteEvent } from '@/app/admin/actions';
import { TrashIcon, PencilIcon, PlusIcon, MegaphoneIcon } from '@heroicons/react/24/outline';
import ImageUploader from '../ImageUploader';
import Image from 'next/image';

export default function EventManager({ initialEvents }: { initialEvents: PromoEvent[] }) {
  const [events, setEvents] = useState<PromoEvent[]>(initialEvents);
  const [editingEvent, setEditingEvent] = useState<Partial<PromoEvent> | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    
    setLoading(true);
    try {
      await saveEvent(editingEvent);
      window.location.reload();
    } catch (error) {
      alert('Error saving event: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus event ini?')) return;
    try {
      await deleteEvent(id);
      setEvents(events.filter(e => e.id !== id));
    } catch (error) {
      alert('Error deleting event: ' + (error as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-heading flex items-center gap-2">
          <MegaphoneIcon className="w-6 h-6 text-primary" />
          Event & Promo Banner
        </h2>
        <AdminButton onClick={() => setEditingEvent({ headline: '', event_slug: '', event_day: 'TUESDAY', is_enabled: true, start_time: '00:00', end_time: '23:59' })}>
          <PlusIcon className="w-5 h-5" />
          Tambah Event
        </AdminButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group">
            <div className="aspect-[21/9] bg-slate-100 relative overflow-hidden">
              {event.banner_image_url ? (
                <Image src={event.banner_image_url} alt={event.headline} fill className="object-cover" />
              ) : (
                <div className="size-full flex items-center justify-center bg-slate-50 text-slate-300">
                   <MegaphoneIcon className="w-12 h-12 opacity-20" />
                </div>
              )}
              <div className="absolute inset-0 bg-slate-900/20 sm:bg-slate-900/40 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button 
                   type="button"
                   onClick={() => setEditingEvent(event)}
                   className="p-3 bg-white rounded-xl shadow-lg text-primary hover:scale-110 transition-transform"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button 
                   type="button"
                   onClick={() => handleDelete(event.id)}
                   className="p-3 bg-white rounded-xl shadow-lg text-red-500 hover:scale-110 transition-transform"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-5 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-800 uppercase tracking-tight">{event.headline}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {event.event_slug?.replace('_', ' ') || 'PROMO'}
                  </span>
                  {!event.is_enabled && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      Draft
                    </span>
                  )}
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {event.event_day}
                  </span>
                </div>
              </div>
              {event.discount_percent && (
                <div className="text-right">
                  <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Diskon</p>
                  <p className="text-2xl font-black text-red-500 leading-none">{event.discount_percent}%</p>
                </div>
              )}
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-3xl">
             <p className="text-slate-400 font-medium italic">Belum ada banner promo aktif.</p>
          </div>
        )}
      </div>

      {editingEvent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="my-auto w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden scale-in-center text-left">
            <div className="px-5 sm:px-8 py-4 sm:py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg sm:text-xl font-black text-heading">
                {editingEvent.id ? 'Edit Event' : 'Tambah Event Baru'}
              </h3>
              <button 
                 type="button"
                 onClick={() => setEditingEvent(null)} 
                 className="text-slate-400 hover:text-slate-600"
              >
                <TrashIcon className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-5 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <AdminInput 
                    label="Headline Event *" 
                    value={editingEvent.headline || ''} 
                    onChange={e => setEditingEvent({...editingEvent, headline: e.target.value})}
                    required 
                  />
                  <AdminInput 
                    label="Slug Event (lowercase_with_underscore) *" 
                    value={editingEvent.event_slug || ''} 
                    onChange={e => setEditingEvent({...editingEvent, event_slug: e.target.value})}
                    required 
                  />
                  <AdminSelect 
                    label="Hari Event"
                    value={editingEvent.event_day || 'TUESDAY'}
                    onChange={e => setEditingEvent({...editingEvent, event_day: e.target.value as PromoEvent['event_day']})}
                    options={[
                      { label: 'Senin', value: 'MONDAY' },
                      { label: 'Selasa', value: 'TUESDAY' },
                      { label: 'Rabu', value: 'WEDNESDAY' },
                      { label: 'Kamis', value: 'THURSDAY' },
                      { label: 'Jumat', value: 'FRIDAY' },
                      { label: 'Sabtu', value: 'SATURDAY' },
                      { label: 'Minggu', value: 'SUNDAY' },
                    ]}
                  />
                  <AdminInput 
                    label="Diskon (%)" 
                    type="number"
                    value={editingEvent.discount_percent || ''} 
                    onChange={e => setEditingEvent({...editingEvent, discount_percent: Number(e.target.value)})}
                  />
                </div>

                <div className="space-y-4">
                   <AdminCard title="Status & Waktu">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold text-slate-700 text-left">Aktif</span>
                        <button
                          type="button"
                          onClick={() => setEditingEvent({...editingEvent, is_enabled: !editingEvent.is_enabled})}
                          className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${editingEvent.is_enabled ? 'bg-primary' : 'bg-slate-300'}`}
                        >
                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${editingEvent.is_enabled ? 'translate-x-5' : 'translate-x-0'} mt-0.5 ml-0.5`} />
                        </button>
                      </div>
                      <div className="space-y-2">
                         <div className="grid grid-cols-2 gap-4">
                           <AdminInput 
                              label="Jam Mulai" 
                              type="time"
                              value={editingEvent.start_time || '00:00'} 
                              onChange={e => setEditingEvent({...editingEvent, start_time: e.target.value})}
                           />
                           <AdminInput 
                              label="Jam Selesai" 
                              type="time"
                              value={editingEvent.end_time || '23:59'} 
                              onChange={e => setEditingEvent({...editingEvent, end_time: e.target.value})}
                           />
                         </div>
                      </div>
                   </AdminCard>
                   <div className="text-left">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Deskripsi</label>
                      <textarea 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[100px]"
                        value={editingEvent.description || ''}
                        onChange={e => setEditingEvent({...editingEvent, description: e.target.value})}
                        placeholder="Deskripsi promo..."
                      />
                   </div>
                </div>
              </div>

              <ImageUploader
                currentImage={editingEvent.banner_image_url}
                onImageUploaded={(url) => setEditingEvent({...editingEvent, banner_image_url: url})}
                label="Banner Promo (Recommended: 21:9)"
                aspectRatio="video"
              />
              
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <AdminButton type="button" variant="secondary" onClick={() => setEditingEvent(null)}>Batal</AdminButton>
                <AdminButton type="submit" isLoading={loading}>Simpan Event</AdminButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
