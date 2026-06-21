import { test, expect } from "@playwright/test";

test.describe("font detail", () => {
  test("renders highlighted code on a font page", async ({ page }) => {
    await page.goto("FiraCode");
    await expect(page.locator(".code-specimen .shiki").first()).toBeVisible();
    // Breadcrumb link (scoped — a second "Browse" lives in the header nav on desktop).
    await expect(page.locator('ol a[href$="/browse"]')).toBeVisible();
  });

  test("compare page shows two specimens", async ({ page }) => {
    await page.goto("FiraCode/JetBrainsMono");
    await expect(page.locator(".code-specimen")).toHaveCount(2);
    await expect(page.locator(".code-specimen .shiki").first()).toBeVisible();
  });

  test("OpenType toggle updates sidebar font samples on compare pages", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem("fontOpenTypeFeatures", "true");
      localStorage.setItem("fontLigatures", "true");
    });
    await page.goto("JetBrainsMono/DejaVuSansMono");

    const sidebarSample = page.locator("aside .font-feature-sample").first();
    await expect(sidebarSample).toBeAttached();
    await expect(page.locator("#ctrl-opentype")).toBeChecked();

    await expect
      .poll(() =>
        sidebarSample.evaluate((element) => {
          return getComputedStyle(element).fontFeatureSettings;
        }),
      )
      .not.toBe("normal");

    await page.locator("#ctrl-opentype").uncheck();
    await expect(page.locator("html")).toHaveAttribute("data-opentype", "0");
    await expect
      .poll(() =>
        sidebarSample.evaluate((element) => {
          return getComputedStyle(element).fontFeatureSettings;
        }),
      )
      .toBe("normal");
  });

  test("OpenType toggle keeps Monaspace Neon ligatures enabled", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem("fontOpenTypeFeatures", "true");
      localStorage.setItem("fontLigatures", "true");
    });
    await page.goto("JetBrainsMono/MonaspaceNeon");

    const sidebarSample = page
      .locator("aside .font-feature-sample", { hasText: "Monaspace Neon" })
      .first();
    await expect(sidebarSample).toBeAttached();

    await page.locator("#ctrl-opentype").uncheck();
    await expect(page.locator("html")).toHaveAttribute("data-opentype", "0");

    await expect
      .poll(() =>
        sidebarSample.evaluate((element) => {
          return getComputedStyle(element).fontFeatureSettings;
        }),
      )
      .toContain("ss01");

    await page.locator("#ctrl-ligatures").uncheck();
    await expect(page.locator("html")).toHaveAttribute("data-ligatures", "0");
    await expect
      .poll(() =>
        sidebarSample.evaluate((element) => {
          return getComputedStyle(element).fontFeatureSettings;
        }),
      )
      .toBe("normal");
  });

  test("navigating from browse to a font page keeps content (no blank route swap)", async ({
    page,
  }) => {
    await page.goto("browse");
    await page
      .locator('tr[data-search*="jetbrains"] a[title="Open font page"]')
      .click();
    await expect(page).toHaveURL(/\/JetBrainsMono$/);
    await expect(page.locator(".code-specimen .shiki").first()).toBeVisible();
  });

  test("a font cannot be compared with itself (no self-pair route)", async ({
    page,
  }) => {
    const response = await page.goto("FiraCode/FiraCode");
    expect(response?.status()).toBe(404);
  });

  test("a font page hides the Compare action on its own row", async ({
    page,
  }) => {
    await page.goto("FiraCode");
    const ownRow = page.locator('tr[data-search="fira code fira code"]');
    await expect(ownRow.getByRole("link", { name: "Compare" })).toHaveCount(0);
    // A different font still offers Compare.
    await expect(
      page
        .locator('tr[data-search="jetbrains mono jetbrains mono"]')
        .getByRole("link", { name: "Compare" }),
    ).toHaveCount(1);
  });
});
