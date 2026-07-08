import test from "node:test";
import assert from "node:assert/strict";
import { classifyAsset } from "../src/lib/classify.mjs";
import { validateTokenList } from "../src/schema.mjs";

test("validator accepts a minimal token list", () => {
  const tokenList = {
    providers: [{ provider: "demo", sourceUrl: "https://example.com", fetchedAt: new Date().toISOString(), tokenCount: 1 }],
    tokens: [{
      id: "demo:1:0x0000000000000000000000000000000000000001",
      provider: "demo",
      symbol: "DEMO",
      assetType: "equity",
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
    assetType: "equity",
    chainId: 1,
    address: "0x0000000000000000000000000000000000000001",
    decimals: 18,
    sourceUrl: "https://example.com",
    confidence: "official",
  };

  const errors = validateTokenList({ providers: [], tokens: [token, token] });
  assert(errors.some((error) => error.includes("duplicates")));
});

test("classifier identifies ETFs and commodity products", () => {
  assert.equal(classifyAsset({ symbol: "SPYx", name: "SP500 xStock" }), "etf");
  assert.equal(classifyAsset({ symbol: "QQQon", name: "Invesco QQQ" }), "etf");
  assert.equal(classifyAsset({ symbol: "GLDx", name: "Gold xStock" }), "commodity");
  assert.equal(classifyAsset({ symbol: "SLV", name: "iShares Silver Trust" }), "commodity");
  assert.equal(classifyAsset({ symbol: "GDXx", name: "VanEck Gold Miners xStock" }), "etf");
  assert.equal(classifyAsset({ symbol: "NVDAon", name: "NVIDIA Corporation Common Stock" }), "equity");
});
