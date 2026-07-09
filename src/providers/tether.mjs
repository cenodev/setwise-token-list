import { fetchText } from "../lib/http.mjs";
import { makeToken, uniqueById } from "../lib/normalize.mjs";

const TETHER_GOLD_ETHEREUM_ADDRESS = "0x68749665FF8D2d112Fa859AA293F07A622782F38";
const TETHER_GOLD_SOURCE_URL = "https://etherscan.io/token/0x68749665ff8d2d112fa859aa293f07a622782f38";
const XAUT0_DEPLOYMENTS_URL = "https://docs.usdt0.to/api/deployments";

function chainIdForDeployment(deployment) {
  if (typeof deployment.chainId === "number") return deployment.chainId;
  return {
    Solana: 101,
    TON: -239,
  }[deployment.name];
}

function tokenStandardForDeployment(deployment) {
  if (deployment.name === "Solana") return "SPL";
  if (deployment.name === "TON") return "JETTON";
  return "ERC-20";
}

export async function fetchTetherGold() {
  const fetchedAt = new Date().toISOString();
  const deployments = JSON.parse(await fetchText(XAUT0_DEPLOYMENTS_URL));
  const xaut0Tokens = [];

  for (const deployment of deployments.xaut0?.native ?? []) {
    const chainId = chainIdForDeployment(deployment);
    if (typeof chainId !== "number") continue;

    const tokenContract = deployment.contracts.find((contract) => contract.name === "Token");
    if (!tokenContract) continue;

    xaut0Tokens.push(makeToken({
      provider: "tether",
      symbol: "XAUT0",
      name: `Tether Gold XAUt0 on ${deployment.name}`,
      underlyingSymbol: "XAUT",
      assetType: "commodity",
      tokenStandard: tokenStandardForDeployment(deployment),
      chainId,
      chainName: deployment.name,
      network: deployment.name,
      address: tokenContract.address,
      decimals: 6,
      sourceUrl: XAUT0_DEPLOYMENTS_URL,
      sourceType: "official-deployment-api",
      confidence: "official",
      fetchedAt,
    }));
  }

  return {
    provider: "tether",
    sourceUrl: XAUT0_DEPLOYMENTS_URL,
    fetchedAt,
    tokens: uniqueById([
      makeToken({
        provider: "tether",
        symbol: "XAUT",
        name: "Tether Gold",
        underlyingSymbol: "XAU",
        assetType: "commodity",
        tokenStandard: "ERC-20",
        chainId: 1,
        chainName: "Ethereum",
        network: "Ethereum",
        address: TETHER_GOLD_ETHEREUM_ADDRESS,
        decimals: 6,
        sourceUrl: TETHER_GOLD_SOURCE_URL,
        sourceType: "verified-explorer",
        confidence: "official",
        fetchedAt,
      }),
      ...xaut0Tokens,
    ]),
  };
}

