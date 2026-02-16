import { UITheme } from '@/types/cms';

// ==============================
// Default Values (fallback) — safe for client & server
// ==============================

export const DEFAULT_THEME: UITheme = {
  primary_color: '#1152d4',
  secondary_color: '#3b82f6',
  background_color: '#f6f7f8',
  text_color: '#0f172a',
  heading_font: 'Sora',
  body_font: 'Public Sans',
  button_radius: 8,
  card_radius: 8,
  card_bg_color: '#ffffff',
  card_border_color: '#e7edf3',
  search_bg_color: '#f1f5f9',
  search_text_color: '#64748b',
  account_bg_color: '#ffffff',
  account_text_color: '#0f172a',
};

export const DEFAULT_COPY: Record<string, string> = {
  nav_home: 'Home',
  nav_menu: 'Menu',
  nav_account: 'Account',
  search_placeholder: 'Cari donat...',
  hero_title: 'HR-One Donuts',
  hero_subtitle: 'Resep Tradisional, Rasa Internasional',
  banner_1_label: 'Flash Sale',
  banner_1_title: 'Diskon s.d 50%',
  banner_1_subtitle: 'Jam 14:00 - 16:00',
  banner_2_label: 'Jumat Berkah',
  banner_2_title: 'Beli 1 Lusin',
  banner_2_subtitle: 'Gratis 2 Donat',
  banner_3_label: 'Takjil Series',
  banner_3_title: 'Menu Buka Puasa',
  banner_3_subtitle: 'Mulai Rp 10rb',
  section_catalog: 'Pilihan Terbaik',
  section_catalog_desc: 'Recommended daily delights for you',
  cta_add_cart: '+ Keranjang',
  cta_buy: 'Beli Sekarang',
  sold_label: 'Terjual',
  badge_promo: 'PROMO',
  badge_limited: 'LIMITED',
  badge_bestseller: 'TERLARIS',
  footer_copyright: '© 2024 HR-One Donuts. All rights reserved.',
  footer_quicklinks: 'Quick Links',
  footer_support: 'Customer Support',
  footer_contact: 'Contact Us',
  empty_products: 'Belum ada produk aktif.',
  empty_category: 'Tidak ada produk di kategori ini.',
};
