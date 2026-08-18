import type { Letter } from "../types";

const PREFIX = "MRLN-";

function toBase64Unicode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Unicode(b64: string): string {
  const normalized = b64.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function encodeLetter(letter: Letter): string {
  const json = JSON.stringify(letter);
  return PREFIX + toBase64Unicode(json);
}

export function decodeLetter(code: string): Letter | null {
  const trimmed = code.trim();
  if (!trimmed.startsWith(PREFIX)) return null;
  try {
    const json = fromBase64Unicode(trimmed.slice(PREFIX.length));
    const parsed = JSON.parse(json);
    if (
      typeof parsed === "object" &&
      parsed &&
      typeof parsed.message === "string" &&
      typeof parsed.templateId === "string" &&
      typeof parsed.toWhom === "string"
    ) {
      return parsed as Letter;
    }
    return null;
  } catch {
    return null;
  }
}

/** accepts either a raw MRLN- code or a pasted full share link and pulls out the code */
export function extractLetterCode(input: string): string {
  const trimmed = input.trim();
  const hashIdx = trimmed.indexOf("#letter=");
  if (hashIdx !== -1) {
    try {
      return decodeURIComponent(trimmed.slice(hashIdx + "#letter=".length));
    } catch {
      return trimmed.slice(hashIdx + "#letter=".length);
    }
  }
  const codeIdx = trimmed.indexOf(PREFIX);
  if (codeIdx !== -1) return trimmed.slice(codeIdx);
  return trimmed;
}

/** the shareable link a recipient can click to open the letter directly, no code to paste */
export function buildLetterLink(code: string): string {
  return `${window.location.origin}${window.location.pathname}#letter=${encodeURIComponent(code)}`;
}

/** reads a `#letter=<code>` fragment from the current URL, if present */
export function letterCodeFromHash(): string | null {
  const hash = window.location.hash;
  if (!hash.startsWith("#letter=")) return null;
  return decodeURIComponent(hash.slice("#letter=".length));
}

export function newLetterId(): string {
  return `L${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
