import type { CodingFont } from "./codingFonts";

/**
 * Prefix an app-absolute path with the configured `base`. With the default
 * `trailingSlash: 'ignore'`, `import.meta.env.BASE_URL` has no trailing slash, so
 * both sides are normalized to guarantee exactly one separating slash. Use for
 * every internal link/asset URL so the site works under a sub-path (e.g. a GitHub
 * Pages project page).
 */
export function withBase(path = "") {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const relative = path.replace(/^\//, "");
  return relative ? `${base}/${relative}` : `${base}/`;
}

export function getFontSlug(family: string) {
  return encodeURIComponent(family.replace(/\s+/g, ""));
}

export function getFontPath(family: string) {
  return withBase(getFontSlug(family));
}

export function findFontBySlug(fonts: CodingFont[], slug: string) {
  const decodedSlug = decodeURIComponent(slug);
  return fonts.find((font) => font.family.replace(/\s+/g, "") === decodedSlug);
}

export function getAppleFontSafePathname(
  pathname: string,
  basePath: string,
  appleFontsAvailable: boolean,
) {
  if (appleFontsAvailable) return null;

  const base = basePath.replace(/\/$/, "");
  const prefix = base && pathname.startsWith(`${base}/`) ? base : "";
  const path = prefix ? pathname.slice(prefix.length) : pathname;
  let changed = false;
  const safeSegments = path
    .split("/")
    .map((segment) => {
      if (decodeURIComponent(segment) !== getFontSlug("SF Mono")) {
        return segment;
      }

      changed = true;
      return getFontSlug("ui-monospace");
    });

  const fontSegments = safeSegments.filter(Boolean);
  if (
    changed &&
    fontSegments.length === 2 &&
    fontSegments.every((segment) => segment === getFontSlug("ui-monospace"))
  ) {
    return `${prefix}/${getFontSlug("ui-monospace")}`;
  }

  const safePath = safeSegments.join("/");
  return changed ? `${prefix}${safePath}` : null;
}
