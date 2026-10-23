import { Box, Button, Chip, Paper, Typography } from '@mui/material';
import PlaceIcon from '@mui/icons-material/PlaceOutlined';
import { PIN_RADIUS, RENT_BANDS } from '../config';
import { formatCount } from '../lib/format';

export function MapLegend() {
  return (
    <Paper
      elevation={0}
      sx={{ px: 1.5, py: 1, border: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column', gap: 0.5 }}
    >
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Rent / month</Typography>
      {RENT_BANDS.map(band => (
        <Box key={band.key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: `band.${band.key}`, flexShrink: 0 }} />
          <Typography variant="caption" sx={{ fontVariantNumeric: 'tabular-nums' }}>{band.label}</Typography>
        </Box>
      ))}
    </Paper>
  );
}

export function PinControl({ pin, pinMode, pinCount, onTogglePinMode, onClearPin }) {
  if (pin) {
    return (
      <Chip
        icon={<PlaceIcon />}
        color="secondary"
        label={`${formatCount(pinCount)} homes within ${PIN_RADIUS} km of pin`}
        onDelete={onClearPin}
        sx={{ boxShadow: 3, bgcolor: 'background.paper', color: 'text.primary', border: 1, borderColor: 'secondary.main', '& .MuiChip-icon': { color: 'secondary.main' } }}
      />
    );
  }
  return (
    <Button
      variant={pinMode ? 'contained' : 'outlined'}
      color="secondary"
      startIcon={<PlaceIcon />}
      onClick={onTogglePinMode}
      aria-pressed={pinMode}
      sx={{ bgcolor: pinMode ? undefined : 'background.paper', boxShadow: 3, '&:hover': { bgcolor: pinMode ? undefined : 'background.paper' } }}
    >
      {pinMode ? 'Tap the map to drop a pin' : 'Drop a pin'}
    </Button>
  );
}
