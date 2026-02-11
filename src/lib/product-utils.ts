import { Product } from "@/types/cms";

export function isPromoActive(product: Product): boolean {
  if (!product.sale_type || product.sale_type === 'normal') return false;
  
  const now = new Date();
  
  if (product.promo_start) {
    const start = new Date(product.promo_start);
    if (now < start) return false;
  }
  
  if (product.promo_end) {
    const end = new Date(product.promo_end);
    if (now > end) return false;
  }
  
  return true;
}

export function getEffectivePrice(product: Product): number {
  if (isPromoActive(product) && product.discount_percent && product.discount_percent > 0) {
    return product.price * (1 - product.discount_percent / 100);
  }
  return product.price;
}

export function getPromoLabel(product: Product): string {
  if (!isPromoActive(product)) return "";
  return product.sale_type.replace('_', ' ');
}
