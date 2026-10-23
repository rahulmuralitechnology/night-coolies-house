import { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { RENT_BANDS, SOURCE_KEYS, SOURCES } from '../config';
import { capitalize, formatCount, formatRent } from '../lib/format';

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function BarRow({ label, value, max, display, color = 'primary.main' }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '96px minmax(0, 1fr) 72px', alignItems: 'center', gap: 1.5, py: 0.5 }}>
      <Typography variant="body2" noWrap>{label}</Typography>
      <Box sx={{ height: 8, borderRadius: 1, bgcolor: 'divider', overflow: 'hidden' }}>
        <Box sx={{ height: '100%', width: `${max ? (value / max) * 100 : 0}%`, bgcolor: color, borderRadius: 1 }} />
      </Box>
      <Typography variant="figure" sx={{ fontSize: 15, textAlign: 'right' }}>{display}</Typography>
    </Box>
  );
}

function Section({ title, note, children }) {
  return (
    <Box component="section" sx={{ py: 2, borderBottom: 1, borderColor: 'divider' }}>
      <Typography variant="h3" sx={{ mb: note ? 0.25 : 1 }}>{title}</Typography>
      {note && <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>{note}</Typography>}
      {children}
    </Box>
  );
}

export default function Insights({ rooms }) {
  const stats = useMemo(() => {
    const rents = rooms.map(room => room.rent);
    const byBhk = [1, 2, 3, 4].map(bhk => {
      const group = rooms.filter(room => (bhk === 4 ? room.bhk >= 4 : room.bhk === bhk)).map(room => room.rent);
      return { label: bhk === 4 ? '4+ BHK' : `${bhk} BHK`, value: median(group), count: group.length };
    }).filter(row => row.count > 0);
    const bands = RENT_BANDS.map(band => ({
      ...band,
      value: rooms.filter(room => room.rent >= band.min && room.rent < band.max).length,
    }));
    const sources = SOURCE_KEYS.map(key => ({ key, value: rooms.filter(room => room.source === key).length }));
    const furnishing = ['furnished', 'semi-furnished', 'unfurnished'].map(key => ({
      key, value: rooms.filter(room => room.furnishing === key).length,
    }));
    return { count: rooms.length, median: median(rents), byBhk, bands, sources, furnishing };
  }, [rooms]);

  if (!stats.count) {
    return (
      <Box sx={{ px: 3, py: 6, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ mb: 0.5 }}>No homes to summarise</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Insights cover whatever the roster shows. Loosen the filters to see numbers here.</Typography>
      </Box>
    );
  }

  const maxBhk = Math.max(...stats.byBhk.map(row => row.value));
  const maxBand = Math.max(...stats.bands.map(row => row.value));
  const maxSource = Math.max(...stats.sources.map(row => row.value));
  const maxFurnishing = Math.max(...stats.furnishing.map(row => row.value));

  return (
    <Box sx={{ px: 2 }}>
      <Section title={`Median rent ${formatRent(stats.median)}`} note={`Across ${formatCount(stats.count)} homes matching your filters.`}>
        {stats.byBhk.map(row => (
          <BarRow key={row.label} label={row.label} value={row.value} max={maxBhk} display={formatRent(row.value)} />
        ))}
      </Section>
      <Section title="Rent spread">
        {stats.bands.map(band => (
          <BarRow key={band.key} label={band.label} value={band.value} max={maxBand} display={formatCount(band.value)} color={`band.${band.key}`} />
        ))}
      </Section>
      <Section title="Where they come from">
        {stats.sources.map(row => (
          <BarRow key={row.key} label={SOURCES[row.key].name} value={row.value} max={maxSource} display={formatCount(row.value)} color="text.secondary" />
        ))}
      </Section>
      <Section title="Furnishing" note="Listings that don't state furnishing are left out.">
        {stats.furnishing.map(row => (
          <BarRow key={row.key} label={capitalize(row.key)} value={row.value} max={maxFurnishing} display={formatCount(row.value)} color="text.secondary" />
        ))}
      </Section>
    </Box>
  );
}
