import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
} from '@mui/material';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import useGameStore from '../store/gameStore';
import type { Server } from '../store/gameStore';

// Format money
const formatMoney = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format power
const formatPower = (watts: number): string => {
  return `${watts}W`;
};

// Calculate build progress for servers under construction
const getBuildProgress = (server: Server): number => {
  if (server.status !== 'building' || !server.buildStartTime) return 0;
  
  const buildTime = server.components.reduce((sum, comp) => sum + comp.buildTime, 0) * 1000; // Convert to milliseconds
  const elapsed = Date.now() - server.buildStartTime;
  
  return Math.min(100, (elapsed / buildTime) * 100);
};

export default function ServersSection() {
  const { servers, shutdownServer, restartServer } = useGameStore();

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Servers
      </Typography>
      
      {servers.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No servers built yet
        </Typography>
      ) : (
        <List dense>
          {servers.map((server) => (
            <ListItem 
              key={server.id}
              secondaryAction={
                <Box>
                  {server.status === 'running' ? (
                    <IconButton edge="end" size="small" onClick={() => shutdownServer(server.id)}>
                      <PowerSettingsNewIcon fontSize="small" color="error" />
                    </IconButton>
                  ) : server.status === 'offline' ? (
                    <IconButton edge="end" size="small" onClick={() => restartServer(server.id)}>
                      <PlayArrowIcon fontSize="small" color="success" />
                    </IconButton>
                  ) : (
                    <CircularProgress 
                      size={16} 
                      variant="determinate" 
                      value={getBuildProgress(server)} 
                    />
                  )}
                </Box>
              }
            >
              <ListItemText 
                primary={`Server ${server.id.substring(server.id.length - 5)}`} 
                secondary={
                  <Typography variant="caption" component="span">
                    {server.status} | {formatMoney(server.revenue)}/s | {formatPower(server.powerUsage)}
                  </Typography>
                } 
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
} 