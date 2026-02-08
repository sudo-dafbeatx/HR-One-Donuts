'use client';

import { useState } from 'react';
import { HeroData } from '@/types/cms';
import { AdminCard, AdminInput, AdminButton } from './Shared';
import { updateHero } from '@/app/admin/actions';

export default function HeroEditor({ initialData }: { initialData?: HeroData }) {
  const [data, setData] = useState<HeroData>(initialData || {
    title: '',
    subtitle: '',
    description: '',
    cta_text: 'Order Now',
    cta_link: '/catalog',
    image_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await updateHero(data);
      setMessage({ type: 'success', text: 'Hero section updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update hero' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AdminCard title="Hero Section Content">
        <div className="grid gap-4">
          <AdminInput 
            label="Main Title" 
            value={data.title} 
            onChange={e => setData({...data, title: e.target.value})}
            required 
          />
          <AdminInput 
            label="Subtitle" 
            value={data.subtitle} 
            onChange={e => setData({...data, subtitle: e.target.value})}
          />
          <AdminInput 
            label="Description" 
            multiline 
            rows={4}
            value={data.description} 
            onChange={e => setData({...data, description: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-4">
            <AdminInput 
              label="CTA Button Text" 
              value={data.cta_text} 
              onChange={e => setData({...data, cta_text: e.target.value})}
            />
            <AdminInput 
              label="CTA Button Link" 
              value={data.cta_link} 
              onChange={e => setData({...data, cta_link: e.target.value})}
            />
          </div>
          <AdminInput 
            label="Hero Image URL (or path)" 
            value={data.image_url} 
            onChange={e => setData({...data, image_url: e.target.value})}
          />
          
          <div className="flex justify-end pt-4">
            <AdminButton type="submit" isLoading={loading}>
              Save Content Changes
            </AdminButton>
          </div>
          
          {message && (
            <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}
        </div>
      </AdminCard>
    </form>
  );
}
