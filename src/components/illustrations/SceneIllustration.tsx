import { SCENE_IMAGES, getSceneKey } from "../../data/assetMap";

interface Props {
  location: string;
  context: "school" | "home";
  /** the situation clock ("16:30"), so a late-afternoon scene is lit like one */
  time?: string;
  /** situation id — keeps a room that has two angles on the same one every visit */
  seed?: string;
  className?: string;
}

/** real scene art, picked from the photo set by the situation's location. Every backdrop
 *  is a supplied image — nothing here is drawn in code. A slow Ken Burns zoom keeps the
 *  still from reading as a flat, lifeless poster. To add a new backdrop: drop the file in
 *  public/images/scenes/, add it to SCENE_IMAGES, and point the location at it in
 *  LOCATION_SCENE_MAP (both in data/assetMap.ts). */
export function SceneIllustration({ location, context, time, seed, className = "" }: Props) {
  const sceneKey = getSceneKey(location, context, time, seed);
  // the gradient is a safety net, not decoration: when a backdrop fails to draw — an old
  // renderer, a machine that cannot hold the texture — what showed through was the black
  // of the screen behind, and the characters looked like they were floating in a void
  return (
    <div className={`overflow-hidden bg-gradient-to-b from-sky-200 via-sky-100 to-slate-300 ${className}`}>
      <img src={SCENE_IMAGES[sceneKey]} alt="" className="h-full w-full object-cover animate-scene-kenburns" />
    </div>
  );
}
