import { test, expect } from "@playwright/test";

test.describe("tournament mobile (/)", () => {
  test("font pool sidebar is collapsed by default and opens full width", async ({
    page,
  }) => {
    await page.goto("./");
    const sidebar = page.getByTestId("tournament-sidebar");

    await expect(page.locator(".code-specimen .shiki").first()).toBeVisible();
    await expect(sidebar).toHaveCSS("width", "0px");
    await page.locator("#app-menu-toggle").click();
    await expect(sidebar).toHaveCSS("width", `${page.viewportSize()!.width}px`);
  });

  test("native navigation select navigates to Browse", async ({ page }) => {
    await page.goto("./");
    const navSelect = page.locator("#app-nav-select");

    await expect(navSelect).toBeVisible();
    await navSelect.selectOption({ label: "Browse" });
    await expect(page).toHaveURL(/\/browse$/);
  });

  test("choose buttons hide keyboard shortcut hints on mobile and tablet", async ({
    page,
  }) => {
    await page.goto("./");
    await expect(page.locator(".code-specimen .shiki").first()).toBeVisible();

    const leftShortcut = page.locator("button kbd", { hasText: "←" });
    const rightShortcut = page.locator("button kbd", { hasText: "→" });

    async function expectShortcutsHidden() {
      await expect(leftShortcut).toBeHidden();
      await expect(rightShortcut).toBeHidden();
    }

    await expect(leftShortcut).toHaveCount(1);
    await expect(rightShortcut).toHaveCount(1);
    await expectShortcutsHidden();

    await page.setViewportSize({ width: 1024, height: 768 });
    await expectShortcutsHidden();

    await page.getByRole("button", { name: "Unified", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Unified", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expectShortcutsHidden();
  });
});
