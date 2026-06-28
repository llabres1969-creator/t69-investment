import { Page } from "@playwright/test";

export async function seedProfile(page: Page, score = 50) {
  await page.addInitScript((profileScore) => {
    window.localStorage.setItem("t69_profile_score", String(profileScore));
  }, score);
}
