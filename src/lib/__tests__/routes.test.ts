import { describe, expect, test } from "vitest";
import { getAppleFontSafePathname } from "../routes";

describe("route helpers", () => {
  test("leaves Apple-only font slugs unchanged when Apple fonts are available", () => {
    expect(getAppleFontSafePathname("/SFMono", "/", true)).toBe(null);
  });

  test("replaces SFMono detail slugs with ui-monospace when Apple fonts are unavailable", () => {
    expect(getAppleFontSafePathname("/SFMono", "/", false)).toBe(
      "/ui-monospace",
    );
  });

  test("replaces SFMono compare slugs with ui-monospace when Apple fonts are unavailable", () => {
    expect(getAppleFontSafePathname("/FiraCode/SFMono", "/", false)).toBe(
      "/FiraCode/ui-monospace",
    );
    expect(getAppleFontSafePathname("/SFMono/FiraCode", "/", false)).toBe(
      "/ui-monospace/FiraCode",
    );
  });

  test("collapses compare routes that would compare ui-monospace with itself", () => {
    expect(getAppleFontSafePathname("/ui-monospace/SFMono", "/", false)).toBe(
      "/ui-monospace",
    );
    expect(getAppleFontSafePathname("/SFMono/ui-monospace", "/", false)).toBe(
      "/ui-monospace",
    );
  });

  test("preserves the configured base path when replacing SFMono", () => {
    expect(
      getAppleFontSafePathname(
        "/coding-font-tournament/SFMono",
        "/coding-font-tournament/",
        false,
      ),
    ).toBe("/coding-font-tournament/ui-monospace");
  });

  test("preserves the configured base path when collapsing duplicate ui-monospace compare routes", () => {
    expect(
      getAppleFontSafePathname(
        "/coding-font-tournament/ui-monospace/SFMono",
        "/coding-font-tournament/",
        false,
      ),
    ).toBe("/coding-font-tournament/ui-monospace");
  });

  test("does not replace partial slug matches", () => {
    expect(getAppleFontSafePathname("/MySFMonoFont", "/", false)).toBe(null);
  });
});
