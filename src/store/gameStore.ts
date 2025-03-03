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

export type RoomType = 'SERVER' | 'PC' | 'SOFTWARE';

export interface Room {
  id: string;
  type: RoomType;
  name: string;
  position: [number, number];
  size: number;
  cost: number;
  maxUnits: number;
  units: (Server | PC | Software)[];
  airConditioning: {
    level: number;
    cost: number;
    efficiency: number;
  };
  lighting: {
    color: string;
    intensity: number;
    cost: number;
  };
}

export interface Server {
  id: string;
  components: Component[];
  status: ServerStatus;
  buildStartTime?: number;
  revenue: number;
  powerUsage: number;
  efficiency: number;
}

export interface PC {
  id: string;
  components: Component[];
  status: ServerStatus;
  buildStartTime?: number;
  revenue: number;
  powerUsage: number;
  efficiency: number;
  userSatisfaction: number; // 0-100
}

export interface Software {
  id: string;
  name: string;
  type: 'OS' | 'PRODUCTIVITY' | 'SECURITY' | 'DEVELOPMENT';
  status: ServerStatus;
  buildStartTime?: number;
  developmentProgress: number; // 0-100
  revenue: number;
  powerUsage: number;
  developers: number;
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
  pcs: PC[];
  software: Software[];
  rooms: Room[];
  availableComponents: Component[];
  upgrades: Upgrade[];
  powerCapacity: number;
  powerUsage: number;
  buildSpeedMultiplier: number;
  revenueMultiplier: number;
  powerEfficiencyMultiplier: number;
  lastUpdate: number;
  gameTime: number; // in seconds
  activeRoomId: string | null;
  
  // Actions
  addMoney: (amount: number) => void;
  purchaseComponent: (component: Component) => boolean;
  startBuildingServer: (components: Component[]) => void;
  startBuildingPC: (components: Component[]) => void;
  startDevelopingSoftware: (name: string, type: Software['type'], developers: number) => boolean;
  purchaseUpgrade: (upgradeId: string) => boolean;
  updateGameState: () => void;
  shutdownServer: (serverId: string) => void;
  restartServer: (serverId: string) => void;
  purchaseRoom: (type: RoomType, position: [number, number]) => boolean;
  setActiveRoom: (roomId: string | null) => void;
  upgradeRoomAirConditioning: (roomId: string) => boolean;
  upgradeRoomLighting: (roomId: string, color: string) => boolean;
}

// Define room types
const roomTypes: Record<RoomType, { 
  name: string, 
  cost: number, 
  maxUnits: number, 
  size: number,
  basePowerUsage: number,
  airConditioningCost: number
}> = {
  SERVER: { 
    name: 'Server Room', 
    cost: 5000, 
    maxUnits: 20,
    size: 3,
    basePowerUsage: 200,
    airConditioningCost: 500
  },
  PC: { 
    name: 'PC Lab', 
    cost: 3000, 
    maxUnits: 10,
    size: 2,
    basePowerUsage: 100,
    airConditioningCost: 300
  },
  SOFTWARE: { 
    name: 'Development Studio', 
    cost: 7000, 
    maxUnits: 5,
    size: 4,
    basePowerUsage: 150,
    airConditioningCost: 700
  }
};

