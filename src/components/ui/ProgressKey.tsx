import { KeyRound } from "lucide-react";

export function ProgressKey({ collected, total }: { collected: number; total: number }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur px-3 py-2 shadow-md">
      <KeyRound
        size={18}
        className={collected >= total ? "text-amber-500 animate-key-glow" : "text-slate-400"}
      />
      <div className="flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full transition-colors ${
              i < collected ? "bg-amber-400" : "bg-slate-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
