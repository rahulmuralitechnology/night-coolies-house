import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, List, ListSubheader, Skeleton, Typography } from '@mui/material';
import { KM_BAND } from '../config';
import { formatCount } from '../lib/format';
import RosterRow from './RosterRow';

const PAGE = 80;

const bandOf = room => Math.floor(room.distance / KM_BAND);

function SkeletonRows() {
  return Array.from({ length: 8 }, (_, i) => (
    <Box key={i} sx={{ display: 'grid', gridTemplateColumns: '52px 1fr 72px', gap: 1.5, px: 2, py: 1.25, borderBottom: 1, borderColor: 'divider' }}>
      <Skeleton variant="text" height={28} />
      <Box>
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="50%" />
      </Box>
      <Skeleton variant="text" height={28} />
    </Box>
  ));
}

export default function RosterList({
  rooms,
  loading,
  grouped,
  resetKey,
  selectedId,
  isShortlisted,
  onSelect,
  onHover,
  emptyTitle,
  emptyBody,
  emptyAction,
}) {
  const [visible, setVisible] = useState(PAGE);
  const sentinelRef = useRef(null);

  useEffect(() => setVisible(PAGE), [resetKey]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return undefined;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) setVisible(count => count + PAGE);
    }, { rootMargin: '400px' });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [rooms.length > visible]);

  // A home picked on the map may be far down the roster: reveal it and scroll to it
  useEffect(() => {
    if (!selectedId) return;
    const index = rooms.findIndex(room => room.id === selectedId);
    if (index >= visible) setVisible(index + PAGE / 2);
    requestAnimationFrame(() => {
      document.getElementById(`roster-${selectedId}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const bandCounts = useMemo(() => {
    if (!grouped) return null;
    const counts = new Map();
    rooms.forEach(room => counts.set(bandOf(room), (counts.get(bandOf(room)) || 0) + 1));
    return counts;
  }, [rooms, grouped]);

  if (!rooms.length) {
    if (loading) return <SkeletonRows />;
    return (
      <Box sx={{ px: 3, py: 6, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ mb: 0.5 }}>{emptyTitle}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: emptyAction ? 2 : 0 }}>{emptyBody}</Typography>
        {emptyAction && <Button variant="outlined" onClick={emptyAction.onClick}>{emptyAction.label}</Button>}
      </Box>
    );
  }

  const shown = rooms.slice(0, visible);

  return (
    <List disablePadding>
      {shown.map((room, index) => {
        const band = grouped ? bandOf(room) : null;
        const startsBand = grouped && (index === 0 || bandOf(shown[index - 1]) !== band);
        return (
          <Fragment key={room.id}>
            {startsBand && (
              <ListSubheader
                disableGutters
                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', px: 2, borderBottom: 1, borderColor: 'divider', zIndex: 2 }}
              >
                <Typography variant="overline" component="span" sx={{ color: 'primary.main' }}>
                  {band * KM_BAND}–{(band + 1) * KM_BAND} km from office
                </Typography>
                <Typography variant="caption" component="span" sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
                  {formatCount(bandCounts.get(band))} homes
                </Typography>
              </ListSubheader>
            )}
            <RosterRow
              room={room}
              selected={room.id === selectedId}
              shortlisted={isShortlisted(room.id)}
              onSelect={onSelect}
              onHover={onHover}
            />
          </Fragment>
        );
      })}
      {rooms.length > visible && <Box ref={sentinelRef} sx={{ height: 1 }} />}
    </List>
  );
}
