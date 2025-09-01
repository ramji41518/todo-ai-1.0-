import { useState } from "react";
import { useDispatch } from "react-redux";
import CssDialog from "./ui/CssDialog";
import { addTask } from "../store/tasksSlice";

export default function AddTaskModal({ isOpen, onClose, collectionId }) {
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("low");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const dispatch = useDispatch();

  const createTask = async () => {
    if (!content.trim() || !collectionId) return;
    setBusy(true);
    setErr("");
    try {
      await dispatch(
        addTask({ collectionId, content: content.trim(), priority })
      ).unwrap();
      setContent("");
      setPriority("low");
      onClose?.();
    } catch (e) {
      setErr(typeof e === "string" ? e : "Failed to add task");
    } finally {
      setBusy(false);
    }
  };

  return (
    <CssDialog
      open={!!isOpen}
      onOpenChange={(v) => !v && onClose?.()}
      title="Add Task"
      footer={
        <div className="flex gap-2">
          <button
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-100 hover:bg-white/10 transition"
            onClick={() => onClose?.()}
          >
            Cancel
          </button>
          <button
            className="rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 text-neutral-900 font-medium px-4 py-2.5
                       shadow-[0_0_0_1px_rgba(255,255,255,.25),0_10px_28px_rgba(16,185,129,.35)]
                       hover:brightness-110 active:scale-[.99] transition"
            disabled={busy}
            onClick={createTask}
          >
            {busy ? "Adding..." : "Add"}
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        <input
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none
                     placeholder:text-slate-400 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
          placeholder="Task content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <select
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none
                     focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option className="bg-[#0b1220]" value="high">
            High
          </option>
          <option className="bg-[#0b1220]" value="low">
            Low
          </option>
        </select>
        {err && <div className="text-sm text-red-400">{err}</div>}
      </div>
    </CssDialog>
  );
}
