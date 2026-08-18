/**
 * The closeness meter for the adult roles — deliberately unlabelled.
 *
 * It carries no title, no number and no tooltip, and the icon is a soft glow rather
 * than a heart. That is the point: the moment a player reads it as "how much your child
 * loves you", the game stops measuring how they actually react and starts measuring how
 * well they can farm a score. Unnamed, it just quietly warms or cools, and most players
 * only work out afterwards what it was tracking.
 */
export function ClosenessMeter({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  // warm and full when things are good, pale and thin when the relationship has cooled
  const fill =
    pct >= 66 ? "from-rose-400 to-pink-400" : pct >= 33 ? "from-amber-300 to-orange-300" : "from-slate-300 to-slate-400";
  const glow = pct >= 66 ? "bg-rose-400" : pct >= 33 ? "bg-amber-300" : "bg-slate-300";

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur px-2.5 py-2 shadow-md">
      <span className={`h-2.5 w-2.5 rounded-full ${glow} transition-colors duration-700`} />
      <span className="relative block h-1.5 w-12 overflow-hidden rounded-full bg-slate-200">
        <span
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${fill} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </span>
    </div>
  );
}
