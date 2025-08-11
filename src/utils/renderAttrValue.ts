import type { AttributeDef } from "../state/types";

/**
 * Format attribute value for display in tables or read-only views.
 * Keep pure (no JSX) so it's easy to unit test.
 */
export function renderAttrValue(def: AttributeDef, v: unknown): string {
  if (v === undefined || v === null || v === "") return "-";

  switch (def.type) {
    case "boolean":
      return v ? "Sì" : "No";
    case "number": {
      // Show as-is; customize here for locale/decimals if needed
      return typeof v === "number" ? String(v) : String(Number(v));
    }
    case "select":
    case "text":
    default:
      return String(v);
  }
}

export default renderAttrValue;
