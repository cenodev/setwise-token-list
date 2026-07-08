import test from "node:test";
import assert from "node:assert/strict";
import { validateTokenList } from "../src/schema.mjs";

test("validator accepts a minimal token list", () => {
  const tokenList = {
    providers: [{ provider: "demo", sourceUrl: "https://example.com", fetchedAt: new Date().toISOString(), tokenCount: 1 }],
    tokens: [{
      id: "demo:1:0x0000000000000000000000000000000000000001",
      provider: "demo",
      symbol: "DEMO",
      chainId: 1,
      address: "0x0000000000000000000000000000000000000001",
      decimals: 18,
      sourceUrl: "https://example.com",
      confidence: "official",
    }],
  };

  assert.deepEqual(validateTokenList(tokenList), []);
});

test("validator rejects duplicate ids", () => {
  const token = {
    id: "demo:1:0x0000000000000000000000000000000000000001",
    provider: "demo",
    symbol: "DEMO",
    chainId: 1,
    address: "0x0000000000000000000000000000000000000001",
    decimals: 18,
    sourceUrl: "https://example.com",
    confidence: "official",
  };

  const errors = validateTokenList({ providers: [], tokens: [token, token] });
  assert(errors.some((error) => error.includes("duplicates")));
});

