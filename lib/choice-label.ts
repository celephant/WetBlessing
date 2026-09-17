/** Player-facing choice copy. Axis tags stay in JSON for routing tests. */

const AXIS_PREFIX = /^(接招|圆场|躲开)\s*[：:]\s*/;
const HEARTS = /[♥♡]/g;

export type ChoiceFace = {
  bark: string;
  hint: string | null;
};

export function playerFacingChoiceText(text: string): string {
  const stripped = text.replace(AXIS_PREFIX, "").replace(HEARTS, "").trim();
  return stripped || text.replace(HEARTS, "").trim();
}

export function isChoiceAxisLabel(text: string): boolean {
  return AXIS_PREFIX.test(text);
}

/**
 * Chip face: a short Stage-1 bark, then an optional whisper hint.
 * Quoted barks keep the closing 「」 (and a trailing 。) together.
 */
export function splitChoiceFace(text: string): ChoiceFace {
  const face = playerFacingChoiceText(text);
  if (!face) return { bark: face, hint: null };

  if (face.startsWith("「")) {
    const close = face.indexOf("」");
    if (close >= 0) {
      let end = close + 1;
      if (face[end] === "。") end += 1;
      const bark = face.slice(0, end).trim();
      const hint = face.slice(end).trim();
      return { bark, hint: hint || null };
    }
  }

  const first = face.indexOf("。");
  if (first >= 0 && first < face.length - 1) {
    const bark = face.slice(0, first + 1).trim();
    const hint = face.slice(first + 1).trim();
    return { bark, hint: hint || null };
  }
  return { bark: face, hint: null };
}
