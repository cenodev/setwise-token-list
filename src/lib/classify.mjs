const COMMODITY_SYMBOLS = new Set([
  "GLD",
  "GLDx",
  "PAXG",
  "SLV",
  "SLVx",
  "XAUT",
  "XAUt",
  "XAUt0",
  "XAUT0",
]);

const CURRENCY_SYMBOLS = new Set([
  "USDG",
  "USDC",
  "USDT",
]);

const CRYPTO_SYMBOLS = new Set([
  "WETH",
]);

const ETF_SYMBOLS = new Set([
  "COPX",
  "COPXx",
  "CUSO",
  "DAX",
  "DAXx",
  "EWG",
  "EWGx",
  "EWQ",
  "EWQx",
  "EWU",
  "EWUx",
  "EWY",
  "EWYx",
  "FAAA",
  "FAAAx",
  "FEZ",
  "FEZx",
  "FLBL",
  "FLBLx",
  "FLQM",
  "FLQMx",
  "FSML",
  "FSMLx",
  "GDX",
  "GDXx",
  "IEMG",
  "IEMGx",
  "IJR",
  "IJRx",
  "ITA",
  "ITAx",
  "IWM",
  "IWMx",
  "JAAA",
  "JAAAx",
  "JPST",
  "JPSTx",
  "KRAQ",
  "KRAQx",
  "LITE",
  "LITEx",
  "MDLN",
  "MDLNx",
  "MOO",
  "MOOx",
  "NLR",
  "NLRx",
  "QQQ",
  "QQQon",
  "QQQx",
  "SGOV",
  "SPCX",
  "SPY",
  "SPYon",
  "SPYx",
  "VTI",
  "VTIx",
  "VXUS",
  "VXUSx",
  "XLE",
  "XLEx",
  "XOP",
  "XOPx",
]);

export function classifyAsset({ name = "", symbol = "", tags = [] } = {}) {
  const normalizedName = name.toLowerCase();
  const normalizedTags = tags.map((tag) => String(tag).toLowerCase());

  if (CURRENCY_SYMBOLS.has(symbol)) return "currency";
  if (CRYPTO_SYMBOLS.has(symbol)) return "crypto";
  if (COMMODITY_SYMBOLS.has(symbol)) return "commodity";
  if (
    ETF_SYMBOLS.has(symbol)
    || normalizedTags.includes("etf")
    || /\b(etf|fund|trust|spdr|ishares|invesco|vanguard|vaneck|franklin|global x|nasdaq|s&p|russell|dax|euro stoxx|bitcoin strategy)\b/u.test(normalizedName)
  ) {
    return "etf";
  }

  return "equity";
}
