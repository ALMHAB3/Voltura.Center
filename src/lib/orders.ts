import type { OrderStatus, PaymentMethod } from "./site";

export type OrderSummary = {
  order_number: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  customer_name: string;
  city_name: string;
  address: string;
  subtotal: number;
  product_discount: number;
  coupon_discount: number;
  delivery_fee: number;
  total: number;
  created_at: string;
  items: { name: string; slug: string | null; image: string | null; quantity: number; unit_sale_price: number; line_total: number }[];
};

export const statusFlow: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered"];
