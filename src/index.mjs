import { mkdir, writeFile } from "node:fs/promises";
import { fetchBStocks } from "./providers/bstocks.mjs";
import { fetchOndo, fetchOndoSeedAssets } from "./providers/ondo.mjs";
import { fetchPaxosGold } from "./providers/paxos.mjs";
import { fetchRobinhood } from "./providers/robinhood.mjs";
import { fetchSetwiseTestnet } from "./providers/setwise-testnet.mjs";
import { fetchTetherGold } from "./providers/tether.mjs";
import { fetchXStocks } from "./providers/xstocks.mjs";
import { validateTokenList } from "./schema.mjs";

async function main() {
  const fetchOndoProvider = process.env.ONDO_FULL === "1" ? fetchOndo : fetchOndoSeedAssets;
  const providers = await Promise.all([
    fetchOndoProvider(),
    fetchXStocks(),
    fetchRobinhood(),
    fetchSetwiseTestnet(),
    fetchBStocks(),
    fetchTetherGold(),
    fetchPaxosGold(),
  ]);

  const generatedAt = new Date().toISOString();
  const tokenList = {
    name: "Setwise Token List",
    version: "0.1.0",
    generatedAt,
    providers: providers.map(({ provider, sourceUrl, fetchedAt, tokens }) => ({
      provider,
      sourceUrl,
      fetchedAt,
      tokenCount: tokens.length,
    })),
    tokens: providers.flatMap(({ tokens }) => tokens)
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
