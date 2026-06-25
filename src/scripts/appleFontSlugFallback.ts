import {
  appleOnlyFontsAvailable,
  setAppleFontOverride,
} from "../lib/codingFonts";
import { getAppleFontSafePathname } from "../lib/routes";

declare global {
  interface Window {
    codingFontTournament?: {
      setAppleFontOverride: (enabled: boolean | null) => void;
    };
  }
}

function registerAppleFontOverride() {
  window.codingFontTournament ??= {};
  // Hidden debug override: run `window.codingFontTournament.setAppleFontOverride(true)`
  // in DevTools to force-enable Apple-only fonts on non-Apple devices. Use `false`
  // to force-hide them, and `null` to clear the override and return to platform
  // detection (macOS will still show apple: true after clearing).
  window.codingFontTournament.setAppleFontOverride = (enabled) => {
    setAppleFontOverride(enabled);
    window.location.reload();
  };
}

function removeUnavailableAppleFontRows() {
  if (appleOnlyFontsAvailable()) return;

  for (const row of document.querySelectorAll<HTMLElement>(
    'tr[data-requires-apple-device="1"]',
  )) {
    row.remove();
  }
}

export function initAppleFontSlugFallback() {
  registerAppleFontOverride();
  removeUnavailableAppleFontRows();

  const safePathname = getAppleFontSafePathname(
    window.location.pathname,
    import.meta.env.BASE_URL,
    appleOnlyFontsAvailable(),
  );

  if (!safePathname) return;

  window.location.replace(
    `${safePathname}${window.location.search}${window.location.hash}`,
  );
}
