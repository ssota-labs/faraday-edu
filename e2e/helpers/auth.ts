import { expect, type Page } from "@playwright/test";
import { SMOKE_EMAIL, SMOKE_PASSWORD } from "../constants";

export async function loginAsSmoke(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(SMOKE_EMAIL);
  await page.getByLabel("Password").fill(SMOKE_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/$/);
}
