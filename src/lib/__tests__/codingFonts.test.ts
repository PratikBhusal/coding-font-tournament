import { afterEach, describe, expect, test } from "vitest";
import codingFonts, {
  appleOnlyFontsAvailable,
  getAvailableCodingFonts,
  isAppleDevice,
  readAppleFontOverride,
  setAppleFontOverride,
} from "../codingFonts";

const originalNavigator = Object.getOwnPropertyDescriptor(
  globalThis,
  "navigator",
);
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

function setNavigator(
  platform: string,
  userAgentDataPlatform?: string,
  userAgent = "",
) {
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      platform,
      userAgent,
      ...(userAgentDataPlatform === undefined
        ? {}
        : { userAgentData: { platform: userAgentDataPlatform } }),
    },
  });
}

function setWindowWithAppleFontOverride(value: string | null) {
  const storage = new Map<string, string>();
  if (value !== null) storage.set("appleFontOverride", value);

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        removeItem: (key: string) => storage.delete(key),
        setItem: (key: string, value: string) => storage.set(key, value),
      },
    },
  });
}

afterEach(() => {
  if (originalNavigator) {
    Object.defineProperty(globalThis, "navigator", originalNavigator);
  } else {
    Reflect.deleteProperty(globalThis, "navigator");
  }

  if (originalWindow) {
    Object.defineProperty(globalThis, "window", originalWindow);
  } else {
    Reflect.deleteProperty(globalThis, "window");
  }
});

describe("coding font availability", () => {
  test("includes SF Mono on Apple devices", () => {
    setNavigator("MacIntel");

    expect(isAppleDevice()).toBe(true);
    expect(
      getAvailableCodingFonts().some((font) => font.family === "SF Mono"),
    ).toBe(true);
  });

  test("falls back to navigator.platform when userAgentData platform is empty", () => {
    setNavigator("MacIntel", "");

    expect(isAppleDevice()).toBe(true);
  });

  test("checks navigator.platform when userAgentData platform is unhelpful", () => {
    setNavigator("MacIntel", "Unknown");

    expect(isAppleDevice()).toBe(true);
  });

  test("falls back to userAgent when platform fields are empty", () => {
    setNavigator("", "", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)");

    expect(isAppleDevice()).toBe(true);
  });

  test("excludes SF Mono on non-Apple devices", () => {
    setNavigator("Linux x86_64");

    expect(isAppleDevice()).toBe(false);
    expect(
      getAvailableCodingFonts().some((font) => font.family === "SF Mono"),
    ).toBe(false);
  });

  test("keeps unrestricted fonts on non-Apple devices", () => {
    setNavigator("Win32");

    const availableFamilies = new Set(
      getAvailableCodingFonts().map((font) => font.family),
    );

    expect(availableFamilies.has("SF Mono")).toBe(false);
    expect(availableFamilies.has("Fira Code")).toBe(true);
    expect(availableFamilies.size).toBe(codingFonts.length - 1);
  });

  test("force-enabled override makes Apple-only fonts available on non-Apple devices", () => {
    setNavigator("Linux x86_64");
    setWindowWithAppleFontOverride("enabled");

    expect(readAppleFontOverride()).toBe(true);
    expect(appleOnlyFontsAvailable()).toBe(true);
    expect(
      getAvailableCodingFonts().some((font) => font.family === "SF Mono"),
    ).toBe(true);
  });

  test("force-disabled override hides Apple-only fonts on Apple devices", () => {
    setNavigator("MacIntel");
    setWindowWithAppleFontOverride("disabled");

    expect(readAppleFontOverride()).toBe(false);
    expect(appleOnlyFontsAvailable()).toBe(false);
    expect(
      getAvailableCodingFonts().some((font) => font.family === "SF Mono"),
    ).toBe(false);
  });

  test("missing override falls back to platform detection", () => {
    setNavigator("MacIntel");
    setWindowWithAppleFontOverride(null);

    expect(readAppleFontOverride()).toBe(null);
    expect(appleOnlyFontsAvailable()).toBe(true);
  });

  test("unknown override value falls back to platform detection", () => {
    setNavigator("Linux x86_64");
    setWindowWithAppleFontOverride("maybe");

    expect(readAppleFontOverride()).toBe(null);
    expect(appleOnlyFontsAvailable()).toBe(false);
  });

  test("writes force-enabled override", () => {
    setWindowWithAppleFontOverride(null);

    setAppleFontOverride(true);

    expect(readAppleFontOverride()).toBe(true);
  });

  test("writes force-disabled override", () => {
    setWindowWithAppleFontOverride(null);

    setAppleFontOverride(false);

    expect(readAppleFontOverride()).toBe(false);
  });

  test("clears override", () => {
    setWindowWithAppleFontOverride("disabled");

    setAppleFontOverride(null);

    expect(readAppleFontOverride()).toBe(null);
  });

  test("ignores storage write errors", () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        localStorage: {
          removeItem: () => {
            throw new Error("storage disabled");
          },
          setItem: () => {
            throw new Error("storage disabled");
          },
        },
      },
    });

    expect(() => setAppleFontOverride(true)).not.toThrow();
    expect(() => setAppleFontOverride(null)).not.toThrow();
  });
});
