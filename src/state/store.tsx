import React, { createContext, useContext, useMemo, useReducer } from "react";
import type {
  Config,
  Workstation,
  EntityItem,
  StatusMatrix,
  StepStatus,
  WorkstationId,
  EntityId,
  AttributeDef,
} from "./types";
import { initialConfig, initialWorkstations, initialEntities } from "./initialData";

/** ---------- State ---------- */
interface AppState {
  config: Config;
  workstations: Workstation[];
  entities: EntityItem[];
  statuses: StatusMatrix; // entityId -> stationId -> status
}

const initialState: AppState = {
  config: initialConfig,
  workstations: initialWorkstations,
  entities: initialEntities,
  statuses: {},
};

/** ---------- Actions ---------- */
type Action =
  | { type: "CONFIG/SET_LABELS"; payload: { singular: string; plural: string } }
  | { type: "ATTR/ADD"; payload: AttributeDef }
  | { type: "ATTR/REMOVE"; payload: { key: string } }
  | { type: "WS/ADD"; payload: { ws: Workstation } }
  | { type: "WS/REMOVE"; payload: { id: WorkstationId } }
  | { type: "WS/MOVE"; payload: { id: WorkstationId; dir: "up" | "down" } }
  | { type: "ENTITY/ADD"; payload: { entity: EntityItem } }
  | { type: "ENTITY/DELETE"; payload: { id: EntityId } }
  | { type: "ENTITY/SET_WS"; payload: { id: EntityId; workstationId: WorkstationId | null } }
  | { type: "MATRIX/TOGGLE"; payload: { entityId: EntityId; stationId: WorkstationId } };

function cycleStatus(current: StepStatus): StepStatus {
  if (current === null || current === undefined) return "pass";
  if (current === "pass") return "fail";
  return null;
}

/** Utility to immutably move an item in array */
function moveItem<T>(arr: T[], index: number, target: number): T[] {
  if (index < 0 || index >= arr.length) return arr;
  if (target < 0 || target >= arr.length) return arr;
  const copy = [...arr];
  const [item] = copy.splice(index, 1);
  copy.splice(target, 0, item);
  return copy;
}

/** ---------- Reducer ---------- */
function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "CONFIG/SET_LABELS": {
      const { singular, plural } = action.payload;
      return {
        ...state,
        config: { ...state.config, entityLabelSingular: singular, entityLabelPlural: plural },
      };
    }

    case "ATTR/ADD": {
      const def = action.payload;
      // prevent duplicate keys
      if (state.config.attributes.some(a => a.key === def.key)) return state;
      return {
        ...state,
        config: { ...state.config, attributes: [...state.config.attributes, def] },
      };
    }

    case "ATTR/REMOVE": {
      const { key } = action.payload;
      // remove from config + strip from all entities
      const newAttributes = state.config.attributes.filter(a => a.key !== key);
      const newEntities = state.entities.map(e => {
        const { [key]: _drop, ...rest } = e.attrs;
        return { ...e, attrs: rest };
      });
      return { ...state, config: { ...state.config, attributes: newAttributes }, entities: newEntities };
    }

    case "WS/ADD": {
      const { ws } = action.payload;
      return { ...state, workstations: [...state.workstations, ws] };
    }

    case "WS/REMOVE": {
      const { id } = action.payload;
      const workstations = state.workstations.filter(w => w.id !== id);
      // detach from entities
      const entities = state.entities.map(e => (e.workstationId === id ? { ...e, workstationId: null } : e));
      // drop column from matrix
      const statuses: StatusMatrix = {};
      for (const [eid, row] of Object.entries(state.statuses)) {
        const { [id]: _drop, ...rest } = row;
        statuses[eid] = rest;
      }
      return { ...state, workstations, entities, statuses };
    }

    case "WS/MOVE": {
      const { id, dir } = action.payload;
      const idx = state.workstations.findIndex(w => w.id === id);
      if (idx === -1) return state;
      const target = dir === "up" ? idx - 1 : idx + 1;
      return { ...state, workstations: moveItem(state.workstations, idx, target) };
    }

    case "ENTITY/ADD": {
      const { entity } = action.payload;
      return {
        ...state,
        entities: [...state.entities, entity],
        statuses: { ...state.statuses, [entity.id]: { ...(state.statuses[entity.id] ?? {}) } },
      };
    }

    case "ENTITY/DELETE": {
      const { id } = action.payload;
      const entities = state.entities.filter(e => e.id !== id);
      const { [id]: _drop, ...rest } = state.statuses;
      return { ...state, entities, statuses: rest };
    }

    case "ENTITY/SET_WS": {
      const { id, workstationId } = action.payload;
      return {
        ...state,
        entities: state.entities.map(e => (e.id === id ? { ...e, workstationId } : e)),
      };
    }

    case "MATRIX/TOGGLE": {
      const { entityId, stationId } = action.payload;
      const currentRow = state.statuses[entityId] ?? {};
      const next = cycleStatus(currentRow[stationId] ?? null);
      return {
        ...state,
        statuses: { ...state.statuses, [entityId]: { ...currentRow, [stationId]: next } },
      };
    }

    default:
      return state;
  }
}

/** ---------- Context & Provider ---------- */
const AppStoreContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
  // convenience actions as functions (nicer DX)
  actions: ReturnType<typeof buildActions>;
} | null>(null);

/** Build typed action creators to expose a friendly API */
function buildActions(dispatch: React.Dispatch<Action>) {
  return {
    // config
    setEntityLabels: (singular: string, plural: string) =>
      dispatch({ type: "CONFIG/SET_LABELS", payload: { singular, plural } }),

    addAttribute: (def: AttributeDef) => dispatch({ type: "ATTR/ADD", payload: def }),
    removeAttribute: (key: string) => dispatch({ type: "ATTR/REMOVE", payload: { key } }),

    // workstations
    addWorkstation: (ws: Workstation) => dispatch({ type: "WS/ADD", payload: { ws } }),
    removeWorkstation: (id: WorkstationId) => dispatch({ type: "WS/REMOVE", payload: { id } }),
    moveWorkstationUp: (id: WorkstationId) => dispatch({ type: "WS/MOVE", payload: { id, dir: "up" } }),
    moveWorkstationDown: (id: WorkstationId) => dispatch({ type: "WS/MOVE", payload: { id, dir: "down" } }),

    // entities
    addEntity: (entity: EntityItem) => dispatch({ type: "ENTITY/ADD", payload: { entity } }),
    deleteEntity: (id: EntityId) => dispatch({ type: "ENTITY/DELETE", payload: { id } }),
    setEntityWorkstation: (id: EntityId, workstationId: WorkstationId | null) =>
      dispatch({ type: "ENTITY/SET_WS", payload: { id, workstationId } }),

    // matrix
    toggleMatrixCell: (entityId: EntityId, stationId: WorkstationId) =>
      dispatch({ type: "MATRIX/TOGGLE", payload: { entityId, stationId } }),
  };
}

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const actions = useMemo(() => buildActions(dispatch), [dispatch]);
  const value = useMemo(() => ({ state, dispatch, actions }), [state, dispatch, actions]);

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

/** Hook to consume the store */
export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore must be used within <AppStoreProvider>");
  return ctx;
}
