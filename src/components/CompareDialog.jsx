import {
  Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { SOURCES } from '../config';
import { capitalize, formatKm, formatRent } from '../lib/format';

const ROWS = [
  { label: 'Rent / month', render: room => formatRent(room.rent), figure: true, best: 'min', value: room => room.rent },
  { label: 'From office', render: room => `${formatKm(room.distance)} km`, figure: true, best: 'min', value: room => room.distance },
  { label: 'Bedrooms', render: room => (room.bhk ? `${room.bhk} BHK` : '—') },
  { label: 'Area', render: room => (room.area ? `${room.area.toLocaleString('en-IN')} sqft` : '—'), figure: true, best: 'max', value: room => room.area || null },
  { label: 'Rent per sqft', render: room => (room.area ? `₹${(room.rent / room.area).toFixed(1)}` : '—'), figure: true, best: 'min', value: room => (room.area ? room.rent / room.area : null) },
  { label: 'Furnishing', render: room => capitalize(room.furnishing) || '—' },
  { label: 'Source', render: room => SOURCES[room.source].name },
];

function bestIndex(row, rooms) {
  if (!row.best || rooms.length < 2) return -1;
  const values = rooms.map(row.value);
  const valid = values.filter(value => value !== null);
  if (valid.length < 2) return -1;
  const target = row.best === 'min' ? Math.min(...valid) : Math.max(...valid);
  return values.indexOf(target);
}

export default function CompareDialog({ open, rooms, onClose, onRemove, onSelect }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', pr: 1 }}>
        <Box sx={{ flex: 1 }}>Compare homes</Box>
        <IconButton onClick={onClose} aria-label="Close compare">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {rooms.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h3" sx={{ mb: 0.5 }}>Nothing to compare yet</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Open a home and use the compare button to add up to 3.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 160 + rooms.length * 200, tableLayout: 'fixed' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 140 }} />
                  {rooms.map(room => (
                    <TableCell key={room.id} sx={{ verticalAlign: 'top' }}>
                      {room.images[0] && (
                        <Box
                          component="img"
                          src={room.images[0]}
                          alt=""
                          referrerPolicy="no-referrer"
                          sx={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 1.5, mb: 1, bgcolor: 'raised' }}
                        />
                      )}
                      <Typography
                        variant="subtitle2"
                        component="button"
                        onClick={() => { onSelect(room); onClose(); }}
                        sx={{ all: 'unset', cursor: 'pointer', fontWeight: 600, display: 'block', '&:hover': { color: 'primary.main' }, '&:focus-visible': { outline: 2, outlineColor: 'primary.main' } }}
                      >
                        {room.title}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {ROWS.map(row => {
                  const best = bestIndex(row, rooms);
                  return (
                    <TableRow key={row.label}>
                      <TableCell component="th" scope="row" sx={{ color: 'text.secondary' }}>{row.label}</TableCell>
                      {rooms.map((room, i) => (
                        <TableCell
                          key={room.id}
                          sx={{
                            ...(row.figure && { typography: 'figure', fontSize: 17 }),
                            color: i === best ? 'primary.main' : 'text.primary',
                            fontWeight: i === best ? 700 : undefined,
                          }}
                        >
                          {row.render(room)}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
                <TableRow>
                  <TableCell />
                  {rooms.map(room => (
                    <TableCell key={room.id}>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button size="small" variant="contained" href={room.url} target="_blank" rel="noopener noreferrer" endIcon={<OpenInNewIcon />}>
                          Open
                        </Button>
                        <Button size="small" onClick={() => onRemove(room.id)}>Remove</Button>
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
