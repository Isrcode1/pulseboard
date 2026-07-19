import { useEffect, useRef, useState } from "react";
import { api } from "../api";

// Fallback when geolocation is denied: central Lagos.
const DEFAULT_LOCATION = { lat: 6.5244, lng: 3.3792 };

function FreshnessBadge({ fresh, updatedAt }) {
  const hours = Math.round((Date.now() - new Date(updatedAt).getTime()) / 36e5);
  const label = hours < 1 ? "just updated" : hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
  return fresh ? (
    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
      Confirmed {label}
    </span>
  ) : (
    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
      Unconfirmed · {label}
    </span>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [results, setResults] = useState(null);
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [alertPhone, setAlertPhone] = useState("");
  const [alertDone, setAlertDone] = useState(false);
  const [error, setError] = useState("");
  const debounce = useRef(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {} // keep the fallback silently
    );
  }, []);

  useEffect(() => {
    if (!query || selectedDrug) return;
    clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      try {
        setSuggestions(await api.searchDrugs(query));
      } catch {
        setSuggestions([]);
      }
    }, 250);
    return () => clearTimeout(debounce.current);
  }, [query, selectedDrug]);

  async function pickDrug(drug) {
    setSelectedDrug(drug);
    setQuery(`${drug.generic_name} ${drug.strength}`);
    setSuggestions([]);
    setAlertDone(false);
    setError("");
    try {
      const res = await api.search(drug.id, location.lat, location.lng);
      setResults(res.results);
    } catch (e) {
      setError(e.message);
      setResults(null);
    }
  }

  async function subscribeAlert(e) {
    e.preventDefault();
    try {
      await api.createAlert({
        phone: alertPhone,
        drug_id: selectedDrug.id,
        lat: location.lat,
        lng: location.lng,
      });
      setAlertDone(true);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Find your medication</h1>
      <p className="mb-4 text-sm text-slate-500">
        See which pharmacies near you have it in stock — before you start walking.
      </p>

      <div className="relative">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedDrug(null);
            setResults(null);
          }}
          placeholder="e.g. amlodipine, metformin, Lantus…"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base shadow-sm focus:border-emerald-500 focus:outline-none"
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            {suggestions.map((d) => (
              <li key={d.id}>
                <button
                  onClick={() => pickDrug(d)}
                  className="flex w-full items-baseline justify-between px-4 py-2.5 text-left hover:bg-emerald-50"
                >
                  <span className="font-medium">
                    {d.generic_name} {d.strength}
                  </span>
                  <span className="text-xs text-slate-400">
                    {d.form} · {d.brand_names.split(",")[0]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {results && results.length > 0 && (
        <ul className="mt-6 space-y-3">
          {results.map((r) => (
            <li
              key={r.pharmacy.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{r.pharmacy.name}</p>
                  <p className="text-sm text-slate-500">
                    {r.pharmacy.address} · {r.distance_km} km away
                  </p>
                </div>
                <FreshnessBadge fresh={r.fresh} updatedAt={r.updated_at} />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm">
                  {r.status === "low" && <span className="text-amber-600">Low stock · </span>}
                  {r.price != null && <span className="font-medium">₦{r.price.toLocaleString()}</span>}
                </span>
                <span className="flex gap-2">
                  <a
                    href={`tel:${r.pharmacy.phone}`}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                  >
                    Call
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${r.pharmacy.lat},${r.pharmacy.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
                  >
                    Directions
                  </a>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {results && results.length === 0 && selectedDrug && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <p className="font-medium">No pharmacy nearby has this in stock right now.</p>
          {alertDone ? (
            <p className="mt-2 text-sm text-emerald-700">
              ✓ We'll text you the moment it's available.
            </p>
          ) : (
            <form onSubmit={subscribeAlert} className="mx-auto mt-3 flex max-w-sm gap-2">
              <input
                value={alertPhone}
                onChange={(e) => setAlertPhone(e.target.value)}
                placeholder="Your phone number"
                required
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
              <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
                Text me
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
