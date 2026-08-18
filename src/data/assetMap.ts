import type { PlayerGender, Role } from "../types";

export type CharacterKey = "teacher_male" | "teacher_female" | "father" | "mother" | "student_boy" | "student_girl";
export type SceneKey =
  | "classroom"
  | "exam_room"
  | "school_gate"
  | "hallway_yard"
  | "teachers_lounge"
  | "living_room"
  | "bedroom_desk"
  | "dining_table"
  | "hallway"
  | "front_door"
  | "group_work"
  // the same classroom at three times of day — see classroomForTime
  | "classroom_morning"
  | "classroom_noon"
  | "classroom_evening"
  // second angle on a room the week keeps returning to — see VARIANTS
  | "living_room_2"
  | "bedroom_2"
  | "school_gate_2";

export const CHARACTER_IMAGES: Record<CharacterKey, string> = {
  teacher_male: "/images/characters/teacher_male.png",
  teacher_female: "/images/characters/teacher_female.png",
  father: "/images/characters/father.png",
  mother: "/images/characters/mother.png",
  student_boy: "/images/characters/student_boy.png",
  student_girl: "/images/characters/student_girl.png",
};

// "shocked" has no dedicated art (unused in the actual game flow — see
// SituationScreen.tsx's STYLE_REACTION, which maps to angry instead), so it's left out
// here and always falls back to the base pose + emoji badge in CharacterPortrait.
// Paths are spelled out as literal strings (not built via template-literal
// concatenation) on purpose — inline.cjs/build-artifact.cjs inline every image into the
// exported artifact/standalone HTML by exact-matching these path strings inside the
// built JS bundle; a computed `${key}_${mood}.png` template survives as separate
// concatenation ops after bundling, not as one matchable literal, so the image-inlining
// step would silently skip every one of these (learned this the hard way — see chat).
export type CharacterMood = "idle" | "talking" | "happy" | "sad" | "shocked" | "angry";

/** one drawn pose per mood per character, replacing the old single-pose + badge/filter
 *  fake-emotion system */
export const CHARACTER_MOOD_IMAGES: Record<CharacterKey, Partial<Record<CharacterMood, string>>> = {
  teacher_male: {
    idle: "/images/characters/teacher_male_idle.png",
    talking: "/images/characters/teacher_male_talking.png",
    happy: "/images/characters/teacher_male_happy.png",
    angry: "/images/characters/teacher_male_angry.png",
    sad: "/images/characters/teacher_male_sad.png",
  },
  teacher_female: {
    idle: "/images/characters/teacher_female_idle.png",
    talking: "/images/characters/teacher_female_talking.png",
    happy: "/images/characters/teacher_female_happy.png",
    angry: "/images/characters/teacher_female_angry.png",
    sad: "/images/characters/teacher_female_sad.png",
  },
  father: {
    idle: "/images/characters/father_idle.png",
    talking: "/images/characters/father_talking.png",
    happy: "/images/characters/father_happy.png",
    angry: "/images/characters/father_angry.png",
    sad: "/images/characters/father_sad.png",
  },
  mother: {
    idle: "/images/characters/mother_idle.png",
    talking: "/images/characters/mother_talking.png",
    happy: "/images/characters/mother_happy.png",
    angry: "/images/characters/mother_angry.png",
    sad: "/images/characters/mother_sad.png",
  },
  student_boy: {
    idle: "/images/characters/student_boy_idle.png",
    talking: "/images/characters/student_boy_talking.png",
    happy: "/images/characters/student_boy_happy.png",
    angry: "/images/characters/student_boy_angry.png",
    sad: "/images/characters/student_boy_sad.png",
  },
  student_girl: {
    idle: "/images/characters/student_girl_idle.png",
    talking: "/images/characters/student_girl_talking.png",
    happy: "/images/characters/student_girl_happy.png",
    angry: "/images/characters/student_girl_angry.png",
    sad: "/images/characters/student_girl_sad.png",
  },
};

export function hasMoodArt(charKey: CharacterKey, mood: CharacterMood): boolean {
  return CHARACTER_MOOD_IMAGES[charKey][mood] !== undefined;
}

/** the image to actually render for a given character + mood, falling back to the
 *  character's single base pose if that particular mood has no dedicated art yet */
