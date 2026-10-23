import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Box, Button, CssBaseline, Drawer, IconButton, Paper, Snackbar, ThemeProvider, Typography, useMediaQuery } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ListIcon from '@mui/icons-material/FormatListBulleted';
import { createAppTheme } from './theme';
import { useListings } from './data/useListings';
import { useStoredList } from './lib/useStoredList';
import { DEFAULT_FILTERS, applyFilters, filtersFromUrl, filtersToSearch, toCsv } from './lib/filters';
import { getDistance } from './lib/geo';
import { formatCount } from './lib/format';
import { APP_NAME, PIN_RADIUS } from './config';
import AppHeader from './components/AppHeader';
import CompareDialog from './components/CompareDialog';
import ListingDetail from './components/ListingDetail';
import MapView from './components/MapView';
import { MapLegend, PinControl } from './components/MapOverlays';
import SidePanel from './components/SidePanel';

const PANEL_WIDTH = 420;
const DETAIL_WIDTH = 380;
const COMPARE_LIMIT = 3;
const SHEET_HEIGHT = 0.6; // share of the viewport the phone detail sheet may cover

function useColorMode() {
  const [mode, setMode] = useState(() => localStorage.getItem('ncc-mode') || 'dark');
  useEffect(() => localStorage.setItem('ncc-mode', mode), [mode]);
  return [mode, () => setMode(prev => (prev === 'dark' ? 'light' : 'dark'))];
}

