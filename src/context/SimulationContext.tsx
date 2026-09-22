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

  // Load villages index and initialize with live backend data on startup
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const villages = await dataProvider.getVillages();
        if (mounted) {
          setAllVillages(villages);
          setIsLoadingVillages(false);

          // Connect to backend API for initial live data & persistent alerts
          const res = await dataProvider.runScenario('NORMAL');
          if (mounted) {
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
        }
      } catch (err) {
        console.error('Error loading initial intelligence state:', err);
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

  const changeScenario = useCallback(async (scenario: ScenarioType) => {
    setCurrentScenario(scenario);
    try {
      const res = await dataProvider.runScenario(scenario);
      setStations(res.updatedStations);
      setSummary(res.summary);
      setAlerts(res.alerts);

      const scenarioDef = SCENARIOS[scenario];
      setNotification(`Scenario activated: ${scenarioDef.title}`);

      if (selectedVillage) {
        const risk = dataProvider.getVillageRisk(selectedVillage);
        setSelectedVillageRisk(risk);
      }
    } catch (err) {
      console.error('Failed to change scenario via API:', err);
    }
  }, [selectedVillage]);

  const selectVillage = useCallback((village: Village | null) => {
    setSelectedVillage(village);
    if (village) {
      const risk = dataProvider.getVillageRisk(village);
      setSelectedVillageRisk(risk);
    } else {
      setSelectedVillageRisk(null);
    }
  }, []);

  const approveAlert = useCallback(async (alertId: string) => {
    // Optimistic UI update
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          status: 'APPROVED',
          approvedBy: 'Disaster Authority (State Command)',
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
    setNotification('Alert authorized and broadcast to state emergency network.');

    // Persist to LibSQL database & audit log
    try {
      const updated = await dataProvider.approveAlert(alertId, 'Disaster Authority (State Command)');
      setAlerts(prev => prev.map(a => a.id === alertId ? updated : a));
    } catch (err) {
      console.error('Failed to persist alert approval to database:', err);
    }
  }, []);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    // Optimistic UI update
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
    setNotification('Alert acknowledged and archived to audit log.');

    // Persist to LibSQL database & audit log
    try {
      const updated = await dataProvider.acknowledgeAlert(alertId, 'District Emergency Operation Center');
      setAlerts(prev => prev.map(a => a.id === alertId ? updated : a));
    } catch (err) {
      console.error('Failed to persist alert acknowledgement to database:', err);
    }
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
