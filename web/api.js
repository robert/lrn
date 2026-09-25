// Every call to the server goes through here. Errors are thrown, never hidden.
async function request(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error ?? `${method} ${url} failed (${res.status})`);
  return data;
}

export const get = url => request("GET", url);
export const post = (url, body = {}) => request("POST", url, body);
