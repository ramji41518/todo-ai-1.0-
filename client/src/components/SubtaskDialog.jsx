// src/components/SubtaskDialog.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactMarkdown from "react-markdown"; // if you don't use it here, remove this line
import remarkGfm from "remark-gfm"; // and this line as well
import CssDialog from "./ui/CssDialog";

import {
  fetchSubtasks,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  selectSubtasks,
  makeSubtaskStats,
} from "../store/subtasksSlice";

function SubtaskDialog({ open, onOpenChange, task }) {
  const dispatch = useDispatch();
  const items = useSelector((s) => selectSubtasks(s, task?._id));
  const statsSel = useMemo(makeSubtaskStats, []);
  const { done, total } = useSelector((s) => statsSel(s, task?._id));
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && task?._id) {
      dispatch(fetchSubtasks(task._id));
      // focus input when dialog opens
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open, task?._id, dispatch]);

  const add = async () => {
    const v = content.trim();
    if (!v || !task?._id) return;
    setBusy(true);
    try {
      await dispatch(addSubtask({ taskId: task._id, content: v })).unwrap();
      setContent("");
      inputRef.current?.focus();
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (id) => {
    await dispatch(toggleSubtask({ id, taskId: task._id })).unwrap();
  };

  const remove = async (id) => {
    await dispatch(deleteSubtask({ id, taskId: task._id })).unwrap();
  };

  return (
    <CssDialog
      open={!!open}
      onOpenChange={onOpenChange}
      title={
        <div className="space-y-1">
          <div className="text-base font-semibold">
            {task?.content || "Task"}
          </div>
          <div className="text-xs text-slate-400">
            Subtasks {done}/{total} · {task?.priority?.toUpperCase()} priority
          </div>
        </div>
      }
      footer={
        <div className="flex justify-between w-full">
          <div className="text-xs text-slate-400">
            {total > 0
              ? done === total
                ? "All subtasks complete."
                : "Mark all subtasks done to complete the task."
              : "No subtasks yet."}
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-100 hover:bg-white/10 transition"
              onClick={() => onOpenChange?.(false)}
            >
              Close
            </button>
            <button
              className="rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 text-neutral-900 font-medium px-4 py-2.5
                         shadow-[0_0_0_1px_rgba(255,255,255,.25),0_10px_28px_rgba(16,185,129,.35)]
                         hover:brightness-110 active:scale-[.99] transition"
              onClick={add}
              disabled={busy || !content.trim()}
            >
              Add Subtask
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <input
            ref={inputRef}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none
                       placeholder:text-slate-400 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
            placeholder="New subtask…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          <button
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-slate-100 hover:bg-white/10 transition"
            onClick={add}
            disabled={busy || !content.trim()}
          >
            Add
          </button>
        </div>

        {/* Scrollable list */}
        <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
          {items.map((s) => (
            <div
              key={s._id}
              className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 border border-white/10 bg-white/5"
            >
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-emerald-400"
                  checked={!!s.isDone}
                  onChange={() => toggle(s._id)}
                />
                <span className={s.isDone ? "line-through text-slate-400" : ""}>
                  {s.content}
                </span>
              </label>
              <button
                className="h-9 px-3 rounded-lg hover:bg-white/10 text-red-300"
                onClick={() => remove(s._id)}
                title="Delete subtask"
              >
                Delete
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-slate-400 text-sm">
              No subtasks yet. Add your first one above.
            </div>
          )}
        </div>
      </div>
    </CssDialog>
  );
}

export default SubtaskDialog; // ✅ default export
export { SubtaskDialog }; // ✅ optional named export
