// src/features/dashboard/WorkstationBoard.tsx
import {
  Card, Title, Text, Grid, Flex, BadgeDelta
} from "@tremor/react";
import { useAppStore } from "../../state/store";

export default function WorkstationBoard() {
  const { state } = useAppStore();
  const { workstations, entities } = state;

  return (
    <Card>
      <Title>Board posizioni attuali</Title>
      <Grid numItemsSm={workstations.length || 1} className="gap-4 mt-4">
        {workstations.map(ws => (
          <Card key={ws.id}>
            <Flex justifyContent="between" alignItems="center">
              <Text className="font-semibold">{ws.name}</Text>
              {/* show count of entities in this workstation */}
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
  );
}
