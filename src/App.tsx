import {
  Card,
  Title,
  Text,
  Metric,
  Grid,
  Flex,
  BadgeDelta,
  AreaChart,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from "@tremor/react";

// Mock data per i KPI
const kpis = [
  { name: "Ordini", value: 1280, delta: "+12.4%" },
  { name: "Ricavi", value: 46200, delta: "+8.1%" },
  { name: "Resi", value: 32, delta: "-2.5%" },
];

// Mock data per il grafico
const chartData = [
  { date: "2025-07-01", sales: 1200 },
  { date: "2025-07-08", sales: 1800 },
  { date: "2025-07-15", sales: 1400 },
  { date: "2025-07-22", sales: 2100 },
  { date: "2025-07-29", sales: 2600 },
];

// Mock data per la tabella
const boxes = [
  { id: "BX-1001", location: "WH-North", status: "In transito" },
  { id: "BX-1002", location: "WH-South", status: "In magazzino" },
  { id: "BX-1003", location: "WH-East", status: "Prelevato" },
];

export default function App() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Title>RFID Generic App</Title>
      <Text>Dashboard di esempio con Tremor.</Text>

      {/* KPI Cards */}
      <Grid numItemsSm={3} className="gap-6">
        {kpis.map((kpi) => (
          <Card key={kpi.name} className="space-y-2">
            <Text>{kpi.name}</Text>
            <Flex alignItems="baseline" className="space-x-2">
              <Metric>{kpi.value.toLocaleString()}</Metric>
              <BadgeDelta
                deltaType={kpi.delta.startsWith("+") ? "increase" : "decrease"}
              >
                {kpi.delta}
              </BadgeDelta>
            </Flex>
          </Card>
        ))}
      </Grid>

      {/* Chart */}
      <Card>
        <Title>Vendite settimanali</Title>
        <AreaChart
          className="mt-4 h-64"
          data={chartData}
          index="date"
          categories={["sales"]}
          valueFormatter={(n: number) => `€ ${n.toLocaleString()}`}
          yAxisWidth={60}
        />
      </Card>

      {/* Table */}
      <Card>
        <Title>Stato box</Title>
        <Table className="mt-4">
          <TableHead>
            <TableRow>
              <TableHeaderCell>ID Box</TableHeaderCell>
              <TableHeaderCell>Location</TableHeaderCell>
              <TableHeaderCell>Stato</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {boxes.map((box) => (
              <TableRow key={box.id}>
                <TableCell>{box.id}</TableCell>
                <TableCell>{box.location}</TableCell>
                <TableCell>{box.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
