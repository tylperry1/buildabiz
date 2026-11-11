/** PostgREST may return an empty 201 body, not just a 204. */
export async function decodeResponse(response) {
  if (!response.ok) throw new Error(`Service request failed (${response.status})`);
  const body = await response.text();
  return body.trim() ? JSON.parse(body) : null;
}
export function encodeFilter(value) {
  // Encode PostgREST syntax as a quoted string, then URL-encode the entire value.
  return encodeURIComponent(`"${String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`);
}
export function pageNumber(value) {const n=Number(value);return Number.isSafeInteger(n)&&n>0?Math.min(n,10000):1;}
