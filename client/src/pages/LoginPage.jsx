import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { FaXTwitter } from "react-icons/fa6";
import api from "../api/axios";
import { setMe } from "../store/userSlice";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const dispatch = useDispatch();
  const nav = useNavigate();

  const submit = async (e) => {
    e?.preventDefault();
    if (!email || !password) return;
    setErr("");
    setBusy(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      dispatch(setMe(data.user));
      nav("/work");
    } catch (e) {
      setErr(e?.response?.data?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-slate-100 flex items-center justify-center px-4">
      {/* soft radial spotlights */}
      <div className="pointer-events-none fixed inset-0 -z-10 [background:radial-gradient(800px_280px_at_10%_-10%,rgba(34,197,94,.12),transparent_60%),radial-gradient(700px_240px_at_110%_-10%,rgba(99,102,241,.12),transparent_60%)]" />

      <div
        className="
    relative w-full max-w-md rounded-3xl border border-white/10 bg-white/5
    shadow-[0_0_0_1px_rgba(255,255,255,.06),0_20px_60px_rgba(0,0,0,.5)]
    backdrop-blur-xl p-6 sm:p-8
    before:content-[''] before:absolute before:-inset-px before:rounded-[inherit]
    before:bg-[radial-gradient(90%_60%_at_-10%_-10%,rgba(34,197,94,.25),transparent_40%),radial-gradient(90%_60%_at_110%_-10%,rgba(99,102,241,.25),transparent_40%)]
    before:pointer-events-none before:blur-2xl
    after:content-[''] after:absolute after:inset-0 after:rounded-[inherit]
    after:bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,.08)_20%,rgba(255,255,255,.02)_60%,transparent_100%)]
    after:[mask-image:linear-gradient(to_bottom,white,transparent)]
    after:pointer-events-none
  "
      >
        <div className="space-y-6">
          <header className="text-center">
            <h1 className="text-3xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Sign in to your account
            </p>
          </header>

          <form className="space-y-4" onSubmit={submit}>
            {/* Email */}
            <div className="relative">
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-400
                           focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-400
                         focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
              placeholder="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {err && <div className="text-sm text-red-400">{err}</div>}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 text-neutral-900 font-medium py-3
                         shadow-[0_0_0_1px_rgba(255,255,255,.2),0_12px_30px_rgba(16,185,129,.35)]
                         hover:brightness-110 active:scale-[.99] transition"
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* OR divider */}
          <div className="flex items-center gap-3">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-xs text-slate-400">OR</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          {/* Social mock buttons (wire later if you add OAuth) */}
          <div className="space-y-3">
            <button
              type="button"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm flex items-center justify-between
                         hover:bg-white/[.06] transition"
            >
              <span className="flex items-center gap-3">
                <FcGoogle className="text-xl" />
                Continue with Google
              </span>
              <FiArrowRight className="opacity-50" />
            </button>

            <button
              type="button"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm flex items-center justify-between
                         hover:bg-white/[.06] transition"
            >
              <span className="flex items-center gap-3">
                <FaXTwitter className="text-lg" />
                Continue with X
              </span>
              <FiArrowRight className="opacity-50" />
            </button>
          </div>

          <p className="text-center text-sm text-slate-400">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="text-emerald-300 hover:text-emerald-200 underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
