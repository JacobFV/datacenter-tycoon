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
import type { PC } from '../store/gameStore';

// Format money
const formatMoney = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Calculate build progress for PCs under construction
const getBuildProgress = (pc: PC): number => {
  if (pc.status !== 'building' || !pc.buildStartTime) return 0;
  
  const buildTime = pc.components.reduce((sum, comp) => sum + comp.buildTime, 0) * 1000; // Convert to milliseconds
  const elapsed = Date.now() - pc.buildStartTime;
  
  return Math.min(100, (elapsed / buildTime) * 100);
};

export default function PCsSection() {
  const { pcs, shutdownServer, restartServer } = useGameStore();

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        PCs
      </Typography>
      
      {pcs.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No PCs built yet
        </Typography>
      ) : (
        <List dense>
          {pcs.map((pc) => (
            <ListItem 
              key={pc.id}
              secondaryAction={
                <Box>
                  {pc.status === 'running' ? (
                    <IconButton edge="end" size="small" onClick={() => shutdownServer(pc.id)}>
                      <PowerSettingsNewIcon fontSize="small" color="error" />
                    </IconButton>
                  ) : pc.status === 'offline' ? (
                    <IconButton edge="end" size="small" onClick={() => restartServer(pc.id)}>
                      <PlayArrowIcon fontSize="small" color="success" />
                    </IconButton>
                  ) : (
                    <CircularProgress 
                      size={16} 
                      variant="determinate" 
                      value={getBuildProgress(pc)} 
                    />
                  )}
                </Box>
              }
            >
              <ListItemText 
                primary={`PC ${pc.id.substring(pc.id.length - 5)}`} 
                secondary={
                  <Typography variant="caption" component="span">
                    {pc.status} | {formatMoney(pc.revenue)}/s | Sat: {pc.userSatisfaction.toFixed(0)}%
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