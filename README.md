# Setwise Token List

Canonical token metadata for tokenized stocks.

The goal of this repo is deliberately boring and very useful: never trust a token symbol by itself.
Every record is keyed by provider, chain, and contract address, with source URLs and confidence
metadata so Setwise services can distinguish canonical assets from lookalike tokens.

## Providers

Initial provider adapters:

- `coinbase` — all Coinbase B20 stocks in Base's official integration registry.
- `ondo` — fetched from Ondo app sitemap and asset pages.
- `xstocks` — fetched from the official xStocks products page.
- `robinhood` — fetched from Robinhood Chain token-contract docs and the official on-chain asset
  registry that powers its live stock-token table.
- `bstocks` — fetched from available bStock listing data; currently lower confidence until a
  first-party Binance/issuer token registry is added.
- `rwa-xyz` — imports stock metadata, descriptions, and logos from the public RWA.xyz stock
  catalog and fills gaps left by issuer-specific adapters. Existing first-party records take
  precedence when a chain/address is listed by both sources.
- `setwise-testnet` — deployed mock stocks on BNB Smart Chain Testnet.

## Usage

```sh
npm test
npm run fetch
npm run validate
```

By default, the Ondo adapter fetches the initial Setwise candidate set:

```text
NVDAon, TSLAon, AAPLon, MSFTon, AMZNon, GOOGLon
```

To crawl the full Ondo app sitemap:

```sh
npm run fetch:ondo:full
```

Generated output:

- `data/token-list.json`

Each token record contains:

- `provider`
- `symbol`
- `underlyingSymbol`
- `chainId`
- `chainName`
- `address`
- `decimals`
- `sourceUrl`
- `sourceType`
- `confidence`
- `fetchedAt`

Where available, records also contain `description`, `logoURI`, and `underlyingLogoURI`.
`underlyingLogoURI` points to a ticker-named WebP file in this repository's `assets` directory.
Run `npm run logos:apply` after adding or removing assets to synchronize the generated token list.

RWA.xyz records are marked as
third-party listings; their asset logo falls back to the protocol, platform, issuer, or manager
logo when a dedicated token image is unavailable. An official record may also inherit missing
description or logo metadata when RWA.xyz catalogs the exact same chain/address deployment.

Mock testnet records also include `logoURI`, pointing to the underlying company's logo.

The stock-only catalog requires every record to use `assetType: "equity"`. The archived
`archive/multi-asset-v0` branch preserves the broader RWA catalog.

## Confidence levels

- `official` — fetched from a first-party provider/issuer page or docs.
- `third-party-listing` — fetched from a listing venue or other non-issuer source.
- `manual-review` — present but not considered canonical until reviewed.
