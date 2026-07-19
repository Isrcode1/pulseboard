import { Link, Navigate, Route, Routes } from "react-router-dom";
import { isLoggedIn } from "./api";
import SearchPage from "./pages/SearchPage";
import PharmacyLogin from "./pages/PharmacyLogin";
import Dashboard from "./pages/Dashboard";

function RequireAuth({ children }) {
  return isLoggedIn() ? children : <Navigate to="/pharmacy/login" replace />;
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold text-emerald-700">
            💊 MedsAlert
          </Link>
          <Link
            to="/pharmacy"
            className="text-sm font-medium text-slate-600 hover:text-emerald-700"
          >
            Pharmacy portal
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/pharmacy/login" element={<PharmacyLogin />} />
          <Route
            path="/pharmacy"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
