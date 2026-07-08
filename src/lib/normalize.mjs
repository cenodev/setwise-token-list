export const CHAIN_NAMES = new Map([
  [1, "Ethereum"],
  [56, "BNB Smart Chain"],
  [101, "Solana"],
  [196, "X Layer"],
  [4663, "Robinhood Chain"],
  [5000, "Mantle"],
  [57073, "Ink"],
  [-239, "TON"],
]);

export function chainName(chainId, fallback) {
  return CHAIN_NAMES.get(chainId) ?? fallback ?? `Chain ${chainId}`;
}

export function normalizeEvmAddress(address) {
  return address.toLowerCase();
}

export function isEvmAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function inferUnderlyingSymbol(symbol) {
  return symbol.replace(/(?:on|x|B)$/u, "");
}

export function tokenId({ provider, chainId, address }) {
  return `${provider}:${chainId}:${address.toLowerCase()}`;
}

export function makeToken(input) {
  const address = isEvmAddress(input.address) ? normalizeEvmAddress(input.address) : input.address;
  return {
    id: tokenId({ ...input, address }),
    provider: input.provider,
    symbol: input.symbol,
    name: input.name,
    underlyingSymbol: input.underlyingSymbol ?? inferUnderlyingSymbol(input.symbol),
    assetType: input.assetType ?? "equity",
    tokenStandard: input.tokenStandard,
    chainId: input.chainId,
    chainName: input.chainName ?? chainName(input.chainId, input.network),
    network: input.network,
    address,
    decimals: input.decimals,
    sourceUrl: input.sourceUrl,
    sourceType: input.sourceType,
    confidence: input.confidence,
    fetchedAt: input.fetchedAt,
  };
}

export function uniqueById(tokens) {
  return [...new Map(tokens.map((token) => [token.id, token])).values()];
}
