import { expect, test } from "@playwright/test";
import { ADMIN, blockWhatsApp, signIn } from "./helpers";

test("guest: browse, search, filter, buy, then admin sees the order and stock drops", async ({ page, browser, isMobile }) => {
  const whatsapp = await blockWhatsApp(page);

  // Home
  await page.goto("/");
  await expect(page.locator("#main").getByRole("heading", { name: "الأقسام" })).toBeVisible();

  // Search with instant suggestions
  const search = page.getByRole("combobox").first();
  await search.fill("سماعه");
  await expect(page.getByRole("option").first()).toBeVisible();
  await search.press("Enter");
  await page.waitForURL(/\/products\?q=/);
  await expect(page.getByRole("heading", { name: /نتائج البحث/ })).toBeVisible();

  // Category with a filter kept in the URL
  await page.goto("/category/laptops");
  if (isMobile) {
    await page.getByRole("button", { name: /التصفية/ }).click();
    await page.getByRole("dialog").getByLabel("المتوفر في المخزون فقط").check();
    await page.waitForURL(/stock=1/);
    await page.getByRole("dialog").getByRole("button", { name: /عرض/ }).click();
  } else {
    await page.getByLabel("المتوفر في المخزون فقط").check();
    await page.waitForURL(/stock=1/);
  }
  await expect(page).toHaveURL(/stock=1/);

  // Product page: read stock first
  await page.goto("/product/lenovo-ideapad-slim-3");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Lenovo IdeaPad Slim 3");
  const admin = await browser.newContext();
  const adminPage = await admin.newPage();
  await signIn(adminPage, ADMIN.email, ADMIN.password, "/admin");
  const stockBefore = await productStock(adminPage, "Lenovo IdeaPad Slim 3");

  await page.getByRole("button", { name: "زيادة الكمية" }).click();
  await page.getByRole("button", { name: "أضف للسلة" }).click();
  await expect(page.getByText("تمت الإضافة إلى السلة")).toBeVisible();

  // Cart
  await page.goto("/cart");
  await expect(page.getByText("Lenovo IdeaPad Slim 3")).toBeVisible();
  await page.getByRole("link", { name: "إتمام الطلب" }).click();

  // Checkout
  await page.waitForURL("**/checkout");
  await page.getByLabel("الاسم الكامل").fill("زبون تجريبي");
  await page.getByLabel("رقم الهاتف").fill("0911234567");
  await page.getByLabel("المدينة").selectOption({ label: "مصراتة — توصيل 10 د.ل" });
  await page.getByLabel("العنوان بالتفصيل").fill("شارع طرابلس، قرب الجامعة");
  await page.getByText("الدفع نقداً عند الاستلام").click();
  await page.getByPlaceholder("كود الخصم").fill("VOLTURA10");
  await page.getByRole("button", { name: "تطبيق" }).click();
  await expect(page.getByText(/تم تطبيق كود الخصم/)).toBeVisible();
  await page.getByRole("button", { name: "تأكيد الطلب" }).click();

  // Confirmation, then WhatsApp
  await page.waitForURL(/\/order\//);
  const orderNumber = (await page.locator("strong", { hasText: /^VC-\d+$/ }).textContent())!.trim();
  expect(orderNumber).toMatch(/^VC-\d+$/);
  await expect.poll(() => whatsapp.length, { timeout: 10_000 }).toBeGreaterThan(0);
  expect(decodeURIComponent(whatsapp[0])).toContain(orderNumber);

  // Admin sees the order and stock dropped by 2
  await adminPage.goto(`/admin/orders?q=${orderNumber}`);
  await expect(adminPage.getByRole("link", { name: orderNumber })).toBeVisible();
  expect(await productStock(adminPage, "Lenovo IdeaPad Slim 3")).toBe(stockBefore - 2);
  await admin.close();
});

async function productStock(page: import("@playwright/test").Page, name: string) {
  await page.goto(`/admin/products?q=${encodeURIComponent(name)}`);
  const row = page.getByRole("row").filter({ hasText: name });
  return Number(await row.locator("td").nth(3).innerText());
}
