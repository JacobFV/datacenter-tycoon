import { useState } from 'react';
import {
  Box,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';
import useGameStore from '../store/gameStore';
import Sidebar from './Sidebar';
import BuildSection from './BuildSection';
import ServersSection from './ServersSection';
import PCsSection from './PCsSection';
import SoftwareSection from './SoftwareSection';
import UpgradesSection from './UpgradesSection';
import RoomsSection from './RoomsSection';

// Format game time
const formatGameTime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `Day ${days}, ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Format money
const formatMoney = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function ControlPanel() {
  const {
    money,
    powerUsage,
    powerCapacity,
    gameTime,
  } = useGameStore();

  const [activeSection, setActiveSection] = useState<string>('build');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        right: 20,
        top: 20,
        width: 400,
        height: 'calc(100vh - 40px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 1000,
        backgroundColor: 'rgba(30, 30, 30, 0.9)',
      }}
    >
      <Box sx={{ display: 'flex', height: '100%' }}>
        {/* Left sidebar */}
        <Box sx={{ width: '120px', height: '100%' }}>
          <Sidebar 
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            money={formatMoney(money)}
            gameTime={formatGameTime(gameTime)}
            powerUsage={powerUsage}
            powerCapacity={powerCapacity}
          />
        </Box>
        
        {/* Right content area */}
        <Box sx={{ flexGrow: 1, height: '100%', overflowY: 'auto' }}>
          {activeSection === 'build' && <BuildSection showSnackbar={showSnackbar} />}
          {activeSection === 'servers' && <ServersSection />}
          {activeSection === 'pcs' && <PCsSection />}
          {activeSection === 'software' && <SoftwareSection />}
          {activeSection === 'upgrades' && <UpgradesSection showSnackbar={showSnackbar} />}
          {activeSection === 'rooms' && <RoomsSection showSnackbar={showSnackbar} />}
        </Box>
      </Box>

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={3000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
} 