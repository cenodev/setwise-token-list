import { readFile } from "node:fs/promises";
import { validateTokenList } from "./schema.mjs";

const path = process.argv[2];
if (!path) {
  console.error("Usage: node src/validate.mjs <token-list.json>");
  process.exit(1);
}

const tokenList = JSON.parse(await readFile(path, "utf8"));
const errors = validateTokenList(tokenList);

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${tokenList.tokens.length} tokens from ${tokenList.providers.length} providers.`);