export function getCharacterImage(charKey: CharacterKey, mood: CharacterMood): string {
  return CHARACTER_MOOD_IMAGES[charKey][mood] ?? CHARACTER_IMAGES[charKey];
}

// JPEG rather than PNG: these are opaque full-bleed backdrops, so alpha buys nothing
// and the format costs a third of the bytes over the whole set
export const SCENE_IMAGES: Record<SceneKey, string> = {
  classroom: "/images/scenes/classroom.jpg",
  exam_room: "/images/scenes/exam_room.jpg",
  school_gate: "/images/scenes/school_gate.jpg",
  hallway_yard: "/images/scenes/hallway_yard.jpg",
  teachers_lounge: "/images/scenes/teachers_lounge.jpg",
  living_room: "/images/scenes/living_room.jpg",
  bedroom_desk: "/images/scenes/bedroom_desk.jpg",
  dining_table: "/images/scenes/dining_table.jpg",
  hallway: "/images/scenes/hallway.jpg",
  front_door: "/images/scenes/front_door.jpg",
  group_work: "/images/scenes/group_work.jpg",
  classroom_morning: "/images/scenes/classroom_morning.jpg",
  classroom_noon: "/images/scenes/classroom_noon.jpg",
  classroom_evening: "/images/scenes/classroom_evening.jpg",
  living_room_2: "/images/scenes/living_room_2.jpg",
  bedroom_2: "/images/scenes/bedroom_2.jpg",
  school_gate_2: "/images/scenes/school_gate_2.jpg",
};



/** the player's own look: their chosen gender crossed with the role they're embodying */
export const PLAYER_CHARACTER_BY_GENDER: Record<PlayerGender, Record<Role, CharacterKey>> = {
  male: { student: "student_boy", parent: "father", teacher: "teacher_male" },
  female: { student: "student_girl", parent: "mother", teacher: "teacher_female" },
};

/** fallback look, used where no gender is known yet (role-picker previews, cover art) */
export const PLAYER_CHARACTER_KEY: Record<Role, CharacterKey> = PLAYER_CHARACTER_BY_GENDER.female;

export function playerCharacterKey(role: Role, gender: PlayerGender | undefined): CharacterKey {
  return PLAYER_CHARACTER_BY_GENDER[gender ?? "female"][role];
}

const OPPOSITE_SEX: Record<CharacterKey, CharacterKey> = {
  student_boy: "student_girl",
  student_girl: "student_boy",
  father: "mother",
  mother: "father",
  teacher_male: "teacher_female",
  teacher_female: "teacher_male",
};

// an honorific or kinship word states the person's gender in their own name, so these
// are never re-cast — "Cô Hạnh" cannot quietly turn into a man to avoid a clash
const GENDERED_TITLE = /^(Cô|Thầy|Mẹ|Bố|Ba|Bà|Ông|Chị|Anh|Dì|Chú|Cậu)\s/;

/** Two people standing in the same frame must not be the identical drawing. With only
 *  six sprites and a player who now picks their own, an NPC can land on exactly the
 *  player's art — the Sao đỏ next to a boy player was both boys. Re-cast the NPC as the
 *  other-gender version of the same type when that happens, unless their name pins their
 *  gender (see GENDERED_TITLE), in which case the collision is impossible anyway since
 *  those are always adults facing a student. */
export function castAlongside(name: string, playerKey: CharacterKey): CharacterKey {
  const key = getCharacterKey(name);
  if (key !== playerKey || GENDERED_TITLE.test(cleanName(name))) return key;
  return OPPOSITE_SEX[key];
}

