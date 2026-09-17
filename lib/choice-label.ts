/** Player-facing choice copy. Axis tags stay in JSON for routing tests. */

const AXIS_PREFIX = /^(接招|圆场|躲开)\s*[：:]\s*/;
const HEARTS = /[♥♡]/g;

export function playerFacingChoiceText(text: string): string {
  const stripped = text.replace(AXIS_PREFIX, "").replace(HEARTS, "").trim();
  return stripped || text.replace(HEARTS, "").trim();
}

export function isChoiceAxisLabel(text: string): boolean {
  return AXIS_PREFIX.test(text);
}
