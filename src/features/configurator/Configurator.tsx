import {
  Card, Title, Text, Grid, TextInput, Select, SelectItem, Button,
} from "@tremor/react";
import { useState } from "react";
import { useAppStore } from "../../state/store";
import type { AttributeDef, AttrType, Workstation } from "../../state/types";
import { uid } from "../../utils/uid";

type AttrForm = Partial<AttributeDef> & { type?: AttrType };
type WsForm = Partial<Workstation>;

export default function Configurator() {
  const { state, actions } = useAppStore();
  const { config, workstations } = state;

  // --- Etichette ---
  const [singular, setSingular] = useState(config.entityLabelSingular);
  const [plural, setPlural] = useState(config.entityLabelPlural);

  // --- Attributi ---
  const [attrForm, setAttrForm] = useState<AttrForm>({ type: "text" });

  // --- Stazioni di lavoro ---
  const [wsForm, setWsForm] = useState<WsForm>({});

  const saveLabels = () => {
    actions.setEntityLabels(singular || "Entità", plural || "Entità");
  };

  const addAttribute = () => {
    if (!attrForm.key || !attrForm.label || !attrForm.type) return;
    const def: AttributeDef = {
      key: attrForm.key,
      label: attrForm.label,
      type: attrForm.type,
      options: attrForm.type === "select" ? (attrForm.options ?? []) : undefined,
    };
    actions.addAttribute(def);
    setAttrForm({ type: "text" });
  };

  const removeAttribute = (key: string) => actions.removeAttribute(key);

  const addWorkstation = () => {
    if (!wsForm.name) return;
    actions.addWorkstation({
      id: uid(),
      name: wsForm.name!,
      description: wsForm.description,
      imageUrl: wsForm.imageUrl,
    });
    setWsForm({});
  };

  const removeWorkstation = (id: string) => actions.removeWorkstation(id);
  const moveWorkstation = (id: string, dir: "up" | "down") =>
    dir === "up" ? actions.moveWorkstationUp(id) : actions.moveWorkstationDown(id);

  return (
    <>
      {/* Row 1: Etichette + Attributi */}
      <Grid numItemsSm={2} className="gap-6">
        <Card>
          <Title>Etichette entità</Title>
          <div className="mt-4 space-y-3">
            <TextInput
              placeholder="Singolare (es. Oggetto, Fusto, Panino)"
              value={singular}
              onChange={(e) => setSingular(e.target.value)}
            />
            <TextInput
              placeholder="Plurale (es. Oggetti, Fusti, Panini)"
              value={plural}
              onChange={(e) => setPlural(e.target.value)}
            />
            <Button onClick={saveLabels}>Salva etichette</Button>
          </div>
        </Card>

        <Card>
          <Title>Nuovo attributo</Title>
          <div className="mt-4 space-y-3">
            <TextInput
              placeholder="Key (es. weightKg)"
              value={attrForm.key ?? ""}
              onChange={(e) => setAttrForm((f) => ({ ...f, key: e.target.value.trim() }))}
            />
            <TextInput
              placeholder="Label (es. Peso (kg))"
              value={attrForm.label ?? ""}
              onChange={(e) => setAttrForm((f) => ({ ...f, label: e.target.value }))}
            />
            <Select
              value={(attrForm.type as string) ?? "text"}
              onValueChange={(v) => setAttrForm((f) => ({ ...f, type: v as AttrType }))}
            >
              <SelectItem value="text">text</SelectItem>
              <SelectItem value="number">number</SelectItem>
              <SelectItem value="boolean">boolean</SelectItem>
              <SelectItem value="select">select</SelectItem>
            </Select>
            {attrForm.type === "select" && (
              <TextInput
                placeholder="Opzioni (separate da virgola)"
                value={(attrForm.options ?? []).join(",")}
                onChange={(e) =>
                  setAttrForm((f) => ({
                    ...f,
                    options: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  }))
                }
              />
            )}
            <Button onClick={addAttribute}>Aggiungi attributo</Button>
          </div>

          <div className="mt-6">
            <Title>Attributi attuali</Title>
            <div className="mt-3 space-y-2">
              {config.attributes.map((a) => (
                <div key={a.key} className="flex items-center justify-between border rounded-lg px-3 py-2">
                  <Text>
                    {a.label} <span className="text-xs opacity-60">({a.key}, {a.type})</span>
                  </Text>
                  <Button variant="light" color="red" onClick={() => removeAttribute(a.key)}>
                    Rimuovi
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </Grid>

      {/* Row 2: Stazioni di lavoro */}
      <Grid numItemsSm={1} className="gap-6 mt-6">
        <Card>
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
                    <Button
                      variant="secondary"
                      onClick={() => moveWorkstation(w.id, "down")}
                      disabled={i === workstations.length - 1}
                    >
                      ↓
                    </Button>
                    <Button variant="light" color="red" onClick={() => removeWorkstation(w.id)}>
                      Rimuovi
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </Grid>
    </>
  );
}
