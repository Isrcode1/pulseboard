const BASE = "/api";

function authHeaders() {
  const token = localStorage.getItem("medsalert_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...options.headers,
    },
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      detail = (await res.json()).detail ?? detail;
    } catch {
      /* not JSON */
    }
    throw new Error(detail);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  searchDrugs: (q) => request(`/catalog/drugs?q=${encodeURIComponent(q)}`),
  search: (drugId, lat, lng, radiusKm = 10) =>
    request(`/search?drug_id=${drugId}&lat=${lat}&lng=${lng}&radius_km=${radiusKm}`),
  createAlert: (body) => request("/alerts", { method: "POST", body: JSON.stringify(body) }),
  requestOtp: (phone) =>
    request("/auth/request-otp", { method: "POST", body: JSON.stringify({ phone }) }),
  verifyOtp: (phone, code) =>
    request("/auth/verify-otp", { method: "POST", body: JSON.stringify({ phone, code }) }),
  myStock: () => request("/pharmacy/stock"),
  updateStock: (drugId, body) =>
    request(`/pharmacy/stock/${drugId}`, { method: "PUT", body: JSON.stringify(body) }),
  confirmStock: () => request("/pharmacy/confirm", { method: "POST" }),
  stats: () => request("/pharmacy/stats"),
};

export function isLoggedIn() {
  return Boolean(localStorage.getItem("medsalert_token"));
}

export function setToken(token) {
  localStorage.setItem("medsalert_token", token);
}

export function logout() {
  localStorage.removeItem("medsalert_token");
}
