import { create } from 'zustand';

export interface Component {
  id: string;
  type: 'CPU' | 'GPU' | 'RAM' | 'MOTHERBOARD' | 'STORAGE' | 'PSU';
  name: string;
  cost: number;
  performance: number;
  powerUsage: number;
  buildTime: number; // in seconds
  tier: number;
  description: string;
}

export type ServerStatus = 'building' | 'running' | 'offline';

export interface Server {
  id: string;
  components: Component[];
  status: ServerStatus;
  buildStartTime?: number;
  revenue: number;
  powerUsage: number;
  efficiency: number;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  applied: boolean;
  effect: {
    type: 'powerEfficiency' | 'buildSpeed' | 'revenue' | 'powerCapacity';
    value: number;
  };
}

interface GameState {
  money: number;
  servers: Server[];
  availableComponents: Component[];
  upgrades: Upgrade[];
  powerCapacity: number;
  powerUsage: number;
  buildSpeedMultiplier: number;
  revenueMultiplier: number;
  powerEfficiencyMultiplier: number;
  lastUpdate: number;
  gameTime: number; // in seconds
  
  // Actions
  addMoney: (amount: number) => void;
  purchaseComponent: (component: Component) => boolean;
  startBuildingServer: (components: Component[]) => void;
  purchaseUpgrade: (upgradeId: string) => boolean;
  updateGameState: () => void;
  shutdownServer: (serverId: string) => void;
  restartServer: (serverId: string) => void;
}

// Define component catalog
const componentCatalog: Component[] = [
  // CPUs
  {
    id: 'cpu-1',
    type: 'CPU',
    name: 'Basic CPU',
    cost: 200,
    performance: 10,
    powerUsage: 65,
    buildTime: 30,
    tier: 1,
    description: 'Entry-level CPU with basic performance',
  },
  {
    id: 'cpu-2',
    type: 'CPU',
    name: 'Mid-range CPU',
    cost: 500,
    performance: 25,
    powerUsage: 95,
    buildTime: 45,
    tier: 2,
    description: 'Balanced CPU for general workloads',
  },
  {
    id: 'cpu-3',
    type: 'CPU',
    name: 'High-end CPU',
    cost: 1200,
    performance: 60,
    powerUsage: 125,
    buildTime: 60,
    tier: 3,
    description: 'Powerful CPU for demanding applications',
  },
  
  // GPUs
  {
    id: 'gpu-1',
    type: 'GPU',
    name: 'Basic GPU',
    cost: 300,
    performance: 15,
    powerUsage: 120,
    buildTime: 40,
    tier: 1,
    description: 'Entry-level GPU for basic compute tasks',
  },
  {
    id: 'gpu-2',
    type: 'GPU',
    name: 'Mid-range GPU',
    cost: 800,
    performance: 40,
    powerUsage: 180,
    buildTime: 55,
    tier: 2,
    description: 'Balanced GPU for various workloads',
  },
  {
    id: 'gpu-3',
    type: 'GPU',
    name: 'High-end GPU',
    cost: 1800,
    performance: 90,
    powerUsage: 250,
    buildTime: 70,
    tier: 3,
    description: 'Powerful GPU for AI and rendering tasks',
  },
  
  // RAM
  {
    id: 'ram-1',
    type: 'RAM',
    name: '8GB RAM',
    cost: 100,
    performance: 5,
    powerUsage: 10,
    buildTime: 20,
    tier: 1,
    description: 'Basic memory module',
  },
  {
    id: 'ram-2',
    type: 'RAM',
    name: '16GB RAM',
    cost: 200,
    performance: 12,
    powerUsage: 15,
    buildTime: 25,
    tier: 2,
    description: 'Standard memory module',
  },
  {
    id: 'ram-3',
    type: 'RAM',
    name: '32GB RAM',
    cost: 400,
    performance: 25,
    powerUsage: 20,
    buildTime: 30,
    tier: 3,
    description: 'High-capacity memory module',
  },
  
  // Storage
  {
    id: 'storage-1',
    type: 'STORAGE',
    name: '500GB HDD',
    cost: 50,
    performance: 3,
    powerUsage: 8,
    buildTime: 15,
    tier: 1,
    description: 'Basic storage solution',
  },
  {
    id: 'storage-2',
    type: 'STORAGE',
    name: '1TB SSD',
    cost: 150,
    performance: 10,
    powerUsage: 5,
    buildTime: 20,
    tier: 2,
    description: 'Faster storage with better reliability',
  },
  {
    id: 'storage-3',
    type: 'STORAGE',
    name: '2TB NVMe',
    cost: 300,
    performance: 20,
    powerUsage: 7,
    buildTime: 25,
    tier: 3,
    description: 'High-speed storage for demanding applications',
  },
  
  // Motherboards
  {
    id: 'mb-1',
    type: 'MOTHERBOARD',
    name: 'Basic Motherboard',
    cost: 120,
    performance: 5,
    powerUsage: 30,
    buildTime: 35,
    tier: 1,
    description: 'Entry-level motherboard with basic features',
  },
  {
    id: 'mb-2',
    type: 'MOTHERBOARD',
    name: 'Standard Motherboard',
    cost: 250,
    performance: 12,
    powerUsage: 40,
    buildTime: 45,
    tier: 2,
    description: 'Mid-range motherboard with good connectivity',
  },
  {
    id: 'mb-3',
    type: 'MOTHERBOARD',
    name: 'Premium Motherboard',
    cost: 500,
    performance: 25,
    powerUsage: 50,
    buildTime: 55,
    tier: 3,
    description: 'High-end motherboard with advanced features',
  },
  
  // Power Supplies
  {
    id: 'psu-1',
    type: 'PSU',
    name: '500W PSU',
    cost: 80,
    performance: 3,
    powerUsage: -10, // Negative means it improves efficiency
    buildTime: 25,
    tier: 1,
    description: 'Basic power supply unit',
  },
  {
    id: 'psu-2',
    type: 'PSU',
    name: '750W PSU',
    cost: 150,
    performance: 8,
    powerUsage: -20,
    buildTime: 30,
    tier: 2,
    description: 'Mid-range power supply with better efficiency',
  },
  {
    id: 'psu-3',
    type: 'PSU',
    name: '1000W PSU',
    cost: 300,
    performance: 15,
    powerUsage: -30,
    buildTime: 40,
    tier: 3,
    description: 'High-end power supply with excellent efficiency',
  },
];

