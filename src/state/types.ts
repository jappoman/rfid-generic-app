// Global app types
// Keep these minimal and framework-agnostic. They will be shared across features.

export type AttrType = "text" | "number" | "boolean" | "select";
export type StepStatus = "pass" | "fail" | null;

export interface AttributeDef {
  key: string;
  label: string;
  type: AttrType;
  options?: string[];
}

export interface Config {
  entityLabelSingular: string;
  entityLabelPlural: string;
  attributes: AttributeDef[];
}

export interface Workstation {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface EntityItem {
  id: string;
  name: string;
  description?: string;
  workstationId?: string | null; // current position
  attrs: Record<string, unknown>;
}

// Matrix of statuses: entityId -> stationId -> status
export type StatusMatrix = Record<string, Record<string, StepStatus>>;

// Convenience to express IDs carried around in events/actions
export type EntityId = string;
export type WorkstationId = string;
