import { useState } from 'react';
import {
  Badge, Box, Button, Chip, Collapse, InputAdornment, MenuItem, TextField, ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import { RENT_BANDS } from '../config';
import { countAdvancedFilters, isDefaultFilters } from '../lib/filters';

const BHK_OPTIONS = [
  { value: 'any', label: 'Any' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4+' },
];

function RangeFields({ label, unit, minValue, maxValue, onMin, onMax }) {
  const adornment = unit === '₹'
    ? { startAdornment: <InputAdornment position="start">₹</InputAdornment> }
    : { endAdornment: <InputAdornment position="end">{unit}</InputAdornment> };
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
      <TextField
        size="small"
        type="number"
        label={`Min ${label}`}
        value={minValue}
        onChange={e => onMin(e.target.value)}
        slotProps={{ input: adornment, htmlInput: { min: 0, inputMode: 'numeric' } }}
      />
      <TextField
        size="small"
        type="number"
        label={`Max ${label}`}
        value={maxValue}
        onChange={e => onMax(e.target.value)}
        slotProps={{ input: adornment, htmlInput: { min: 0, inputMode: 'numeric' } }}
      />
    </Box>
  );
}

export default function FilterControls({ filters, onChange, onReset }) {
  const advancedCount = countAdvancedFilters(filters);
  const [moreOpen, setMoreOpen] = useState(advancedCount > 0);
  const set = (key, value) => onChange({ ...filters, [key]: value });

  const toggleBand = key => set('bands', filters.bands.includes(key)
    ? filters.bands.filter(band => band !== key)
    : [...filters.bands, key]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <TextField
        size="small"
        placeholder="Search title, locality, society…"
        value={filters.search}
        onChange={e => set('search', e.target.value)}
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
            endAdornment: filters.search ? (
              <InputAdornment position="end">
                <Button size="small" onClick={() => set('search', '')} sx={{ minWidth: 0, p: 0.5 }} aria-label="Clear search">
                  <CloseIcon fontSize="small" />
                </Button>
              </InputAdornment>
            ) : null,
          },
          htmlInput: { 'aria-label': 'Search listings' },
        }}
      />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }} role="group" aria-label="Monthly rent">
        {RENT_BANDS.map(band => {
          const on = filters.bands.includes(band.key);
          return (
            <Chip
              key={band.key}
              size="small"
              label={band.label}
              clickable
              onClick={() => toggleBand(band.key)}
              aria-pressed={on}
              variant={on ? 'filled' : 'outlined'}
              icon={<Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: `band.${band.key}`, ml: '8px !important' }} />}
              sx={theme => ({
                borderColor: on ? 'transparent' : theme.palette.divider,
                bgcolor: on ? `${theme.palette.band[band.key]}2E` : undefined,
                color: on ? 'text.primary' : 'text.secondary',
              })}
            />
          );
        })}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={filters.bhk}
          onChange={(_, value) => value && set('bhk', value)}
          aria-label="Bedrooms"
        >
          {BHK_OPTIONS.map(option => (
            <ToggleButton key={option.value} value={option.value} aria-label={option.value === 'any' ? 'Any BHK' : `${option.label} BHK`}>
              {option.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Box sx={{ color: 'text.secondary', typography: 'caption', mr: 'auto' }}>BHK</Box>
        <Badge badgeContent={advancedCount} color="primary" overlap="circular">
          <Button
            size="small"
            variant={moreOpen ? 'outlined' : 'text'}
            startIcon={<TuneIcon fontSize="small" />}
            onClick={() => setMoreOpen(open => !open)}
            aria-expanded={moreOpen}
          >
            More
          </Button>
        </Badge>
      </Box>

      <Collapse in={moreOpen} unmountOnExit>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 0.5 }}>
          <RangeFields
            label="rent"
            unit="₹"
            minValue={filters.minRent}
            maxValue={filters.maxRent}
            onMin={value => set('minRent', value)}
            onMax={value => set('maxRent', value)}
          />
          <RangeFields
            label="area"
            unit="sqft"
            minValue={filters.minArea}
            maxValue={filters.maxArea}
            onMin={value => set('minArea', value)}
            onMax={value => set('maxArea', value)}
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <TextField select size="small" label="Furnishing" value={filters.furnishing} onChange={e => set('furnishing', e.target.value)}>
              <MenuItem value="any">Any</MenuItem>
              <MenuItem value="furnished">Furnished</MenuItem>
              <MenuItem value="semi-furnished">Semi-furnished</MenuItem>
              <MenuItem value="unfurnished">Unfurnished</MenuItem>
            </TextField>
            <TextField select size="small" label="Listed by" value={filters.listedBy} onChange={e => set('listedBy', e.target.value)}>
              <MenuItem value="any">Anyone</MenuItem>
              <MenuItem value="owner">Owner</MenuItem>
              <MenuItem value="dealer">Broker / agent</MenuItem>
              <MenuItem value="builder">Builder</MenuItem>
            </TextField>
          </Box>
        </Box>
      </Collapse>

      {!isDefaultFilters(filters) && (
        <Button size="small" onClick={onReset} sx={{ alignSelf: 'flex-start', mt: -0.5 }}>
          Clear all filters
        </Button>
      )}
    </Box>
  );
}
