// src/features/entities/EntityTable.tsx
import {
  Card, Title, Text, Table, TableHead, TableRow,
  TableHeaderCell, TableBody, TableCell, Select, SelectItem, Badge
} from "@tremor/react";
import { useAppStore } from "../../state/store";
import renderAttrValue from "../../utils/renderAttrValue";

export default function EntityTable() {
  const { state, actions } = useAppStore();
  const { config, workstations, entities } = state;

  const entityLabelPlural = config.entityLabelPlural || "Entità";

  return (
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
                  onValueChange={(v) => actions.setEntityWorkstation(e.id, v || null)}
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
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => actions.deleteEntity(e.id)}
                >
                  Elimina
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
