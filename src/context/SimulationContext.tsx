import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Village, WeatherStation, VillageRiskData, AlertProposal, DashboardSummary, ScenarioType } from '../types';
import { dataProvider } from '../services/dataProvider';
import { SCENARIOS } from '../data/scenarios';
import { INITIAL_STATIONS } from '../data/stations';

interface SimulationContextType {
  allVillages: Village[];
  isLoadingVillages: boolean;
  stations: WeatherStation[];
  currentScenario: ScenarioType;
  summary: DashboardSummary;
  alerts: AlertProposal[];
  selectedVillage: Village | null;
  selectedVillageRisk: VillageRiskData | null;
  selectedDistrict: string;
  notification: string | null;
  changeScenario: (scenario: ScenarioType) => void;
  selectVillage: (village: Village | null) => void;
  setSelectedDistrict: (dtcode: string) => void;
  approveAlert: (alertId: string) => void;
  acknowledgeAlert: (alertId: string) => void;
  getVillageRisk: (village: Village) => VillageRiskData;
  dismissNotification: () => void;
}

const defaultSummary: DashboardSummary = {
  totalVillages: 16920,
  severeCount: 0,
  highCount: 14,
  moderateCount: 182,
  lowCount: 16724,
  averageRisk: 14,
  activeAlertProposals: 0,
  approvedAlerts: 0,
  maxRainfall: 6.2,
  activeScenario: 'NORMAL'
};

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allVillages, setAllVillages] = useState<Village[]>([]);
  const [isLoadingVillages, setIsLoadingVillages] = useState<boolean>(true);
  const [stations, setStations] = useState<WeatherStation[]>(INITIAL_STATIONS);
  const [currentScenario, setCurrentScenario] = useState<ScenarioType>('NORMAL');
  const [summary, setSummary] = useState<DashboardSummary>(defaultSummary);
  const [alerts, setAlerts] = useState<AlertProposal[]>([]);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [selectedVillageRisk, setSelectedVillageRisk] = useState<VillageRiskData | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [notification, setNotification] = useState<string | null>(null);

  // Load villages index on startup
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const villages = await dataProvider.getVillages();
        if (mounted) {
          setAllVillages(villages);
          setIsLoadingVillages(false);
          // Run initial baseline scenario
          const res = dataProvider.runScenario('NORMAL', villages);
          setStations(res.updatedStations);
          setSummary(res.summary);
          setAlerts(res.alerts);

          // Select Joshimath by default for demo readiness
          const joshimath = villages.find(v => v.village.toLowerCase().includes('joshimath') && v.isHotspot) || villages[0];
          if (joshimath) {
            setSelectedVillage(joshimath);
            setSelectedVillageRisk(dataProvider.getVillageRisk(joshimath));
          }
        }
      } catch (err) {
        console.error('Error loading village index:', err);
        setIsLoadingVillages(false);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, []);

  // Recalculate selected village risk when scenario or stations change
  useEffect(() => {
    if (selectedVillage) {
      const risk = dataProvider.getVillageRisk(selectedVillage);
      setSelectedVillageRisk(risk);
    }
  }, [stations, selectedVillage]);

  const changeScenario = useCallback((scenario: ScenarioType) => {
    setCurrentScenario(scenario);
    const res = dataProvider.runScenario(scenario, allVillages);
    setStations(res.updatedStations);
    setSummary(res.summary);
    setAlerts(res.alerts);

    const scenarioDef = SCENARIOS[scenario];
    setNotification(`Scenario activated: ${scenarioDef.title}`);

    if (selectedVillage) {
      const risk = dataProvider.getVillageRisk(selectedVillage);
      setSelectedVillageRisk(risk);
    }
  }, [allVillages, selectedVillage]);

  const selectVillage = useCallback((village: Village | null) => {
    setSelectedVillage(village);
    if (village) {
      const risk = dataProvider.getVillageRisk(village);
      setSelectedVillageRisk(risk);
    } else {
      setSelectedVillageRisk(null);
    }
  }, []);

  const approveAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          status: 'APPROVED',
          approvedBy: 'Disaster Authority (Demo Control)',
          approvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
      }
      return a;
    }));
    setSummary(prev => ({
      ...prev,
      activeAlertProposals: Math.max(0, prev.activeAlertProposals - 1),
      approvedAlerts: prev.approvedAlerts + 1
    }));
    setNotification('Alert approved and marked for dissemination.');
  }, []);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          status: 'ACKNOWLEDGED',
          acknowledgedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
      }
      return a;
    }));
    setNotification('Alert marked as acknowledged.');
  }, []);

  const getVillageRisk = useCallback((village: Village) => {
    return dataProvider.getVillageRisk(village);
  }, []);

  const dismissNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return (
    <SimulationContext.Provider
      value={{
        allVillages,
        isLoadingVillages,
        stations,
        currentScenario,
        summary,
        alerts,
        selectedVillage,
        selectedVillageRisk,
        selectedDistrict,
        notification,
        changeScenario,
        selectVillage,
        setSelectedDistrict,
        approveAlert,
        acknowledgeAlert,
        getVillageRisk,
        dismissNotification
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
