import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import * as THREE from 'three';
import useGameStore from '../store/gameStore';
import type { Server, PC, Software, Room } from '../store/gameStore';

// Server Rack Component
interface ServerRackProps {
  position: [number, number, number];
  servers: Server[];
}

// PC Desk Component
interface PCDeskProps {
  position: [number, number, number];
  pc: PC;
}

// Software Workstation Component
interface SoftwareWorkstationProps {
  position: [number, number, number];
  software: Software;
}

// Room Props
interface RoomProps {
  room: Room;
  position: [number, number, number];
}

function ServerRack({ position, servers }: ServerRackProps) {
  // Rack dimensions
  const width = 2;
  const height = 4;
  const depth = 1;
  
  return (
    <group position={position}>
      {/* Rack frame */}
      <mesh position={[0, height/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      
      {/* Server units */}
      {servers.map((server, index) => {
        // Position servers vertically within the rack
        const serverHeight = 0.25; // Height of each server unit
        const yPos = index * serverHeight - height/2 + serverHeight/2 + 0.1;
        
        return (
          <ServerUnit 
            key={server.id} 
            server={server} 
            position={[0, yPos, depth/2 + 0.01]} 
          />
        );
      })}
    </group>
  );
}

function PCDesk({ position, pc }: PCDeskProps) {
  // Desk dimensions
  const width = 1.2;
  const height = 0.8;
  const depth = 0.8;
  
  // PC status color
  const statusColor = pc.status === 'running' 
    ? '#00ff00' 
    : pc.status === 'building' 
      ? '#ffaa00' 
      : '#ff0000';
  
  return (
    <group position={position}>
      {/* Desk */}
      <mesh position={[0, height/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* PC Tower */}
      <mesh position={[width/2 - 0.15, height + 0.2, 0]} castShadow>
        <boxGeometry args={[0.3, 0.4, 0.3]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      
      {/* Monitor */}
      <mesh position={[0, height + 0.3, 0]} castShadow>
        <boxGeometry args={[0.6, 0.4, 0.05]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      
      {/* Monitor Screen */}
      <mesh position={[0, height + 0.3, 0.03]} castShadow>
        <boxGeometry args={[0.55, 0.35, 0.01]} />
        <meshStandardMaterial color="#333" emissive={new THREE.Color(statusColor)} emissiveIntensity={0.5} />
      </mesh>
      
      {/* Keyboard */}
      <mesh position={[0, height + 0.05, -0.1]} castShadow>
        <boxGeometry args={[0.4, 0.02, 0.15]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      
      {/* Mouse */}
      <mesh position={[0.25, height + 0.05, -0.1]} castShadow>
        <boxGeometry args={[0.1, 0.02, 0.06]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      
      {/* Chair */}
      <mesh position={[0, height/2, -0.6]} castShadow>
        <boxGeometry args={[0.5, 0.1, 0.5]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0, height, -0.8]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.1]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </group>
  );
}

function SoftwareWorkstation({ position, software }: SoftwareWorkstationProps) {
  // Workstation dimensions
  const width = 2.5;
  const height = 0.8;
  const depth = 1.5;
  
  // Software status color
  const statusColor = software.status === 'running' 
    ? '#00ff00' 
    : software.status === 'building' 
      ? '#ffaa00' 
      : '#ff0000';
  
  // Development progress
  const progress = software.status === 'building' ? software.developmentProgress / 100 : 1;
  
  return (
    <group position={position}>
      {/* Large desk */}
      <mesh position={[0, height/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Multiple monitors */}
      {Array.from({ length: software.developers }).map((_, i) => {
        const offset = (i - (software.developers - 1) / 2) * 0.7;
        return (
          <group key={`monitor-${software.id}-${i}`} position={[offset, 0, 0]}>
            {/* Monitor */}
            <mesh position={[0, height + 0.3, -0.2]} castShadow>
              <boxGeometry args={[0.6, 0.4, 0.05]} />
              <meshStandardMaterial color="#111" />
            </mesh>
            
            {/* Monitor Screen */}
            <mesh position={[0, height + 0.3, -0.17]} castShadow>
              <boxGeometry args={[0.55, 0.35, 0.01]} />
              <meshStandardMaterial color="#333" emissive={new THREE.Color(statusColor)} emissiveIntensity={0.5} />
            </mesh>
            
            {/* Keyboard */}
            <mesh position={[0, height + 0.05, 0]} castShadow>
              <boxGeometry args={[0.4, 0.02, 0.15]} />
              <meshStandardMaterial color="#444" />
            </mesh>
            
            {/* Mouse */}
            <mesh position={[0.25, height + 0.05, 0]} castShadow>
              <boxGeometry args={[0.1, 0.02, 0.06]} />
              <meshStandardMaterial color="#444" />
            </mesh>
          </group>
        );
      })}
      
      {/* Progress bar */}
      <group position={[0, height + 0.7, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[width - 0.5, 0.1, 0.1]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[-(width - 0.5) / 2 + ((width - 0.5) * progress) / 2, 0, 0.06]} castShadow>
          <boxGeometry args={[(width - 0.5) * progress, 0.08, 0.02]} />
          <meshStandardMaterial color={statusColor} />
        </mesh>
      </group>
    </group>
  );
}

interface ServerUnitProps {
  server: Server;
  position: [number, number, number];
}

function ServerUnit({ server, position }: ServerUnitProps) {
  // Server unit dimensions
  const width = 1.8;
  const height = 0.2;
  const depth = 0.8;
  
  // Server status color
  const statusColor = server.status === 'running' 
    ? '#00ff00' 
    : server.status === 'building' 
      ? '#ffaa00' 
      : '#ff0000';
  
  return (
    <group position={position}>
      {/* Server chassis */}
      <mesh castShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      
      {/* Front panel with status lights */}
      <mesh position={[0, 0, depth/2 + 0.001]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      
      {/* Status light */}
      <mesh position={[width/2 - 0.1, 0, depth/2 + 0.01]}>
        <circleGeometry args={[0.03, 16]} />
        <meshStandardMaterial color={statusColor} emissive={new THREE.Color(statusColor)} emissiveIntensity={0.5} />
      </mesh>
      
      {/* Activity lights */}
      {server.status === 'running' && (
        <>
          <mesh position={[width/2 - 0.2, 0, depth/2 + 0.01]}>
            <circleGeometry args={[0.02, 16]} />
            <meshStandardMaterial color="#ffff00" emissive={new THREE.Color("#ffff00")} emissiveIntensity={Math.random() * 0.5} />
          </mesh>
          <mesh position={[width/2 - 0.3, 0, depth/2 + 0.01]}>
            <circleGeometry args={[0.02, 16]} />
            <meshStandardMaterial color="#ffff00" emissive={new THREE.Color("#ffff00")} emissiveIntensity={Math.random() * 0.5} />
          </mesh>
        </>
      )}
    </group>
  );
}

function Floor() {
  // Create a canvas texture for the floor grid
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    if (context) {
      // Fill with dark color
      context.fillStyle = '#111';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid
      context.strokeStyle = '#333';
      context.lineWidth = 2;
      
      const gridSize = 64;
      for (let i = 0; i <= canvas.width; i += gridSize) {
        context.beginPath();
        context.moveTo(i, 0);
        context.lineTo(i, canvas.height);
        context.stroke();
        
        context.beginPath();
        context.moveTo(0, i);
        context.lineTo(canvas.width, i);
        context.stroke();
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);
    
    return texture;
  }, []);
  
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

function DatacenterRoomComponent({ room, position }: RoomProps) {
  const roomSize = room.size * 5; // Scale room size
  const wallHeight = 3;
  
  // Room color based on type
  const roomColors = {
    SERVER: '#1a2a3a',
    PC: '#2a1a3a',
    SOFTWARE: '#3a1a2a'
  };
  
  const roomColor = roomColors[room.type];
  
  return (
    <group position={position}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[roomSize, roomSize]} />
        <meshStandardMaterial color={roomColor} />
      </mesh>
      
      {/* Walls */}
      <mesh position={[0, wallHeight/2, -roomSize/2]} castShadow receiveShadow>
        <boxGeometry args={[roomSize, wallHeight, 0.2]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0, wallHeight/2, roomSize/2]} castShadow receiveShadow>
        <boxGeometry args={[roomSize, wallHeight, 0.2]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[-roomSize/2, wallHeight/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, wallHeight, roomSize]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[roomSize/2, wallHeight/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, wallHeight, roomSize]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      
      {/* Room contents based on type */}
      {room.type === 'SERVER' && (
        <ServerRoom room={room} />
      )}
      
      {room.type === 'PC' && (
        <PCRoom room={room} />
      )}
      
      {room.type === 'SOFTWARE' && (
        <SoftwareRoom room={room} />
      )}
      
      {/* Room label */}
      <group position={[0, wallHeight + 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <planeGeometry args={[roomSize * 0.8, 1]} />
          <meshBasicMaterial color="#000" transparent opacity={0.7} />
        </mesh>
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.5}
          color="#fff"
          anchorX="center"
          anchorY="middle"
        >
          {room.name}
        </Text>
      </group>
      
      {/* Ceiling lights */}
      {Array.from({ length: Math.ceil(room.size / 2) }).map((_, i) => (
        <pointLight 
          key={`light-${room.id}-${i}`}
          position={[
            (i - Math.floor(room.size / 4)) * 3, 
            wallHeight - 0.5, 
            0
          ]} 
          intensity={10} 
          distance={roomSize} 
          decay={2} 
        />
      ))}
    </group>
  );
}

function ServerRoom({ room }: { room: Room }) {
  const servers = room.units.filter(unit => 'components' in unit && !('userSatisfaction' in unit)) as Server[];
  
  // Organize servers into racks
  const serversPerRack = 10;
  const racks: Server[][] = [];
  
  for (let i = 0; i < servers.length; i += serversPerRack) {
    racks.push(servers.slice(i, i + serversPerRack));
  }
  
  const roomSize = room.size * 5;
  const rackSpacing = roomSize / (Math.max(racks.length, 1) + 1);
  
  return (
    <group>
      {racks.map((rackServers, index) => {
        const xPos = (index + 1) * rackSpacing - roomSize / 2;
        return (
          <ServerRack 
            key={`rack-${index}-${room.id}`} 
            position={[xPos, 0, 0]} 
            servers={rackServers} 
          />
        );
      })}
    </group>
  );
}

function PCRoom({ room }: { room: Room }) {
  const pcs = room.units.filter(unit => 'components' in unit && 'userSatisfaction' in unit) as PC[];
  
  const roomSize = room.size * 5;
  const rows = Math.ceil(Math.sqrt(room.maxUnits));
  const spacing = roomSize / (rows + 1);
  
  return (
    <group>
      {pcs.map((pc, index) => {
        const row = Math.floor(index / rows);
        const col = index % rows;
        
        const xPos = (col + 1) * spacing - roomSize / 2;
        const zPos = (row + 1) * spacing - roomSize / 2;
        
        return (
          <PCDesk 
            key={pc.id} 
            position={[xPos, 0, zPos]} 
            pc={pc} 
          />
        );
      })}
    </group>
  );
}

function SoftwareRoom({ room }: { room: Room }) {
  const software = room.units.filter(unit => 'developmentProgress' in unit) as Software[];
  
  const roomSize = room.size * 5;
  const spacing = roomSize / (Math.max(software.length, 1) + 1);
  
  return (
    <group>
      {software.map((sw, index) => {
        const xPos = (index + 1) * spacing - roomSize / 2;
        
        return (
          <SoftwareWorkstation 
            key={sw.id} 
            position={[xPos, 0, 0]} 
            software={sw} 
          />
        );
      })}
    </group>
  );
}

function DatacenterMap() {
  const { rooms, activeRoomId, setActiveRoom } = useGameStore();
  
  // Grid size for the map
  const gridSize = 10;
  const cellSize = 1;
  
  return (
    <group position={[0, 10, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Map background */}
      <mesh>
        <planeGeometry args={[gridSize * cellSize, gridSize * cellSize]} />
        <meshBasicMaterial color="#111" />
      </mesh>
      
      {/* Grid lines */}
      {Array.from({ length: gridSize + 1 }).map((_, i) => (
        <group key={`grid-${i}`}>
          <mesh position={[i * cellSize - (gridSize * cellSize) / 2, 0, 0.01]}>
            <boxGeometry args={[0.02, gridSize * cellSize, 0.01]} />
            <meshBasicMaterial color="#333" />
          </mesh>
          <mesh position={[0, i * cellSize - (gridSize * cellSize) / 2, 0.01]}>
            <boxGeometry args={[gridSize * cellSize, 0.02, 0.01]} />
            <meshBasicMaterial color="#333" />
          </mesh>
        </group>
      ))}
      
      {/* Room representations */}
      {rooms.map(room => {
        const [x, y] = room.position;
        const size = room.size * cellSize;
        
        // Room color based on type
        const roomColors = {
          SERVER: '#1a4a6a',
          PC: '#4a1a6a',
          SOFTWARE: '#6a1a4a'
        };
        
        const isActive = room.id === activeRoomId;
        
        return (
          <mesh 
            key={room.id}
            position={[
              x * cellSize - (gridSize * cellSize) / 2 + size / 2, 
              y * cellSize - (gridSize * cellSize) / 2 + size / 2, 
              0.02
            ]}
            onClick={() => setActiveRoom(room.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setActiveRoom(room.id);
              }
            }}
            tabIndex={0}
          >
            <boxGeometry args={[size, size, 0.05]} />
            <meshBasicMaterial 
              color={roomColors[room.type]} 
              emissive={new THREE.Color(isActive ? '#ffffff' : roomColors[room.type])} 
              emissiveIntensity={isActive ? 0.5 : 0}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export default function DatacenterScene() {
  const { rooms, activeRoomId } = useGameStore();
  const activeRoom = rooms.find(room => room.id === activeRoomId);
  
  // Generate unique IDs for rooms
  const roomIds = useMemo(() => 
    Array.from({ length: Math.max(1, rooms.length) }).map((_, i) => `room-${i}-${Date.now()}`),
    [rooms.length]
  );

  return (
    <Canvas shadows style={{ width: '100%', height: '100vh' }}>
      <color attach="background" args={['#050505']} />
      
      <PerspectiveCamera makeDefault position={[15, 15, 15]} fov={50} />
      <OrbitControls 
        target={[0, 0, 0]} 
        maxPolarAngle={Math.PI / 2 - 0.1} 
        minDistance={5}
        maxDistance={50}
      />
      
      <fog attach="fog" args={['#050505', 10, 50]} />
      
      <ambientLight intensity={0.2} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={0.5} 
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048} 
      />
      
      <Floor />
      
      {/* Display active room */}
      {activeRoom && (
        <DatacenterRoomComponent 
          key={`room-${activeRoom.id}`}
          room={activeRoom}
          position={[0, 0, 0]}
        />
      )}
      
      {/* Datacenter map for navigation */}
      <DatacenterMap />
    </Canvas>
  );
} 