// Define upgrades
const upgradeCatalog: Upgrade[] = [
  {
    id: 'upgrade-power-1',
    name: 'Power Grid Expansion I',
    description: 'Increase power capacity by 500W',
    cost: 1000,
    applied: false,
    effect: {
      type: 'powerCapacity',
      value: 500,
    },
  },
  {
    id: 'upgrade-power-2',
    name: 'Power Grid Expansion II',
    description: 'Increase power capacity by 1000W',
    cost: 3000,
    applied: false,
    effect: {
      type: 'powerCapacity',
      value: 1000,
    },
  },
  {
    id: 'upgrade-efficiency-1',
    name: 'Cooling System I',
    description: 'Reduce power consumption by 10%',
    cost: 2000,
    applied: false,
    effect: {
      type: 'powerEfficiency',
      value: 0.1,
    },
  },
  {
    id: 'upgrade-efficiency-2',
    name: 'Cooling System II',
    description: 'Reduce power consumption by an additional 15%',
    cost: 5000,
    applied: false,
    effect: {
      type: 'powerEfficiency',
      value: 0.15,
    },
  },
  {
    id: 'upgrade-build-1',
    name: 'Assembly Line I',
    description: 'Reduce build time by 20%',
    cost: 1500,
    applied: false,
    effect: {
      type: 'buildSpeed',
      value: 0.2,
    },
  },
  {
    id: 'upgrade-build-2',
    name: 'Assembly Line II',
    description: 'Reduce build time by an additional 25%',
    cost: 4000,
    applied: false,
    effect: {
      type: 'buildSpeed',
      value: 0.25,
    },
  },
  {
    id: 'upgrade-revenue-1',
    name: 'Optimization Software I',
    description: 'Increase server revenue by 15%',
    cost: 2500,
    applied: false,
    effect: {
      type: 'revenue',
      value: 0.15,
    },
  },
  {
    id: 'upgrade-revenue-2',
    name: 'Optimization Software II',
    description: 'Increase server revenue by an additional 20%',
    cost: 6000,
    applied: false,
    effect: {
      type: 'revenue',
      value: 0.2,
    },
  },
];

