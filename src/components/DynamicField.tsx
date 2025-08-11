import { NumberInput, Select, SelectItem, TextInput } from "@tremor/react";
import type { AttributeDef } from "../state/types";

interface DynamicFieldProps {
  def: AttributeDef;
  value: unknown;
  onChange: (v: unknown) => void;
  placeholderOverride?: string;
  disabled?: boolean;
}

/**
 * Render a form control based on the AttributeDef type.
 * - number -> <NumberInput>
 * - boolean -> <Select> with true/false
 * - select -> <Select> with provided options
 * - text (default) -> <TextInput>
 */
export function DynamicField({
  def,
  value,
  onChange,
  placeholderOverride,
  disabled,
}: DynamicFieldProps) {
  const placeholder = placeholderOverride ?? def.label;

  switch (def.type) {
    case "number":
      return (
        <NumberInput
          placeholder={placeholder}
          value={typeof value === "number" ? value : undefined}
          onValueChange={(v) => onChange(typeof v === "number" ? v : undefined)}
          disabled={disabled}
        />
      );

    case "boolean": {
      const strValue = value === true ? "true" : value === false ? "false" : "";
      return (
        <Select value={strValue} onValueChange={(v) => onChange(v === "true")} disabled={disabled}>
          <SelectItem value="">--</SelectItem>
          <SelectItem value="true">Sì</SelectItem>
          <SelectItem value="false">No</SelectItem>
        </Select>
      );
    }

    case "select":
      return (
        <Select value={(value as string) ?? ""} onValueChange={onChange} disabled={disabled}>
          <SelectItem value="">--</SelectItem>
          {(def.options ?? []).map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </Select>
      );

    case "text":
    default:
      return (
        <TextInput
          placeholder={placeholder}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      );
  }
}

export default DynamicField;
