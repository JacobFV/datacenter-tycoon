import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useTexture, Text, Environment } from '@react-three/drei';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import useGameStore from '../store/gameStore';
import type { Server } from '../store/gameStore';

interface ServerRackProps {
  position: [number, number, number];
  servers: Server[];
}

// Color mapping for server status
const statusColors: Record<string, string> = {
  building: '#FFA500',
  running: '#00FF00',
  offline: '#FF0000'
};

function ServerRack({ position, servers }: ServerRackProps) {
  const rackRef = useRef<THREE.Group>(null);
  
  // Subtle animation for the rack
  useFrame((state) => {
    if (rackRef.current) {
      rackRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.02;
    }
  });

  return (
    <group position={position} ref={rackRef}>
      {/* Rack frame */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.2, 4.2, 1.2]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Rack inner frame */}
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[2, 4, 1]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      
      {/* Servers */}
      {servers.map((server, index) => (
        <ServerUnit 
          key={server.id} 
          server={server} 
          position={[0, -1.5 + index * 0.3, 0.6]} 
        />
      ))}
      
      {/* Rack label */}
      <Text
        position={[0, 2.2, 0.7]}
        rotation={[0, 0, 0]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        RACK {position[0].toFixed(0)}-{position[2].toFixed(0)}
      </Text>
    </group>
  );
}

interface ServerUnitProps {
  server: Server;
  position: [number, number, number];
}

function ServerUnit({ server, position }: ServerUnitProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Pulse animation for building servers
  useFrame((state) => {
    if (meshRef.current && server.status === 'building') {
      meshRef.current.scale.x = 1 + Math.sin(state.clock.getElapsedTime() * 3) * 0.05;
      meshRef.current.scale.z = 1 + Math.sin(state.clock.getElapsedTime() * 3) * 0.05;
    }
  });
  
  // Calculate server performance level (1-3) based on components
  const performanceLevel = Math.min(3, Math.ceil(server.revenue / 10));
  
  return (
    <group position={position}>
      <mesh 
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[1.8, 0.25, 0.8]} />
        <meshStandardMaterial 
          color={statusColors[server.status]} 
          emissive={statusColors[server.status]}
          emissiveIntensity={server.status === 'running' ? 0.5 : 0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Server front panel with lights */}
      <mesh position={[0, 0, 0.41]}>
        <boxGeometry args={[1.7, 0.2, 0.02]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      
      {/* Status lights */}
      {Array.from({ length: performanceLevel }).map((_, i) => (
        <mesh key={`light-${server.id}-${i}`} position={[-0.7 + i * 0.3, 0, 0.43]}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial 
            color={server.status === 'running' ? '#00ff00' : '#ff0000'} 
            emissive={server.status === 'running' ? '#00ff00' : '#ff0000'}
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}
      
      {/* Server info tooltip */}
      {hovered && (
        <Text
          position={[0, 0.3, 0]}
          rotation={[0, 0, 0]}
          fontSize={0.1}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {`${server.status.toUpperCase()} - $${server.revenue.toFixed(2)}/s`}
        </Text>
      )}
    </group>
  );
}

function Floor() {
  const floorTexture = useTexture({
    map: 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@master/prototype/dark.png'
  });
  
  // Make the texture repeat
  if (floorTexture.map) {
    floorTexture.map.wrapS = floorTexture.map.wrapT = THREE.RepeatWrapping;
    floorTexture.map.repeat.set(50, 50);
  }
  
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.1, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial {...floorTexture} color="#111111" />
    </mesh>
  );
}

function DatacenterRoom() {
  // Create walls for the datacenter
  return (
    <group>
      {/* Back wall */}
      <mesh position={[0, 0, -15]} receiveShadow castShadow>
        <boxGeometry args={[40, 10, 0.5]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      
      {/* Left wall */}
      <mesh position={[-20, 0, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[30, 10, 0.5]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      {/* Right wall */}
      <mesh position={[20, 0, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[30, 10, 0.5]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      
      {/* Ceiling */}
      <mesh position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <boxGeometry args={[40, 30, 0.5]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      
      {/* Ceiling lights */}
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={`ceiling-light-${i}`} position={[(i % 3) * 10 - 10, 4.7, Math.floor(i / 3) * 10 - 10]}>
          <mesh>
            <boxGeometry args={[3, 0.2, 3]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          <mesh position={[0, -0.1, 0]}>
            <boxGeometry args={[2.8, 0.1, 2.8]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
          </mesh>
          <pointLight position={[0, -1, 0]} intensity={5} distance={15} decay={2} />
        </group>
      ))}
    </group>
  );
}

export default function DatacenterScene() {
  const { servers } = useGameStore();

  const serverRacks: Server[][] = [];
  const serversPerRack = 10;
  
  // Organize servers into racks
  for (let i = 0; i < servers.length; i += serversPerRack) {
    serverRacks.push(servers.slice(i, i + serversPerRack));
  }

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
      
      <DatacenterRoom />
      <Floor />
      
      {serverRacks.map((rackServers, rackIndex) => {
        // Arrange racks in a grid pattern
        const gridSize = Math.ceil(Math.sqrt(serverRacks.length));
        const row = Math.floor(rackIndex / gridSize);
        const col = rackIndex % gridSize;
        
        const x = (col - gridSize / 2) * 4 + 2;
        const z = (row - gridSize / 2) * 4 + 2;
        
        return (
          <ServerRack
            key={`rack-${rackIndex}`}
            position={[x, 0, z]}
            servers={rackServers}
          />
        );
      })}
      
      <Environment preset="warehouse" />
    </Canvas>
  );
} 