const useGameStore = create<GameState>((set, get) => ({
  money: 2000, // Starting money
  servers: [],
  availableComponents: componentCatalog.filter(comp => comp.tier === 1), // Start with tier 1 components
  upgrades: upgradeCatalog,
  powerCapacity: 1000,
  powerUsage: 0,
  buildSpeedMultiplier: 1,
  revenueMultiplier: 1,
  powerEfficiencyMultiplier: 1,
  lastUpdate: Date.now(),
  gameTime: 0,

  addMoney: (amount) => set((state) => ({ money: state.money + amount })),

  purchaseComponent: (component) => {
    const state = get();
    if (state.money >= component.cost) {
      set({ money: state.money - component.cost });
      return true;
    }
    return false;
  },

  startBuildingServer: (components) => {
    const totalCost = components.reduce((sum, comp) => sum + comp.cost, 0);
    const state = get();
    
    if (state.money >= totalCost) {
      // Calculate total power usage (considering PSU efficiency)
      const psu = components.find(c => c.type === 'PSU');
      const basePowerUsage = components.reduce((sum, comp) => sum + comp.powerUsage, 0);
      const powerEfficiency = psu ? Math.abs(psu.powerUsage) / 100 : 0;
      
      const newServer: Server = {
        id: `server-${Date.now()}`,
        components,
        status: 'building',
        buildStartTime: Date.now(),
        revenue: components.reduce((sum, comp) => sum + comp.performance, 0) * 0.1 * state.revenueMultiplier,
        powerUsage: basePowerUsage * (1 - (powerEfficiency + state.powerEfficiencyMultiplier - 1)),
        efficiency: powerEfficiency,
      };
      
      set((state) => ({
        servers: [...state.servers, newServer],
        money: state.money - totalCost,
      }));
    }
  },

  purchaseUpgrade: (upgradeId) => {
    const state = get();
    const upgrade = state.upgrades.find(u => u.id === upgradeId && !u.applied);
    
    if (upgrade && state.money >= upgrade.cost) {
      // Apply upgrade effect
      const newState: Partial<GameState> = {
        money: state.money - upgrade.cost,
        upgrades: state.upgrades.map(u => 
          u.id === upgradeId ? { ...u, applied: true } : u
        ),
      };
      
      // Apply specific upgrade effects
      switch (upgrade.effect.type) {
        case 'powerCapacity':
          newState.powerCapacity = state.powerCapacity + upgrade.effect.value;
          break;
        case 'powerEfficiency':
          newState.powerEfficiencyMultiplier = state.powerEfficiencyMultiplier + upgrade.effect.value;
          break;
        case 'buildSpeed':
          newState.buildSpeedMultiplier = state.buildSpeedMultiplier + upgrade.effect.value;
          break;
        case 'revenue':
          newState.revenueMultiplier = state.revenueMultiplier + upgrade.effect.value;
          break;
      }
      
      set(newState);
      
      // Unlock new tier components if enough upgrades are purchased
      const appliedUpgrades = state.upgrades.filter(u => u.applied || u.id === upgradeId).length;
      if (appliedUpgrades === 2) {
        // Unlock tier 2 components
        set((state) => ({
          availableComponents: [...state.availableComponents, ...componentCatalog.filter(comp => comp.tier === 2)]
        }));
      } else if (appliedUpgrades === 6) {
        // Unlock tier 3 components
        set((state) => ({
          availableComponents: [...state.availableComponents, ...componentCatalog.filter(comp => comp.tier === 3)]
        }));
      }
      
      return true;
    }
    
    return false;
  },

  shutdownServer: (serverId) => {
    set((state) => ({
      servers: state.servers.map(server => 
        server.id === serverId ? { ...server, status: 'offline' as ServerStatus } : server
      )
    }));
  },

  restartServer: (serverId) => {
    set((state) => ({
      servers: state.servers.map(server => 
        server.id === serverId ? { ...server, status: 'running' as ServerStatus } : server
      )
    }));
  },

  updateGameState: () => {
    const currentTime = Date.now();
    const state = get();
    const timeDelta = (currentTime - state.lastUpdate) / 1000; // in seconds
    
    // Update game time
    const newGameTime = state.gameTime + timeDelta;
    
    // Update servers status and collect revenue
    const updatedServers = state.servers.map(server => {
      if (server.status === 'building') {
        const buildTime = server.components.reduce((sum, comp) => sum + comp.buildTime, 0) * 
          (1 - (state.buildSpeedMultiplier - 1)) * 1000; // Convert to milliseconds
        
        if (currentTime - (server.buildStartTime || 0) >= buildTime) {
          return { ...server, status: 'running' as ServerStatus };
        }
      }
      return server;
    });

    // Calculate revenue from running servers
    const revenue = updatedServers
      .filter(server => server.status === 'running')
      .reduce((sum, server) => sum + server.revenue * timeDelta, 0);

    // Update power usage
    const newPowerUsage = updatedServers
      .filter(server => server.status === 'running')
      .reduce((sum, server) => sum + server.powerUsage, 0);

    // Check if power usage exceeds capacity and shut down servers if needed
    let finalServers = [...updatedServers];
    if (newPowerUsage > state.powerCapacity) {
      // Sort servers by efficiency (revenue per watt) and shut down least efficient ones
      const runningServers = finalServers
        .filter(s => s.status === 'running')
        .sort((a, b) => (a.revenue / a.powerUsage) - (b.revenue / b.powerUsage));
      
      let currentPowerUsage = newPowerUsage;
      let i = 0;
      
      // Shut down servers until power usage is below capacity
      while (currentPowerUsage > state.powerCapacity && i < runningServers.length) {
        const serverToShutdown = runningServers[i];
        currentPowerUsage -= serverToShutdown.powerUsage;
        
        finalServers = finalServers.map(s => 
          s.id === serverToShutdown.id ? { ...s, status: 'offline' as ServerStatus } : s
        );
        
        i++;
      }
    }

    set({
      servers: finalServers,
      money: state.money + revenue,
      powerUsage: Math.min(newPowerUsage, state.powerCapacity),
      lastUpdate: currentTime,
      gameTime: newGameTime,
    });
  },
}));

export default useGameStore; 