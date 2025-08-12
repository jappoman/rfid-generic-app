// src/features/dashboard/Dashboard.tsx
import WorkflowMatrixSection from "../workflow/WorkflowMatrixSection";
import CreateEntityForm from "../entities/CreateEntityForm";
import WorkstationBoard from "./WorkstationBoard";
import EntityTable from "../entities/EntityTable";

export default function Dashboard() {

  return (
    <>
      {/* 1) Board posizioni attuali */}
      <WorkstationBoard />

      {/* 2) Matrice lavorazioni */}
      <div className="mt-6">
        <WorkflowMatrixSection />
      </div>

      {/* 3) Elenco entità */}
      <EntityTable />

      {/* 4) Creazione entità */}
      <div className="mt-6">
        <CreateEntityForm />
      </div>
    </>
  );
}
