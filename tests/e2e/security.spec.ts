import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { blockWhatsApp, register, uniqueEmail } from "./helpers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

test("guests are sent to sign-in from private pages", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/account\/login\?next=%2Fadmin/);
  await page.goto("/account/addresses");
  await expect(page).toHaveURL(/\/account\/login/);
});

test("a customer cannot open the admin dashboard", async ({ page }) => {
  await register(page, uniqueEmail("noadmin"));
  const res = await page.goto("/admin");
  expect(res?.status()).toBe(404);
  await expect(page.getByText("الصفحة غير موجودة")).toBeVisible();
});

test("a customer cannot read another customer's order", async ({ browser }) => {
  // Customer A places an order.
  const a = await browser.newPage();
  await blockWhatsApp(a);
  await register(a, uniqueEmail("owner"));
  await a.goto("/product/samsung-45w-charger");
  await a.locator("#main").getByRole("button", { name: "اشترِ الآن" }).first().click();
  await a.waitForURL("**/checkout");
  await a.getByLabel("المدينة").selectOption({ index: 1 });
  await a.getByLabel("العنوان بالتفصيل").fill("عنوان اختبار طويل");
  await a.getByRole("button", { name: "تأكيد الطلب" }).click();
  await a.waitForURL(/\/order\//);
  const orderNumber = (await a.locator("strong", { hasText: /^VC-\d+$/ }).textContent())!.trim();

  // Customer B tries to open it.
  const b = await browser.newPage();
  await register(b, uniqueEmail("intruder"));
  await b.goto(`/account/orders/${orderNumber}`);
  // Streamed pages keep HTTP 200 and render the not-found screen (marked noindex).
  await expect(b.getByRole("heading", { name: "الصفحة غير موجودة" })).toBeVisible();
  await expect(b.getByText("Samsung 45W")).toHaveCount(0);
  await a.close();
  await b.close();
});

test("prices cannot be changed from the browser", async () => {
  const supabase = createClient(url, anonKey);
  const before = await supabase.from("products").select("price").eq("slug", "hp-250-g10").single();
  const update = await supabase.from("products").update({ price: 1 }).eq("slug", "hp-250-g10").select();
  expect(update.data ?? []).toHaveLength(0);
  const after = await supabase.from("products").select("price").eq("slug", "hp-250-g10").single();
  expect(after.data?.price).toBe(before.data?.price);

  // Orders cannot be inserted directly either; only place_order() creates them.
  const insert = await supabase.from("orders").insert({
    payment_method: "cash", customer_name: "x", phone: "0910000000", city_name: "x", address: "x",
    subtotal: 1, product_discount: 0, total: 1,
  });
  expect(insert.error).not.toBeNull();
});
