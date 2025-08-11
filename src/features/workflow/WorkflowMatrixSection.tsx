// src/features/workflow/WorkflowMatrixSection.tsx
import { Card, Title, Text, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell } from "@tremor/react";
import { useAppStore } from "../../state/store";

export default function WorkflowMatrixSection() {
  const { state, actions } = useAppStore();
  const { entities, workstations, statuses, config } = state;

  const entityLabelSingular = config.entityLabelSingular || "Entità";

  return (
    <Card>
      <Title>Matrice lavorazioni</Title>
      <Text className="mt-1">
        Clicca una cella per ciclare: vuoto → <span className="text-emerald-600">verde</span> → <span className="text-red-600">rosso</span>.
      </Text>

      <Table className="mt-4">
        <TableHead>
          <TableRow>
            <TableHeaderCell>{entityLabelSingular}</TableHeaderCell>
            {workstations.map((ws) => (
              <TableHeaderCell key={ws.id}>{ws.name}</TableHeaderCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {entities.map((e) => (
            <TableRow key={e.id}>
              <TableCell className="font-semibold">{e.name}</TableCell>
              {workstations.map((ws) => {
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
                      onClick={() => actions.toggleMatrixCell(e.id, ws.id)}
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
  );
}
