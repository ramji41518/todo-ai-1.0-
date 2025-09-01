// src/components/Sidebar.jsx
import { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { FiTrash2, FiSearch, FiX } from "react-icons/fi";

import NewCollectionModal from "./NewCollectionModal";
import {
  setSelectedCollectionId,
  clearSelection,
} from "../store/selectionSlice";
import {
  fetchCollections,
  selectCollections,
  selectCollectionsStatus,
  deleteCollection,
} from "../store/collectionsSlice";
import { dropCollection } from "../store/tasksSlice";
import Trie from "../utils/trie";

export default function Sidebar() {
  const dispatch = useDispatch();
  const nav = useNavigate();

  const { name, credits } = useSelector((s) => s.user);
  const items = useSelector(selectCollections);
  const status = useSelector(selectCollectionsStatus);
  const selectedCollectionId = useSelector(
    (s) => s.selection.selectedCollectionId
  );

  const [newColOpen, setNewColOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (status === "idle") dispatch(fetchCollections());
  }, [status, dispatch]);

  const trie = useMemo(() => {
    const t = new Trie();
    for (const c of items) t.insert(c.name, c);
    return t;
  }, [items]);

  const searchResults = useMemo(() => {
    const q = query.trim();
    if (!q) return null;
    return trie.search(q, 100);
  }, [query, trie]);

  const grouped = useMemo(() => {
    const map = {};
    for (const c of items) {
      const key = moment(c.createdAt).format("YYYY-MM-DD");
      (map[key] ||= []).push(c);
    }
    return Object.entries(map).sort((a, b) => new Date(b[0]) - new Date(a[0]));
  }, [items]);

  async function handleDelete(e, id) {
    e.stopPropagation();
    if (!window.confirm("Delete this collection and all its tasks?")) return;
    setDeletingId(id);
    try {
      await dispatch(deleteCollection(id)).unwrap();
      dispatch(dropCollection(id));
      if (selectedCollectionId === id) dispatch(clearSelection());
    } catch (err) {
      alert(typeof err === "string" ? err : "Failed to delete collection");
    } finally {
      setDeletingId(null);
    }
  }

  const renderCollectionRow = (col) => (
    <div
      key={col._id}
      className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 border transition
        ${
          selectedCollectionId === col._id
            ? "border-fuchsia-400/40 bg-fuchsia-400/10"
            : "border-white/10 bg-white/5 hover:bg-white/10"
        }`}
      onClick={() => dispatch(setSelectedCollectionId(col._id))}
      title={col.name}
    >
      <div className="truncate text-sm sm:text-base">{col.name}</div>

      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs bg-white/10 border border-white/10 text-slate-300">
          {moment(col.createdAt).fromNow()}
        </span>
        <button
          className="h-8 w-8 grid place-items-center rounded-lg hover:bg-white/10 text-red-300"
          title="Delete collection"
          aria-label="Delete collection"
          onClick={(e) => handleDelete(e, col._id)}
          disabled={deletingId === col._id}
        >
          <FiTrash2 className="text-base sm:text-lg" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col p-4 sm:p-5 gap-4 sm:gap-5">
      {/* Profile */}
      <div className="cursor-pointer" onClick={() => nav("/profile")}>
        <div className="font-semibold text-base sm:text-lg lg:text-xl">
          {name || "User"}
        </div>
        <div className="text-[11px] sm:text-xs text-slate-400">
          View profile
        </div>
      </div>

      <div className="h-px bg-white/10" />

      {/* Search bar */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300/80 pointer-events-none" />
        <input
          className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-10 py-2 sm:py-2.5 text-sm sm:text-base text-slate-100 outline-none
                     placeholder:text-slate-400 focus:border-fuchsia-400/50 focus:ring-2 focus:ring-fuchsia-400/20"
          placeholder="Search collections…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-lg hover:bg-white/10 text-slate-300"
            onClick={() => setQuery("")}
          >
            <FiX className="text-base sm:text-lg" />
          </button>
        )}
      </div>

      <h3 className="tracking-wide text-slate-300 text-xs sm:text-sm">
        {query.trim() ? "Results" : "Collections"}
      </h3>

      {status === "loading" && (
        <div className="text-[11px] sm:text-xs text-slate-400">
          Loading collections…
        </div>
      )}

      {/* Scroller */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        <div className="space-y-4">
          {query.trim() ? (
            <>
              {searchResults && searchResults.length > 0 ? (
                searchResults.map((col) => renderCollectionRow(col))
              ) : (
                <div className="text-[11px] sm:text-xs text-slate-400">
                  No matches for “{query.trim()}”.
                </div>
              )}
            </>
          ) : (
            <>
              {grouped.map(([date, list]) => (
                <div key={date} className="space-y-2">
                  <div className="text-[11px] sm:text-xs text-slate-400">
                    {moment(date).format("MMM D, YYYY")}
                  </div>
                  {list.map(renderCollectionRow)}
                </div>
              ))}
              {status === "succeeded" && items.length === 0 && (
                <div className="text-[11px] sm:text-xs text-slate-400">
                  No collections yet.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <button
        className="w-full rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 text-neutral-900 font-medium
                   px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base
                   shadow-[0_0_0_1px_rgba(255,255,255,.25),0_10px_28px_rgba(16,185,129,.35)]
                   hover:brightness-110 active:scale-[.99] transition"
        onClick={() => setNewColOpen(true)}
      >
        + New Collection
      </button>

      <div className="h-px bg-white/10" />

      <div className="space-y-1">
        <div className="font-semibold text-sm sm:text-base">Credits</div>
        <div className="text-slate-300 text-sm sm:text-base">
          {credits || 0}
        </div>
      </div>

      <NewCollectionModal
        isOpen={newColOpen}
        onClose={() => setNewColOpen(false)}
        onCreated={() => setNewColOpen(false)}
      />
    </div>
  );
}
