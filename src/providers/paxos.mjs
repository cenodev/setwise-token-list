import { makeToken } from "../lib/normalize.mjs";

const PAXG_ETHEREUM_ADDRESS = "0x45804880De22913dAFE09f4980848ECE6EcbAf78";
const PAXG_SOURCE_URL = "https://github.com/paxosglobal/paxos-gold-contract";

export async function fetchPaxosGold() {
  const fetchedAt = new Date().toISOString();
  return {
    provider: "paxos",
    sourceUrl: PAXG_SOURCE_URL,
    fetchedAt,
    tokens: [
      makeToken({
        provider: "paxos",
        symbol: "PAXG",
        name: "Pax Gold",
        underlyingSymbol: "XAU",
        assetType: "commodity",
        tokenStandard: "ERC-20",
        chainId: 1,
        chainName: "Ethereum",
        network: "Ethereum",
        address: PAXG_ETHEREUM_ADDRESS,
        decimals: 18,
        sourceUrl: PAXG_SOURCE_URL,
        sourceType: "official-contract-repository",
        confidence: "official",
        fetchedAt,
      }),
    ],
  };
}

