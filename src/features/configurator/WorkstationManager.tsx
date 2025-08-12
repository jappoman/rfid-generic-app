// src/features/configurator/WorkstationManager.tsx
import { Card, Title, Text, TextInput, Button } from "@tremor/react";
import { useState } from "react";
import { useAppStore } from "../../state/store";
import type { Workstation } from "../../state/types";
import { uid } from "../../utils/uid";

type WsForm = Partial<Workstation>;

export default function WorkstationManager() {
  const { state, actions } = useAppStore();
  const { workstations } = state;

  const [wsForm, setWsForm] = useState<WsForm>({});

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
  );
}
