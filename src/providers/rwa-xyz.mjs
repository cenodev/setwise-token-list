import { fetchText } from "../lib/http.mjs";
import { makeToken, uniqueById } from "../lib/normalize.mjs";

const RWA_XYZ_BASE_URL = "https://app.rwa.xyz";

export const RWA_XYZ_CATALOGS = [
  { path: "stocks", assetType: "equity" },
];

const NETWORKS = new Map([
  ["Ethereum", { chainId: 1, network: "ethereum" }],
  ["Optimism", { chainId: 10, network: "optimism" }],
  ["XDC", { chainId: 50, network: "xdc" }],
  ["BNB Chain", { chainId: 56, network: "bsc" }],
  ["Gnosis", { chainId: 100, network: "gnosis" }],
  ["Solana", { chainId: 101, network: "solana" }],
  ["Polygon", { chainId: 137, network: "polygon" }],
  ["Monad", { chainId: 143, network: "monad" }],
  ["ZKsync Era", { chainId: 324, network: "zksync" }],
  ["HyperEVM", { chainId: 999, network: "hyperevm" }],
  ["SEI", { chainId: 1329, network: "sei" }],
  ["Tempo", { chainId: 4217, network: "tempo" }],
  ["Robinhood", { chainId: 4663, network: "robinhood" }],
  ["Mantle", { chainId: 5000, network: "mantle" }],
  ["MANTRA", { chainId: 5888, network: "mantra" }],
  ["Base", { chainId: 8453, network: "base" }],
  ["Plasma", { chainId: 9745, network: "plasma" }],
  ["Arbitrum", { chainId: 42161, network: "arbitrum" }],
  ["Celo", { chainId: 42220, network: "celo" }],
  ["Avalanche C-Chain", { chainId: 43114, network: "avalanche" }],
  ["Ink", { chainId: 57073, network: "ink" }],
  ["Plume", { chainId: 98866, network: "plume" }],
  ["Pharos", { chainId: 688688, network: "pharos" }],
]);

function extractNextData(html) {
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/u);
  if (!match) throw new Error("Could not find RWA.xyz __NEXT_DATA__ payload");
  return JSON.parse(match[1]);
}

function preferredLogo(asset, token) {
  const logo = asset.icon_url
    ?? token.protocol?.icon_url
    ?? token.platform?.icon_url
    ?? asset.issuer?.icon_url
    ?? asset.manager?.icon_url;
  return logo?.replace(/%(?![0-9a-f]{2})/giu, "%25");
}

function tokenStandard(token, network) {
  if (network === "solana") return "SPL";
  return token.standards?.[0] ?? "ERC-20";
}

export function parseRwaXyzPage(html, { assetType, path, fetchedAt }) {
  const data = extractNextData(html);
  const assets = data.props?.pageProps?.listQueryResponse?.results;
  if (!Array.isArray(assets)) throw new Error(`RWA.xyz ${path} page did not contain an asset catalog`);

  const sourceUrl = `${RWA_XYZ_BASE_URL}/${path}`;
  return assets.flatMap((asset) => (asset.tokens ?? []).flatMap((token) => {
    const network = NETWORKS.get(token.network_name);
    if (!network || typeof token.address !== "string" || token.address.length === 0) return [];
    if (token.hidden || typeof token.decimals !== "number") return [];

    const symbol = String(asset.ticker ?? "").trim();
    if (!symbol) return [];

    return makeToken({
      provider: "rwa-xyz",
      symbol,
      name: asset.name ?? token.name ?? symbol,
      underlyingSymbol: symbol,
      assetType,
      tokenStandard: tokenStandard(token, network.network),
      chainId: network.chainId,
      network: network.network,
      address: token.address,
      decimals: token.decimals,
      description: asset.description || undefined,
      logoURI: preferredLogo(asset, token),
      sourceUrl,
      sourceType: "third-party-analytics-catalog",
      confidence: "third-party-listing",
      fetchedAt,
    });
  }));
}

export async function fetchRwaXyz() {
  const fetchedAt = new Date().toISOString();
  const tokens = [];

  for (const catalog of RWA_XYZ_CATALOGS) {
    const html = await fetchText(`${RWA_XYZ_BASE_URL}/${catalog.path}`);
    tokens.push(...parseRwaXyzPage(html, { ...catalog, fetchedAt }));
  }

  return {
    provider: "rwa-xyz",
    sourceUrl: RWA_XYZ_BASE_URL,
    fetchedAt,
    tokens: uniqueById(tokens),
  };
}
