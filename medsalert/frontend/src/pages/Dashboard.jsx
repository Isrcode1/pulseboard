import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, logout } from "../api";

const STATUSES = [
  { value: "in_stock", label: "In stock", active: "bg-emerald-600 text-white" },
  { value: "low", label: "Low", active: "bg-amber-500 text-white" },
  { value: "out_of_stock", label: "Out", active: "bg-slate-600 text-white" },
];

export default function Dashboard() {
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function load() {
    try {
      setRows(await api.myStock());
      setStats(await api.stats());
    } catch (e) {
      if (e.message.includes("authenticated") || e.message.includes("token")) {
        logout();
        navigate("/pharmacy/login");
      } else {
        setError(e.message);
      }
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function setStatus(drugId, status, price) {
    try {
      const updated = await api.updateStock(drugId, { status, price });
      setRows((rs) => rs.map((r) => (r.drug.id === drugId ? updated : r)));
    } catch (e) {
      setError(e.message);
    }
  }

  async function confirmAll() {
    await api.confirmStock();
    setConfirmed(true);
    load();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Today's stock</h1>
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          Sign out
        </button>
      </div>

      {stats && (
        <p className="mb-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          📈 <strong>{stats.searches_this_week}</strong> people searched for drugs you stock this
          week{stats.alerts_pending > 0 && ` · ${stats.alerts_pending} waiting for restock alerts`}.
        </p>
      )}

      <button
        onClick={confirmAll}
        disabled={confirmed}
        className="mb-5 w-full rounded-xl border-2 border-emerald-600 py-2.5 font-medium text-emerald-700 hover:bg-emerald-50 disabled:border-slate-300 disabled:text-slate-400"
      >
        {confirmed ? "✓ Stock confirmed for today" : "Confirm today's stock unchanged"}
      </button>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <ul className="space-y-2">
        {rows.map((row) => (
          <li
            key={row.drug.id}
            className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">
                  {row.drug.generic_name} {row.drug.strength}
                </p>
                <p className="text-xs text-slate-400">
                  {row.drug.form} · {row.drug.category}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {STATUSES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStatus(row.drug.id, s.value, row.price)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                      row.status === s.value
                        ? s.active
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
                <input
                  type="number"
                  min="0"
                  placeholder="₦"
                  defaultValue={row.price ?? ""}
                  onBlur={(e) => {
                    const price = e.target.value === "" ? null : Number(e.target.value);
                    if (price !== row.price && row.status) {
                      setStatus(row.drug.id, row.status, price);
                    }
                  }}
                  className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-right text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
