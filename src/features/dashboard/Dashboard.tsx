// src/features/dashboard/Dashboard.tsx
import {
  Card, Title, Text, Grid, Table, TableHead, TableRow,
  TableHeaderCell, TableBody, TableCell, Select, SelectItem, Badge, Flex, BadgeDelta
} from "@tremor/react";
import { useAppStore } from "../../state/store";
import renderAttrValue from "../../utils/renderAttrValue";
import WorkflowMatrixSection from "../workflow/WorkflowMatrixSection";
import CreateEntityForm from "../entities/CreateEntityForm";

export default function Dashboard() {
  const { state, actions } = useAppStore();
  const { config, workstations, entities } = state;

  const entityLabelPlural = config.entityLabelPlural || "Entità";

  return (
    <>
      {/* 1) Board posizioni attuali */}
      <Card>
        <Title>Board posizioni attuali</Title>
        <Grid numItemsSm={workstations.length || 1} className="gap-4 mt-4">
          {workstations.map(ws => (
            <Card key={ws.id}>
              <Flex justifyContent="between" alignItems="center">
                <Text className="font-semibold">{ws.name}</Text>
                <BadgeDelta deltaType="unchanged">
                  {entities.filter(e => e.workstationId === ws.id).length}
                </BadgeDelta>
              </Flex>
              <div className="mt-3 space-y-2">
                {entities.filter(e => e.workstationId === ws.id).map(e => (
                  <div key={e.id} className="border rounded-lg px-3 py-2">{e.name}</div>
                ))}
                {entities.every(e => e.workstationId !== ws.id) && (
                  <Text className="text-sm opacity-60">—</Text>
                )}
              </div>
            </Card>
          ))}
          <Card>
            <Text className="font-semibold">Senza stazione</Text>
            <div className="mt-3 space-y-2">
              {entities.filter(e => !e.workstationId).map(e => (
                <div key={e.id} className="border rounded-lg px-3 py-2">{e.name}</div>
              ))}
              {entities.every(e => e.workstationId) && (
                <Text className="text-sm opacity-60">—</Text>
              )}
            </div>
          </Card>
        </Grid>
      </Card>

      {/* 2) Matrice lavorazioni */}
      <div className="mt-6">
        <WorkflowMatrixSection />
      </div>

      {/* 3) Elenco entità */}
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

      {/* 4) Creazione entità */}
      <div className="mt-6">
        <CreateEntityForm />
      </div>
    </>
  );
}
