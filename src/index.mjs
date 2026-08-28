import { mkdir, writeFile } from "node:fs/promises";
import { fetchBStocks } from "./providers/bstocks.mjs";
import { fetchCoinbase } from "./providers/coinbase.mjs";
import { fetchOndo, fetchOndoSeedAssets } from "./providers/ondo.mjs";
import { fetchRobinhood } from "./providers/robinhood.mjs";
import { fetchRwaXyz } from "./providers/rwa-xyz.mjs";
import { fetchSetwiseTestnet } from "./providers/setwise-testnet.mjs";
import { fetchXStocks } from "./providers/xstocks.mjs";
import { validateTokenList } from "./schema.mjs";
import { deploymentKey } from "./lib/normalize.mjs";

async function main() {
  const fetchOndoProvider = process.env.ONDO_FULL === "1" ? fetchOndo : fetchOndoSeedAssets;
  const providers = await Promise.all([
    fetchCoinbase(),
    fetchOndoProvider(),
    fetchXStocks(),
    fetchRobinhood(),
    fetchSetwiseTestnet(),
    fetchBStocks(),
    fetchRwaXyz(),
  ]);

  // Providers are ordered by authority. Keep the first record when a
  // third-party catalog repeats an issuer-verified chain/address deployment.
  const seenDeployments = new Set();
  const canonicalDeployments = new Map();
  const deduplicatedTokens = providers.flatMap((result) => result.tokens
    .filter((token) => token.assetType === "equity")
    .filter((token) => {
      const key = deploymentKey(token);
      if (seenDeployments.has(key)) {
        const canonical = canonicalDeployments.get(key);
        if (canonical && token.sourceType === "third-party-analytics-catalog") {
          if (!canonical.description && token.description) canonical.description = token.description;
          if (!canonical.logoURI && token.logoURI) canonical.logoURI = token.logoURI;
        }
        return false;
      }
      seenDeployments.add(key);
      canonicalDeployments.set(key, token);
      return true;
    }));

  // Scraped catalogs attribute tokens to their issuing protocol, so group the
  // final provider metadata by token provider rather than scrape source.
  const providerSources = new Map(providers.map((result) => [
    result.provider,
    { sourceUrl: result.sourceUrl, fetchedAt: result.fetchedAt },
  ]));
  const scrapedSource = providerSources.get("rwa-xyz");
  const providerOrder = providers.map((result) => result.provider);
  const tokensByProvider = new Map();
  for (const token of deduplicatedTokens) {
    tokensByProvider.set(token.provider, [...(tokensByProvider.get(token.provider) ?? []), token]);
  }
  const providerMetadata = [...tokensByProvider.entries()]
    .sort(([a], [b]) => {
      const rank = (provider) => {
        const index = providerOrder.indexOf(provider);
        return index === -1 ? providerOrder.length : index;
      };
      return rank(a) - rank(b) || a.localeCompare(b);
    })
    .map(([provider, tokens]) => ({
      provider,
      ...(providerSources.get(provider) ?? scrapedSource),
      tokenCount: tokens.length,
    }));

  const generatedAt = new Date().toISOString();
  const tokenList = {
    name: "Setwise Token List",
    version: "0.1.0",
    generatedAt,
    providers: providerMetadata,
    tokens: deduplicatedTokens
      .sort((a, b) => `${a.provider}:${a.symbol}:${a.chainId}`.localeCompare(`${b.provider}:${b.symbol}:${b.chainId}`)),
  };

  const errors = validateTokenList(tokenList);
  if (errors.length > 0) {
    throw new Error(`Generated token list is invalid:\n${errors.join("\n")}`);
  }

  await mkdir("data", { recursive: true });
  await writeFile("data/token-list.json", `${JSON.stringify(tokenList, null, 2)}\n`, "utf8");
  console.log(`Wrote ${tokenList.tokens.length} tokens to data/token-list.json`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
