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
    const gameLoop = setInterval(() => {
      updateGameState();
    }, 1000);

    return () => clearInterval(gameLoop);
  }, [updateGameState]);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ 
        width: '100vw', 
        height: '100vh', 
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#121212'
      }}>
        <DatacenterScene />
        <ControlPanel />
      </Box>
    </ThemeProvider>
  );
}

export default App;
