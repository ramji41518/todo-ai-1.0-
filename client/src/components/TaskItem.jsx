import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiRefreshCcw, FiTrash2 } from "react-icons/fi";
import {
  deleteTask,
  toggleTaskDone,
  toggleTaskPriority,
} from "../store/tasksSlice";
import { selectSubtasks } from "../store/subtasksSlice";
import SubtaskDialog from "./SubtaskDialog";

export default function TaskItem({ task, collectionId }) {
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  const subtasks = useSelector((s) => selectSubtasks(s, task._id));
  const { done, total } = useMemo(() => {
    const t = subtasks.length;
    const d = subtasks.filter((x) => x.isDone).length;
    return { done: d, total: t };
  }, [subtasks]);

  const togglePriorityHandler = async () => {
    setBusy(true);
    try {
      await dispatch(
        toggleTaskPriority({ id: task._id, collectionId })
      ).unwrap();
    } finally {
      setBusy(false);
    }
  };

  const toggleDoneHandler = async (e) => {
    e.stopPropagation();
    setBusy(true);
    try {
      await dispatch(toggleTaskDone({ id: task._id, collectionId })).unwrap();
    } finally {
      setBusy(false);
    }
  };

  const removeHandler = async (e) => {
    e.stopPropagation();
    setBusy(true);
    try {
      await dispatch(deleteTask({ id: task._id, collectionId })).unwrap();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div
        className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2 border bg-white/5 hover:bg-white/[.07] transition ${
          busy ? "opacity-70" : ""
        } border-white/10`}
        onClick={() => setOpen(true)}
        title="Click to manage subtasks"
      >
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={task.isDone}
            onChange={toggleDoneHandler}
            disabled={busy}
            className="accent-emerald-400"
            onClick={(e) => e.stopPropagation()}
          />
          <span className={task.isDone ? "line-through text-slate-400" : ""}>
            {task.content}
          </span>

          <span
            className={`px-2 py-0.5 rounded-full text-xs border
              ${
                task.priority === "high"
                  ? "bg-pink-500/15 text-pink-300 border-pink-400/30"
                  : "bg-white/10 text-slate-300 border-white/10"
              }`}
          >
            {task.priority}
          </span>

          {total > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs border border-white/10 bg-white/5 text-slate-300">
              {done}/{total}
            </span>
          )}
        </div>

        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="h-9 w-9 grid place-items-center rounded-lg hover:bg-white/10"
            title="Switch priority"
            onClick={togglePriorityHandler}
            disabled={busy}
          >
            <FiRefreshCcw />
          </button>
          <button
            className="h-9 w-9 grid place-items-center rounded-lg hover:bg-white/10 text-red-300"
            title="Delete task"
            onClick={removeHandler}
            disabled={busy}
          >
            <FiTrash2 />
          </button>
        </div>
      </div>

      <SubtaskDialog open={open} onOpenChange={setOpen} task={task} />
    </>
  );
}
