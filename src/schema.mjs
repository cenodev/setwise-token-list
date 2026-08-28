export function validateTokenList(tokenList) {
  const errors = [];
  if (!tokenList || typeof tokenList !== "object") errors.push("Token list must be an object");
  if (!Array.isArray(tokenList.tokens)) errors.push("tokens must be an array");
  if (!Array.isArray(tokenList.providers)) errors.push("providers must be an array");

  const ids = new Set();
  for (const [index, token] of (tokenList.tokens ?? []).entries()) {
    const prefix = `tokens[${index}]`;
    for (const field of ["id", "provider", "symbol", "chainId", "address", "decimals", "sourceUrl", "confidence"]) {
      if (token[field] === undefined || token[field] === null || token[field] === "") {
        errors.push(`${prefix}.${field} is required`);
      }
    }
    if (token.assetType !== "equity") {
      errors.push(`${prefix}.assetType must be equity`);
    }
    if (ids.has(token.id)) errors.push(`${prefix}.id duplicates ${token.id}`);
    ids.add(token.id);
    if (typeof token.chainId !== "number") errors.push(`${prefix}.chainId must be a number`);
    if (typeof token.decimals !== "number") errors.push(`${prefix}.decimals must be a number`);
    if (token.address.startsWith?.("0x") && !/^0x[a-f0-9]{40}$/u.test(token.address)) {
      errors.push(`${prefix}.address must be a normalized lowercase EVM address`);
    }
  }

  return errors;
}
