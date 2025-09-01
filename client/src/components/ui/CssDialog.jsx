import { useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * Dark / glass dialog
 * Props:
 *  - open          : boolean
 *  - onOpenChange  : (bool) => void
 *  - title         : string | node
 *  - footer        : node
 *  - panelClassName, bodyClassName : optional class overrides
 */
export default function CssDialog({
  open,
  onOpenChange,
  title,
  footer,
  panelClassName = "",
  bodyClassName = "",
  children,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onOpenChange?.(false);
    document.addEventListener("keydown", onKey);
    // lock scroll behind modal
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const node = (
    <div
      className="fixed inset-0 z-[1000] grid place-items-center"
      onClick={() => onOpenChange?.(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Panel */}
      <div
        className={`
          relative w-[min(92vw,520px)] rounded-3xl border border-white/10 bg-white/5 text-slate-100
          shadow-[0_0_0_1px_rgba(255,255,255,.06),0_20px_60px_rgba(0,0,0,.5)]
          backdrop-blur-xl
          before:content-[''] before:absolute before:-inset-px before:rounded-[inherit]
          before:bg-[radial-gradient(90%_60%_at_-10%_-10%,rgba(168,85,247,.25),transparent_40%),radial-gradient(90%_60%_at_110%_-10%,rgba(20,184,166,.25),transparent_40%)]
          before:pointer-events-none before:blur-2xl
          after:content-[''] after:absolute after:inset-0 after:rounded-[inherit]
          after:bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,.08)_20%,rgba(255,255,255,.02)_60%,transparent_100%)]
          after:[mask-image:linear-gradient(to_bottom,white,transparent)]
          after:pointer-events-none
          ${panelClassName}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="text-base font-semibold">{title}</div>
          <button
            className="h-9 w-9 grid place-items-center rounded-lg hover:bg-white/10"
            onClick={() => onOpenChange?.(false)}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className={`px-5 py-4 ${bodyClassName}`}>{children}</div>

        <div className="px-5 py-4 border-t border-white/10 flex justify-end gap-2">
          {footer}
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
