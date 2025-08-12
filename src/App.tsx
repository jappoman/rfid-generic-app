// src/App.tsx
import {
  Card, Title, Text, TabGroup, TabList, Tab, TabPanels, TabPanel,
} from "@tremor/react";
import { AppStoreProvider } from "./state/store";

// feature tabs
import { Dashboard } from "./features/dashboard";
import { Configurator } from "./features/configurator";

export default function App() {
  return (
    <AppStoreProvider>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Title>RFID Generic App</Title>
        <Text>POC: stazioni di lavoro & entità configurabili (mock frontend).</Text>

        <TabGroup>
          <TabList>
            <Tab>Dashboard</Tab>
            <Tab>Statistiche</Tab>
            <Tab>Configurator</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Dashboard />
            </TabPanel>

            <TabPanel>
              {/* Placeholder: qui monterai il tuo pannello statistiche */}
              <Card>
                <Title>Statistiche</Title>
                <Text className="mt-2">In arrivo 🚧 — qui potrai aggiungere grafici, filtri e report.</Text>
              </Card>
            </TabPanel>

            <TabPanel>
              <Configurator />
            </TabPanel>

          </TabPanels>
        </TabGroup>
      </div>
    </AppStoreProvider>
  );
}
