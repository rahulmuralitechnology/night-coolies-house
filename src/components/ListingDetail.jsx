import { useState } from 'react';
import { Alert, Box, Button, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { SOURCES, rentBand } from '../config';
import { capitalize, formatDate, formatKm, formatRent } from '../lib/format';

const LISTED_BY = { owner: 'Owner', dealer: 'Broker / agent', builder: 'Builder' };

function Gallery({ images, title }) {
  const [broken, setBroken] = useState([]);
  const shown = images.filter(src => !broken.includes(src)).slice(0, 8);
  if (!shown.length) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        mx: -2,
        px: 2,
        pb: 0.5,
      }}
    >
      {shown.map((src, i) => (
        <Box
          key={src}
          component="img"
          src={src}
          alt={i === 0 ? title : ''}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setBroken(prev => [...prev, src])}
          sx={{
            height: 180,
            width: shown.length === 1 ? '100%' : 260,
            flexShrink: 0,
            objectFit: 'cover',
            borderRadius: '10px',
            scrollSnapAlign: 'start',
            bgcolor: 'raised',
          }}
        />
      ))}
    </Box>
  );
}

function Fact({ label, value }) {
  if (!value) return null;
  return (
    <Box>
      <Typography variant="caption" component="dt" sx={{ color: 'text.secondary' }}>{label}</Typography>
      <Typography variant="body2" component="dd" sx={{ m: 0, fontWeight: 600 }}>{value}</Typography>
    </Box>
  );
}

export default function ListingDetail({ room, shortlisted, inCompare, compareFull, onToggleShortlist, onToggleCompare, onClose }) {
  const [expanded, setExpanded] = useState(false);
  const source = SOURCES[room.source];
  const band = rentBand(room.rent);
  const longDescription = room.description.length > 280;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, pb: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h2">{room.title}</Typography>
          {room.summary && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>{room.summary}</Typography>
          )}
        </Box>
        <IconButton onClick={onClose} aria-label="Close details" sx={{ mt: -0.5, mr: -1 }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Gallery images={room.images} title={room.title} />

      <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="figureLarge" component="div">{formatRent(room.rent)}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
            <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: `band.${band.key}` }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {source.perBed ? 'per bed / month' : 'per month'}
            </Typography>
          </Box>
        </Box>
        <Box>
          <Typography variant="figureLarge" component="div" sx={{ color: 'primary.main' }}>
            {formatKm(room.distance)}<Box component="span" sx={{ fontSize: 18, ml: 0.5 }}>km</Box>
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
            {source.approximate ? 'from office, approx.' : 'from office, straight line'}
          </Typography>
        </Box>
      </Box>

      <Box component="dl" sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1.5, m: 0 }}>
        <Fact label="Bedrooms" value={room.bhk ? `${room.bhk} BHK` : room.source === 'stanza' ? 'PG bed' : ''} />
        <Fact label="Area" value={room.area ? `${room.area.toLocaleString('en-IN')} sqft` : ''} />
        <Fact label="Furnishing" value={capitalize(room.furnishing)} />
        <Fact label="Listed by" value={LISTED_BY[room.listedBy] || ''} />
        <Fact label="Contact" value={room.owner} />
        <Fact label="Posted" value={formatDate(room.postedAt)} />
      </Box>

      {source.approximate && (
        <Alert severity="info" variant="outlined" sx={{ py: 0 }}>
          OLX only shares the area, not the exact address, so this pin and distance are approximate.
        </Alert>
      )}

      {room.description && (
        <Box>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              maxWidth: '65ch',
              whiteSpace: 'pre-line',
              ...(!expanded && longDescription && {
                display: '-webkit-box',
                WebkitLineClamp: 5,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }),
            }}
          >
            {room.description}
          </Typography>
          {longDescription && (
            <Button size="small" onClick={() => setExpanded(open => !open)} sx={{ ml: -1, mt: 0.5 }}>
              {expanded ? 'Show less' : 'Read full description'}
            </Button>
          )}
        </Box>
      )}

      <Stack
        direction="row"
        spacing={1}
        sx={{
          position: 'sticky',
          bottom: 0,
          mx: -2,
          mt: -0.5,
          px: 2,
          py: 1.5,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          zIndex: 1,
        }}
      >
        <Button
          variant="contained"
          href={room.url}
          target="_blank"
          rel="noopener noreferrer"
          endIcon={<OpenInNewIcon />}
          sx={{ flex: 1 }}
        >
          Open on {source.name}
        </Button>
        <Tooltip title={shortlisted ? 'Remove from shortlist' : 'Add to shortlist'}>
          <IconButton
            onClick={() => onToggleShortlist(room)}
            aria-pressed={shortlisted}
            aria-label={shortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
            sx={{ border: 1, borderColor: 'divider', borderRadius: '8px', color: shortlisted ? 'primary.main' : 'text.primary' }}
          >
            {shortlisted ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title={inCompare ? 'Remove from compare' : compareFull ? 'Compare holds 3 homes; remove one first' : 'Add to compare'}>
          <span>
            <IconButton
              onClick={() => onToggleCompare(room)}
              disabled={!inCompare && compareFull}
              aria-pressed={inCompare}
              aria-label={inCompare ? 'Remove from compare' : 'Add to compare'}
              sx={{ border: 1, borderColor: 'divider', borderRadius: '8px', color: inCompare ? 'primary.main' : 'text.primary' }}
            >
              <CompareArrowsIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    </Box>
  );
}
