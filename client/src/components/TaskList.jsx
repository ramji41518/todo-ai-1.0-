// src/components/TaskList.jsx
import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchTasks,
  makeSelectTasksForCollection,
  selectTasksStatus,
} from "../store/tasksSlice";
import TaskItem from "./TaskItem";
import AddTaskModal from "./AddTaskModal";

export default function TaskList() {
  const dispatch = useDispatch();
  const { selectedCollectionId } = useSelector((s) => s.selection);

  const selectTasks = useMemo(makeSelectTasksForCollection, []);
  const tasks = useSelector((s) => selectTasks(s, selectedCollectionId));
  const status = useSelector((s) => selectTasksStatus(s, selectedCollectionId));

  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    if (selectedCollectionId) dispatch(fetchTasks(selectedCollectionId));
  }, [selectedCollectionId, dispatch]);

  const high = useMemo(
    () => tasks.filter((t) => t.priority === "high"),
    [tasks]
  );
  const low = useMemo(() => tasks.filter((t) => t.priority === "low"), [tasks]);

  if (!selectedCollectionId) {
    return (
      <div className="p-4 text-slate-400 text-sm sm:text-base">
        Select a collection from the left to see tasks.
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {status === "loading" && (
        <div className="text-[11px] sm:text-xs text-slate-400">
          Loading tasks…
        </div>
      )}

      <section>
        <h2 className="mb-3 font-semibold text-slate-200 text-base sm:text-lg lg:text-xl">
          High Priority
        </h2>
        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
          {high.map((t) => (
            <TaskItem
              key={t._id}
              task={t}
              collectionId={selectedCollectionId}
            />
          ))}
          {high.length === 0 && (
            <div className="text-slate-400 text-sm sm:text-base">
              No high priority tasks
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-semibold text-slate-200 text-base sm:text-lg lg:text-xl">
          Low Priority
        </h2>
        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
          {low.map((t) => (
            <TaskItem
              key={t._id}
              task={t}
              collectionId={selectedCollectionId}
            />
          ))}
          {low.length === 0 && (
            <div className="text-slate-400 text-sm sm:text-base">
              No low priority tasks
            </div>
          )}
        </div>
      </section>

      <button
        className="rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 text-neutral-900 font-medium
                   px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base
                   shadow-[0_0_0_1px_rgba(255,255,255,.25),0_10px_28px_rgba(16,185,129,.35)]
                   hover:brightness-110 active:scale-[.99] transition"
        onClick={() => setAddOpen(true)}
      >
        + Add Task
      </button>

      <AddTaskModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        collectionId={selectedCollectionId}
      />
    </div>
  );
}
