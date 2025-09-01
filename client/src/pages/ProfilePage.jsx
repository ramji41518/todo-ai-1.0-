import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import api from "../api/axios";
import { setMe, clearUser } from "../store/userSlice";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
  const { name, email, profileImage } = useSelector((s) => s.user);
  const [newName, setNewName] = useState(name || "");
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const dispatch = useDispatch();
  const nav = useNavigate();

  const save = async () => {
    setMsg("");
    setBusy(true);
    try {
      const form = new FormData();
      if (newName) form.append("name", newName);
      if (file) form.append("image", file);
      const { data } = await api.put("/users/profile", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(setMe(data.user));
      setMsg("Saved!");
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    await api.post("/auth/logout");
    dispatch(clearUser());
    nav("/login");
  };

  const initial = (name && name.trim()[0]) || (email && email.trim()[0]) || "U";

  return (
    <div className="relative min-h-screen bg-[#0b1220] text-slate-100 flex items-start justify-center px-4 py-10">
      {/* dreamy background glows */}
      <div
        className="pointer-events-none absolute inset-0 -z-10
        [background:
          radial-gradient(900px_400px_at_-10%_-10%,rgba(168,85,247,.25),transparent_55%),
          radial-gradient(800px_360px_at_110%_-10%,rgba(20,184,166,.18),transparent_55%),
          radial-gradient(500px_400px_at_30%_120%,rgba(99,102,241,.18),transparent_55%)
        ]"
      />

      {/* Glass card */}
      <div
        className="
          relative w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5
          shadow-[0_0_0_1px_rgba(255,255,255,.06),0_20px_60px_rgba(0,0,0,.5)]
          backdrop-blur-xl p-6 sm:p-8
          before:content-[''] before:absolute before:-inset-px before:rounded-[inherit]
          before:bg-[radial-gradient(90%_60%_at_-10%_-10%,rgba(168,85,247,.25),transparent_40%),radial-gradient(90%_60%_at_110%_-10%,rgba(20,184,166,.25),transparent_40%)]
          before:pointer-events-none before:blur-2xl
          after:content-[''] after:absolute after:inset-0 after:rounded-[inherit]
          after:bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,.08)_20%,rgba(255,255,255,.02)_60%,transparent_100%)]
          after:[mask-image:linear-gradient(to_bottom,white,transparent)]
          after:pointer-events-none
        "
      >
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-[auto,1fr] gap-6 items-start">
          {/* Avatar + email */}
          <div className="flex flex-col items-center gap-3">
            {profileImage ? (
              <img
                src={profileImage}
                alt="avatar"
                className="h-24 w-24 rounded-full object-cover border border-white/10 shadow"
              />
            ) : (
              <div
                className="
                  h-24 w-24 rounded-full grid place-items-center text-3xl font-semibold
                  bg-gradient-to-br from-emerald-400 to-fuchsia-500 text-neutral-900
                  border border-white/20 shadow
                "
                aria-label="avatar"
                title="No profile image"
              >
                {initial.toUpperCase()}
              </div>
            )}
            <div className="text-xs text-slate-400 break-all">
              Email: {email}
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Name</label>
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none
                           placeholder:text-slate-400 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
                placeholder="Your name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Profile image</label>
              <input
                className="block w-full text-sm text-slate-200
                           file:mr-4 file:rounded-lg file:border-0 file:px-4 file:py-2.5
                           file:bg-white/10 file:text-slate-100 file:hover:bg-white/15
                           hover:cursor-pointer"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              {file && (
                <div className="text-xs text-slate-400">
                  Selected: <span className="text-slate-200">{file.name}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <button
                className="rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 text-neutral-900 font-medium px-4 py-2.5
                           shadow-[0_0_0_1px_rgba(255,255,255,.25),0_10px_28px_rgba(16,185,129,.35)]
                           hover:brightness-110 active:scale-[.99] transition"
                onClick={save}
                disabled={busy}
              >
                {busy ? "Saving…" : "Save"}
              </button>
              <button
                className="rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 text-neutral-900 font-medium px-4 py-2.5
                           shadow-[0_0_0_1px_rgba(255,255,255,.25),0_10px_28px_rgba(16,185,129,.35)]
                           hover:brightness-110 active:scale-[.99] transition"
                onClick={() => {
                  nav("/work");
                }}
              >
                back
              </button>
              <button
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-100 hover:bg-white/10 transition"
                onClick={logout}
              >
                Logout
              </button>
            </div>

            {msg && <div className="text-sm text-emerald-400">{msg}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
