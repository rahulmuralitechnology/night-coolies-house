import { useState } from 'react';
import { Badge, Box, Button, MenuItem, Tab, Tabs, TextField, Typography } from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { MAX_DISTANCE } from '../config';
import { SORTS } from '../lib/filters';
import { formatCount } from '../lib/format';
import FilterControls from './FilterControls';
import Insights from './Insights';
import RosterList from './RosterList';
import SourceBar from './SourceBar';

export default function SidePanel({
  rooms,
  totalCount,
  loading,
  sources,
  filters,
  filtersKey,
  onFiltersChange,
  onResetFilters,
  selectedId,
  onSelect,
  onHover,
  shortlist,
  compare,
  onOpenCompare,
}) {
  const [tab, setTab] = useState('roster');
  const set = (key, value) => onFiltersChange({ ...filters, [key]: value });

  const toggleSource = key => set('sources', filters.sources.includes(key)
    ? filters.sources.filter(source => source !== key)
    : [...filters.sources, key]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}
      >
        <Tab value="roster" label="Roster" />
        <Tab value="shortlist" label={`Shortlist${shortlist.items.length ? ` · ${shortlist.items.length}` : ''}`} />
        <Tab value="insights" label="Insights" />
      </Tabs>

      {tab === 'roster' && (
        <>
          <Box sx={{ px: 2, pt: 2, pb: 1.5, display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0, borderBottom: 1, borderColor: 'divider' }}>
            <SourceBar sources={sources} selected={filters.sources} onToggle={toggleSource} />
            <FilterControls filters={filters} onChange={onFiltersChange} onReset={onResetFilters} />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }} aria-live="polite">
                <Typography component="span" variant="figure" sx={{ color: 'text.primary', fontSize: 18, mr: 0.5 }}>
                  {formatCount(rooms.length)}
                </Typography>
                {rooms.length === totalCount ? 'homes' : `of ${formatCount(totalCount)} homes`}
              </Typography>
              <TextField
                select
                size="small"
                variant="standard"
                value={filters.sort}
                onChange={e => set('sort', e.target.value)}
                slotProps={{ htmlInput: { 'aria-label': 'Sort homes' } }}
                sx={{ minWidth: 150, '& .MuiInput-root': { fontWeight: 600, fontSize: 14 } }}
              >
                {SORTS.map(sort => <MenuItem key={sort.value} value={sort.value}>{sort.label}</MenuItem>)}
              </TextField>
            </Box>
          </Box>
          <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <RosterList
              rooms={rooms}
              loading={loading}
              grouped={filters.sort === 'distance-asc'}
              resetKey={filtersKey}
              selectedId={selectedId}
              isShortlisted={shortlist.has}
              onSelect={onSelect}
              onHover={onHover}
              emptyTitle={loading ? 'Still loading' : 'No homes match'}
              emptyBody={loading
                ? 'Matches will appear as each site finishes.'
                : `Nothing within ${MAX_DISTANCE} km fits these filters.`}
              emptyAction={loading ? null : { label: 'Clear all filters', onClick: onResetFilters }}
            />
          </Box>
        </>
      )}

      {tab === 'shortlist' && (
        <>
          <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Saved on this device</Typography>
            <Badge badgeContent={compare.items.length} color="primary">
              <Button size="small" variant="outlined" startIcon={<CompareArrowsIcon />} onClick={onOpenCompare}>
                Compare
              </Button>
            </Badge>
          </Box>
          <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <RosterList
              rooms={shortlist.items}
              loading={false}
              grouped={false}
              resetKey="shortlist"
              selectedId={selectedId}
              isShortlisted={() => false}
              onSelect={onSelect}
              onHover={onHover}
              emptyTitle="Your shortlist is empty"
              emptyBody="Open a home and tap the heart to keep it here."
            />
          </Box>
        </>
      )}

      {tab === 'insights' && (
        <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          <Insights rooms={rooms} />
        </Box>
      )}
    </Box>
  );
}
