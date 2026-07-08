import { fetchText } from "../lib/http.mjs";
import { makeToken, uniqueById } from "../lib/normalize.mjs";

const CONTRACTS_URL = "https://docs.robinhood.com/chain/contracts";
const TOKEN_CONTRACTS_URL = "https://docs.robinhood.com/chain/stock-tokens/token-contracts/";

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
      assetType: "equity",
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

export async function fetchRobinhood() {
  const fetchedAt = new Date().toISOString();
  const html = await fetchText(TOKEN_CONTRACTS_URL);
  const scriptUrl = html.match(/src="([^"]+index-[^"]+\.js)"/u)?.[1];
  if (!scriptUrl) throw new Error("Could not find Robinhood docs JS bundle");

  const bundle = await fetchText(new URL(scriptUrl, TOKEN_CONTRACTS_URL).href);
  const markdown = decodeRouteContent(bundle, "/chain/contracts");
  if (!markdown) throw new Error("Could not find Robinhood contract docs content");

  return {
    provider: "robinhood",
    sourceUrl: CONTRACTS_URL,
    fetchedAt,
    tokens: uniqueById(parseTokenTable(markdown, fetchedAt)),
  };
}
