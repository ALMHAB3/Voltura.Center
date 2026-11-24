import { expect, type Page } from "@playwright/test";

export const ADMIN = {
  email: process.env.E2E_ADMIN_EMAIL ?? "admin@volturacenter.test",
  password: process.env.E2E_ADMIN_PASSWORD ?? "Admin12345!",
};

/** WhatsApp is an external site; record the link instead of leaving the store. */
export async function blockWhatsApp(page: Page) {
  const opened: string[] = [];
  await page.route(/https:\/\/(wa\.me|api\.whatsapp\.com)\/.*/, (route) => {
    opened.push(route.request().url());
    return route.fulfill({ status: 200, body: "whatsapp" });
  });
  return opened;
}

export async function signIn(page: Page, email: string, password: string, next = "/account") {
  await page.goto(`/account/login?next=${encodeURIComponent(next)}`);
  await page.getByLabel("البريد الإلكتروني").fill(email);
  await page.getByLabel("كلمة المرور").fill(password);
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  await page.waitForURL((url) => url.pathname === next);
}

export async function register(page: Page, email: string, password = "Customer123!") {
  await page.goto("/account/register");
  await page.getByLabel("الاسم الكامل").fill("عميل اختبار");
  await page.getByLabel("رقم الهاتف").fill("0921234567");
  await page.getByLabel("البريد الإلكتروني").fill(email);
  await page.getByLabel("كلمة المرور", { exact: true }).fill(password);
  await page.getByLabel("تأكيد كلمة المرور").fill(password);
  await page.getByRole("button", { name: "إنشاء الحساب" }).click();
  await page.waitForURL("**/account");
  await expect(page.getByRole("heading", { name: "طلباتي" })).toBeVisible();
}

export function uniqueEmail(tag: string) {
  return `${tag}-${Date.now()}-${Math.floor(Math.random() * 1e4)}@volturacenter.test`;
}
