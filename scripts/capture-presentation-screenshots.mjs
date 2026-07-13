import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = "/opt/cursor/artifacts/screenshots";
const BASE = "http://localhost:4321";

async function hoverToolbar(page) {
  await page.mouse.move(640, 760);
  await page.waitForTimeout(500);
}

async function clickBtn(page, label) {
  await hoverToolbar(page);
  await page.getByRole("button", { name: label }).click({ force: true });
  await page.waitForTimeout(700);
}

async function shot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(file);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await mkdir(OUT, { recursive: true });

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await shot(page, "01-map");

await page.getByRole("button", { name: /Motion/i }).click();
await page.waitForTimeout(900);

await clickBtn(page, "Slides");
await shot(page, "02-slide-title");

await hoverToolbar(page);
await shot(page, "03-slide-toolbar");

await page.keyboard.press("ArrowRight");
await page.waitForTimeout(600);
await shot(page, "04-slide-content");

await clickBtn(page, /Overview/i);
await page.waitForSelector("text=Pan", { timeout: 8000 });
await shot(page, "05-slide-overview");

const layer = page.locator("[data-world-layer]");
const box = await layer.boundingBox();
if (box) {
  await page.mouse.move(box.x + 180, box.y + 160);
  await page.mouse.down();
  await page.mouse.move(box.x + 400, box.y + 240, { steps: 10 });
  await page.mouse.up();
}
await page.waitForTimeout(300);
await shot(page, "05b-slide-overview-ink");

await clickBtn(page, "Textbook");
await page.waitForTimeout(800);
await shot(page, "06-textbook-read");

await clickBtn(page, "Overview");
await page.waitForSelector("text=Pan", { timeout: 8000 });
await shot(page, "07-textbook-overview");

await browser.close();
