// src/pages/WorkAreaPage.jsx
import Sidebar from "../components/Sidebar";
import TaskList from "../components/TaskList";
import { useNavigate } from "react-router-dom";
import { FiMessageSquare, FiClock, FiMenu, FiX } from "react-icons/fi";
import { useEffect, useState } from "react";
import FocusTimerDialog from "../components/FocusTimerDialog";

export default function WorkAreaPage() {
  const nav = useNavigate();
  const [timerOpen, setTimerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (sidebarOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [sidebarOpen]);

  return (
    <div className="relative h-screen overflow-hidden bg-[#0b1220] text-slate-100">
      <div
        className="pointer-events-none absolute inset-0 -z-10
        [background:
          radial-gradient(900px_400px_at_-10%_-10%,rgba(168,85,247,.25),transparent_55%),
          radial-gradient(800px_360px_at_110%_-10%,rgba(20,184,166,.18),transparent_55%),
          radial-gradient(500px_400px_at_30%_120%,rgba(99,102,241,.18),transparent_55%)]"
      />

      {/* ≥ md */}
      <div className="hidden md:flex h-full">
        <div className="w-[320px] shrink-0 overflow-hidden border-r border-white/10 bg-white/[.04] backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,.03),0_10px_40px_rgba(0,0,0,.45)]">
          <Sidebar />
        </div>

        <div className="relative flex-1 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6">
            <TaskList />
          </div>

          <button
            className="fixed bottom-6 right-24 h-11 w-11 sm:h-12 sm:w-12 grid place-items-center rounded-full
                       bg-gradient-to-br from-indigo-400 to-cyan-400 text-neutral-900
                       shadow-[0_0_0_1px_rgba(255,255,255,.25),0_14px_40px_rgba(99,102,241,.45)]
                       hover:brightness-110 active:scale-95 transition text-base sm:text-lg"
            title="Focus Timer"
            aria-label="Focus Timer"
            onClick={() => setTimerOpen(true)}
          >
            <FiClock />
          </button>

          <button
            className="fixed bottom-6 right-6 h-11 w-11 sm:h-12 sm:w-12 grid place-items-center rounded-full
                       bg-gradient-to-br from-emerald-400 to-fuchsia-500 text-neutral-900
                       shadow-[0_0_0_1px_rgba(255,255,255,.25),0_14px_40px_rgba(99,102,241,.45)]
                       hover:brightness-110 active:scale-95 transition text-base sm:text-lg"
            title="AI Chat"
            aria-label="AI Chat"
            onClick={() => nav("/ai")}
          >
            <FiMessageSquare />
          </button>
        </div>
      </div>

      {/* < md */}
      <div className="md:hidden flex h-full flex-col">
        <div className="h-12 sm:h-14 flex items-center justify-between px-3 sm:px-4 border-b border-white/10 bg-white/[.04] backdrop-blur-xl">
          <button
            className="h-9 w-9 sm:h-10 sm:w-10 grid place-items-center rounded-lg hover:bg-white/10"
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            onClick={() => setSidebarOpen((v) => !v)}
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
          <div className="text-[13px] sm:text-sm text-slate-300">Work</div>
          <div className="w-9 sm:w-10" />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4">
          <TaskList />
        </div>

        <div className="pointer-events-none fixed inset-x-0 bottom-4 flex justify-end gap-3 px-3 sm:px-4">
          <button
            className="pointer-events-auto h-11 w-11 sm:h-12 sm:w-12 grid place-items-center rounded-full
                       bg-gradient-to-br from-indigo-400 to-cyan-400 text-neutral-900
                       shadow-[0_0_0_1px_rgba(255,255,255,.25),0_14px_40px_rgba(99,102,241,.45)]
                       hover:brightness-110 active:scale-95 transition text-base sm:text-lg"
            title="Focus Timer"
            aria-label="Focus Timer"
            onClick={() => setTimerOpen(true)}
          >
            <FiClock />
          </button>
          <button
            className="pointer-events-auto h-11 w-11 sm:h-12 sm:w-12 grid place-items-center rounded-full
                       bg-gradient-to-br from-emerald-400 to-fuchsia-500 text-neutral-900
                       shadow-[0_0_0_1px_rgba(255,255,255,.25),0_14px_40px_rgba(99,102,241,.45)]
                       hover:brightness-110 active:scale-95 transition text-base sm:text-lg"
            title="AI Chat"
            aria-label="AI Chat"
            onClick={() => nav("/ai")}
          >
            <FiMessageSquare />
          </button>
        </div>

        {/* Sidebar overlay */}
        <div
          className={`fixed inset-0 z-40 transition-opacity ${
            sidebarOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          aria-hidden={!sidebarOpen}
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div
            className={`absolute top-0 left-0 h-full w-[86vw] max-w-[320px]
                        border-r border-white/10 bg-white/[.06] backdrop-blur-xl
                        shadow-[0_0_0_1px_rgba(255,255,255,.05),0_20px_60px_rgba(0,0,0,.6)]
                        transition-transform duration-300 ease-out
                        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="h-12 sm:h-14 flex items-center justify-between px-3 sm:px-4 border-b border-white/10">
              <div className="text-[13px] sm:text-sm text-slate-300">Menu</div>
              <button
                className="h-9 w-9 sm:h-10 sm:w-10 grid place-items-center rounded-lg hover:bg-white/10"
                aria-label="Close menu"
                onClick={() => setSidebarOpen(false)}
              >
                <FiX />
              </button>
            </div>

            <div className="h-[calc(100%-48px)] sm:h-[calc(100%-56px)] overflow-y-auto">
              <Sidebar />
            </div>
          </div>
        </div>
      </div>

      <FocusTimerDialog open={timerOpen} onOpenChange={setTimerOpen} />
    </div>
  );
}
