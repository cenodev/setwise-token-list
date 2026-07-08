export async function fetchText(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      accept: "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
      "user-agent": "SetwiseTokenList/0.1 (+https://ceno.dev)",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`GET ${url} failed with HTTP ${response.status}`);
  }

  return response.text();
}

