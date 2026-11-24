import { expect, test } from "@playwright/test";
import { register, signIn, uniqueEmail } from "./helpers";

test("register, sign out, sign in again", async ({ page }) => {
  const email = uniqueEmail("auth");
  await register(page, email);
  await page.getByRole("button", { name: "تسجيل الخروج" }).click();
  await page.waitForURL("/");
  await signIn(page, email, "Customer123!");
  await expect(page.getByRole("heading", { name: "طلباتي" })).toBeVisible();
});

test("wrong password shows an error", async ({ page }) => {
  await page.goto("/account/login");
  await page.getByLabel("البريد الإلكتروني").fill("nobody@volturacenter.test");
  await page.getByLabel("كلمة المرور").fill("wrong-password");
  await page.getByRole("button", { name: "تسجيل الدخول" }).click();
  await expect(page.getByText("البريد أو كلمة المرور غير صحيحة")).toBeVisible();
});

test("guest cart is merged into the account at sign-in", async ({ page }) => {
  const email = uniqueEmail("merge");
  await register(page, email);
  await page.getByRole("button", { name: "تسجيل الخروج" }).click();
  await page.waitForURL("/");

  await page.goto("/product/kingston-nv2-1tb");
  await page.getByRole("button", { name: "أضف للسلة" }).click();
  await signIn(page, email, "Customer123!", "/cart");
  await expect(page.getByText("Kingston NV2 1TB NVMe")).toBeVisible();
});
