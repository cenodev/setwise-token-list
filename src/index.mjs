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
  const deduplicatedProviders = providers.map((result) => ({
    ...result,
    tokens: result.tokens.filter((token) => token.assetType === "equity").filter((token) => {
      const key = deploymentKey(token);
      if (seenDeployments.has(key)) {
        const canonical = canonicalDeployments.get(key);
        if (canonical && token.provider === "rwa-xyz") {
          if (!canonical.description && token.description) canonical.description = token.description;
          if (!canonical.logoURI && token.logoURI) canonical.logoURI = token.logoURI;
        }
        return false;
      }
      seenDeployments.add(key);
      canonicalDeployments.set(key, token);
      return true;
    }),
  }));

  const generatedAt = new Date().toISOString();
  const tokenList = {
    name: "Setwise Token List",
    version: "0.1.0",
    generatedAt,
    providers: deduplicatedProviders.map(({ provider, sourceUrl, fetchedAt, tokens }) => ({
      provider,
      sourceUrl,
      fetchedAt,
      tokenCount: tokens.length,
    })),
    tokens: deduplicatedProviders.flatMap(({ tokens }) => tokens)
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
