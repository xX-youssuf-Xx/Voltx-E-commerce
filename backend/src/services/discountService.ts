import { db } from '../config/database';

export async function validateCouponAndCalculateDiscount(coupon: string, products: Record<string, number>, price: number): Promise<number> {
  // Find coupon
  const result = await db.query('SELECT * FROM discounts WHERE code = $1 AND is_active = true', [coupon]);
  if (result.rows.length === 0) throw new Error('Invalid or inactive coupon');
  const discount = result.rows[0];
  const now = new Date();
  if (discount.start_date && new Date(discount.start_date) > now) throw new Error('Coupon not started yet');
  if (discount.end_date && new Date(discount.end_date) < now) throw new Error('Coupon expired');
  // TODO: Check usage limits per user/order if needed
  if (discount.minimum_order_amount && price < Number(discount.minimum_order_amount)) throw new Error('Order does not meet minimum amount for coupon');
  // Calculate discount
  let discountAmount = 0;
  if (discount.type === 'percentage') {
    discountAmount = price * (Number(discount.value) / 100);
    if (discount.maximum_discount_amount) {
      discountAmount = Math.min(discountAmount, Number(discount.maximum_discount_amount));
    }
  } else if (discount.type === 'fixed') {
    discountAmount = Number(discount.value);
    if (discount.maximum_discount_amount) {
      discountAmount = Math.min(discountAmount, Number(discount.maximum_discount_amount));
    }
  }
  return discountAmount;
} 