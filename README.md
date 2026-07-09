# Setwise Token List

Canonical token metadata for tokenized equities, ETFs, commodities, currencies, and crypto assets.

The goal of this repo is deliberately boring and very useful: never trust a token symbol by itself.
Every record is keyed by provider, chain, and contract address, with source URLs and confidence
metadata so Setwise services can distinguish canonical assets from lookalike tokens.

## Providers

Initial provider adapters:

- `ondo` — fetched from Ondo app sitemap and asset pages.
- `xstocks` — fetched from the official xStocks products page.
- `robinhood` — fetched from Robinhood Chain token-contract docs.
- `bstocks` — fetched from available bStock listing data; currently lower confidence until a
  first-party Binance/issuer token registry is added.
- `tether` — includes Tether Gold `XAUT` and official XAUt0 deployment data.
- `paxos` — includes Pax Gold `PAXG`.

## Usage

```sh
npm test
npm run fetch
npm run validate
```

By default, the Ondo adapter fetches the initial Setwise candidate set:

```text
SPYon, QQQon, NVDAon, TSLAon, AAPLon, MSFTon, AMZNon, GOOGLon
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

`assetType` is normalized to one of:

- `equity`
- `etf`
- `commodity`
- `currency`
- `crypto`

## Confidence levels

- `official` — fetched from a first-party provider/issuer page or docs.
- `third-party-listing` — fetched from a listing venue or other non-issuer source.
- `manual-review` — present but not considered canonical until reviewed.
