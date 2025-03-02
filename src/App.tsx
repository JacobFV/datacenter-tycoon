import { useEffect } from 'react';
import DatacenterScene from './scenes/DatacenterScene';
import ControlPanel from './components/ControlPanel';
import useGameStore from './store/gameStore';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';

// Create a dark theme for the game
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4caf50',
    },
    secondary: {
      main: '#2196f3',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

function App() {
  const { updateGameState } = useGameStore();

  // Update game state every second
  useEffect(() => {
    const interval = setInterval(() => {
      updateGameState();
    }, 1000);

    return () => clearInterval(interval);
  }, [updateGameState]);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        height: '100vh' 
      }}>
        <Box sx={{ 
          flex: 1, 
          height: { xs: '50vh', md: '100vh' },
          position: 'relative'
        }}>
          <DatacenterScene />
        </Box>
        <Box sx={{ 
          width: { xs: '100%', md: '400px' }, 
          height: { xs: '50vh', md: '100vh' }, 
          overflow: 'auto',
          borderLeft: '1px solid rgba(255, 255, 255, 0.12)'
        }}>
          <ControlPanel />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
