import React, { useState } from 'react';
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
  Card,
  CardContent,
  CardActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import useGameStore from '../store/gameStore';
import type { Component, Server, PC, Software, RoomType } from '../store/gameStore';

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
      style={{ flexGrow: 1, overflow: 'auto' }}
      {...other}
    >
      {value === index && (
        <Box>
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
    pcs,
    software,
    rooms,
    activeRoomId,
    availableComponents,
    upgrades,
    powerUsage,
    powerCapacity,
    gameTime,
    purchaseComponent,
    startBuildingServer,
    startBuildingPC,
    startDevelopingSoftware,
    purchaseUpgrade,
    shutdownServer,
    restartServer,
    purchaseRoom,
    setActiveRoom,
  } = useGameStore();

  const [selectedComponents, setSelectedComponents] = useState<Component[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [softwareName, setSoftwareName] = useState('');
  const [softwareType, setSoftwareType] = useState<'OS' | 'PRODUCTIVITY' | 'SECURITY' | 'DEVELOPMENT'>('OS');
  const [developers, setDevelopers] = useState(1);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddComponent = (component: Component) => {
    // Check if we can purchase this component
    if (purchaseComponent(component)) {
      setSelectedComponents([...selectedComponents, component]);
      showSnackbar(`Added ${component.name} to build queue`, 'success');
    } else {
      showSnackbar(`Not enough money to purchase ${component.name}`, 'error');
    }
  };

  const handleRemoveComponent = (index: number) => {
    const newComponents = [...selectedComponents];
    const removed = newComponents.splice(index, 1)[0];
    setSelectedComponents(newComponents);
    showSnackbar(`Removed ${removed.name} from build queue`, 'success');
  };

  const handleBuildServer = () => {
    // Check if we have the required components
    const missingComponents = getMissingRequiredComponents();
    
    if (missingComponents.length > 0) {
      showSnackbar(`Missing required components: ${missingComponents.join(', ')}`, 'error');
      return;
    }
    
    startBuildingServer(selectedComponents);
    showSnackbar('Server build started!', 'success');
    setSelectedComponents([]);
  };
  
  const handleBuildPC = () => {
    // Check if we have the required components for a PC
    const hasCPU = selectedComponents.some(c => c.type === 'CPU');
    const hasRAM = selectedComponents.some(c => c.type === 'RAM');
    const hasMotherboard = selectedComponents.some(c => c.type === 'MOTHERBOARD');
    const hasStorage = selectedComponents.some(c => c.type === 'STORAGE');
    
    const missingComponents = [];
    if (!hasCPU) missingComponents.push('CPU');
    if (!hasRAM) missingComponents.push('RAM');
    if (!hasMotherboard) missingComponents.push('MOTHERBOARD');
    if (!hasStorage) missingComponents.push('STORAGE');
    
    if (missingComponents.length > 0) {
      showSnackbar(`Missing required components: ${missingComponents.join(', ')}`, 'error');
      return;
    }
    
    startBuildingPC(selectedComponents);
    showSnackbar('PC build started!', 'success');
    setSelectedComponents([]);
  };

  const handlePurchaseUpgrade = (upgradeId: string) => {
    const success = purchaseUpgrade(upgradeId);
    if (success) {
      showSnackbar('Upgrade purchased successfully!', 'success');
    } else {
      showSnackbar('Not enough money for this upgrade', 'error');
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
  const getBuildProgress = (server: Server | PC): number => {
    if (server.status !== 'building' || !server.buildStartTime) return 0;
    
    const buildTime = server.components.reduce((sum, comp) => sum + comp.buildTime, 0) * 1000; // Convert to milliseconds
    const elapsed = Date.now() - server.buildStartTime;
    
    return Math.min(100, (elapsed / buildTime) * 100);
  };

  // Check if a component type is already in the build queue
  const isComponentTypeInQueue = (type: string): boolean => {
    return selectedComponents.some(comp => comp.type === type);
  };

  // Get missing required components
  const getMissingRequiredComponents = (): string[] => {
    const hasCPU = selectedComponents.some(c => c.type === 'CPU');
    const hasRAM = selectedComponents.some(c => c.type === 'RAM');
    const hasMotherboard = selectedComponents.some(c => c.type === 'MOTHERBOARD');
    
    const missing = [];
    if (!hasCPU) missing.push('CPU');
    if (!hasRAM) missing.push('RAM');
    if (!hasMotherboard) missing.push('MOTHERBOARD');
    
    return missing;
  };

  // Get active room
  const activeRoom = rooms.find(room => room.id === activeRoomId);

  // Check if the active room is of a specific type
  const isActiveRoomType = (type: 'SERVER' | 'PC' | 'SOFTWARE'): boolean => {
    return activeRoom?.type === type;
  };

  const handleDevelopSoftware = () => {
    if (!softwareName.trim()) {
      showSnackbar('Please enter a software name', 'error');
      return;
    }
    
    const success = startDevelopingSoftware(softwareName, softwareType, developers);
    if (success) {
      showSnackbar(`Started developing ${softwareName}!`, 'success');
      setSoftwareName('');
      setDevelopers(1);
    } else {
      showSnackbar('Not enough money to start development', 'error');
    }
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
        <Tab label="Rooms" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Available Components
          </Typography>
          
          <Grid container spacing={2}>
            {availableComponents.map((component) => (
              <Grid item xs={12} sm={6} md={4} key={component.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="div">
                      {component.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Type: {component.type}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Performance: {component.performance}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Power: {formatPower(component.powerUsage)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cost: {formatMoney(component.cost)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Build Time: {component.buildTime}s
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Tooltip title={component.description}>
                      <IconButton size="small">
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                    <Button 
                      size="small" 
                      onClick={() => handleAddComponent(component)}
                      disabled={
                        money < component.cost || 
                        (component.type === 'CPU' && isComponentTypeInQueue('CPU')) ||
                        (component.type === 'MOTHERBOARD' && isComponentTypeInQueue('MOTHERBOARD'))
                      }
                    >
                      Add to Build ({formatMoney(component.cost)})
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Build Queue
            </Typography>
            
            {selectedComponents.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No components selected. Add components to build a server or PC.
              </Typography>
            ) : (
              <>
                <List>
                  {selectedComponents.map((component, index) => (
                    <ListItem 
                      key={`${component.id}-${index}`}
                      secondaryAction={
                        <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveComponent(index)}>
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText 
                        primary={component.name} 
                        secondary={`${component.type} - ${formatMoney(component.cost)}`} 
                      />
                    </ListItem>
                  ))}
                </List>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Typography variant="body1">
                    Total Cost: {formatMoney(selectedComponents.reduce((sum, comp) => sum + comp.cost, 0))}
                  </Typography>
                  <Typography variant="body1">
                    Components: {selectedComponents.length}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                  {isActiveRoomType('SERVER') && (
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={handleBuildServer}
                      disabled={selectedComponents.length === 0}
                    >
                      Build Server
                    </Button>
                  )}
                  
                  {isActiveRoomType('PC') && (
                    <Button 
                      variant="contained" 
                      color="secondary" 
                      onClick={handleBuildPC}
                      disabled={selectedComponents.length === 0}
                    >
                      Build PC
                    </Button>
                  )}
                  
                  {!isActiveRoomType('SERVER') && !isActiveRoomType('PC') && (
                    <Typography variant="body2" color="error">
                      Please select a Server Room or PC Room to build in
                    </Typography>
                  )}
                </Box>
              </>
            )}
          </Box>
          
          {isActiveRoomType('SOFTWARE') && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Develop Software
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Software Name"
                    variant="outlined"
                    fullWidth
                    value={softwareName}
                    onChange={(e) => setSoftwareName(e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Software Type</InputLabel>
                    <Select
                      value={softwareType}
                      label="Software Type"
                      onChange={(e) => setSoftwareType(e.target.value as any)}
                    >
                      <MenuItem value="OS">Operating System</MenuItem>
                      <MenuItem value="PRODUCTIVITY">Productivity Suite</MenuItem>
                      <MenuItem value="SECURITY">Security Software</MenuItem>
                      <MenuItem value="DEVELOPMENT">Development Tools</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Developers</InputLabel>
                    <Select
                      value={developers}
                      label="Developers"
                      onChange={(e) => setDevelopers(Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5].map(num => (
                        <MenuItem key={num} value={num}>{num} {num === 1 ? 'Developer' : 'Developers'}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>
                      Estimated Cost: {formatMoney(
                        softwareType === 'OS' ? 5000 * developers :
                        softwareType === 'PRODUCTIVITY' ? 2000 * developers :
                        softwareType === 'SECURITY' ? 3000 * developers :
                        4000 * developers
                      )}
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="info" 
                      onClick={handleDevelopSoftware}
                      disabled={!softwareName.trim()}
                    >
                      Start Development
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ p: 2 }}>
          <Tabs value={activeRoom?.type || 'SERVER'} onChange={(_, newValue) => {
            // Find first room of this type and set it as active
            const roomOfType = rooms.find(r => r.type === newValue);
            if (roomOfType) {
              setActiveRoom(roomOfType.id);
            }
          }}>
            <Tab label="Servers" value="SERVER" />
            <Tab label="PCs" value="PC" />
            <Tab label="Software" value="SOFTWARE" />
          </Tabs>
          
          {isActiveRoomType('SERVER') && (
            <>
              <Typography variant="h6" sx={{ mt: 2 }}>
                Your Servers
              </Typography>
              
              {servers.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  No servers built yet. Go to the Build tab to create your first server.
                </Typography>
              ) : (
                <List>
                  {servers.map((server) => (
                    <ListItem 
                      key={server.id}
                      secondaryAction={
                        <Box>
                          {server.status === 'running' ? (
                            <IconButton edge="end" aria-label="shutdown" onClick={() => shutdownServer(server.id)}>
                              <PowerSettingsNewIcon color="error" />
                            </IconButton>
                          ) : server.status === 'offline' ? (
                            <IconButton edge="end" aria-label="start" onClick={() => restartServer(server.id)}>
                              <PlayArrowIcon color="success" />
                            </IconButton>
                          ) : (
                            <CircularProgress 
                              size={24} 
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
                          <>
                            <Typography variant="body2" component="span">
                              Status: {server.status.toUpperCase()} | 
                              Revenue: {formatMoney(server.revenue)}/s | 
                              Power: {formatPower(server.powerUsage)}
                            </Typography>
                            <br />
                            <Typography variant="body2" component="span">
                              Components: {server.components.length} | 
                              Efficiency: {(server.efficiency * 100).toFixed(0)}%
                            </Typography>
                          </>
                        } 
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </>
          )}
          
          {isActiveRoomType('PC') && (
            <>
              <Typography variant="h6" sx={{ mt: 2 }}>
                Your PCs
              </Typography>
              
              {pcs.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  No PCs built yet. Go to the Build tab to create your first PC.
                </Typography>
              ) : (
                <List>
                  {pcs.map((pc) => (
                    <ListItem 
                      key={pc.id}
                      secondaryAction={
                        <Box>
                          {pc.status === 'running' ? (
                            <IconButton edge="end" aria-label="shutdown" onClick={() => shutdownServer(pc.id)}>
                              <PowerSettingsNewIcon color="error" />
                            </IconButton>
                          ) : pc.status === 'offline' ? (
                            <IconButton edge="end" aria-label="start" onClick={() => restartServer(pc.id)}>
                              <PlayArrowIcon color="success" />
                            </IconButton>
                          ) : (
                            <CircularProgress 
                              size={24} 
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
                          <>
                            <Typography variant="body2" component="span">
                              Status: {pc.status.toUpperCase()} | 
                              Revenue: {formatMoney(pc.revenue)}/s | 
                              Power: {formatPower(pc.powerUsage)}
                            </Typography>
                            <br />
                            <Typography variant="body2" component="span">
                              Components: {pc.components.length} | 
                              User Satisfaction: {pc.userSatisfaction.toFixed(0)}%
                            </Typography>
                          </>
                        } 
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </>
          )}
          
          {isActiveRoomType('SOFTWARE') && (
            <>
              <Typography variant="h6" sx={{ mt: 2 }}>
                Your Software
              </Typography>
              
              {software.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  No software developed yet. Go to the Build tab to start developing software.
                </Typography>
              ) : (
                <List>
                  {software.map((sw) => (
                    <ListItem 
                      key={sw.id}
                      secondaryAction={
                        <Box>
                          {sw.status === 'running' ? (
                            <IconButton edge="end" aria-label="shutdown" onClick={() => shutdownServer(sw.id)}>
                              <PowerSettingsNewIcon color="error" />
                            </IconButton>
                          ) : sw.status === 'offline' ? (
                            <IconButton edge="end" aria-label="start" onClick={() => restartServer(sw.id)}>
                              <PlayArrowIcon color="success" />
                            </IconButton>
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body2" sx={{ mr: 1 }}>
                                {sw.developmentProgress.toFixed(0)}%
                              </Typography>
                              <CircularProgress 
                                size={24} 
                                variant="determinate" 
                                value={sw.developmentProgress} 
                              />
                            </Box>
                          )}
                        </Box>
                      }
                    >
                      <ListItemText 
                        primary={sw.name} 
                        secondary={
                          <>
                            <Typography variant="body2" component="span">
                              Type: {sw.type} | 
                              Status: {sw.status.toUpperCase()} | 
                              Revenue: {formatMoney(sw.revenue)}/s
                            </Typography>
                            <br />
                            <Typography variant="body2" component="span">
                              Developers: {sw.developers} | 
                              Power: {formatPower(sw.powerUsage)}
                            </Typography>
                          </>
                        } 
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </>
          )}
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Available Upgrades
        </Typography>

        <Grid container spacing={2}>
          {upgrades.filter(upgrade => !upgrade.applied).map((upgrade) => (
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

      <TabPanel value={tabValue} index={3}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Datacenter Rooms
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}>
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth
                onClick={() => {
                  const success = purchaseRoom('SERVER', [rooms.length, 0]);
                  if (success) {
                    showSnackbar('Server room purchased!', 'success');
                  } else {
                    showSnackbar('Not enough money to purchase server room', 'error');
                  }
                }}
              >
                Purchase Server Room ($5,000)
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button 
                variant="contained" 
                color="secondary" 
                fullWidth
                onClick={() => {
                  const success = purchaseRoom('PC', [rooms.length, 1]);
                  if (success) {
                    showSnackbar('PC room purchased!', 'success');
                  } else {
                    showSnackbar('Not enough money to purchase PC room', 'error');
                  }
                }}
              >
                Purchase PC Room ($3,000)
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button 
                variant="contained" 
                color="info" 
                fullWidth
                onClick={() => {
                  const success = purchaseRoom('SOFTWARE', [rooms.length, 2]);
                  if (success) {
                    showSnackbar('Software room purchased!', 'success');
                  } else {
                    showSnackbar('Not enough money to purchase software room', 'error');
                  }
                }}
              >
                Purchase Software Room ($7,000)
              </Button>
            </Grid>
          </Grid>
          
          <Typography variant="h6" gutterBottom>
            Your Rooms
          </Typography>
          
          <List>
            {rooms.map(room => (
              <ListItem 
                key={room.id}
                secondaryAction={
                  <Button 
                    variant={room.id === activeRoomId ? "contained" : "outlined"}
                    onClick={() => setActiveRoom(room.id)}
                  >
                    {room.id === activeRoomId ? "Active" : "Select"}
                  </Button>
                }
              >
                <ListItemText 
                  primary={room.name} 
                  secondary={`Type: ${room.type} | Units: ${room.units.length}/${room.maxUnits}`} 
                />
              </ListItem>
            ))}
          </List>
        </Box>
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