import { describe, expect, test } from "vitest";
import codingFonts from "../codingFonts";
import { getFontFeatures, getFontStyle } from "../fontFeatures";

function fontByFamily(family: string) {
  const font = codingFonts.find((candidate) => candidate.family === family);
  if (!font) throw new Error(`Missing test font: ${family}`);
  return font;
}

describe("font feature helpers", () => {
  test("formats OpenType features for CSS", () => {
    const dejaVu = fontByFamily("DejaVu Sans Mono");

    expect(getFontFeatures(dejaVu, true, true)).toBe('"zero"');
    expect(getFontFeatures(dejaVu, false, true)).toBe("");
    expect(getFontFeatures(dejaVu, true, false)).toBe('"zero"');
  });

  test("formats combined OpenType and ligature features for CSS", () => {
    const monaspaceNeon = fontByFamily("Monaspace Neon");

    expect(getFontFeatures(monaspaceNeon, true, true)).toBe(
      '"cv01" 2, "ss01", "ss02", "ss03", "ss04", "ss05", "ss06"',
    );
    expect(getFontFeatures(monaspaceNeon, false, true)).toBe(
      '"ss01", "ss02", "ss03", "ss04", "ss05", "ss06"',
    );
    expect(getFontFeatures(monaspaceNeon, true, false)).toBe('"cv01" 2');
  });

  test("font style exposes feature variants as CSS variables", () => {
    const dejaVu = fontByFamily("DejaVu Sans Mono");
    const style = getFontStyle(dejaVu);

    expect(style).toContain(
      "font-family: 'DejaVu Sans Mono', ui-monospace, monospace",
    );
    expect(style).toContain('--feat-both: "zero"');
    expect(style).toContain("--feat-lig: normal");
    expect(style).toContain('--feat-ot: "zero"');
    expect(style).toContain('--feat-initial: "zero"');
    expect(style).not.toContain("font-feature-settings");
  });

  test("font style initial features respect disabled OpenType", () => {
    const dejaVu = fontByFamily("DejaVu Sans Mono");

    expect(getFontStyle(dejaVu, false, true)).toContain(
      "--feat-initial: normal",
    );
  });

  test("font style keeps Monaspace Neon ligatures when OpenType is disabled", () => {
    const monaspaceNeon = fontByFamily("Monaspace Neon");
    const style = getFontStyle(monaspaceNeon, false, true);

    expect(style).toContain('--feat-both: "cv01" 2, "ss01"');
    expect(style).toContain('--feat-lig: "ss01", "ss02"');
    expect(style).toContain('--feat-ot: "cv01" 2');
    expect(style).toContain('--feat-initial: "ss01", "ss02"');
    expect(style).not.toContain("font-feature-settings");
  });
});
