import { getCharacterImage, hasMoodArt, type CharacterKey, type CharacterMood } from "../../data/assetMap";

export type { CharacterMood };

interface Props {
  charKey: CharacterKey;
  mood?: CharacterMood;
  className?: string;
}

// only used as a fallback for a character/mood combo with no dedicated pose yet (see
// assetMap.ts) — a small badge + light filter/motion standing in for the missing art
const FALLBACK_BADGE: Partial<Record<CharacterMood, string>> = {
  happy: "😊",
  sad: "😔",
  shocked: "😮",
  angry: "😠",
};
const FALLBACK_FILTER: Partial<Record<CharacterMood, string>> = {
  sad: "grayscale-[35%] opacity-90 translate-y-1",
};
// worth keeping even once real art exists — a little extra motion on top of an
// already-angry pose reads as more urgent, it doesn't fight the artwork
const ALWAYS_EFFECT: Partial<Record<CharacterMood, string>> = {
  angry: "animate-char-shake",
};

// the single-pose fallback images all share this aspect ratio (see public/images/characters/*.png);
// the per-mood art doesn't need this — each file is sized by the browser at its own natural ratio
const FALLBACK_ASPECT = "1023 / 1537";

export function CharacterPortrait({ charKey, mood = "idle", className = "" }: Props) {
  const src = getCharacterImage(charKey, mood);

  if (hasMoodArt(charKey, mood)) {
    return (
      <span className={`relative inline-flex items-end justify-center ${className}`}>
        <img
          src={src}
          alt=""
          className={`h-full w-auto max-w-full object-contain object-bottom transition-all duration-300 ${ALWAYS_EFFECT[mood] ?? ""}`}
        />
      </span>
    );
  }

  const badge = FALLBACK_BADGE[mood];
  const effect = [ALWAYS_EFFECT[mood], FALLBACK_FILTER[mood]].filter(Boolean).join(" ");

  return (
    <span className={`relative inline-flex items-end justify-center ${className}`}>
      {/* matches the fallback image's own aspect ratio, so the badge below can sit right
       *  above the actual head instead of the corner of a wider, letterboxed box */}
      <span className="relative h-full max-w-full" style={{ aspectRatio: FALLBACK_ASPECT }}>
        <img src={src} alt="" className={`h-full w-full object-contain object-bottom transition-all duration-300 ${effect}`} />
        {badge && (
          <span className="animate-pop absolute -top-2 left-1/2 -translate-x-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-base shadow-md ring-2 ring-white">
            {badge}
          </span>
        )}
      </span>
    </span>
  );
}
