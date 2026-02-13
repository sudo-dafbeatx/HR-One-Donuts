export interface HeroData {
  id?: string;
  title: string;
  subtitle?: string;
  description?: string;
  cta_text?: string;
  cta_link?: string;
  image_url?: string;
  updated_at?: string;
}

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
  discount_percent?: number;
  promo_start?: string;
  promo_end?: string;
  sold_count: number;
}

export interface PromoEvent {
  id: string;
  title: string;
  event_type: 'flash_sale' | 'jumat_berkah' | 'takjil' | 'seasonal';
  banner_image_url?: string;
  discount_percent?: number;
  start_at?: string;
  end_at?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Reason {
  id: string;
  title: string;
  description: string;
  icon?: string;
  order_index: number;
}

export interface SiteSettings {
  seo: {
    title: string;
    description: string;
    keywords?: string[];
  };
  contact: {
    whatsapp: string;
    address: string;
    openingHours: string;
    email: string;
  };
  social: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
}

export type CMSContentKey = 'hero' | 'products' | 'reasons' | 'settings' | 'featured_products';