function Workspace({ mode, onToggleMode }) {
  const isDesktop = useMediaQuery(theme => theme.breakpoints.up('md'), { noSsr: true });

  const [reloadKey, setReloadKey] = useState(0);
  const { rooms, sources, loading } = useListings(reloadKey);

  const [filters, setFilters] = useState(() => filtersFromUrl(window.location.search));
  const deferredFilters = useDeferredValue(filters);
  const filtersKey = JSON.stringify(deferredFilters);

  useEffect(() => {
    window.history.replaceState(null, '', `${window.location.pathname}${filtersToSearch(filters)}`);
  }, [filters]);

  const [pin, setPin] = useState(null);
  const [pinMode, setPinMode] = useState(false);
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [rosterOpen, setRosterOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [toast, setToast] = useState('');

  const shortlist = useStoredList('ncc-shortlist');
  const compare = useStoredList('ncc-compare', COMPARE_LIMIT);

  const filtered = useMemo(() => {
    const matched = applyFilters(rooms, deferredFilters);
    if (!pin) return matched;
    return matched.filter(room => getDistance(pin.lat, pin.lng, room.lat, room.lon) <= PIN_RADIUS);
  }, [rooms, deferredFilters, pin]);

  const selectRoom = useCallback(room => {
    setSelected(room);
    setRosterOpen(false);
  }, []);

  const handleMapClick = useCallback(latlng => {
    if (pinMode) {
      setPin(latlng);
      setPinMode(false);
    } else {
      setSelected(null);
    }
  }, [pinMode]);

  const resetFilters = () => setFilters(prev => ({ ...DEFAULT_FILTERS, sort: prev.sort }));

  const exportCsv = () => {
    const blob = new Blob([toCsv(filtered)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `night-coolies-house-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setToast(`Exported ${formatCount(filtered.length)} homes`);
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share && !isDesktop) {
        await navigator.share({ title: APP_NAME, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setToast('Link copied. It opens with these filters.');
    } catch (err) {
      if (err?.name !== 'AbortError') setToast('Could not share this link');
    }
  };

  const toggleCompare = room => {
    if (!compare.toggle(room)) setToast(`You can compare up to ${COMPARE_LIMIT} homes. Remove one first.`);
  };

  const detail = selected && (
    <ListingDetail
      room={selected}
      shortlisted={shortlist.has(selected.id)}
      inCompare={compare.has(selected.id)}
      compareFull={compare.items.length >= COMPARE_LIMIT}
      onToggleShortlist={() => shortlist.toggle(selected)}
      onToggleCompare={() => toggleCompare(selected)}
      onClose={() => setSelected(null)}
    />
  );

  const panel = (
    <SidePanel
      rooms={filtered}
      totalCount={rooms.length}
      loading={loading}
      sources={sources}
      filters={filters}
      filtersKey={filtersKey}
      onFiltersChange={setFilters}
      onResetFilters={resetFilters}
      selectedId={selected?.id}
      onSelect={selectRoom}
      onHover={isDesktop ? setHovered : undefined}
      shortlist={shortlist}
      compare={compare}
      onOpenCompare={() => setCompareOpen(true)}
    />
  );

  const followPadding = isDesktop
    ? { topLeft: [64, 72], bottomRight: [selected ? DETAIL_WIDTH + 64 : 48, 48] }
    : { topLeft: [24, 80], bottomRight: [24, Math.round(window.innerHeight * SHEET_HEIGHT) + 24] };

  return (
    <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppHeader
        compact={!isDesktop}
        mode={mode}
        loading={loading}
        compareCount={compare.items.length}
        onToggleMode={onToggleMode}
        onRefresh={() => setReloadKey(key => key + 1)}
        onExport={exportCsv}
        onShare={share}
        onOpenCompare={() => setCompareOpen(true)}
      />

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
        <Box component="main" sx={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <MapView
            rooms={filtered}
            selected={selected}
            hovered={hovered}
            pin={pin}
            pinMode={pinMode}
            onSelect={selectRoom}
            onMapClick={handleMapClick}
            followPadding={followPadding}
          />

          <Box sx={{ position: 'absolute', top: 12, left: 60, right: isDesktop && selected ? DETAIL_WIDTH + 32 : 12, zIndex: 1000, pointerEvents: 'none', '& > *': { pointerEvents: 'auto' } }}>
            <PinControl
              pin={pin}
              pinMode={pinMode}
              pinCount={filtered.length}
              onTogglePinMode={() => setPinMode(on => !on)}
              onClearPin={() => setPin(null)}
            />
          </Box>

          {isDesktop && (
            <Box sx={{ position: 'absolute', left: 12, bottom: 28, zIndex: 1000 }}>
              <MapLegend />
            </Box>
          )}

          {isDesktop && selected && (
            <Paper
              elevation={8}
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                width: DETAIL_WIDTH,
                zIndex: 1000,
                overflowY: 'auto',
                border: 1,
                borderColor: 'divider',
                height: 'fit-content',
                maxHeight: 'calc(100% - 40px)',
              }}
            >
              {detail}
            </Paper>
          )}

          {!isDesktop && !selected && (
            <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 28, display: 'flex', justifyContent: 'center', zIndex: 1000, pointerEvents: 'none' }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<ListIcon />}
                onClick={() => setRosterOpen(true)}
                sx={{ pointerEvents: 'auto', borderRadius: 999, px: 3, boxShadow: 6, fontSize: 16 }}
              >
                <Typography component="span" variant="figure" sx={{ fontSize: 19, mr: 0.75 }}>{formatCount(filtered.length)}</Typography>
                {loading ? 'homes so far' : 'homes'}
              </Button>
            </Box>
          )}
        </Box>

        {isDesktop && (
          <Paper
            component="aside"
            square
            elevation={0}
            sx={{ width: PANEL_WIDTH, flexShrink: 0, borderLeft: 1, borderColor: 'divider', minHeight: 0 }}
          >
            {panel}
          </Paper>
        )}
      </Box>

      {!isDesktop && (
        <Drawer
          anchor="right"
          open={rosterOpen}
          onClose={() => setRosterOpen(false)}
          slotProps={{ paper: { sx: { width: 'min(92vw, 440px)' } } }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h2" sx={{ flex: 1 }}>Homes</Typography>
            <IconButton onClick={() => setRosterOpen(false)} aria-label="Close list" edge="end">
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ flex: 1, minHeight: 0 }}>{panel}</Box>
        </Drawer>
      )}

      {!isDesktop && (
        <Drawer
          anchor="bottom"
          variant="persistent"
          open={Boolean(selected)}
          slotProps={{ paper: { sx: { maxHeight: `${SHEET_HEIGHT * 100}dvh`, borderTopLeftRadius: 16, borderTopRightRadius: 16, boxShadow: 12, borderTop: 1, borderColor: 'divider' } } }}
        >
          {detail}
        </Drawer>
      )}

      <CompareDialog
        open={compareOpen}
        rooms={compare.items}
        onClose={() => setCompareOpen(false)}
        onRemove={compare.remove}
        onSelect={selectRoom}
      />

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3500}
        onClose={() => setToast('')}
        message={toast}
        anchorOrigin={{ vertical: 'bottom', horizontal: isDesktop ? 'left' : 'center' }}
      />
    </Box>
  );
}

export default function App() {
  const [mode, toggleMode] = useColorMode();
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <Workspace mode={mode} onToggleMode={toggleMode} />
    </ThemeProvider>
  );
}