// every NPC name used across the 3 roles' situations/beats, mapped to one of the 6 reusable portraits
const NPC_CHARACTER_MAP: Record<string, CharacterKey> = {
  "Thầy Minh": "teacher_male",
  "Cô Hạnh": "teacher_female",
  "Lan": "student_girl",
  "Thầy Đức": "teacher_male",
  "Mẹ": "mother",
  "Bố": "father",
  "Đăng": "student_boy",
  "Chi": "student_girl",
  "Trang": "student_girl",
  "Hùng": "student_boy",
  "Giám thị": "teacher_male",
  "Một bạn học sinh": "student_boy",
  "Bo": "student_boy",
  "An": "student_girl",
  "Cô chủ nhiệm": "teacher_female",
  "Khang": "student_boy",
  "Hoa": "student_girl",
  "Tuấn": "student_boy",
  "Minh và Long": "student_boy",
  "Vy": "student_girl",
  "Đạt": "student_boy",
  "Ngọc": "student_girl",
  "Bình": "student_boy",
  "Hải": "student_boy",
  "Kiên": "student_boy",
  "Phụ huynh bạn Lâm": "mother",
  "Thảo": "student_girl",
  // student-role situations (st1-st20)
  "Cô Vân": "teacher_female",
  "Cô Hiệu": "teacher_female",
  "Thầy Hòa": "teacher_male",
  "Bạn Kỳ": "student_boy",
  "Cô Yến": "teacher_female",
  // teacher-role situations (te1-te20)
  "Nam": "student_boy",
  "My": "student_girl",
  "Trâm": "student_girl",
  "Việt": "student_boy",
  "Khoa": "student_boy",
  "Lâm": "student_boy",
  "Phương": "student_girl",
  "Quân": "student_boy",
  "Trúc": "student_girl",
  "Đăng và Chi": "student_boy",
};

const STUDENT_FALLBACKS: CharacterKey[] = ["student_boy", "student_girl"];

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function cleanName(name: string) {
  return name.replace(/\s*\(.*\)\s*$/, "").trim();
}

/** resolves any NPC/speaker name to one of the 6 reusable character portraits */
export function getCharacterKey(name: string): CharacterKey {
  const clean = cleanName(name);
  const mapped = NPC_CHARACTER_MAP[clean];
  if (mapped) return mapped;
  return STUDENT_FALLBACKS[hashString(clean) % STUDENT_FALLBACKS.length];
}

// every `location` string used across the 3 roles' situations, mapped to a reusable scene
const LOCATION_SCENE_MAP: Record<string, SceneKey> = {
  "Lớp học — làm bài nhóm": "group_work",
  "Lớp học": "classroom",
  "Lớp 8A": "classroom",
  "Lớp 8A, tiết đầu giờ chiều": "classroom",
  "Phòng thi": "exam_room",
  "Phòng thi giữa kỳ": "exam_room",
  "Cổng trường": "school_gate",
  "Cổng sau trường": "school_gate",
  "Hành lang lớp học": "hallway",
  "Sân trường giờ ra chơi": "hallway_yard",
  "Phòng giáo viên": "teachers_lounge",
  "Phòng khách": "living_room",
  "Cửa nhà": "front_door",
  "Cuộc gọi với cô giáo": "living_room",
  "Tin nhắn phụ huynh": "living_room",
  "Phòng ngủ": "bedroom_desk",
  "Phòng con": "bedroom_desk",
  "Bàn học": "bedroom_desk",
  "Bàn ăn": "dining_table",
};

// The classroom holds 22 of the 60 situations, spread from 07:30 to 17:00 — one photo
// for all of them meant a 17:00 scene lit like breakfast. Same room, same angle, three
// lighting passes, picked off the situation clock.
function classroomForTime(time: string | undefined): SceneKey {
  const hour = Number.parseInt(time?.split(":")[0] ?? "", 10);
  if (Number.isNaN(hour)) return "classroom_noon";
  if (hour < 10) return "classroom_morning";
  if (hour < 15) return "classroom_noon";
  return "classroom_evening";
}

// rooms the week keeps coming back to, which now have a second angle to alternate with
const VARIANTS: Partial<Record<SceneKey, SceneKey>> = {
  living_room: "living_room_2",
  bedroom_desk: "bedroom_2",
  school_gate: "school_gate_2",
};

/** resolves a situation to its background: its location, then the time of day for the
 *  classroom, then a stable per-situation choice between a room's two angles. Keyed off
 *  the situation id rather than at random so revisiting one shows the same room twice. */
export function getSceneKey(location: string, context: "school" | "home", time?: string, seed?: string): SceneKey {
  const base = LOCATION_SCENE_MAP[location] ?? (context === "school" ? "classroom" : "living_room");
  if (base === "classroom") return classroomForTime(time);
  const variant = VARIANTS[base];
  if (variant && seed && hashString(seed) % 2 === 1) return variant;
  return base;
}