// Define software types
const softwareTypes: Record<Software['type'], { baseCost: number, baseRevenue: number, developmentTime: number }> = {
  OS: {
    baseCost: 5000,
    baseRevenue: 50,
    developmentTime: 300 // seconds
  },
  PRODUCTIVITY: {
    baseCost: 2000,
    baseRevenue: 20,
    developmentTime: 180
  },
  SECURITY: {
    baseCost: 3000,
    baseRevenue: 30,
    developmentTime: 240
  },
  DEVELOPMENT: {
    baseCost: 4000,
    baseRevenue: 40,
    developmentTime: 270
  }
};

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
  money: 10000, // Starting money
  servers: [],
  pcs: [],
  software: [],
  rooms: [
    {
      id: 'room-1',
      type: 'SERVER',
      name: 'Server Room 1',
      position: [0, 0],
      size: roomTypes.SERVER.size,
      cost: roomTypes.SERVER.cost,
      maxUnits: roomTypes.SERVER.maxUnits,
      units: [], // Start with empty racks
      airConditioning: {
        level: 1,
        cost: roomTypes.SERVER.airConditioningCost,
        efficiency: 0.1
      },
      lighting: {
        color: '#4287f5', // Blue light for server rooms
        intensity: 1.5,
        cost: 200
      }
    }
  ],
  availableComponents: componentCatalog.filter(comp => comp.tier === 1), // Start with tier 1 components
  upgrades: upgradeCatalog,
  powerCapacity: 2000,
  powerUsage: 0,
  buildSpeedMultiplier: 1,
  revenueMultiplier: 1,
  powerEfficiencyMultiplier: 1,
  lastUpdate: Date.now(),
  gameTime: 0,
  activeRoomId: 'room-1',

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
    const state = get();
    
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
    
    // Add server to active room if it's a server room
    if (state.activeRoomId) {
      const activeRoom = state.rooms.find(r => r.id === state.activeRoomId);
      if (activeRoom && activeRoom.type === 'SERVER' && activeRoom.units.length < activeRoom.maxUnits) {
        set((state) => ({
          rooms: state.rooms.map(room => 
            room.id === state.activeRoomId 
              ? { ...room, units: [...room.units, newServer] } 
              : room
          ),
          servers: [...state.servers, newServer]
        }));
        return;
      }
    }
    
    // If no active room or room is full, just add to servers array
    set((state) => ({
      servers: [...state.servers, newServer]
    }));
  },

  startBuildingPC: (components) => {
    const state = get();
    
    // Calculate total power usage (considering PSU efficiency)
    const psu = components.find(c => c.type === 'PSU');
    const basePowerUsage = components.reduce((sum, comp) => sum + comp.powerUsage, 0);
    const powerEfficiency = psu ? Math.abs(psu.powerUsage) / 100 : 0;
    
    // Calculate user satisfaction based on component quality
    const totalPerformance = components.reduce((sum, comp) => sum + comp.performance, 0);
    const userSatisfaction = Math.min(100, totalPerformance / 2);
    
    const newPC: PC = {
      id: `pc-${Date.now()}`,
      components,
      status: 'building',
      buildStartTime: Date.now(),
      revenue: components.reduce((sum, comp) => sum + comp.performance, 0) * 0.05 * state.revenueMultiplier,
      powerUsage: basePowerUsage * (1 - (powerEfficiency + state.powerEfficiencyMultiplier - 1)),
      efficiency: powerEfficiency,
      userSatisfaction
    };
    
    // Add PC to active room if it's a PC room
    if (state.activeRoomId) {
      const activeRoom = state.rooms.find(r => r.id === state.activeRoomId);
      if (activeRoom && activeRoom.type === 'PC' && activeRoom.units.length < activeRoom.maxUnits) {
        set((state) => ({
          rooms: state.rooms.map(room => 
            room.id === state.activeRoomId 
              ? { ...room, units: [...room.units, newPC] } 
              : room
          ),
          pcs: [...state.pcs, newPC]
        }));
        return;
      }
    }
    
    // If no active room or room is full, just add to PCs array
    set((state) => ({
      pcs: [...state.pcs, newPC]
    }));
  },

  startDevelopingSoftware: (name, type, developers) => {
    const state = get();
    const softwareTypeInfo = softwareTypes[type];
    
    // Calculate cost based on developers
    const cost = softwareTypeInfo.baseCost * developers;
    
    if (state.money < cost) {
      return false;
    }
    
    const newSoftware: Software = {
      id: `software-${Date.now()}`,
      name,
      type,
      status: 'building',
      buildStartTime: Date.now(),
      developmentProgress: 0,
      revenue: softwareTypeInfo.baseRevenue * developers * state.revenueMultiplier,
      powerUsage: 50 * developers,
      developers
    };
    
    // Add software to active room if it's a software room
    if (state.activeRoomId) {
      const activeRoom = state.rooms.find(r => r.id === state.activeRoomId);
      if (activeRoom && activeRoom.type === 'SOFTWARE' && activeRoom.units.length < activeRoom.maxUnits) {
        set((state) => ({
          rooms: state.rooms.map(room => 
            room.id === state.activeRoomId 
              ? { ...room, units: [...room.units, newSoftware] } 
              : room
          ),
          software: [...state.software, newSoftware],
          money: state.money - cost
        }));
        return true;
      }
    }
    
    // If no active room or room is full, just add to software array
    set((state) => ({
      software: [...state.software, newSoftware],
      money: state.money - cost
    }));
    
    return true;
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
      ),
      rooms: state.rooms.map(room => ({
        ...room,
        units: room.units.map(unit => 
          'components' in unit && unit.id === serverId 
            ? { ...unit, status: 'offline' as ServerStatus } 
            : unit
        )
      }))
    }));
  },

  restartServer: (serverId) => {
    set((state) => ({
      servers: state.servers.map(server => 
        server.id === serverId ? { ...server, status: 'running' as ServerStatus } : server
      ),
      rooms: state.rooms.map(room => ({
        ...room,
        units: room.units.map(unit => 
          'components' in unit && unit.id === serverId 
            ? { ...unit, status: 'running' as ServerStatus } 
            : unit
        )
      }))
    }));
  },

  purchaseRoom: (type, position) => {
    const state = get();
    const roomInfo = roomTypes[type];
    
    if (state.money >= roomInfo.cost) {
      const newRoom: Room = {
        id: `room-${type.toLowerCase()}-${Date.now()}`,
        type,
        name: `${roomInfo.name} ${state.rooms.filter(r => r.type === type).length + 1}`,
        position,
        size: roomInfo.size,
        cost: roomInfo.cost,
        maxUnits: roomInfo.maxUnits,
        units: [],
        airConditioning: {
          level: 1,
          cost: roomInfo.airConditioningCost,
          efficiency: 0.1
        },
        lighting: {
          color: type === 'SERVER' ? '#4287f5' : type === 'PC' ? '#42f59e' : '#f542cb',
          intensity: 1.0,
          cost: 200
        }
      };
      
      set((state) => ({
        rooms: [...state.rooms, newRoom],
        money: state.money - roomInfo.cost,
        activeRoomId: newRoom.id
      }));
      
      return true;
    }
    
    return false;
  },

  setActiveRoom: (roomId) => {
    set({ activeRoomId: roomId });
  },

  updateGameState: () => {
    const currentTime = Date.now();
    const state = get();
    const timeDelta = (currentTime - state.lastUpdate) / 1000; // in seconds
    
    // Update game time
    const newGameTime = state.gameTime + timeDelta;
    
    // Update all units in all rooms
    const updatedRooms = state.rooms.map(room => {
      const updatedUnits = room.units.map(unit => {
        // Handle servers and PCs
        if ('components' in unit) {
          if (unit.status === 'building') {
            const buildTime = unit.components.reduce((sum, comp) => sum + comp.buildTime, 0) * 
              (1 - (state.buildSpeedMultiplier - 1)) * 1000; // Convert to milliseconds
            
            if (currentTime - (unit.buildStartTime || 0) >= buildTime) {
              return { ...unit, status: 'running' as ServerStatus };
            }
          }
          return unit;
        } 
        
        // Handle software
        if ('developmentProgress' in unit) {
          if (unit.status === 'building') {
            const softwareTypeInfo = softwareTypes[unit.type];
            const developmentTime = softwareTypeInfo.developmentTime * (1 - (state.buildSpeedMultiplier - 1));
            const progressIncrement = (timeDelta / developmentTime) * 100;
            
            const newProgress = unit.developmentProgress + progressIncrement;
            
            if (newProgress >= 100) {
              return { ...unit, developmentProgress: 100, status: 'running' as ServerStatus };
            }
            
            return { ...unit, developmentProgress: newProgress };
          }
          return unit;
        }
        
        return unit;
      });
      
      return { ...room, units: updatedUnits };
    });
    
    // Update servers, PCs, and software arrays to match room units
    const allServers: Server[] = [];
    const allPCs: PC[] = [];
    const allSoftware: Software[] = [];
    
    for (const room of updatedRooms) {
      for (const unit of room.units) {
        if ('components' in unit) {
          if ('userSatisfaction' in unit) {
            allPCs.push(unit as PC);
          } else {
            allServers.push(unit as Server);
          }
        } else if ('developmentProgress' in unit) {
          allSoftware.push(unit as Software);
        }
      }
    }
    
    // Calculate revenue from all running units
    const serverRevenue = allServers
      .filter(server => server.status === 'running')
      .reduce((sum, server) => sum + server.revenue * timeDelta, 0);
    
    const pcRevenue = allPCs
      .filter(pc => pc.status === 'running')
      .reduce((sum, pc) => sum + pc.revenue * timeDelta, 0);
    
    const softwareRevenue = allSoftware
      .filter(sw => sw.status === 'running')
      .reduce((sum, sw) => sum + sw.revenue * timeDelta, 0);
    
    const totalRevenue = serverRevenue + pcRevenue + softwareRevenue;

    // Calculate air conditioning costs
    const airConditioningCosts = updatedRooms.reduce((sum, room) => {
      // Base cost per room type plus cost per unit
      const baseCost = roomTypes[room.type].basePowerUsage;
      const unitCost = room.units.length * 10;
      
      // Apply air conditioning efficiency
      const totalCost = (baseCost + unitCost) * (1 - room.airConditioning.efficiency);
      
      return sum + totalCost;
    }, 0);

    // Deduct air conditioning costs from revenue
    const netRevenue = Math.max(0, totalRevenue - airConditioningCosts * timeDelta);

    // Update power usage
    const serverPower = allServers
      .filter(server => server.status === 'running')
      .reduce((sum, server) => sum + server.powerUsage, 0);
    
    const pcPower = allPCs
      .filter(pc => pc.status === 'running')
      .reduce((sum, pc) => sum + pc.powerUsage, 0);
    
    const softwarePower = allSoftware
      .filter(sw => sw.status === 'running')
      .reduce((sum, sw) => sum + sw.powerUsage, 0);
    
    // Add air conditioning power usage
    const airConditioningPower = updatedRooms.reduce((sum, room) => {
      return sum + roomTypes[room.type].basePowerUsage * room.airConditioning.level;
    }, 0);
    
    const totalPowerUsage = serverPower + pcPower + softwarePower + airConditioningPower;

    // Check if power usage exceeds capacity and shut down units if needed
    if (totalPowerUsage > state.powerCapacity) {
      // Sort all units by efficiency (revenue per watt) and shut down least efficient ones
      const allRunningUnits = [
        ...allServers.filter(s => s.status === 'running').map(s => ({ ...s, type: 'server' as const })),
        ...allPCs.filter(p => p.status === 'running').map(p => ({ ...p, type: 'pc' as const })),
        ...allSoftware.filter(sw => sw.status === 'running').map(sw => ({ ...sw, type: 'software' as const }))
      ].sort((a, b) => (a.revenue / a.powerUsage) - (b.revenue / b.powerUsage));
      
      let currentPowerUsage = totalPowerUsage;
      let i = 0;
      
      // Shut down units until power usage is below capacity
      while (currentPowerUsage > state.powerCapacity && i < allRunningUnits.length) {
        const unitToShutdown = allRunningUnits[i];
        currentPowerUsage -= unitToShutdown.powerUsage;
        
        // Mark unit for shutdown
        if (unitToShutdown.type === 'server') {
          for (const s of allServers) {
            if (s.id === unitToShutdown.id) {
              s.status = 'offline';
            }
          }
        } else if (unitToShutdown.type === 'pc') {
          for (const p of allPCs) {
            if (p.id === unitToShutdown.id) {
              p.status = 'offline';
            }
          }
        } else if (unitToShutdown.type === 'software') {
          for (const sw of allSoftware) {
            if (sw.id === unitToShutdown.id) {
              sw.status = 'offline';
            }
          }
        }
        
        // Also update in rooms
        for (const room of updatedRooms) {
          for (const unit of room.units) {
            if ('id' in unit && unit.id === unitToShutdown.id) {
              unit.status = 'offline';
            }
          }
        }
        
        i++;
      }
    }

    set({
      rooms: updatedRooms,
      servers: allServers,
      pcs: allPCs,
      software: allSoftware,
      money: state.money + netRevenue,
      powerUsage: Math.min(totalPowerUsage, state.powerCapacity),
      lastUpdate: currentTime,
      gameTime: newGameTime,
    });
  },

  // Add air conditioning upgrade function
  upgradeRoomAirConditioning: (roomId: string) => {
    const state = get();
    const room = state.rooms.find(r => r.id === roomId);
    
    if (!room) return false;
    
    const upgradeCost = room.airConditioning.cost;
    
    if (state.money < upgradeCost) return false;
    
    const newLevel = room.airConditioning.level + 1;
    const newEfficiency = Math.min(0.5, room.airConditioning.efficiency + 0.1);
    const newCost = Math.round(room.airConditioning.cost * 1.5);
    
    set({
      money: state.money - upgradeCost,
      rooms: state.rooms.map(r => 
        r.id === roomId 
          ? { 
              ...r, 
              airConditioning: {
                level: newLevel,
                efficiency: newEfficiency,
                cost: newCost
              }
            } 
          : r
      )
    });
    
    return true;
  },

  // Add lighting upgrade function
  upgradeRoomLighting: (roomId: string, color: string) => {
    const state = get();
    const room = state.rooms.find(r => r.id === roomId);
    
    if (!room) return false;
    
    const upgradeCost = room.lighting.cost;
    
    if (state.money < upgradeCost) return false;
    
    const newIntensity = Math.min(2.0, room.lighting.intensity + 0.2);
    const newCost = Math.round(room.lighting.cost * 1.5);
    
    set({
      money: state.money - upgradeCost,
      rooms: state.rooms.map(r => 
        r.id === roomId 
          ? { 
              ...r, 
              lighting: {
                color,
                intensity: newIntensity,
                cost: newCost
              }
            } 
          : r
      )
    });
    
    return true;
  },
}));

export default useGameStore; 