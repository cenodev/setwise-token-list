import { fetchText } from "../lib/http.mjs";
import { makeToken, uniqueById } from "../lib/normalize.mjs";

const SITEMAP_URL = "https://app.ondo.finance/sitemap.xml";
const ASSET_URL_PREFIX = "https://app.ondo.finance/assets/";

function assetUrlsFromSitemap(xml) {
  return [...xml.matchAll(/<loc>(https:\/\/app\.ondo\.finance\/assets\/[^<]+)<\/loc>/gmu)]
    .map((match) => match[1])
    .sort();
}

function parseAssetPage(html, sourceUrl, fetchedAt) {
  const symbol = html.match(/\\"symbol\\":\\"([^"]+on)\\"/u)?.[1];
  const ticker = html.match(/\\"ticker\\":\\"([^"]+)\\"/u)?.[1];
  const underlyingName = html.match(/\\"underlyingName\\":\\"([^"]+)\\"/u)?.[1];
  const networksMatch = html.match(/\\"supportedNetworks\\":\[(?<json>.*?)\],\\"description\\"/u);

  if (!symbol || !networksMatch?.groups?.json) return [];

  const supportedNetworks = JSON.parse(`[${networksMatch.groups.json.replaceAll('\\"', '"')}]`);
  return supportedNetworks.map((network) => makeToken({
    provider: "ondo",
    symbol,
    name: underlyingName ? `${underlyingName} Ondo Stock Token` : `${symbol} Ondo Stock Token`,
    underlyingSymbol: ticker,
    assetType: "equity",
    tokenStandard: network.network === "SOLANA" ? "SPL" : "ERC-20",
    chainId: network.chainId,
    network: network.network,
    address: network.address,
    decimals: network.decimals,
    sourceUrl,
    sourceType: "official-provider-page",
    confidence: "official",
    fetchedAt,
  }));
}

export async function fetchOndo({ limit } = {}) {
  const fetchedAt = new Date().toISOString();
  const sitemap = await fetchText(SITEMAP_URL);
  const urls = assetUrlsFromSitemap(sitemap);
  const selectedUrls = typeof limit === "number" ? urls.slice(0, limit) : urls;
  const tokens = [];

  for (const url of selectedUrls) {
    const html = await fetchText(url);
    tokens.push(...parseAssetPage(html, url, fetchedAt));
  }

  return {
    provider: "ondo",
    sourceUrl: SITEMAP_URL,
    fetchedAt,
    tokens: uniqueById(tokens),
  };
}

export async function fetchOndoSeedAssets() {
  const fetchedAt = new Date().toISOString();
  const slugs = ["spyon", "qqqon", "nvdaon", "tslaon", "aaplon", "msfton", "amznon", "googlon"];
  const tokens = [];

  for (const slug of slugs) {
    const url = `${ASSET_URL_PREFIX}${slug}`;
    const html = await fetchText(url);
    tokens.push(...parseAssetPage(html, url, fetchedAt));
  }

  return {
    provider: "ondo",
    sourceUrl: SITEMAP_URL,
    fetchedAt,
    tokens: uniqueById(tokens),
  };
}

