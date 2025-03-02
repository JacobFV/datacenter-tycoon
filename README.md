# Datacenter Tycoon

A 3D datacenter building simulation game built with React, Three.js, and TypeScript.

## Overview

Datacenter Tycoon is a resource management game where players build and manage their own datacenter. Purchase components, build servers, and optimize your datacenter to maximize profits while managing power constraints.

## Features

- **3D Visualization**: View your datacenter in a fully interactive 3D environment
- **Component Management**: Purchase various PC components (CPUs, GPUs, RAM, etc.) to build servers
- **Resource Constraints**: Manage your budget and power capacity
- **Progression System**: Unlock better components through upgrades
- **Real-time Simulation**: Servers take time to build and generate revenue over time

## Game Mechanics

- **Building Servers**: Combine different components to create servers with unique performance characteristics
- **Power Management**: More powerful components consume more electricity - stay within your power capacity
- **Revenue Generation**: Servers generate income based on their component performance
- **Upgrades**: Purchase upgrades to improve efficiency, build speed, and unlock better components

## Technologies Used

- React
- TypeScript
- Three.js
- React Three Fiber
- Material UI
- Zustand (State Management)

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or bun

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   bun install
   ```
3. Start the development server:
   ```
   bun dev
   ```

## How to Play

1. **Purchase Components**: Select components from the Build tab
2. **Build Servers**: Combine components and click "Build Server"
3. **Manage Resources**: Keep an eye on your power usage and budget
4. **Purchase Upgrades**: Buy upgrades to improve your datacenter's efficiency
5. **Expand**: Build more servers to increase your revenue

## Game Tips

- Balance performance and power consumption
- Prioritize upgrades that increase revenue or reduce power usage
- More expensive components generally offer better performance-to-power ratios
- Servers can be shut down temporarily if you exceed your power capacity

## License

MIT
