import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import api from "../api/axios";
import { patchUser } from "../store/userSlice";

export default function AIChatPage() {
  const dispatch = useDispatch();
  const { credits, name } = useSelector((s) => s.user);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! Ask me anything. **Each message costs 1 credit.**\n\n" +
        "Tip: I support *Markdown*, so feel free to ask for bullet lists, tables, or step-by-step plans.",
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const scrollerRef = useRef(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const send = async () => {
    if (!input.trim() || busy) return;

    if (!credits || credits <= 0) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "You have 0 credits. Complete all **HIGH** tasks in a collection to earn **+5 credits**.",
        },
      ]);
      return;
    }

    const next = [...messages, { role: "user", content: input.trim() }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setError("");

    try {
      const { data } = await api.post("/ai/chat", { messages: next });
      setMessages([...next, { role: "assistant", content: data.reply }]);
      if (typeof data.credits === "number") {
        dispatch(patchUser({ credits: data.credits }));
      }
    } catch (e) {
      const msg =
        e?.response?.data?.message || e.message || "Something went wrong.";
      setError(msg);
      setMessages([...next, { role: "assistant", content: msg }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0b1220] text-slate-100 flex items-start justify-center px-4 py-8">
      {/* dreamy background glows */}
      <div
        className="pointer-events-none absolute inset-0 -z-10
        [background:
          radial-gradient(900px_400px_at_-10%_-10%,rgba(168,85,247,.25),transparent_55%),
          radial-gradient(800px_360px_at_110%_-10%,rgba(20,184,166,.18),transparent_55%),
          radial-gradient(500px_400px_at_30%_120%,rgba(99,102,241,.18),transparent_55%)
        ]"
      />

      <div className="w-full max-w-3xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">AI Chat</h1>
          <div className="px-2 py-1 rounded-full bg-white/10 border border-white/10 text-sm">
            Credits: {credits ?? 0}
          </div>
        </div>

        <p className="text-sm text-slate-400">
          1 message = 1 credit. Earn <b>+5</b> by completing all <b>HIGH</b>{" "}
          tasks in any collection.
        </p>

        {/* Chat surface */}
        <div
          ref={scrollerRef}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 sm:p-6 h-[480px] overflow-y-auto
                     shadow-[0_0_0_1px_rgba(255,255,255,.06),0_20px_60px_rgba(0,0,0,.45)]"
        >
          <div className="flex flex-col gap-3">
            {messages.map((m, i) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={i}
                  className={`
                    max-w-[80%] px-4 py-3 rounded-2xl border text-sm sm:text-base leading-relaxed
                    ${
                      isUser
                        ? "self-end bg-indigo-400/10 border-indigo-300/20"
                        : "self-start bg-white/5 border-white/10"
                    }
                  `}
                >
                  <div className="text-xs mb-1 opacity-70">
                    {isUser ? name || "You" : "AI"}
                  </div>
                  <div className="space-y-2">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.content}
                    </ReactMarkdown>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-stretch gap-2">
          <input
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none
                       placeholder:text-slate-400 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
            placeholder="Type your message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button
            className="rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 text-neutral-900 font-medium px-5
                       shadow-[0_0_0_1px_rgba(255,255,255,.25),0_10px_28px_rgba(16,185,129,.35)]
                       hover:brightness-110 active:scale-[.99] transition"
            disabled={busy}
            onClick={send}
          >
            {busy ? "Sending…" : "Send"}
          </button>
        </div>

        {error && <div className="text-sm text-red-400">{error}</div>}
      </div>
    </div>
  );
}
