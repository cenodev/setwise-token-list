import { readdir } from "node:fs/promises";

export const UNDERLYING_LOGO_BASE_URL = "https://raw.githubusercontent.com/cenodev/setwise-token-list/main/assets";

const LOGO_FILE_PATTERN = /^(.+)\.webp$/u;

export async function loadUnderlyingLogoSymbols(directory = new URL("../../assets/", import.meta.url)) {
  const entries = await readdir(directory, { withFileTypes: true });

  return new Set(entries.flatMap((entry) => {
    if (!entry.isFile()) return [];
    const symbol = entry.name.match(LOGO_FILE_PATTERN)?.[1];
    return symbol ? [symbol] : [];
  }));
}

export function addUnderlyingLogoURIs(tokens, symbols, baseUrl = UNDERLYING_LOGO_BASE_URL) {
  return tokens.map((token) => {
    // Keep generated data in sync when an asset is renamed or removed.
    const { underlyingLogoURI: _staleUnderlyingLogoURI, ...tokenWithoutLogo } = token;
    if (!symbols.has(token.underlyingSymbol)) return tokenWithoutLogo;

    return {
      ...tokenWithoutLogo,
      underlyingLogoURI: `${baseUrl}/${encodeURIComponent(token.underlyingSymbol)}.webp`,
    };
  });
}
