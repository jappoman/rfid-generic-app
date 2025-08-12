// src/features/configurator/EntityConfigPanel.tsx
import {
  Card, Title, Text, TextInput, Select, SelectItem, Button,
} from "@tremor/react";
import { useState } from "react";
import { useAppStore } from "../../state/store";
import type { AttributeDef, AttrType } from "../../state/types";

type AttrForm = Partial<AttributeDef> & { type?: AttrType };

export default function EntityConfigPanel() {
  const { state, actions } = useAppStore();
  const { config } = state;

  // labels
  const [singular, setSingular] = useState(config.entityLabelSingular);
  const [plural, setPlural] = useState(config.entityLabelPlural);

  // attributes
  const [attrForm, setAttrForm] = useState<AttrForm>({ type: "text" });

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

  return (
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

      <div className="mt-6">
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
      </div>
    </Card>
  );
}
