import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken } from "../api";

export default function PharmacyLogin() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("phone"); // phone → code
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (step === "phone") {
        await api.requestOtp(phone);
        setStep("code");
      } else {
        const { access_token } = await api.verifyOtp(phone, code);
        setToken(access_token);
        navigate("/pharmacy");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-1 text-xl font-bold">Pharmacy sign in</h1>
      <p className="mb-4 text-sm text-slate-500">
        {step === "phone"
          ? "Enter your registered phone number and we'll text you a code."
          : `Enter the 6-digit code we sent to ${phone}.`}
      </p>
      <form onSubmit={submit} className="space-y-3">
        {step === "phone" ? (
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+234…"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 focus:border-emerald-500 focus:outline-none"
          />
        ) : (
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            required
            inputMode="numeric"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 tracking-widest focus:border-emerald-500 focus:outline-none"
          />
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={busy}
          className="w-full rounded-lg bg-emerald-600 py-2.5 font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {step === "phone" ? "Send code" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
