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
