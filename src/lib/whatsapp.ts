import { site, paymentMethods, type PaymentMethod } from "./site";
import { formatPrice } from "./format";

export function whatsappLink(text?: string) {
  const base = `https://wa.me/${site.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

type OrderForMessage = {
  order_number: string;
  customer_name: string;
  city_name: string;
  address: string;
  payment_method: PaymentMethod;
  delivery_fee: number;
  coupon_discount: number;
  total: number;
  items: { name: string; quantity: number; line_total: number }[];
};

/** The message the customer sends to confirm a new order. */
export function orderConfirmationMessage(order: OrderForMessage) {
  const lines = [
    `مرحباً ${site.nameAr}، أريد تأكيد طلبي رقم ${order.order_number}`,
    "",
    ...order.items.map((i) => `• ${i.name} × ${i.quantity} = ${formatPrice(i.line_total)}`),
    "",
    `التوصيل: ${formatPrice(order.delivery_fee)}`,
    ...(order.coupon_discount > 0 ? [`خصم الكوبون: ${formatPrice(order.coupon_discount)}`] : []),
    `الإجمالي: ${formatPrice(order.total)}`,
    `طريقة الدفع: ${paymentMethods[order.payment_method].short}`,
    "",
    `الاسم: ${order.customer_name}`,
    `العنوان: ${order.city_name}، ${order.address}`,
  ];
  return lines.join("\n");
}
