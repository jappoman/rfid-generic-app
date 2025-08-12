// src/features/configurator/Configurator.tsx
import { Grid } from "@tremor/react";
import EntityConfigPanel from "./EntityConfigPanel";
import WorkstationManager from "./WorkstationManager";

export default function Configurator() {
  return (
    <>
      <Grid numItemsSm={2} className="gap-6">
        <EntityConfigPanel />
        <WorkstationManager />
      </Grid>
    </>
  );
}
