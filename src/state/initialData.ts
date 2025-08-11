import type { Config, Workstation, EntityItem } from "./types";
import { uid } from "../utils/uid";

/** Config iniziale (etichette + attributi dinamici) */
export const initialConfig: Config = {
  entityLabelSingular: "Oggetto",
  entityLabelPlural: "Oggetti",
  attributes: [
    { key: "weightKg", label: "Peso (kg)", type: "number" },
    { key: "isClean", label: "Pulito", type: "boolean" },
    { key: "material", label: "Materiale", type: "select", options: ["Acciaio", "Plastica", "Carta"] },
  ],
};

/** Stazioni di lavoro iniziali */
export const initialWorkstations: Workstation[] = [
  { id: uid(), name: "Lavaggio", description: "Pulisce i pezzi" },
  { id: uid(), name: "Riempimento", description: "Riempie i contenitori" },
  { id: uid(), name: "Sigillatura", description: "Chiude/sigilla" },
];

/** Entità iniziali */
export const initialEntities: EntityItem[] = [
  {
    id: uid(),
    name: "Fusto A",
    description: "Primo lotto",
    workstationId: null,
    attrs: { weightKg: 12.5, isClean: false, material: "Acciaio" },
  },
];

/**
 * Nota per futuro backend:
 * - potrai caricare i dati reali e, se assenti, fallback su questi mock.
 * - se il backend fornisce gli ID, evita l'uso di uid() in fase di idratazione.
 */
