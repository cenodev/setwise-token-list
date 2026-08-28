import test from "node:test";
import assert from "node:assert/strict";
import { classifyAsset } from "../src/lib/classify.mjs";
import { validateTokenList } from "../src/schema.mjs";
import { fetchCoinbase } from "../src/providers/coinbase.mjs";
import { fetchSetwiseTestnet } from "../src/providers/setwise-testnet.mjs";
import { parseRwaXyzPage, RWA_XYZ_CATALOGS } from "../src/providers/rwa-xyz.mjs";
import { parseAssetRegistry } from "../src/providers/robinhood.mjs";

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

test("validator rejects non-stock assets", () => {
  const token = {
    id: "demo:1:0x0000000000000000000000000000000000000001",
    provider: "demo",
    symbol: "DEMO",
    assetType: "etf",
    chainId: 1,
    address: "0x0000000000000000000000000000000000000001",
    decimals: 18,
    sourceUrl: "https://example.com",
    confidence: "official",
  };

  assert(validateTokenList({ providers: [], tokens: [token] }).some((error) => error.includes("must be equity")));
});

test("Coinbase provider exposes every B20 stock in the Base integration registry", async () => {
  const { sourceUrl, tokens } = await fetchCoinbase();

  assert.equal(sourceUrl, "https://docs.base.org/base-chain/specs/reference/b20/tokenized-stocks-on-base");
  assert.deepEqual(tokens.map(({ symbol }) => symbol), [
    "AAPLc", "AMZNc", "COINc", "CRCLc", "GOOGLc", "INTCc", "METAc",
    "MSFTc", "MSTRc", "NVDAc", "SNDKc", "SPCXc", "TSLAc",
  ]);
  assert(tokens.every((token) => (
    token.provider === "coinbase"
    && token.assetType === "equity"
    && token.tokenStandard === "B20"
    && token.chainId === 8453
    && token.network === "base"
    && token.decimals === 8
    && token.confidence === "official"
    && token.sourceType === "official-provider-docs"
  )));
});

test("classifier identifies ETFs and commodity products", () => {
  assert.equal(classifyAsset({ symbol: "SPYx", name: "SP500 xStock" }), "etf");
  assert.equal(classifyAsset({ symbol: "QQQon", name: "Invesco QQQ" }), "etf");
  assert.equal(classifyAsset({ symbol: "GLDx", name: "Gold xStock" }), "commodity");
  assert.equal(classifyAsset({ symbol: "SLV", name: "iShares Silver Trust" }), "commodity");
  assert.equal(classifyAsset({ symbol: "XAUT", name: "Tether Gold" }), "commodity");
  assert.equal(classifyAsset({ symbol: "XAUT0", name: "Tether Gold XAUt0" }), "commodity");
  assert.equal(classifyAsset({ symbol: "PAXG", name: "Pax Gold" }), "commodity");
  assert.equal(classifyAsset({ symbol: "GDXx", name: "VanEck Gold Miners xStock" }), "etf");
  assert.equal(classifyAsset({ symbol: "NVDAon", name: "NVIDIA Corporation Common Stock" }), "equity");
});

test("Setwise BSC Testnet provider exposes the stock-only mock-token basket", async () => {
  const { tokens } = await fetchSetwiseTestnet();

  assert.equal(tokens.length, 7);
  assert.deepEqual(tokens.map(({ symbol }) => symbol), [
    "mbSPCX", "mbSNDK", "mbPLTR", "mbQCOM", "mbGOOGL", "mbMU", "mbNVDA",
  ]);
  assert(tokens.every(({ chainId, network, logoURI }) => chainId === 97 && network === "bsc-testnet" && logoURI));
  assert(tokens.every(({ assetType }) => assetType === "equity"));
});

test("RWA.xyz provider only catalogs stocks", () => {
  assert.deepEqual(RWA_XYZ_CATALOGS, [{ path: "stocks", assetType: "equity" }]);
});

test("RWA.xyz parser retains metadata and skips unsupported networks", () => {
  const payload = {
    props: {
      pageProps: {
        listQueryResponse: {
          results: [{
            ticker: "USYC",
            name: "Circle USYC",
            description: "Short-duration U.S. Treasury exposure.",
            icon_url: "https://img.rwa.xyz/usyc.png",
            tokens: [
              {
                network_name: "Ethereum",
                address: "0x136471a34f6ef19fe571effc1ca711fdb8e49f2b",
                decimals: 6,
                standards: ["ERC-20"],
                hidden: false,
              },
              {
                network_name: "Stellar",
                address: "USYC-GISSUER",
                decimals: 7,
                hidden: false,
              },
            ],
          }],
        },
      },
    },
  };
  const html = `<script id="__NEXT_DATA__" type="application/json">${JSON.stringify(payload)}</script>`;
  const tokens = parseRwaXyzPage(html, {
    assetType: "treasury",
    path: "treasuries",
    fetchedAt: "2026-08-19T00:00:00.000Z",
  });

  assert.equal(tokens.length, 1);
  assert.deepEqual(tokens[0], {
    id: "rwa-xyz:1:0x136471a34f6ef19fe571effc1ca711fdb8e49f2b",
    provider: "rwa-xyz",
    symbol: "USYC",
    name: "Circle USYC",
    underlyingSymbol: "USYC",
    assetType: "treasury",
    tokenStandard: "ERC-20",
    chainId: 1,
    chainName: "Ethereum",
    network: "ethereum",
    address: "0x136471a34f6ef19fe571effc1ca711fdb8e49f2b",
    decimals: 6,
    sourceUrl: "https://app.rwa.xyz/treasuries",
    sourceType: "third-party-analytics-catalog",
    confidence: "third-party-listing",
    description: "Short-duration U.S. Treasury exposure.",
    logoURI: "https://img.rwa.xyz/usyc.png",
    fetchedAt: "2026-08-19T00:00:00.000Z",
  });
});

test("Robinhood registry parser imports current active stock tokens with logos", () => {
  const tokens = parseAssetRegistry({
    assets: [
      {
        tokenSymbol: "CRM",
        tokenName: "Salesforce • Robinhood Token",
        deployments: [{
          contractAddress: "0xd95B44124e475743a7589e68F3D74008A5536D44",
          chainId: 4663,
          networkName: "Robinhood Chain",
        }],
        logoUrl: "https://cdn.robinhood.com/ncw_assets/logos/crm.png",
        status: "ASSET_STATUS_ACTIVE",
        tokenDecimals: 18,
      },
      {
        tokenSymbol: "OLD",
        deployments: [{ contractAddress: "0x0000000000000000000000000000000000000001", chainId: 4663 }],
        status: "ASSET_STATUS_INACTIVE",
      },
    ],
  }, "2026-08-19T00:00:00.000Z");

  assert.equal(tokens.length, 1);
  assert.equal(tokens[0].symbol, "CRM");
  assert.equal(tokens[0].address, "0xd95b44124e475743a7589e68f3d74008a5536d44");
  assert.equal(tokens[0].logoURI, "https://cdn.robinhood.com/ncw_assets/logos/crm.png");
  assert.equal(tokens[0].sourceType, "official-provider-api");
});
