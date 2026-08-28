import { makeToken } from "../lib/normalize.mjs";

const STOCKS_URL = "https://www.base.org/stocks";

// Base labels this as the full list of launched Coinbase Tokenized Stocks.
// Addresses must match this first-party registry; B20 symbols are not unique
// security identifiers and additional reserved contracts may exist onchain.
const STOCKS = [
  {
    symbol: "AAPLc",
    name: "Apple Inc.",
    underlyingSymbol: "AAPL",
    address: "0xb200000000000000000000C2e324d24d7eEcd1fb",
  },
  {
    symbol: "GOOGLc",
    name: "Alphabet Inc.",
    underlyingSymbol: "GOOGL",
    address: "0xb2000000000000000000002D0BA3164cc74f58B7",
  },
  {
    symbol: "METAc",
    name: "Meta Platforms Inc.",
    underlyingSymbol: "META",
    address: "0xb2000000000000000000008bC8786B856E61707C",
  },
  {
    symbol: "NVDAc",
    name: "NVIDIA Corporation",
    underlyingSymbol: "NVDA",
    address: "0xb20000000000000000000078ee7ce2fE4908108C",
  },
];

export async function fetchCoinbase() {
  const fetchedAt = new Date().toISOString();
  return {
    provider: "coinbase",
    sourceUrl: STOCKS_URL,
    fetchedAt,
    tokens: STOCKS.map((stock) => makeToken({
      provider: "coinbase",
      assetType: "equity",
      tokenStandard: "B20",
      chainId: 8453,
      network: "base",
      decimals: 8,
      sourceUrl: STOCKS_URL,
      sourceType: "official-provider-page",
      confidence: "official",
      fetchedAt,
      ...stock,
    })),
  };
}
