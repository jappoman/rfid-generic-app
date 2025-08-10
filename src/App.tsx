import {
  Card, Title, Text, Grid, Button, TextInput, NumberInput,
  TabGroup, TabList, Tab, TabPanels, TabPanel,
  Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell,
  Badge, Select, SelectItem, Flex, BadgeDelta
} from "@tremor/react";
import { useMemo, useState } from "react";

/** ---------- Types ---------- */
type AttrType = "text" | "number" | "boolean" | "select";
type StepStatus = "pass" | "fail" | null;

interface AttributeDef {
  key: string;
  label: string;
  type: AttrType;
  options?: string[];
}

interface Config {
  entityLabelSingular: string;
  entityLabelPlural: string;
  attributes: AttributeDef[];
}

interface Workstation {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

interface EntityItem {
  id: string;
  name: string;
  description?: string;
  workstationId?: string | null; // posizione attuale
  attrs: Record<string, unknown>;
}

/** ---------- Helpers ---------- */
const uid = () => Math.random().toString(36).slice(2, 9);

/** ---------- Initial Mock Data ---------- */
const initialConfig: Config = {
  entityLabelSingular: "Oggetto",
  entityLabelPlural: "Oggetti",
  attributes: [
    { key: "weightKg", label: "Peso (kg)", type: "number" },
    { key: "isClean", label: "Pulito", type: "boolean" },
    { key: "material", label: "Materiale", type: "select", options: ["Acciaio", "Plastica", "Carta"] },
  ],
};

const initialWorkstations: Workstation[] = [
  { id: uid(), name: "Lavaggio", description: "Pulisce i pezzi" },
  { id: uid(), name: "Riempimento", description: "Riempie i contenitori" },
  { id: uid(), name: "Sigillatura", description: "Chiude/sigilla" },
];

const initialEntities: EntityItem[] = [
  {
    id: uid(),
    name: "Fusto A",
    description: "Primo lotto",
    workstationId: null,
    attrs: { weightKg: 12.5, isClean: false, material: "Acciaio" },
  },
];

/** ---------- Campo dinamico ---------- */
function DynamicField({
  def,
  value,
  onChange,
}: {
  def: AttributeDef;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  switch (def.type) {
    case "number":
      return (
        <NumberInput
          placeholder={def.label}
          value={typeof value === "number" ? value : undefined}
          onValueChange={(v) => onChange(typeof v === "number" ? v : undefined)}
        />
      );
    case "boolean":
      return (
        <Select value={value === true ? "true" : value === false ? "false" : ""} onValueChange={(v) => onChange(v === "true")}>
          <SelectItem value="">--</SelectItem>
          <SelectItem value="true">Sì</SelectItem>
          <SelectItem value="false">No</SelectItem>
        </Select>
      );
    case "select":
      return (
        <Select value={(value as string) ?? ""} onValueChange={onChange}>
          <SelectItem value="">--</SelectItem>
          {(def.options ?? []).map((opt) => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </Select>
      );
    default:
      return (
        <TextInput
          placeholder={def.label}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

/** ---------- App ---------- */
export default function App() {
  // config e dati
  const [config, setConfig] = useState<Config>(initialConfig);
  const [workstations, setWorkstations] = useState<Workstation[]>(initialWorkstations);
  const [entities, setEntities] = useState<EntityItem[]>(initialEntities);

  // storico per-matrice: entityId -> stationId -> status
  const [statuses, setStatuses] = useState<Record<string, Record<string, StepStatus>>>({});

  // forms
  const [wsForm, setWsForm] = useState<Partial<Workstation>>({});
  const [attrForm, setAttrForm] = useState<Partial<AttributeDef>>({ type: "text" });
  const [entityForm, setEntityForm] = useState<Partial<EntityItem>>({ attrs: {}, workstationId: "" });

  const entityLabelPlural = config.entityLabelPlural || "Entità";
  const entityLabelSingular = config.entityLabelSingular || "Entità";
  const wsById = useMemo(() => Object.fromEntries(workstations.map(w => [w.id, w])), [workstations]);

  /** ----- Handlers base ----- */
  const addWorkstation = () => {
    if (!wsForm.name) return;
    setWorkstations((prev) => [
      ...prev,
      { id: uid(), name: wsForm.name!, description: wsForm.description, imageUrl: wsForm.imageUrl },
    ]);
    setWsForm({});
  };

  const removeWorkstation = (id: string) => {
    setWorkstations((prev) => prev.filter((w) => w.id !== id));
    // stacca dalle entità
    setEntities((prev) => prev.map(e => e.workstationId === id ? { ...e, workstationId: null } : e));
    // rimuovi colonna dallo storico
    setStatuses((prev) => {
      const copy: typeof prev = {};
      for (const [eid, m] of Object.entries(prev)) {
        const { [id]: _drop, ...rest } = m;
        copy[eid] = rest;
      }
      return copy;
    });
  };

  const moveWorkstation = (id: string, dir: "up" | "down") => {
    setWorkstations(prev => {
      const idx = prev.findIndex(w => w.id === id);
      if (idx === -1) return prev;
      const target = dir === "up" ? idx - 1 : idx + 1;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      copy.splice(target, 0, item);
      return copy;
    });
  };

  const addAttribute = () => {
    if (!attrForm.key || !attrForm.label || !attrForm.type) return;
    if (config.attributes.some(a => a.key === attrForm.key)) return alert("Chiave attributo già esistente.");
    setConfig((c) => ({
      ...c,
      attributes: [...c.attributes, {
        key: attrForm.key!,
        label: attrForm.label!,
        type: attrForm.type as AttrType,
        options: (attrForm.type === "select" ? (attrForm.options ?? []) : undefined) as string[] | undefined,
      }],
    }));
    setAttrForm({ type: "text" });
  };

  const removeAttribute = (key: string) => {
    setConfig((c) => ({ ...c, attributes: c.attributes.filter(a => a.key !== key) }));
    setEntities((prev) => prev.map(e => {
      const { [key]: _drop, ...rest } = e.attrs;
      return { ...e, attrs: rest };
    }));
  };

  const addEntity = () => {
    if (!entityForm.name) return;
    const id = uid();
    setEntities((prev) => [
      ...prev,
      {
        id,
        name: entityForm.name!,
        description: entityForm.description,
        workstationId: (entityForm.workstationId as string) || null,
        attrs: entityForm.attrs || {},
      },
    ]);
    // inizializza riga matrice
    setStatuses((prev) => ({ ...prev, [id]: { ...(prev[id] ?? {}) } }));
    setEntityForm({ attrs: {}, workstationId: "" });
  };

  const deleteEntity = (id: string) => {
    setEntities(prev => prev.filter(e => e.id !== id));
    setStatuses(prev => {
      const { [id]: _drop, ...rest } = prev;
      return rest;
    });
  };

  /** ----- Matrice: toggle cella ----- */
  const cycleStatus = (current: StepStatus): StepStatus => {
    if (current === null || current === undefined) return "pass";
    if (current === "pass") return "fail";
    return null;
  };

  const toggleMatrixCell = (entityId: string, stationId: string) => {
    setStatuses(prev => {
      const row = prev[entityId] ?? {};
      const next = cycleStatus(row[stationId] ?? null);
      return { ...prev, [entityId]: { ...row, [stationId]: next } };
    });
  };

  /** ----- UI ----- */
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Title>RFID Generic App</Title>
      <Text>POC: stazioni di lavoro & {entityLabelPlural} configurabili (mock frontend).</Text>

      <TabGroup>
        <TabList>
          <Tab>Dashboard</Tab>
          <Tab>Workflow</Tab>
          <Tab>Configurator</Tab>
        </TabList>

        <TabPanels>
          {/* ------------ DASHBOARD ------------ */}
          <TabPanel>
            <Grid numItemsSm={3} className="gap-6">
              {/* Stazioni di lavoro */}
              <Card className="sm:col-span-1">
                <Title>Stazioni di lavoro</Title>
                <div className="mt-4 space-y-2">
                  <TextInput
                    placeholder="Nome stazione"
                    value={wsForm.name ?? ""}
                    onChange={(e) => setWsForm((f) => ({ ...f, name: e.target.value }))}
                  />
                  <TextInput
                    placeholder="Descrizione"
                    value={wsForm.description ?? ""}
                    onChange={(e) => setWsForm((f) => ({ ...f, description: e.target.value }))}
                  />
                  <TextInput
                    placeholder="URL immagine (opz.)"
                    value={wsForm.imageUrl ?? ""}
                    onChange={(e) => setWsForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  />
                  <Button onClick={addWorkstation}>Aggiungi stazione</Button>
                </div>

                <div className="mt-6 space-y-3">
                  {workstations.map((w, i) => (
                    <Card key={w.id} className="p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Text className="font-semibold">{w.name}</Text>
                          {w.description && <Text>{w.description}</Text>}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="secondary" onClick={() => moveWorkstation(w.id, "up")} disabled={i === 0}>↑</Button>
                          <Button variant="secondary" onClick={() => moveWorkstation(w.id, "down")} disabled={i === workstations.length - 1}>↓</Button>
                          <Button variant="light" color="red" onClick={() => removeWorkstation(w.id)}>Rimuovi</Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>

              {/* Crea entità */}
              <Card className="sm:col-span-2">
                <Title>Crea {entityLabelSingular}</Title>
                <Grid numItemsSm={2} className="gap-4 mt-4">
                  <TextInput
                    placeholder={`Nome ${entityLabelSingular.toLowerCase()}`}
                    value={entityForm.name ?? ""}
                    onChange={(e) => setEntityForm((f) => ({ ...f, name: e.target.value }))}
                  />
                  <TextInput
                    placeholder="Descrizione (opz.)"
                    value={entityForm.description ?? ""}
                    onChange={(e) => setEntityForm((f) => ({ ...f, description: e.target.value }))}
                  />
                  <div className="col-span-full">
                    <Text className="mb-2">Stazione assegnata</Text>
                    <Select
                      value={(entityForm.workstationId as string) ?? ""}
                      onValueChange={(v) => setEntityForm((f) => ({ ...f, workstationId: v }))}
                    >
                      <SelectItem value="">Nessuna</SelectItem>
                      {workstations.map((w) => (
                        <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                      ))}
                    </Select>
                  </div>

                  {/* Attributi dinamici */}
                  <div className="col-span-full space-y-3 mt-2">
                    <Text className="font-semibold">Attributi</Text>
                    {config.attributes.map((a) => (
                      <div key={a.key} className="grid grid-cols-3 gap-3 items-center">
                        <Text className="col-span-1">{a.label}</Text>
                        <div className="col-span-2">
                          <DynamicField
                            def={a}
                            value={(entityForm.attrs as Record<string, unknown> | undefined)?.[a.key]}
                            onChange={(v) =>
                              setEntityForm((f) => ({
                                ...f,
                                attrs: { ...(f.attrs as Record<string, unknown>), [a.key]: v },
                              }))
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="col-span-full">
                    <Button onClick={addEntity}>Crea {entityLabelSingular}</Button>
                  </div>
                </Grid>
              </Card>
            </Grid>

            {/* Elenco entità (con elimina + cambio stazione) */}
            <Card className="mt-6">
              <Title>Elenco {entityLabelPlural}</Title>
              <Table className="mt-4">
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Nome</TableHeaderCell>
                    <TableHeaderCell>Stazione</TableHeaderCell>
                    {config.attributes.map((a) => (
                      <TableHeaderCell key={a.key}>{a.label}</TableHeaderCell>
                    ))}
                    <TableHeaderCell>Azioni</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entities.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Text className="font-semibold">{e.name}</Text>
                          {e.description && <Badge size="xs">info</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={e.workstationId ?? ""}
                          onValueChange={(v) =>
                            setEntities(prev => prev.map(x => x.id === e.id ? { ...x, workstationId: v || null } : x))
                          }
                        >
                          <SelectItem value="">-</SelectItem>
                          {workstations.map((w) => (
                            <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                          ))}
                        </Select>
                      </TableCell>
                      {config.attributes.map((a) => (
                        <TableCell key={a.key}>{renderAttrValue(a, e.attrs[a.key])}</TableCell>
                      ))}
                      <TableCell>
                        <Button variant="light" color="red" onClick={() => deleteEntity(e.id)}>Elimina</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {/* Board per posizione attuale */}
            <Card className="mt-6">
              <Title>Board posizioni attuali</Title>
              <Grid numItemsSm={workstations.length || 1} className="gap-4 mt-4">
                {workstations.map(ws => (
                  <Card key={ws.id}>
                    <Flex justifyContent="between" alignItems="center">
                      <Text className="font-semibold">{ws.name}</Text>
                      <BadgeDelta deltaType="unchanged">{entities.filter(e => e.workstationId === ws.id).length}</BadgeDelta>
                    </Flex>
                    <div className="mt-3 space-y-2">
                      {entities.filter(e => e.workstationId === ws.id).map(e => (
                        <div key={e.id} className="border rounded-lg px-3 py-2">{e.name}</div>
                      ))}
                      {entities.every(e => e.workstationId !== ws.id) && <Text className="text-sm opacity-60">—</Text>}
                    </div>
                  </Card>
                ))}
                <Card>
                  <Text className="font-semibold">Senza stazione</Text>
                  <div className="mt-3 space-y-2">
                    {entities.filter(e => !e.workstationId).map(e => (
                      <div key={e.id} className="border rounded-lg px-3 py-2">{e.name}</div>
                    ))}
                    {entities.every(e => e.workstationId) && <Text className="text-sm opacity-60">—</Text>}
                  </div>
                </Card>
              </Grid>
            </Card>
          </TabPanel>

          {/* ------------ WORKFLOW (Matrice) ------------ */}
          <TabPanel>
            <Card>
              <Title>Matrice lavorazioni</Title>
              <Text className="mt-1">Clicca una cella per ciclare: vuoto → <span className="text-emerald-600">verde</span> → <span className="text-red-600">rosso</span>.</Text>
              <Table className="mt-4">
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>{entityLabelSingular}</TableHeaderCell>
                    {workstations.map(ws => (
                      <TableHeaderCell key={ws.id}>{ws.name}</TableHeaderCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entities.map(e => (
                    <TableRow key={e.id}>
                      <TableCell className="font-semibold">{e.name}</TableCell>
                      {workstations.map(ws => {
                        const cell = statuses[e.id]?.[ws.id] ?? null;
                        const bg =
                          cell === "pass" ? "bg-emerald-100 border-emerald-300"
                          : cell === "fail" ? "bg-red-100 border-red-300"
                          : "bg-white border-gray-200";
                        const label = cell === "pass" ? "OK" : cell === "fail" ? "KO" : "—";
                        return (
                          <TableCell key={ws.id}>
                            <button
                              className={`w-full rounded-md border text-sm px-3 py-1 ${bg}`}
                              onClick={() => toggleMatrixCell(e.id, ws.id)}
                              title="Clic per cambiare stato"
                            >
                              {label}
                            </button>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabPanel>

          {/* ------------ CONFIGURATOR ------------ */}
          <TabPanel>
            <Grid numItemsSm={2} className="gap-6">
              <Card>
                <Title>Etichette entità</Title>
                <div className="mt-4 space-y-3">
                  <TextInput
                    placeholder="Singolare (es. Oggetto, Fusto, Panino)"
                    value={config.entityLabelSingular}
                    onChange={(e) => setConfig((c) => ({ ...c, entityLabelSingular: e.target.value }))}
                  />
                  <TextInput
                    placeholder="Plurale (es. Oggetti, Fusti, Panini)"
                    value={config.entityLabelPlural}
                    onChange={(e) => setConfig((c) => ({ ...c, entityLabelPlural: e.target.value }))}
                  />
                </div>
              </Card>

              <Card>
                <Title>Nuovo attributo</Title>
                <div className="mt-4 space-y-3">
                  <TextInput placeholder="Key (es. weightKg)" value={attrForm.key ?? ""} onChange={(e) => setAttrForm((f) => ({ ...f, key: e.target.value }))} />
                  <TextInput placeholder="Label (es. Peso (kg))" value={attrForm.label ?? ""} onChange={(e) => setAttrForm((f) => ({ ...f, label: e.target.value }))} />
                  <Select value={(attrForm.type as string) ?? "text"} onValueChange={(v) => setAttrForm((f) => ({ ...f, type: v as AttrType }))}>
                    <SelectItem value="text">text</SelectItem>
                    <SelectItem value="number">number</SelectItem>
                    <SelectItem value="boolean">boolean</SelectItem>
                    <SelectItem value="select">select</SelectItem>
                  </Select>
                  {attrForm.type === "select" && (
                    <TextInput
                      placeholder="Opzioni (separate da virgola)"
                      value={(attrForm.options ?? []).join(",")}
                      onChange={(e) => setAttrForm((f) => ({ ...f, options: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))}
                    />
                  )}
                  <Button onClick={addAttribute}>Aggiungi attributo</Button>
                </div>

                <div className="mt-6">
                  <Title level={3}>Attributi attuali</Title>
                  <div className="mt-3 space-y-2">
                    {config.attributes.map((a) => (
                      <div key={a.key} className="flex items-center justify-between border rounded-lg px-3 py-2">
                        <Text>{a.label} <span className="text-xs opacity-60">({a.key}, {a.type})</span></Text>
                        <Button variant="light" color="red" onClick={() => removeAttribute(a.key)}>Rimuovi</Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </Grid>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}

/** render helper for table cells */
function renderAttrValue(def: AttributeDef, v: unknown) {
  if (v === undefined || v === null || v === "") return "-";
  if (def.type === "boolean") return v ? "Sì" : "No";
  if (def.type === "number") return (v as number).toString();
  return String(v);
}
