import type { ReactNode } from "react";

export function Badge({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur px-3 py-1.5 text-xs font-bold text-slate-700 shadow-md">
      {icon}
      {children}
    </span>
  );
}
