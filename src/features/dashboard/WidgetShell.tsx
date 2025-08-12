// src/features/dashboard/WidgetShell.tsx
import { Card } from "@tremor/react";

export default function WidgetShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full">
      <Card className="h-full shadow-md">
        <div className="h-full overflow-auto">{children}</div>
      </Card>
    </div>
  );
}
