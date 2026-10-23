import { useState } from 'react';
import {
  AppBar, Badge, Box, Button, IconButton, LinearProgress, ListItemIcon, ListItemText, Menu, MenuItem, Toolbar, Tooltip, Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/IosShare';
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeIcon from '@mui/icons-material/LightModeOutlined';
import MoreIcon from '@mui/icons-material/MoreVert';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { APP_NAME, MAX_DISTANCE, OFFICE } from '../config';

export default function AppHeader({ compact, mode, loading, compareCount, onToggleMode, onRefresh, onExport, onShare, onOpenCompare }) {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const closeMenu = () => setMenuAnchor(null);
  const run = action => () => { closeMenu(); action(); };

  const actions = [
    { label: 'Refresh listings', icon: <RefreshIcon />, onClick: onRefresh, disabled: loading },
    { label: 'Export CSV', icon: <DownloadIcon />, onClick: onExport },
    { label: 'Share this view', icon: <ShareIcon />, onClick: onShare },
    { label: mode === 'dark' ? 'Light map' : 'Dark map', icon: mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />, onClick: onToggleMode },
  ];

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={theme => ({
        bgcolor: 'shell.bar',
        color: 'shell.barText',
        borderBottom: `1px solid ${alpha(theme.palette.shell.barMuted, 0.18)}`,
        position: 'relative',
        zIndex: theme.zIndex.appBar,
      })}
    >
      <Toolbar variant="dense" sx={{ minHeight: { xs: 52, md: 56 }, gap: 1.5 }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="h1" component="h1" noWrap sx={{ color: 'primary.main', fontSize: { xs: '1.25rem', md: '1.375rem' } }}>
            {APP_NAME}
          </Typography>
          <Typography variant="caption" noWrap component="p" sx={{ color: 'shell.barMuted', display: 'block' }}>
            Homes within {MAX_DISTANCE} km of {OFFICE.name}, {OFFICE.area}
          </Typography>
        </Box>

        <Tooltip title="Compare up to 3 homes side by side">
          <Badge badgeContent={compareCount} color="primary" overlap="circular">
            <IconButton color="inherit" onClick={onOpenCompare} aria-label="Compare homes">
              <CompareArrowsIcon />
            </IconButton>
          </Badge>
        </Tooltip>

        {compact ? (
          <>
            <IconButton color="inherit" onClick={e => setMenuAnchor(e.currentTarget)} aria-label="More actions">
              <MoreIcon />
            </IconButton>
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
              {actions.map(action => (
                <MenuItem key={action.label} onClick={run(action.onClick)} disabled={action.disabled}>
                  <ListItemIcon>{action.icon}</ListItemIcon>
                  <ListItemText>{action.label}</ListItemText>
                </MenuItem>
              ))}
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Button color="inherit" startIcon={<RefreshIcon />} onClick={onRefresh} disabled={loading} sx={{ '&.Mui-disabled': { color: 'shell.barMuted', opacity: 0.6 } }}>
              Refresh
            </Button>
            <Button color="inherit" startIcon={<DownloadIcon />} onClick={onExport}>Export CSV</Button>
            <Button color="inherit" startIcon={<ShareIcon />} onClick={onShare}>Share</Button>
            <Tooltip title={mode === 'dark' ? 'Switch to light map' : 'Switch to dark map'}>
              <IconButton color="inherit" onClick={onToggleMode} aria-label="Toggle colour mode">
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Toolbar>
      {loading && (
        <LinearProgress
          aria-label="Loading listings"
          sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, bgcolor: 'transparent' }}
        />
      )}
    </AppBar>
  );
}
