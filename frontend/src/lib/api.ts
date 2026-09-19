export const getApiUrl = (path: string): string => {
  let envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl || envUrl === "undefined" || envUrl.includes("undefined")) {
    envUrl = "http://localhost:5000/api";
  }
  let baseUrl = envUrl.replace(/\/$/, "");
  if (!baseUrl.endsWith("/api")) {
    baseUrl = `${baseUrl}/api`;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
  try {
    const res = await fetch(url, options);
    const text = await res.text();
    let data: any;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (parseErr) {
      return {
        ok: false,
        status: res.status,
        error: `Server returned non-JSON response (HTTP ${res.status}).`
      };
    }
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        data,
        error: data.error || data.message || `Server returned status ${res.status}`
      };
    }
    return { ok: true, status: res.status, data };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      error: err.message || "Network error. Please check backend connection."
    };
  }
}
