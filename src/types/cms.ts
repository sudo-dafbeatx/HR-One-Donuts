export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
  category: string;
  stock: number;
  is_active: boolean;
  variants?: {
    name: string;
    price_adjustment: number;
  }[];
  created_at?: string;
  updated_at?: string;
  sale_type: 'normal' | 'flash_sale' | 'jumat_berkah' | 'takjil';
  package_type: 'satuan' | 'box';
  discount_percent?: number | null;
  promo_start?: string;
  promo_end?: string;
  sold_count: number;
  tag?: string;
}

export interface PromoEvent {
  id: string;
  title: string;
  event_type: 'seasonal' | 'flash_sale' | 'jumat_berkah' | 'takjil';
  banner_image_url?: string;
  discount_percent: number;
  start_at: string | null;
  end_at: string | null;
  is_active: boolean;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface OrderStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
}

export interface SiteSettings {
  store_name: string;
  tagline: string;
  whatsapp_number: string;
  phone_number: string;
  email: string;
  address: string;
  opening_hours: string;
  instagram_url?: string;
  facebook_url?: string;
  tiktok_url?: string;
}

export type CMSContentKey = 'site_info' | 'order_steps' | 'product_categories' | 'products' | 'events';
