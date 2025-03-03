import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
} from '@mui/material';
import useGameStore from '../store/gameStore';

// Format money
const formatMoney = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Style for buttons to prevent hover issues
const buttonStyle = {
  '&:hover': {
    opacity: 0.9,
  },
  transition: 'all 0.2s ease-in-out',
};

interface UpgradesSectionProps {
  showSnackbar: (message: string, severity: 'success' | 'error') => void;
}

export default function UpgradesSection({ showSnackbar }: UpgradesSectionProps) {
  const { upgrades, money, purchaseUpgrade } = useGameStore();

  const handlePurchaseUpgrade = (upgradeId: string) => {
    const success = purchaseUpgrade(upgradeId);
    if (success) {
      showSnackbar('Upgrade purchased successfully!', 'success');
    } else {
      showSnackbar('Not enough money for this upgrade', 'error');
    }
  };

  const availableUpgrades = upgrades.filter(upgrade => !upgrade.applied);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Upgrades
      </Typography>
      
      {availableUpgrades.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No upgrades available
        </Typography>
      ) : (
        <List dense>
          {availableUpgrades.map((upgrade) => (
            <ListItem 
              key={upgrade.id}
              secondaryAction={
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => handlePurchaseUpgrade(upgrade.id)}
                  disabled={money < upgrade.cost}
                  sx={buttonStyle}
                >
                  Buy
                </Button>
              }
            >
              <ListItemText 
                primary={upgrade.name} 
                secondary={
                  <>
                    <Typography variant="caption" component="span">
                      {formatMoney(upgrade.cost)} | {upgrade.effect.type}: +{upgrade.effect.value}
                    </Typography>
                    <Typography variant="caption" component="div" sx={{ mt: 0.5 }}>
                      {upgrade.description}
                    </Typography>
                  </>
                } 
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
} 