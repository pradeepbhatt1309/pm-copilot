export async function apiRequest<T>(
  method: string,
  url: string,
  body?: unknown,
  formData?: FormData
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: formData ? undefined : { "Content-Type": "application/json" },
    body: formData ? formData : body ? JSON.stringify(body) : undefined,
  };

  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || err.message || "Request failed");
  }
  return res.json();
}
