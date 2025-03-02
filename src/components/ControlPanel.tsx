import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  CircularProgress,
  Tabs,
  Tab,
  Tooltip,
  IconButton,
  Chip,
  LinearProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InfoIcon from '@mui/icons-material/Info';
import useGameStore from '../store/gameStore';
import type { Component, Server } from '../store/gameStore';

const formatMoney = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatPower = (watts: number): string => {
  return `${watts}W`;
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 1 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ControlPanel() {
  const {
    money,
    servers,
    availableComponents,
    upgrades,
    powerUsage,
    powerCapacity,
    startBuildingServer,
    purchaseUpgrade,
    shutdownServer,
    restartServer,
    gameTime,
    purchaseComponent,
  } = useGameStore();

  const [selectedComponents, setSelectedComponents] = useState<Component[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddComponent = (component: Component) => {
    // First purchase the component
    if (purchaseComponent(component)) {
      setSelectedComponents([...selectedComponents, component]);
      showSnackbar(`Added ${component.name} to build queue`, 'success');
    } else {
      showSnackbar(`Not enough money to purchase ${component.name}`, 'error');
    }
  };

  const handleRemoveComponent = (index: number) => {
    const removedComponent = selectedComponents[index];
    setSelectedComponents(selectedComponents.filter((_: Component, i: number) => i !== index));
    showSnackbar(`Removed ${removedComponent.name} from build queue`, 'success');
  };

  const handleBuildServer = () => {
    if (selectedComponents.length > 0) {
      // Check if we have all required component types
      const hasRequiredComponents = 
        selectedComponents.some(c => c.type === 'CPU') &&
        selectedComponents.some(c => c.type === 'RAM') &&
        selectedComponents.some(c => c.type === 'MOTHERBOARD');
      
      if (!hasRequiredComponents) {
        showSnackbar('Server requires at least a CPU, RAM, and Motherboard', 'error');
        return;
      }
      
      startBuildingServer(selectedComponents);
      setSelectedComponents([]);
      showSnackbar('Server build started!', 'success');
    } else {
      showSnackbar('No components selected', 'error');
    }
  };

  const handlePurchaseUpgrade = (upgradeId: string) => {
    if (purchaseUpgrade(upgradeId)) {
      const upgrade = upgrades.find(u => u.id === upgradeId);
      showSnackbar(`Purchased upgrade: ${upgrade?.name}`, 'success');
    } else {
      showSnackbar('Failed to purchase upgrade', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const totalCost = selectedComponents.reduce((sum: number, comp: Component) => sum + comp.cost, 0);
  const estimatedRevenue = selectedComponents.reduce((sum: number, comp: Component) => sum + comp.performance, 0) * 0.1;
  
  // Group components by type
  const componentsByType: Record<string, Component[]> = {};
  for (const component of availableComponents) {
    if (!componentsByType[component.type]) {
      componentsByType[component.type] = [];
    }
    componentsByType[component.type].push(component);
  }

  // Format game time
  const formatGameTime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `Day ${days}, ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Calculate build progress for servers under construction
  const getBuildProgress = (server: Server): number => {
    if (server.status !== 'building' || !server.buildStartTime) return 0;
    
    const totalBuildTime = server.components.reduce((sum, comp) => sum + comp.buildTime, 0) * 1000;
    const elapsedTime = Date.now() - server.buildStartTime;
    
    return Math.min(100, (elapsedTime / totalBuildTime) * 100);
  };

  // Check if a component type is already in the build queue
  const isComponentTypeInQueue = (type: string): boolean => {
    return selectedComponents.some(comp => comp.type === type);
  };

  // Get missing required components
  const getMissingRequiredComponents = (): string[] => {
    const required = ['CPU', 'RAM', 'MOTHERBOARD'];
    return required.filter(type => !selectedComponents.some(comp => comp.type === type));
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        right: 20,
        top: 20,
        width: 400,
        maxHeight: '95vh',
        overflowY: 'auto',
        p: 2,
        zIndex: 1000,
        backgroundColor: 'rgba(30, 30, 30, 0.9)',
      }}
    >
      <Typography variant="h5" gutterBottom>
        Datacenter Tycoon
      </Typography>
      
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            {formatMoney(money)}
          </Typography>
          <Typography variant="body2">
            {formatGameTime(gameTime)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2">
            Power: {formatPower(powerUsage)} / {formatPower(powerCapacity)}
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={(powerUsage / powerCapacity) * 100} 
            color={powerUsage > powerCapacity * 0.9 ? "error" : "primary"}
            sx={{ mt: 0.5, height: 8, borderRadius: 1 }}
          />
        </Box>
      </Box>

      <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
        <Tab label="Build" />
        <Tab label="Servers" />
        <Tab label="Upgrades" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Components
        </Typography>

        {Object.entries(componentsByType).map(([type, components]) => (
          <Box key={type} sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {type}
              {type === 'PSU' || type === 'STORAGE' || type === 'GPU' ? 
                '' : 
                <Chip 
                  size="small" 
                  label="Required" 
                  color={isComponentTypeInQueue(type) ? "success" : "warning"}
                  sx={{ ml: 1, height: 16, fontSize: '0.6rem' }}
                />
              }
            </Typography>
            <Grid container spacing={1}>
              {components.map((component) => (
                <Grid item xs={12} key={component.id}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => handleAddComponent(component)}
                    disabled={money < component.cost || 
                      (isComponentTypeInQueue(component.type) && 
                      (component.type === 'CPU' || component.type === 'MOTHERBOARD'))}
                    sx={{ 
                      justifyContent: 'flex-start', 
                      textAlign: 'left',
                      height: '60px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {component.name}
                        </Typography>
                        <Typography variant="body2">
                          {formatMoney(component.cost)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Chip 
                          label={`Perf: ${component.performance}`} 
                          size="small" 
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                        <Chip 
                          label={`Power: ${formatPower(component.powerUsage)}`} 
                          size="small" 
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                        <Tooltip title={component.description} arrow>
                          <InfoIcon sx={{ fontSize: 16, ml: 'auto' }} />
                        </Tooltip>
                      </Box>
                    </Box>
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Server Build Queue
        </Typography>

        {selectedComponents.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', my: 2, textAlign: 'center' }}>
            Add components to build a server
          </Typography>
        ) : (
          <List sx={{ maxHeight: 200, overflow: 'auto' }}>
            {selectedComponents.map((component, index) => (
              <ListItem
                key={`${component.id}-${index}`}
                secondaryAction={
                  <IconButton
                    edge="end"
                    size="small"
                    color="error"
                    onClick={() => handleRemoveComponent(index)}
                  >
                    <PowerSettingsNewIcon fontSize="small" />
                  </IconButton>
                }
                sx={{ py: 0.5 }}
              >
                <ListItemText
                  primary={component.name}
                  secondary={formatMoney(component.cost)}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
          </List>
        )}

        {selectedComponents.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">
                Total Cost: {formatMoney(totalCost)}
              </Typography>
              <Typography variant="body2">
                Est. Revenue: {formatMoney(estimatedRevenue)}/s
              </Typography>
            </Box>
            
            {getMissingRequiredComponents().length > 0 && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1 }}>
                Missing required components: {getMissingRequiredComponents().join(', ')}
              </Typography>
            )}
            
            <Button
              variant="contained"
              fullWidth
              onClick={handleBuildServer}
              disabled={getMissingRequiredComponents().length > 0}
            >
              Build Server
            </Button>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Active Servers ({servers.length})
        </Typography>

        {servers.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', my: 2, textAlign: 'center' }}>
            No servers built yet. Go to the Build tab to create your first server.
          </Typography>
        ) : (
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {servers.map((server) => (
              <Paper key={server.id} sx={{ mb: 1, p: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">
                    Server {server.id.slice(-4)}
                  </Typography>
                  {server.status === 'running' ? (
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => shutdownServer(server.id)}
                      title="Shutdown"
                    >
                      <PowerSettingsNewIcon fontSize="small" />
                    </IconButton>
                  ) : server.status === 'offline' ? (
                    <IconButton 
                      size="small" 
                      color="success" 
                      onClick={() => restartServer(server.id)}
                      title="Start"
                    >
                      <PlayArrowIcon fontSize="small" />
                    </IconButton>
                  ) : (
                    <CircularProgress size={20} />
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="body2">
                    Status: 
                    <Chip 
                      label={server.status} 
                      size="small" 
                      color={
                        server.status === 'running' ? 'success' : 
                        server.status === 'building' ? 'warning' : 'error'
                      }
                      sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                    />
                  </Typography>
                  <Typography variant="body2">
                    {formatMoney(server.revenue)}/s
                  </Typography>
                </Box>
                
                {server.status === 'building' && (
                  <Box sx={{ width: '100%', mt: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={getBuildProgress(server)} 
                    />
                  </Box>
                )}
                
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" sx={{ display: 'block' }}>
                    Components: {server.components.map(c => c.name).join(', ')}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block' }}>
                    Power Usage: {formatPower(server.powerUsage)}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </List>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Available Upgrades
        </Typography>

        <Grid container spacing={2}>
          {upgrades.map((upgrade) => (
            <Grid item xs={12} key={upgrade.id}>
              <Paper 
                sx={{ 
                  p: 1.5, 
                  opacity: upgrade.applied ? 0.7 : 1,
                  border: upgrade.applied ? '1px solid #4caf50' : 'none'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">
                    {upgrade.name}
                    {upgrade.applied && (
                      <Chip 
                        label="Purchased" 
                        size="small" 
                        color="success" 
                        sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </Typography>
                  <Typography variant="body2">
                    {formatMoney(upgrade.cost)}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                  {upgrade.description}
                </Typography>
                {!upgrade.applied && (
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    sx={{ mt: 1 }}
                    disabled={money < upgrade.cost}
                    onClick={() => handlePurchaseUpgrade(upgrade.id)}
                  >
                    Purchase
                  </Button>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

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