import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import useGameStore from '../store/gameStore';

// Format money
const formatMoney = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function SoftwareSection() {
  const { software, shutdownServer, restartServer } = useGameStore();

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Software
      </Typography>
      
      {software.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No software developed yet
        </Typography>
      ) : (
        <List dense>
          {software.map((sw) => (
            <ListItem 
              key={sw.id}
              secondaryAction={
                <Box>
                  {sw.status === 'running' ? (
                    <IconButton edge="end" size="small" onClick={() => shutdownServer(sw.id)}>
                      <PowerSettingsNewIcon fontSize="small" color="error" />
                    </IconButton>
                  ) : sw.status === 'offline' ? (
                    <IconButton edge="end" size="small" onClick={() => restartServer(sw.id)}>
                      <PlayArrowIcon fontSize="small" color="success" />
                    </IconButton>
                  ) : (
                    <Typography variant="caption">
                      {sw.developmentProgress.toFixed(0)}%
                    </Typography>
                  )}
                </Box>
              }
            >
              <ListItemText 
                primary={sw.name} 
                secondary={
                  <Typography variant="caption" component="span">
                    {sw.type} | {formatMoney(sw.revenue)}/s | Devs: {sw.developers}
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