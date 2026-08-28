import { makeToken } from "../lib/normalize.mjs";

const DEPLOYMENT_URL = "https://github.com/cenodev/setwise-contracts/blob/main/deployments/bsc-testnet.json";

const TESTNET_TOKENS = [
  {
    symbol: "mbSPCX",
    name: "Mock SpaceX bStock",
    underlyingSymbol: "SPCX",
    assetType: "equity",
    address: "0x75D74Ab8EcFF5215bbad450103ceDF532C23Ae46",
    logoURI: "https://cdn.simpleicons.org/spacex",
  },
  {
    symbol: "mbSNDK",
    name: "Mock SanDisk bStock",
    underlyingSymbol: "SNDK",
    assetType: "equity",
    address: "0xb106721f4f4D515c3528278DA64017cb6fc120F1",
    logoURI: "https://cdn.simpleicons.org/sandisk",
  },
  {
    symbol: "mbPLTR",
    name: "Mock Palantir bStock",
    underlyingSymbol: "PLTR",
    assetType: "equity",
    address: "0x610B80d790D8895128b49d49026EC8FA9189559d",
    logoURI: "https://cdn.simpleicons.org/palantir",
  },
  {
    symbol: "mbQCOM",
    name: "Mock Qualcomm bStock",
    underlyingSymbol: "QCOM",
    assetType: "equity",
    address: "0xcA60A189a5Edb00549FFD05cF855AFEb7E42e366",
    logoURI: "https://cdn.simpleicons.org/qualcomm",
  },
  {
    symbol: "mbGOOGL",
    name: "Mock Alphabet bStock",
    underlyingSymbol: "GOOGL",
    assetType: "equity",
    address: "0x90f0d4f7F58469ba56A09a679228873E71978264",
    logoURI: "https://cdn.simpleicons.org/google",
  },
  {
    symbol: "mbMU",
    name: "Mock Micron bStock",
    underlyingSymbol: "MU",
    assetType: "equity",
    address: "0xaE9Bb4b368a9C5C6218Fae97327A5331a72596EA",
    logoURI: "https://cdn.simpleicons.org/microntechnology",
  },
  {
    symbol: "mbNVDA",
    name: "Mock NVIDIA bStock",
    underlyingSymbol: "NVDA",
    assetType: "equity",
    address: "0x4825Ce7b23d59A443BAD34864132971582782Fb2",
    logoURI: "https://cdn.simpleicons.org/nvidia",
  },
];

export async function fetchSetwiseTestnet() {
  const fetchedAt = new Date().toISOString();
  const tokens = TESTNET_TOKENS.map((token) => makeToken({
    provider: "setwise-testnet",
    tokenStandard: "BEP-20",
    chainId: 97,
    network: "bsc-testnet",
    decimals: 18,
    sourceUrl: DEPLOYMENT_URL,
    sourceType: "first-party-deployment-manifest",
    confidence: "official",
    fetchedAt,
    ...token,
  }));

  return {
    provider: "setwise-testnet",
    sourceUrl: DEPLOYMENT_URL,
    fetchedAt,
    tokens,
  };
}
