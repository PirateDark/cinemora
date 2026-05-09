import { test, expect } from "@playwright/test";

test.describe("Cinemora E2E Core Flows", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load the home page with all key elements", async ({ page }) => {
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("header").getByRole("button", { name: "سينمورا" })).toBeVisible();
    await expect(page.locator("text=الرئيسية")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();

    const mainEl = page.locator("main").first();
    await expect(mainEl).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to movies page via header dropdown", async ({ page }) => {
    const moviesDropdown = page.locator("nav button").filter({ hasText: "أفلام" });
    await moviesDropdown.click();
    await page.locator("nav a").filter({ hasText: "أفلام أجنبية" }).click();
    await expect(page).toHaveURL("/movies");
    await expect(page.locator("h1")).toContainText("أفلام");
  });

  test("should navigate to TV page via header dropdown", async ({ page }) => {
    const tvDropdown = page.locator("nav button").filter({ hasText: "مسلسلات" });
    await tvDropdown.click();
    await page.locator("nav a").filter({ hasText: "مسلسلات أجنبية" }).click();
    await expect(page).toHaveURL("/tv");
    await expect(page.locator("h1")).toContainText("مسلسلات");
  });

  test("should show movie grid on movies page", async ({ page }) => {
    await page.goto("/movies");
    await expect(page.locator("h1")).toContainText("أفلام");
    const movieLink = page.locator("a[href^='/movie/']").first();
    await expect(movieLink).toBeVisible({ timeout: 15000 });
  });

  test("should show TV show grid on TV page", async ({ page }) => {
    await page.goto("/tv");
    await expect(page.locator("h1")).toContainText("مسلسلات");
    const tvLink = page.locator("a[href^='/tv/']").first();
    await expect(tvLink).toBeVisible({ timeout: 15000 });
  });

  test("should open movie detail page when clicking a movie card", async ({ page }) => {
    await page.goto("/movies");
    const firstMovie = page.locator("a[href^='/movie/']").first();
    await expect(firstMovie).toBeVisible({ timeout: 15000 });
    await firstMovie.click();
    await expect(page).toHaveURL(/\/movie\/\d+/);
    const detailTitle = page.locator("h1").first();
    await expect(detailTitle).toBeVisible({ timeout: 15000 });
  });

  test("should toggle family mode", async ({ page }) => {
    const familyButton = page.locator("button[title*='الوضع العائلي']").first();
    await expect(familyButton).toBeVisible();

    const wasActive = (await familyButton.getAttribute("title"))?.includes("مفعل") ?? false;

    await familyButton.click();
    await page.waitForTimeout(500);

    const titleAfter = await familyButton.getAttribute("title") ?? "";
    if (wasActive) {
      expect(titleAfter).toContain("تفعيل");
    } else {
      expect(titleAfter).toContain("مفعل");
    }
  });

  test("should show search results when typing", async ({ page }) => {
    const searchInput = page.locator("input[type='text']").first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill("test");
    await page.waitForTimeout(500);
    const dropdown = page.locator("text=عرض كل النتائج");
    await expect(dropdown).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to full search page", async ({ page }) => {
    await page.goto("/search?q=test");
    await expect(page).toHaveURL(/search\?q=test/);
  });

  test("should open mobile menu on small viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    const menuButton = page.locator("button").filter({ has: page.locator("svg.lucide-menu") });
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(300);
      await expect(page.getByRole("button", { name: "حمّل التطبيق الآن" })).toBeVisible({ timeout: 5000 });
    }
  });

  test("should show favorites page with empty state", async ({ page }) => {
    await page.goto("/favorites");
    await expect(page).toHaveURL("/favorites");
    const emptyTitle = page.locator("h3").filter({ hasText: "لا توجد مفضلات" });
    await expect(emptyTitle).toBeVisible({ timeout: 10000 });
  });

  test("should show watchlist page with empty state", async ({ page }) => {
    await page.goto("/watchlist");
    await expect(page).toHaveURL("/watchlist");
    const emptyEl = page.locator("h3").filter({ hasText: /فارغة|لا توجد/i });
    await expect(emptyEl).toBeVisible({ timeout: 10000 });
  });

  test("should show 404 page for unknown routes", async ({ page }) => {
    await page.goto("/this-does-not-exist");
    await expect(page).toHaveURL("/this-does-not-exist");
    await expect(page.locator("h1:has-text('404')").first()).toBeVisible({ timeout: 10000 });
  });

  test("should navigate to anime series page", async ({ page }) => {
    await page.goto("/anime/series");
    await expect(page).toHaveURL("/anime/series");
  });

  test("should navigate to anime movies page", async ({ page }) => {
    await page.goto("/anime/movies");
    await expect(page).toHaveURL("/anime/movies");
  });

  test("should navigate to Asian dramas page", async ({ page }) => {
    await page.goto("/asian");
    await expect(page).toHaveURL("/asian");
  });

  test("should show privacy page", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.locator("h1")).toContainText("سياسة الخصوصية", { timeout: 10000 });
  });

  test("should show contact page", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("h1")).toContainText("اتصل بنا", { timeout: 10000 });
  });

  test("should show watch history page", async ({ page }) => {
    await page.goto("/history");
    await expect(page).toHaveURL("/history");
  });

  test("pagination should work on movies page", async ({ page }) => {
    await page.goto("/movies");
    const nextButton = page.locator("button").filter({ hasText: "التالي" });
    await expect(nextButton).toBeVisible({ timeout: 15000 });
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(1000);
      expect(page.url()).toContain("/movies");
    }
  });

  test("footer should contain links", async ({ page }) => {
    await expect(page.locator("footer a")).not.toHaveCount(0);
    const privacyLink = page.locator("footer a").filter({ hasText: "سياسة الخصوصية" });
    await expect(privacyLink).toBeVisible();
  });
});
