export async function api<T>(url: string, body?: unknown): Promise<T> {
  const response = await fetch(url, { method: body === undefined ? "GET" : "POST", headers: body === undefined ? undefined : { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body), cache: "no-store" });
  const data = await response.json().catch(() => ({ error: "The server could not be reached. Please try again." }));
  if (!response.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data as T;
}
