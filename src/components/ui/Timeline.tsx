import { Clock, MapPin } from "lucide-react";
import type { ScheduleItem } from "../../types";

export function Timeline({ items }: { items: ScheduleItem[] }) {
  return (
    <ol className="relative border-l-2 border-blue-100 pl-5 space-y-5">
      {items.map((item, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-blue-400 ring-4 ring-blue-50" />
          <div className="flex items-center gap-2 text-xs font-bold text-blue-500">
            <Clock size={13} />
            {item.time}
            <span className="text-slate-300">•</span>
            <MapPin size={13} />
            {item.location}
          </div>
          <p className="mt-0.5 text-sm font-semibold text-slate-800">{item.title}</p>
          {item.caption && <p className="text-xs text-slate-400 mt-0.5">{item.caption}</p>}
        </li>
      ))}
    </ol>
  );
}
