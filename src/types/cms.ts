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
  sale_type: 'normal' | 'jumat_berkah' | 'selasa_mega_sale';
  discount_percent?: number | null;
  promo_start?: string;
  promo_end?: string;
  sold_count: number;
  tag?: string;
}

export interface PromoEvent {
  id: string;
  title: string;
  description?: string;
  event_type: 'seasonal' | 'jumat_berkah' | 'selasa_mega_sale';
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

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment?: string | null;
  created_at: string;
  updated_at: string;
  // Joined data from user profile
  reviewer_name?: string;
  reviewer_avatar?: string | null;
  reviewer_email?: string;
}

export interface ReviewStats {
  product_id: string;
  product_name?: string;
  average_rating: number;
  total_reviews: number;
  five_star_count: number;
  four_star_count: number;
  three_star_count: number;
  two_star_count: number;
  one_star_count: number;
}

export type CMSContentKey = 'site_info' | 'order_steps' | 'product_categories' | 'products' | 'events';

export interface UITheme {
  id?: string;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  text_color: string;
  heading_font: string;
  body_font: string;
  button_radius: number;
  card_radius: number;
  card_bg_color: string;
  card_border_color: string;
  search_bg_color: string;
  search_text_color: string;
  account_bg_color: string;
  account_text_color: string;
  updated_at?: string;
}

export interface UICopy {
  id?: string;
  key: string;
  value: string;
  updated_at?: string;
}
