"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Banknote, Building2, Loader2, Smartphone, Ticket, Wallet } from "lucide-react";
import { checkoutSchema, type CheckoutInput } from "@/lib/validation";
import { paymentMethods, type PaymentMethod } from "@/lib/site";
import { formatPrice } from "@/lib/format";
import { imageUrl } from "@/lib/images";
import { useCart } from "@/components/store/cart-provider";
import { Button, LinkButton } from "@/components/ui/button";
import { Field, FormMessage, Input, Select, Textarea } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { checkCoupon, placeOrder } from "@/app/actions/checkout";
import { cn } from "@/lib/cn";
import { useCartProducts } from "./use-cart-products";

type City = { id: number; name: string; delivery_fee: number; delivery_days: string | null };
type Address = { id: number; label: string; recipient_name: string; phone: string; city_id: number; details: string; is_default: boolean };

const paymentIcons: Record<PaymentMethod, typeof Banknote> = {
  cash: Banknote,
  bank_transfer: Building2,
  onepay: Smartphone,
  lypay: Wallet,
};

export function CheckoutForm({
  cities,
  addresses,
  defaults,
}: {
  cities: City[];
  addresses: Address[];
  defaults: { name: string; phone: string };
}) {
  const router = useRouter();
  const { lines, clear } = useCart();
  const { items, loading, subtotal, saleTotal, productDiscount, stockIssues } = useCartProducts();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [checkingCoupon, startCoupon] = useTransition();

  const defaultAddress = addresses.find((a) => a.is_default) ?? addresses[0];
  const form = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: defaultAddress?.recipient_name ?? defaults.name,
      phone: defaultAddress?.phone ?? defaults.phone,
      cityId: defaultAddress?.city_id ?? ("" as unknown as number),
      address: defaultAddress?.details ?? "",
      notes: "",
      paymentMethod: "cash",
    },
  });
  const { register, handleSubmit, formState, setValue, control } = form;
  const cityId = Number(useWatch({ control, name: "cityId" }));
  const payment = useWatch({ control, name: "paymentMethod" }) as PaymentMethod;
  const city = cities.find((c) => c.id === cityId);
  const delivery = city?.delivery_fee ?? 0;
  const couponDiscount = coupon ? Math.min(coupon.discount, saleTotal) : 0;
  const total = saleTotal - couponDiscount + delivery;
  const errors = formState.errors;

  function applyCoupon() {
    const code = couponInput.trim();
    if (!code) return;
    startCoupon(async () => {
      const res = await checkCoupon(code, saleTotal);
      if (res.valid && res.code) {
        setCoupon({ code: res.code, discount: res.discount ?? 0 });
        setCouponMessage({ ok: true, text: `${res.message}: وفّرت ${formatPrice(res.discount ?? 0)}` });
      } else {
        setCoupon(null);
        setCouponMessage({ ok: false, text: res.message });
      }
    });
  }

  const onSubmit = handleSubmit((values) => {
    setServerError(null);
    start(async () => {
      const res = await placeOrder({ ...values, couponCode: coupon?.code }, lines);
      if (!res.ok) {
        setServerError(res.message);
        if (res.message.includes("كود الخصم")) setCoupon(null);
        return;
      }
      clear();
      router.replace(`/order/${res.orderId}?new=1`);
    });
  });

  if (!loading && !lines.length && !pending) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border bg-surface px-4 py-20 text-center">
        <h2 className="text-lg font-bold">سلتك فارغة</h2>
        <LinkButton href="/products">ابدأ التسوق</LinkButton>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid items-start gap-6 lg:grid-cols-[1fr_400px]">
      <div className="flex flex-col gap-6">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-4 text-lg font-bold">بيانات التوصيل</h2>
          {addresses.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {addresses.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    setValue("customerName", a.recipient_name);
                    setValue("phone", a.phone);
                    setValue("cityId", a.city_id);
                    setValue("address", a.details);
                  }}
                  className="rounded-xl border border-border px-3 py-1.5 text-sm hover:border-primary-strong"
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="الاسم الكامل" htmlFor="customerName" error={errors.customerName?.message}>
              <Input id="customerName" autoComplete="name" aria-invalid={!!errors.customerName} {...register("customerName")} />
            </Field>
            <Field label="رقم الهاتف" htmlFor="phone" error={errors.phone?.message} hint="سنتواصل معك على هذا الرقم لتأكيد الطلب">
              <Input id="phone" type="tel" dir="ltr" inputMode="tel" autoComplete="tel" placeholder="0912345678" className="num text-end" aria-invalid={!!errors.phone} {...register("phone")} />
            </Field>
            <Field label="المدينة" htmlFor="cityId" error={errors.cityId?.message}>
              <Select id="cityId" aria-invalid={!!errors.cityId} {...register("cityId")}>
                <option value="">اختر المدينة</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — توصيل {formatPrice(c.delivery_fee)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="مدة التوصيل المتوقعة" htmlFor="days">
              <p id="days" className="flex h-11 items-center rounded-xl bg-surface-2 px-3.5 text-sm text-muted">
                {city?.delivery_days ?? "تظهر بعد اختيار المدينة"}
              </p>
            </Field>
            <Field label="العنوان بالتفصيل" htmlFor="address" error={errors.address?.message} className="sm:col-span-2">
              <Textarea id="address" rows={2} placeholder="المنطقة، الشارع، أقرب معلم" aria-invalid={!!errors.address} {...register("address")} />
            </Field>
            <Field label="ملاحظات (اختياري)" htmlFor="notes" className="sm:col-span-2">
              <Input id="notes" placeholder="مثال: الاتصال قبل الوصول" {...register("notes")} />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <h2 className="mb-4 text-lg font-bold">طريقة الدفع</h2>
          <div className="grid gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label="طريقة الدفع">
            {(Object.keys(paymentMethods) as PaymentMethod[]).map((key) => {
              const Icon = paymentIcons[key];
              const active = payment === key;
              return (
                <label
                  key={key}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3.5 transition-colors",
                    active ? "border-primary-strong bg-primary/10" : "border-border hover:border-primary-strong/50",
                  )}
                >
                  <input type="radio" value={key} className="sr-only" {...register("paymentMethod")} />
                  <span className={cn("flex size-10 items-center justify-center rounded-lg", active ? "bg-ink text-primary" : "bg-surface-2 text-muted")}>
                    <Icon size={20} aria-hidden />
                  </span>
                  <span className="text-sm font-semibold">{paymentMethods[key].label}</span>
                </label>
              );
            })}
          </div>
          <p className="mt-3 rounded-xl bg-surface-2 px-3.5 py-2.5 text-sm leading-6 text-muted">{paymentMethods[payment]?.instructions}</p>
        </section>
      </div>

      <aside className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 lg:sticky lg:top-32">
        <h2 className="text-lg font-bold">ملخص الطلب</h2>
        {loading && !items.length ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
        ) : (
          <ul className="flex max-h-64 flex-col gap-3 overflow-y-auto">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="flex items-center gap-3">
                <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                  {product.image && <Image src={imageUrl(product.image)!} alt="" fill sizes="56px" className="object-cover" />}
                  <span className="num absolute -top-0 end-0 rounded-bl-lg bg-ink px-1.5 text-[11px] font-bold text-primary">{quantity}</span>
                </span>
                <span className="line-clamp-2 flex-1 text-sm">{product.name}</span>
                <span className="num text-sm font-semibold">{formatPrice(product.sale_price * quantity)}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          <label htmlFor="coupon" className="sr-only">
            كود الخصم
          </label>
          <div className="relative flex-1">
            <Ticket size={16} className="pointer-events-none absolute inset-y-0 start-3 my-auto text-muted" aria-hidden />
            <Input
              id="coupon"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              placeholder="كود الخصم"
              dir="ltr"
              className="ps-9 text-end uppercase"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyCoupon();
                }
              }}
            />
          </div>
          <Button variant="outline" onClick={applyCoupon} disabled={checkingCoupon || !couponInput.trim()}>
            {checkingCoupon ? <Loader2 size={16} className="animate-spin" /> : "تطبيق"}
          </Button>
        </div>
        {couponMessage && <p className={cn("text-xs", couponMessage.ok ? "text-success" : "text-danger")}>{couponMessage.text}</p>}

        <dl className="num flex flex-col gap-2 border-t border-border pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">المجموع</dt>
            <dd>{formatPrice(subtotal)}</dd>
          </div>
          {productDiscount > 0 && (
            <div className="flex justify-between text-success">
              <dt>خصم المنتجات</dt>
              <dd>- {formatPrice(productDiscount)}</dd>
            </div>
          )}
          {couponDiscount > 0 && (
            <div className="flex justify-between text-success">
              <dt>كود الخصم ({coupon?.code})</dt>
              <dd>- {formatPrice(couponDiscount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted">التوصيل {city ? `إلى ${city.name}` : ""}</dt>
            <dd>{city ? formatPrice(delivery) : "—"}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-lg font-bold">
            <dt>الإجمالي</dt>
            <dd>{formatPrice(total)}</dd>
          </div>
        </dl>

        <FormMessage>{serverError}</FormMessage>
        {stockIssues.length > 0 && <FormMessage>بعض الكميات غير متوفرة. عدّلها من السلة.</FormMessage>}
        <Button type="submit" size="lg" disabled={pending || loading || stockIssues.length > 0 || !items.length}>
          {pending ? <Loader2 size={18} className="animate-spin" aria-hidden /> : null}
          تأكيد الطلب
        </Button>
        <p className="text-center text-xs leading-5 text-muted">بعد التأكيد سننقلك إلى واتساب لإرسال تفاصيل الطلب وتأكيده معنا.</p>
      </aside>
    </form>
  );
}
