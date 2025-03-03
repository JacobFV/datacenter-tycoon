import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import StorageIcon from '@mui/icons-material/Storage';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ComputerIcon from '@mui/icons-material/Computer';
import CodeIcon from '@mui/icons-material/Code';

// Navigation items for the sidebar
const navItems = [
  { id: 'build', label: 'Build', icon: <BuildIcon /> },
  { id: 'servers', label: 'Servers', icon: <StorageIcon /> },
  { id: 'pcs', label: 'PCs', icon: <ComputerIcon /> },
  { id: 'software', label: 'Software', icon: <CodeIcon /> },
  { id: 'upgrades', label: 'Upgrades', icon: <UpgradeIcon /> },
  { id: 'rooms', label: 'Rooms', icon: <MeetingRoomIcon /> },
];

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  money: number;
  gameTime: string;
  powerUsage: number;
  powerCapacity: number;
}

export default function Sidebar({
  activeSection,
  onSectionChange,
  money,
  gameTime,
  powerUsage,
  powerCapacity,
}: SidebarProps) {
  return (
    <Box sx={{ 
      width: '100%', 
      borderRight: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      {/* Game stats at the top */}
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Typography variant="h6" gutterBottom>
          Datacenter Tycoon
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
          {money}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {gameTime}
        </Typography>
        <Typography variant="body2">
          Power: {powerUsage}W / {powerCapacity}W
        </Typography>
        <Box 
          sx={{ 
            mt: 1, 
            height: 4, 
            width: '100%', 
            bgcolor: 'rgba(255,255,255,0.1)',
            borderRadius: 1,
            overflow: 'hidden'
          }}
        >
          <Box 
            sx={{ 
              height: '100%', 
              width: `${Math.min(100, (powerUsage / powerCapacity) * 100)}%`,
              bgcolor: powerUsage > powerCapacity * 0.9 ? 'error.main' : 'primary.main',
              transition: 'width 0.3s ease'
            }} 
          />
        </Box>
      </Box>

      {/* Navigation items */}
      <List sx={{ flexGrow: 1, pt: 0 }}>
        {navItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              selected={activeSection === item.id}
              onClick={() => onSectionChange(item.id)}
              sx={{
                py: 1.5,
                borderRadius: 0,
                borderLeft: activeSection === item.id ? '4px solid' : '4px solid transparent',
                borderLeftColor: 'primary.main',
                '&.Mui-selected': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: activeSection === item.id ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: activeSection === item.id ? 'bold' : 'normal',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
} 