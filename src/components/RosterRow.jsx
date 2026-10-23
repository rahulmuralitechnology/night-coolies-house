import { memo } from 'react';
import { Box, ListItemButton, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { SOURCES, rentBand } from '../config';
import { capitalize, formatKm, formatRent } from '../lib/format';

export function roomFacts(room) {
  return [
    room.bhk ? `${room.bhk} BHK` : room.source === 'stanza' ? 'PG' : null,
    room.area ? `${room.area.toLocaleString('en-IN')} sqft` : null,
    capitalize(room.furnishing),
  ].filter(Boolean).join(' · ');
}

function RosterRow({ room, selected, shortlisted, onSelect, onHover }) {
  const band = rentBand(room.rent);

  return (
    <ListItemButton
      id={`roster-${room.id}`}
      selected={selected}
      onClick={() => onSelect(room)}
      onMouseEnter={onHover ? () => onHover(room) : undefined}
      onMouseLeave={onHover ? () => onHover(null) : undefined}
      sx={theme => ({
        display: 'grid',
        gridTemplateColumns: '52px minmax(0, 1fr) auto',
        columnGap: 1.5,
        alignItems: 'center',
        py: 1,
        px: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
        '&.Mui-selected, &.Mui-selected:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.14) },
      })}
    >
      <Box sx={{ textAlign: 'right' }}>
        <Typography variant="figure" component="div" sx={{ fontSize: 20, color: selected ? 'primary.main' : 'text.primary' }}>
          {formatKm(room.distance)}
        </Typography>
        <Typography variant="caption" component="div" sx={{ color: 'text.secondary', lineHeight: 1 }}>
          km
        </Typography>
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap component="div">
            {room.place || room.title}
          </Typography>
          {shortlisted && <FavoriteIcon sx={{ fontSize: 13, color: 'primary.main', flexShrink: 0 }} aria-label="Shortlisted" />}
        </Box>
        <Typography variant="caption" noWrap component="div" sx={{ color: 'text.secondary' }}>
          {roomFacts(room) || '\u00a0'}
        </Typography>
      </Box>

      <Box sx={{ textAlign: 'right' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.75 }}>
          <Box
            component="span"
            title={band.label}
            sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: `band.${band.key}`, flexShrink: 0 }}
          />
          <Typography variant="figure" component="span" sx={{ fontSize: 17 }}>
            {formatRent(room.rent)}
          </Typography>
        </Box>
        <Typography variant="caption" component="div" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
          {SOURCES[room.source].name}
        </Typography>
      </Box>
    </ListItemButton>
  );
}

export default memo(RosterRow);
