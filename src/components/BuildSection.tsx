import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import type { Component, SelectChangeEvent } from '@mui/material';
import useGameStore from '../store/gameStore';

// Style for buttons to prevent hover issues
const buttonStyle = {
  '&:hover': {
    opacity: 0.9,
  },
  transition: 'all 0.2s ease-in-out',
};

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

interface BuildSectionProps {
  showSnackbar: (message: string, severity: 'success' | 'error') => void;
}

export default function BuildSection({ showSnackbar }: BuildSectionProps) {
  const {
    money,
    availableComponents,
    purchaseComponent,
    startBuildingServer,
    startBuildingPC,
    startDevelopingSoftware,
    activeRoomId,
    rooms,
  } = useGameStore();

  const [selectedComponents, setSelectedComponents] = useState<Component[]>([]);
  const [softwareName, setSoftwareName] = useState('');
  const [softwareType, setSoftwareType] = useState<'OS' | 'PRODUCTIVITY' | 'SECURITY' | 'DEVELOPMENT'>('OS');
  const [developers, setDevelopers] = useState(1);

  // Get active room
  const activeRoom = rooms.find(room => room.id === activeRoomId);

  // Check if the active room is of a specific type
  const isActiveRoomType = (type: 'SERVER' | 'PC' | 'SOFTWARE'): boolean => {
    return activeRoom?.type === type;
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

  const handleSoftwareTypeChange = (e: SelectChangeEvent) => {
    setSoftwareType(e.target.value as 'OS' | 'PRODUCTIVITY' | 'SECURITY' | 'DEVELOPMENT');
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Components
      </Typography>
      
      <List dense>
        {availableComponents.map((component) => (
          <ListItem 
            key={component.id}
            secondaryAction={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Tooltip title={component.description}>
                  <IconButton size="small" sx={{ mr: 1 }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Button 
                  size="small" 
                  variant="outlined"
                  onClick={() => handleAddComponent(component)}
                  disabled={
                    money < component.cost || 
                    (component.type === 'CPU' && isComponentTypeInQueue('CPU')) ||
                    (component.type === 'MOTHERBOARD' && isComponentTypeInQueue('MOTHERBOARD'))
                  }
                  sx={buttonStyle}
                >
                  Add
                </Button>
              </Box>
            }
          >
            <ListItemText 
              primary={component.name} 
              secondary={
                <Typography variant="caption" component="span">
                  {component.type} | {formatMoney(component.cost)} | {formatPower(component.powerUsage)}
                </Typography>
              } 
            />
          </ListItem>
        ))}
      </List>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        Build Queue
      </Typography>
      
      {selectedComponents.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No components selected
        </Typography>
      ) : (
        <>
          <List dense>
            {selectedComponents.map((component, index) => (
              <ListItem 
                key={`${component.id}-${index}`}
                secondaryAction={
                  <IconButton edge="end" size="small" onClick={() => handleRemoveComponent(index)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemText 
                  primary={component.name} 
                  secondary={
                    <Typography variant="caption" component="span">
                      {component.type} | {formatMoney(component.cost)}
                    </Typography>
                  } 
                />
              </ListItem>
            ))}
          </List>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="small"
              onClick={handleBuildServer}
              disabled={!isActiveRoomType('SERVER') || selectedComponents.length === 0}
              sx={buttonStyle}
            >
              Build Server
            </Button>
            
            <Button 
              variant="contained" 
              color="secondary" 
              size="small"
              onClick={handleBuildPC}
              disabled={!isActiveRoomType('PC') || selectedComponents.length === 0}
              sx={buttonStyle}
            >
              Build PC
            </Button>
          </Box>
        </>
      )}
      
      {isActiveRoomType('SOFTWARE') && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Develop Software
          </Typography>
          
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <TextField
                label="Software Name"
                variant="outlined"
                size="small"
                fullWidth
                value={softwareName}
                onChange={(e) => setSoftwareName(e.target.value)}
              />
            </Grid>
            
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={softwareType}
                  label="Type"
                  onChange={handleSoftwareTypeChange}
                >
                  <MenuItem value="OS">OS</MenuItem>
                  <MenuItem value="PRODUCTIVITY">Productivity</MenuItem>
                  <MenuItem value="SECURITY">Security</MenuItem>
                  <MenuItem value="DEVELOPMENT">Development</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Devs</InputLabel>
                <Select
                  value={developers}
                  label="Devs"
                  onChange={(e) => setDevelopers(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <MenuItem key={num} value={num}>{num}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Button 
                variant="contained" 
                color="info" 
                fullWidth
                size="small"
                onClick={handleDevelopSoftware}
                disabled={!softwareName.trim()}
                sx={buttonStyle}
              >
                Start Development
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
} 