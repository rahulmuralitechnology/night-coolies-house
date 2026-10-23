import { Box, ButtonBase, CircularProgress, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { SOURCE_KEYS, SOURCES } from '../config';
import { formatCount } from '../lib/format';

// Sources are told apart by name and position, not hue; hue is reserved for rent bands
const SHADES = [1, 0.72, 0.52, 0.36, 0.24];

function statusText(key, state) {
  const name = SOURCES[key].name;
  if (state.status === 'loading') return `Loading ${name}…`;
  if (state.status === 'error') return `${name} couldn't be reached. Refresh to try again.`;
  if (state.status === 'partial') return `${name} stopped early; showing what loaded.`;
  if (SOURCES[key].approximate) return `${name} only gives area-level locations, so distances are approximate.`;
  if (SOURCES[key].perBed) return `${name} rents are per bed in a PG.`;
  return `${formatCount(state.count)} homes from ${name}`;
}

export default function SourceBar({ sources, selected, onToggle }) {
  const total = SOURCE_KEYS.reduce((sum, key) => sum + sources[key].count, 0);
  const active = key => !selected.length || selected.includes(key);

  return (
    <Box>
      <Box
        aria-hidden
        sx={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', bgcolor: 'divider', mb: 1 }}
      >
        {SOURCE_KEYS.map((key, i) => (
          <Box
            key={key}
            sx={theme => ({
              flexGrow: sources[key].count,
              flexBasis: 0,
              bgcolor: alpha(theme.palette.primary.main, SHADES[i]),
              opacity: active(key) ? 1 : 0.2,
              transition: 'flex-grow 600ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms',
            })}
          />
        ))}
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 1.75, rowGap: 0.5 }}>
        {SOURCE_KEYS.map((key, i) => {
          const state = sources[key];
          return (
            <Tooltip key={key} title={statusText(key, state)}>
              <ButtonBase
                onClick={() => onToggle(key)}
                aria-pressed={selected.includes(key)}
                aria-label={`${SOURCES[key].name}: ${state.count} homes. ${selected.includes(key) ? 'Showing only selected sources' : 'Filter to this source'}`}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  borderRadius: 1,
                  px: 0.5,
                  mx: -0.5,
                  opacity: active(key) ? 1 : 0.45,
                }}
              >
                <Box
                  component="span"
                  sx={theme => ({ width: 8, height: 8, borderRadius: '2px', bgcolor: alpha(theme.palette.primary.main, SHADES[i]) })}
                />
                <Typography variant="caption" component="span" sx={{ fontWeight: selected.includes(key) ? 700 : 500 }}>
                  {SOURCES[key].name}
                </Typography>
                {state.status === 'loading' && <CircularProgress size={10} thickness={6} aria-label="Loading" />}
                {state.status === 'error' && <ErrorOutlineIcon sx={{ fontSize: 14, color: 'error.main' }} />}
                {state.status !== 'loading' && state.status !== 'error' && (
                  <Typography variant="caption" component="span" sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
                    {formatCount(state.count)}
                  </Typography>
                )}
              </ButtonBase>
            </Tooltip>
          );
        })}
      </Box>
      {total === 0 && SOURCE_KEYS.every(key => sources[key].status === 'error') && (
        <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mt: 1 }}>
          No source could be reached. Check your connection and refresh.
        </Typography>
      )}
    </Box>
  );
}
