import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import useGameStore from '../store/gameStore';
import type { Room } from '../store/gameStore';

// Style for buttons to prevent hover issues
const buttonStyle = {
  '&:hover': {
    opacity: 0.9,
  },
  transition: 'all 0.2s ease-in-out',
};

// Available light colors
const lightColors = [
  { name: 'Blue', value: '#4287f5' },
  { name: 'Green', value: '#42f59e' },
  { name: 'Pink', value: '#f542cb' },
  { name: 'Red', value: '#f54242' },
  { name: 'Yellow', value: '#f5e642' },
  { name: 'Purple', value: '#9e42f5' },
  { name: 'White', value: '#ffffff' },
];

interface RoomUpgradesProps {
  room: Room;
  onUpgrade: (message: string, success: boolean) => void;
}

export default function RoomUpgrades({ room, onUpgrade }: RoomUpgradesProps) {
  const [selectedColor, setSelectedColor] = useState(room.lighting.color);
  
  const { upgradeRoomAirConditioning, upgradeRoomLighting } = useGameStore();
  
  const handleColorChange = (event: SelectChangeEvent) => {
    setSelectedColor(event.target.value);
  };
  
  const handleAirConditioningUpgrade = () => {
    const success = upgradeRoomAirConditioning(room.id);
    if (success) {
      onUpgrade(`Air conditioning upgraded to level ${room.airConditioning.level + 1}!`, true);
    } else {
      onUpgrade('Not enough money to upgrade air conditioning', false);
    }
  };
  
  const handleLightingUpgrade = () => {
    const success = upgradeRoomLighting(room.id, selectedColor);
    if (success) {
      onUpgrade('Room lighting upgraded!', true);
    } else {
      onUpgrade('Not enough money to upgrade lighting', false);
    }
  };
  
  // Format money
  const formatMoney = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Room Upgrades
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                Air Conditioning
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Reduces power consumption and increases efficiency
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Current Level: {room.airConditioning.level}
                </Typography>
                <Typography variant="body2">
                  Efficiency: {(room.airConditioning.efficiency * 100).toFixed(0)}%
                </Typography>
                <Slider
                  value={room.airConditioning.level}
                  step={1}
                  marks
                  min={1}
                  max={5}
                  disabled
                  sx={{ mt: 2 }}
                />
              </Box>
            </CardContent>
            <CardActions>
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth
                sx={buttonStyle}
                onClick={handleAirConditioningUpgrade}
              >
                Upgrade ({formatMoney(room.airConditioning.cost)})
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                Lighting
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Customize the room lighting color and intensity
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Current Intensity: {(room.lighting.intensity * 100).toFixed(0)}%
                </Typography>
                <Slider
                  value={room.lighting.intensity * 100}
                  step={10}
                  marks
                  min={10}
                  max={200}
                  disabled
                  sx={{ mt: 2 }}
                />
                
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Light Color</InputLabel>
                  <Select
                    value={selectedColor}
                    label="Light Color"
                    onChange={handleColorChange}
                  >
                    {lightColors.map((color) => (
                      <MenuItem key={color.value} value={color.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box 
                            sx={{ 
                              width: 20, 
                              height: 20, 
                              backgroundColor: color.value,
                              borderRadius: '50%',
                              mr: 1,
                              border: '1px solid #ccc'
                            }} 
                          />
                          {color.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
            <CardActions>
              <Button 
                variant="contained" 
                color="secondary" 
                fullWidth
                sx={buttonStyle}
                onClick={handleLightingUpgrade}
              >
                Upgrade ({formatMoney(room.lighting.cost)})
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 