import "server-only";

/**
 * Vanex delivery integration (server only).
 *
 * The API key and address come from VANEX_API_URL / VANEX_API_KEY and never reach the browser.
 * Vanex's request format was not available while building this store, so createVanexShipment()
 * sends a generic payload. Before using it, match `payload` and the response parsing below to
 * the documentation Vanex gives you with your key.
 */
export function vanexConfigured() {
  return Boolean(process.env.VANEX_API_URL && process.env.VANEX_API_KEY);
}

type OrderForShipment = {
  order_number: string;
  customer_name: string;
  phone: string;
  city_name: string;
  address: string;
  total: number;
  payment_method: string;
  city: { vanex_city_id: number | null } | null;
  order_items: { product_name: string; quantity: number }[];
};

export async function createVanexShipment(order: OrderForShipment): Promise<{ ok: true; tracking: string } | { ok: false; message: string }> {
  const payload = {
    reference: order.order_number,
    receiver_name: order.customer_name,
    receiver_phone: order.phone,
    city_id: order.city?.vanex_city_id,
    city_name: order.city_name,
    address: order.address,
    // Cash orders: the courier collects the total. Prepaid orders: nothing to collect.
    cod_amount: order.payment_method === "cash" ? order.total : 0,
    description: order.order_items.map((i) => `${i.product_name} × ${i.quantity}`).join("، "),
  };
  try {
    const res = await fetch(process.env.VANEX_API_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.VANEX_API_KEY}` },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { ok: false, message: `رفضت Vanex الطلب (رمز ${res.status})` };
    const json = (await res.json()) as Record<string, unknown>;
    const tracking = String(json.tracking ?? json.tracking_number ?? json.id ?? "");
    return tracking ? { ok: true, tracking } : { ok: false, message: "لم تُرجع Vanex رقم تتبع" };
  } catch {
    return { ok: false, message: "تعذّر الاتصال بـ Vanex" };
  }
}
