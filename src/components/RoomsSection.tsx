import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
} from '@mui/material';
import useGameStore from '../store/gameStore';
import RoomUpgrades from './RoomUpgrades';

// Style for buttons to prevent hover issues
const buttonStyle = {
  '&:hover': {
    opacity: 0.9,
  },
  transition: 'all 0.2s ease-in-out',
};

interface RoomsSectionProps {
  showSnackbar: (message: string, severity: 'success' | 'error') => void;
}

export default function RoomsSection({ showSnackbar }: RoomsSectionProps) {
  const { rooms, activeRoomId, setActiveRoom, purchaseRoom } = useGameStore();

  // Get active room
  const activeRoom = rooms.find(room => room.id === activeRoomId);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Rooms
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button 
          variant="outlined" 
          size="small"
          onClick={() => {
            const success = purchaseRoom('SERVER', [rooms.length, 0]);
            if (success) {
              showSnackbar('Server room purchased!', 'success');
            } else {
              showSnackbar('Not enough money', 'error');
            }
          }}
          sx={buttonStyle}
        >
          Server Room
        </Button>
        <Button 
          variant="outlined" 
          size="small"
          onClick={() => {
            const success = purchaseRoom('PC', [rooms.length, 1]);
            if (success) {
              showSnackbar('PC room purchased!', 'success');
            } else {
              showSnackbar('Not enough money', 'error');
            }
          }}
          sx={buttonStyle}
        >
          PC Room
        </Button>
        <Button 
          variant="outlined" 
          size="small"
          onClick={() => {
            const success = purchaseRoom('SOFTWARE', [rooms.length, 2]);
            if (success) {
              showSnackbar('Software room purchased!', 'success');
            } else {
              showSnackbar('Not enough money', 'error');
            }
          }}
          sx={buttonStyle}
        >
          Software Room
        </Button>
      </Box>
      
      <List dense>
        {rooms.map(room => (
          <ListItem 
            key={room.id}
            secondaryAction={
              <Button 
                variant={room.id === activeRoomId ? "contained" : "outlined"}
                size="small"
                onClick={() => setActiveRoom(room.id)}
                sx={buttonStyle}
              >
                {room.id === activeRoomId ? "Active" : "Select"}
              </Button>
            }
          >
            <ListItemText 
              primary={room.name} 
              secondary={
                <Typography variant="caption" component="span">
                  {room.type} | Units: {room.units.length}/{room.maxUnits}
                </Typography>
              } 
            />
          </ListItem>
        ))}
      </List>
      
      {activeRoom && (
        <RoomUpgrades 
          room={activeRoom} 
          onUpgrade={(message, success) => showSnackbar(message, success ? 'success' : 'error')} 
        />
      )}
    </Box>
  );
} 