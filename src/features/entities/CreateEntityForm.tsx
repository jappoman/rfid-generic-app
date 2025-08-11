import { Card, Title, Grid, Text, TextInput, Select, SelectItem, Button } from "@tremor/react";
import { useState, useMemo } from "react";
import { useAppStore } from "../../state/store";
import type { AttributeDef, EntityItem } from "../../state/types";
import DynamicField from "../../components/DynamicField";
import { uid } from "../../utils/uid";

type AttrMap = Record<string, unknown>;

export default function CreateEntityForm() {
  const { state, actions } = useAppStore();
  const { config, workstations } = state;

  const [name, setName] = useState("");
  const [description, setDescription] = useState<string | undefined>("");
  const [workstationId, setWorkstationId] = useState<string>("");
  const [attrs, setAttrs] = useState<AttrMap>({});

  const entityLabelSingular = config.entityLabelSingular || "Entità";

  // reset veloce dopo submit
  const reset = () => {
    setName("");
    setDescription("");
    setWorkstationId("");
    setAttrs({});
  };

  const canSubmit = useMemo(() => name.trim().length > 0, [name]);

  const handleSubmit = () => {
    if (!canSubmit) return;
    const id = uid();
    const entity: EntityItem = {
      id,
      name: name.trim(),
      description: description || undefined,
      workstationId: workstationId || null,
      attrs: attrs || {},
    };
    actions.addEntity(entity);
    reset();
  };

  return (
    <Card>
      <Title>Crea {entityLabelSingular}</Title>
      <Grid numItemsSm={2} className="gap-4 mt-4">
        <TextInput
          placeholder={`Nome ${entityLabelSingular.toLowerCase()}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextInput
          placeholder="Descrizione (opz.)"
          value={description ?? ""}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="col-span-full">
          <Text className="mb-2">Stazione assegnata</Text>
          <Select value={workstationId} onValueChange={setWorkstationId}>
            <SelectItem value="">Nessuna</SelectItem>
            {workstations.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.name}
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* Attributi dinamici */}
        <div className="col-span-full space-y-3 mt-2">
          <Text className="font-semibold">Attributi</Text>
          {config.attributes.map((a: AttributeDef) => (
            <div key={a.key} className="grid grid-cols-3 gap-3 items-center">
              <Text className="col-span-1">{a.label}</Text>
              <div className="col-span-2">
                <DynamicField
                  def={a}
                  value={attrs[a.key]}
                  onChange={(v) => setAttrs((prev) => ({ ...prev, [a.key]: v }))}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-full">
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            Crea {entityLabelSingular}
          </Button>
        </div>
      </Grid>
    </Card>
  );
}
