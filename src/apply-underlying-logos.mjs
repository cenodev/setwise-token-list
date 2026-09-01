import { readFile, writeFile } from "node:fs/promises";
import { addUnderlyingLogoURIs, loadUnderlyingLogoSymbols } from "./lib/underlying-logos.mjs";
import { validateTokenList } from "./schema.mjs";

const TOKEN_LIST_PATH = new URL("../data/token-list.json", import.meta.url);

async function main() {
  const tokenList = JSON.parse(await readFile(TOKEN_LIST_PATH, "utf8"));
  const symbols = await loadUnderlyingLogoSymbols();
  const tokens = addUnderlyingLogoURIs(tokenList.tokens, symbols);
  const updatedTokenList = { ...tokenList, tokens };
  const errors = validateTokenList(updatedTokenList);

  if (errors.length > 0) {
    throw new Error(`Updated token list is invalid:\n${errors.join("\n")}`);
  }

  await writeFile(TOKEN_LIST_PATH, `${JSON.stringify(updatedTokenList, null, 2)}\n`, "utf8");
  const matchedTokens = tokens.filter(({ underlyingLogoURI }) => underlyingLogoURI).length;
  const matchedSymbols = new Set(tokens
    .filter(({ underlyingLogoURI }) => underlyingLogoURI)
    .map(({ underlyingSymbol }) => underlyingSymbol));
  const unusedSymbols = [...symbols].filter((symbol) => !matchedSymbols.has(symbol)).sort();

  console.log(`Applied ${matchedSymbols.size} underlying logo assets to ${matchedTokens} token records`);
  if (unusedSymbols.length > 0) console.warn(`Unused assets: ${unusedSymbols.join(", ")}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
