// src/features/dashboard/DashboardGrid.tsx
import { useEffect, useState } from "react";
import { Responsive, WidthProvider, Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import WorkstationBoard from "./WorkstationBoard";
import { WorkflowMatrixSection } from "../workflow";
import { EntityTable, CreateEntityForm } from "../entities";
import WidgetShell from "./WidgetShell";

const ResponsiveGridLayout = WidthProvider(Responsive);

// --- Types (minimal) ---
type Widget = {
  id: string;
  element: JSX.Element;       // the widget content (your existing components)
  layout: Layout;             // position/size on the grid
};

// --- Default layout (tweak w/h se serve più spazio) ---
const DEFAULT_WIDGETS = [
  { id: "board",  element: <WidgetShell><WorkstationBoard /></WidgetShell>,  layout: { i:"board", x:0, y:0, w:6, h:9, minW:4, minH:5 } },
  { id: "matrix", element: <WidgetShell><WorkflowMatrixSection /></WidgetShell>, layout: { i:"matrix", x:6, y:0, w:6, h:9, minW:4, minH:5 } },
  { id: "table",  element: <WidgetShell><EntityTable /></WidgetShell>,         layout: { i:"table", x:0, y:9, w:12, h:12, minW:6, minH:8 } },
  { id: "create", element: <WidgetShell><CreateEntityForm /></WidgetShell>,    layout: { i:"create", x:0, y:21, w:12, h:8,  minW:4, minH:4 } },
];

const LS_KEY = "dashboard.widgets.v1";

export default function DashboardGrid() {
  // Load saved layout from localStorage or use defaults
  const [widgets, setWidgets] = useState<Widget[]>(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_WIDGETS;
    try {
      const saved = JSON.parse(raw) as Widget[];
      // keep elements from code, just apply saved layout by id
      return DEFAULT_WIDGETS.map((def) => {
        const match = saved.find((w) => w.id === def.id);
        return match ? { ...def, layout: { ...def.layout, ...match.layout } } : def;
      });
    } catch {
      return DEFAULT_WIDGETS;
    }
  });

  const [editMode, setEditMode] = useState<boolean>(false);

  // Persist on change
  useEffect(() => {
    const toSave = widgets.map(({ id, layout }) => ({ id, layout }));
    localStorage.setItem(LS_KEY, JSON.stringify(toSave));
  }, [widgets]);

  // Update layout after drag/resize
  const handleLayoutChange = (_current: Layout[], allLayouts: Record<string, Layout[]>) => {
    const lg = allLayouts.lg ?? [];
    setWidgets((prev) =>
      prev.map((w) => {
        const li = lg.find((l) => l.i === w.id);
        return li ? { ...w, layout: { ...w.layout, ...li } } : w;
      })
    );
  };

  // Reset layout to defaults
  const resetLayout = () => {
    setWidgets(DEFAULT_WIDGETS);
    localStorage.removeItem(LS_KEY);
  };

  const layouts = { lg: widgets.map((w) => w.layout) };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex gap-2">
        <button
          className="px-3 py-1 rounded border"
          onClick={() => setEditMode((v) => !v)}
          title="Abilita/Disabilita drag & resize"
        >
          {editMode ? "🔓 Modifica layout: ON" : "🔒 Modifica layout: OFF"}
        </button>
        <button className="px-3 py-1 rounded border" onClick={resetLayout}>
          ♻️ Reset layout
        </button>
      </div>

      {/* Grid */}
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768 }}
        cols={{ lg: 12, md: 10, sm: 6 }}
        rowHeight={38}           // height of one grid row in px (increase if content is cramped)
        onLayoutChange={handleLayoutChange}
        isDraggable={editMode}   // lock/unlock drag
        isResizable={editMode}   // lock/unlock resize
        compactType="vertical"
        measureBeforeMount
        preventCollision={false} // allow overlapping widgets
      >
        {widgets.map((w) => (
          <div key={w.id}>{w.element}</div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}
