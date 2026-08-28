import { makeToken } from "../lib/normalize.mjs";

const STOCKS_URL = "https://docs.base.org/base-chain/specs/reference/b20/tokenized-stocks-on-base";

// Base publishes this canonical integration registry for Coinbase B20 stocks.
// Addresses must match the registry because B20 symbols are mutable and are
// not unique security identifiers.
const STOCKS = [
  {
    symbol: "AAPLc",
    name: "Apple Inc.",
    underlyingSymbol: "AAPL",
    address: "0xb200000000000000000000C2e324d24d7eEcd1fb",
  },
  {
    symbol: "AMZNc",
    name: "Amazon.com Inc.",
    underlyingSymbol: "AMZN",
    address: "0xb200000000000000000000d9192b6B456483C2E8",
  },
  {
    symbol: "COINc",
    name: "Coinbase Global Inc.",
    underlyingSymbol: "COIN",
    address: "0xb200000000000000000000c85a31389D71F3ecfb",
  },
  {
    symbol: "CRCLc",
    name: "Circle Internet Group Inc.",
    underlyingSymbol: "CRCL",
    address: "0xB20000000000000000000019f6E7C675b73C2e4D",
  },
  {
    symbol: "GOOGLc",
    name: "Alphabet Inc.",
    underlyingSymbol: "GOOGL",
    address: "0xb2000000000000000000002D0BA3164cc74f58B7",
  },
  {
    symbol: "INTCc",
    name: "Intel Corporation",
    underlyingSymbol: "INTC",
    address: "0xB2000000000000000000004AFF16039bA04bdFBc",
  },
  {
    symbol: "METAc",
    name: "Meta Platforms Inc.",
    underlyingSymbol: "META",
    address: "0xb2000000000000000000008bC8786B856E61707C",
  },
  {
    symbol: "MSFTc",
    name: "Microsoft Corporation",
    underlyingSymbol: "MSFT",
    address: "0xB200000000000000000000Ab99cFa739E253872B",
  },
  {
    symbol: "MSTRc",
    name: "Strategy Inc.",
    underlyingSymbol: "MSTR",
    address: "0xb2000000000000000000004884b426556b92883d",
  },
  {
    symbol: "NVDAc",
    name: "NVIDIA Corporation",
    underlyingSymbol: "NVDA",
    address: "0xb20000000000000000000078ee7ce2fE4908108C",
  },
  {
    symbol: "SNDKc",
    name: "Sandisk Corporation",
    underlyingSymbol: "SNDK",
    address: "0xb200000000000000000000397293Cb8cda9a10c5",
  },
  {
    symbol: "SPCXc",
    name: "Space Exploration Technologies Corp.",
    underlyingSymbol: "SPCX",
    address: "0xb2000000000000000000007b9fcbd005511aCBd5",
  },
  {
    symbol: "TSLAc",
    name: "Tesla Inc.",
    underlyingSymbol: "TSLA",
    address: "0xb2000000000000000000001e800a7f5189430cD0",
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
      sourceType: "official-provider-docs",
      confidence: "official",
      fetchedAt,
      ...stock,
    })),
  };
}
