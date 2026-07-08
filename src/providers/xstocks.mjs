import { fetchText } from "../lib/http.mjs";
import { classifyAsset } from "../lib/classify.mjs";
import { makeToken, uniqueById } from "../lib/normalize.mjs";

const PRODUCTS_URL = "https://xstocks.fi/products";

function extractNextData(html) {
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/u);
  if (!match) throw new Error("Could not find xStocks __NEXT_DATA__ payload");
  return JSON.parse(match[1]);
}

function collectProducts(value, products = []) {
  if (!value || typeof value !== "object") return products;
  if (
    typeof value.symbol === "string"
    && value.symbol.endsWith("x")
    && value.addresses
    && typeof value.addresses === "object"
  ) {
    products.push(value);
  }
  for (const child of Object.values(value)) collectProducts(child, products);
  return products;
}

function chainIdForNetwork(network) {
  return {
    ethereum: 1,
    solana: 101,
    ton: -239,
    ink: 57073,
    bsc: 56,
    mantle: 5000,
    xLayer: 196,
  }[network];
}

function tokenStandardForNetwork(network) {
  if (network === "solana") return "SPL";
  if (network === "ton") return "JETTON";
  return "ERC-20";
}

export async function fetchXStocks() {
  const fetchedAt = new Date().toISOString();
  const html = await fetchText(PRODUCTS_URL);
  const data = extractNextData(html);
  const products = collectProducts(data);
  const tokens = products.flatMap((product) => Object.entries(product.addresses).flatMap(([network, address]) => {
    const chainId = chainIdForNetwork(network);
    if (typeof chainId !== "number" || typeof address !== "string" || address.length === 0) return [];
    return makeToken({
      provider: "xstocks",
      symbol: product.symbol,
      name: product.name,
      underlyingSymbol: product.symbol.replace(/x$/u, ""),
      assetType: classifyAsset(product),
      tokenStandard: tokenStandardForNetwork(network),
      chainId,
      network,
      address,
      decimals: network === "solana" ? 8 : 18,
      sourceUrl: PRODUCTS_URL,
      sourceType: "official-provider-page",
      confidence: "official",
      fetchedAt,
    });
  }));

  return {
    provider: "xstocks",
    sourceUrl: PRODUCTS_URL,
    fetchedAt,
    tokens: uniqueById(tokens),
  };
}
