import { fetchText } from "../lib/http.mjs";
import { classifyAsset } from "../lib/classify.mjs";
import { makeToken, uniqueById } from "../lib/normalize.mjs";

const CONTRACTS_URL = "https://docs.robinhood.com/chain/contracts";
const TOKEN_CONTRACTS_URL = "https://docs.robinhood.com/chain/stock-tokens/token-contracts/";
const ASSET_REGISTRY_URL = "https://api.robinhood.com/rhj/assets";

function decodeRouteContent(bundle, path) {
  const pathIndex = bundle.indexOf(`path:"${path}"`);
  if (pathIndex === -1) return undefined;
  const contentIndex = bundle.indexOf("content:\"", pathIndex);
  if (contentIndex === -1) return undefined;

  let cursor = contentIndex + "content:\"".length;
  let encoded = "";
  while (cursor < bundle.length) {
    const char = bundle[cursor];
    const previous = bundle[cursor - 1];
    if (char === "\"" && previous !== "\\") break;
    encoded += char;
    cursor += 1;
  }

  return decodeURIComponent(encoded.replaceAll("\\n", "%0A").replaceAll("\\\"", "\""));
}

function parseTokenTable(markdown, fetchedAt) {
  const tokens = [];
  for (const line of markdown.split("\n")) {
    const match = line.match(/^\|\s*([A-Z0-9.]+)\s*\|\s*\[\*\*`(0x[a-fA-F0-9]{40})`\*\*\]/u);
    if (!match) continue;
    const [, symbol, address] = match;
    tokens.push(makeToken({
      provider: "robinhood",
      symbol,
      name: `${symbol} Robinhood Stock Token`,
      underlyingSymbol: symbol,
      assetType: classifyAsset({ symbol }),
      tokenStandard: "ERC-20",
      chainId: 4663,
      chainName: "Robinhood Chain",
      network: "robinhood-chain",
      address,
      decimals: 18,
      sourceUrl: CONTRACTS_URL,
      sourceType: "official-provider-docs",
      confidence: "official",
      fetchedAt,
    }));
  }
  return tokens;
}

export function parseAssetRegistry(payload, fetchedAt) {
  if (!Array.isArray(payload?.assets)) throw new Error("Robinhood asset registry returned an invalid payload");

  return payload.assets.flatMap((asset) => {
    if (asset.status && asset.status !== "ASSET_STATUS_ACTIVE") return [];
    const symbol = String(asset.tokenSymbol ?? "").trim();
    if (!symbol) return [];

    return (asset.deployments ?? []).flatMap((deployment) => {
      if (deployment.chainId !== 4663 || typeof deployment.contractAddress !== "string") return [];
      return makeToken({
        provider: "robinhood",
        symbol,
        name: asset.tokenName ?? `${symbol} Robinhood Stock Token`,
        underlyingSymbol: symbol,
        assetType: classifyAsset({ name: asset.tokenName, symbol }),
        tokenStandard: "ERC-20",
        chainId: 4663,
        chainName: deployment.networkName ?? "Robinhood Chain",
        network: "robinhood-chain",
        address: deployment.contractAddress,
        decimals: typeof asset.tokenDecimals === "number" ? asset.tokenDecimals : 18,
        sourceUrl: CONTRACTS_URL,
        sourceType: "official-provider-api",
        confidence: "official",
        logoURI: asset.logoUrl,
        fetchedAt,
      });
    });
  });
}

export async function fetchRobinhood() {
  const fetchedAt = new Date().toISOString();
  const html = await fetchText(TOKEN_CONTRACTS_URL);
  const scriptUrl = html.match(/src="([^"]+index-[^"]+\.js)"/u)?.[1];
  if (!scriptUrl) throw new Error("Could not find Robinhood docs JS bundle");

  const bundle = await fetchText(new URL(scriptUrl, TOKEN_CONTRACTS_URL).href);
  const markdown = decodeRouteContent(bundle, "/chain/contracts");
  if (!markdown) throw new Error("Could not find Robinhood contract docs content");
  const registry = JSON.parse(await fetchText(ASSET_REGISTRY_URL, {
    headers: { accept: "application/json" },
  }));

  return {
    provider: "robinhood",
    sourceUrl: CONTRACTS_URL,
    fetchedAt,
    tokens: uniqueById([
      ...parseTokenTable(markdown, fetchedAt),
      ...parseAssetRegistry(registry, fetchedAt),
    ]),
  };
}
