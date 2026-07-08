import { fetchText } from "../lib/http.mjs";
import { makeToken, uniqueById } from "../lib/normalize.mjs";

const OURBIT_LISTING_URL = "https://www.ourbit.com/support/articles/17827791513065";

const UNDERLYINGS = new Map([
  ["TSLAB", "TSLA"],
  ["MUB", "MU"],
  ["CRCLB", "CRCL"],
  ["NVDAB", "NVDA"],
  ["SNDKB", "SNDK"],
]);

export async function fetchBStocks() {
  const fetchedAt = new Date().toISOString();
  const html = await fetchText(OURBIT_LISTING_URL);
  const text = html.replace(/<[^>]*>/gmu, " ").replace(/\s+/gmu, " ");
  const tokens = [];

  for (const [symbol, underlyingSymbol] of UNDERLYINGS) {
    const match = text.match(new RegExp(`${symbol}:\\s*https://bscscan\\.com/token/(0x[a-fA-F0-9]{40})`, "u"));
    if (!match) continue;
    tokens.push(makeToken({
      provider: "bstocks",
      symbol,
      name: `${underlyingSymbol} Binance bStock`,
      underlyingSymbol,
      assetType: "equity",
      tokenStandard: "BEP-20",
      chainId: 56,
      network: "bsc",
      address: match[1],
      decimals: 18,
      sourceUrl: OURBIT_LISTING_URL,
      sourceType: "third-party-listing-announcement",
      confidence: "third-party-listing",
      fetchedAt,
    }));
  }

  return {
    provider: "bstocks",
    sourceUrl: OURBIT_LISTING_URL,
    fetchedAt,
    tokens: uniqueById(tokens),
  };
}

