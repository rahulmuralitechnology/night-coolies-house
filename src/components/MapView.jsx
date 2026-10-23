import { memo, useEffect, useState } from 'react';
import { Circle, CircleMarker, MapContainer, Marker, Polyline, TileLayer, Tooltip, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '@mui/material/styles';
import { KM_BAND, MAX_DISTANCE, OFFICE, PIN_RADIUS, rentBand } from '../config';
import { formatKm } from '../lib/format';

const OFFICE_POSITION = [OFFICE.lat, OFFICE.lon];
const STOP_RINGS = Array.from({ length: Math.ceil(MAX_DISTANCE / KM_BAND) - 1 }, (_, i) => (i + 1) * KM_BAND);

const officeIcon = L.divIcon({
  className: 'office-icon',
  html: '<div style="font-size:34px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.45))">🤡</div>',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

function pinIcon(color) {
  return L.divIcon({
    className: 'office-icon',
    html: `<svg width="28" height="36" viewBox="0 0 28 36" aria-hidden="true"><path d="M14 1C7 1 1.5 6.4 1.5 13.3 1.5 22.6 14 35 14 35s12.5-12.4 12.5-21.7C26.5 6.4 21 1 14 1z" fill="${color}" stroke="rgba(0,0,0,.35)"/><circle cx="14" cy="13" r="4.5" fill="rgba(0,0,0,.45)"/></svg>`,
    iconSize: [28, 36],
    iconAnchor: [14, 35],
  });
}

const TILE_ROOT = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas';

// Thousands of homes overlap when zoomed out, so dots shrink with the zoom level
const markerRadius = zoom => (zoom <= 12 ? 2.5 : zoom === 13 ? 3.5 : zoom === 14 ? 5 : 6.5);

function ZoomRadius({ onChange }) {
  const map = useMapEvents({ zoomend: () => onChange(map.getZoom()) });
  return null;
}

const RoomMarkers = memo(function RoomMarkers({ rooms, radius, bandColors, strokeColor, onSelect }) {
  return rooms.map(room => (
    <CircleMarker
      key={room.id}
      center={[room.lat, room.lon]}
      radius={radius}
      bubblingMouseEvents={false}
      pathOptions={{ color: strokeColor, weight: radius > 4 ? 1 : 0.5, fillColor: bandColors[rentBand(room.rent).key], fillOpacity: 0.9 }}
      eventHandlers={{ click: () => onSelect(room) }}
    />
  ));
});

function MapEvents({ onClick }) {
  useMapEvents({ click: e => onClick(e.latlng) });
  return null;
}

// Frame the whole drop line (office to home) in the part of the map not covered by panels
function FollowSelection({ room, padding }) {
  const map = useMap();
  useEffect(() => {
    if (!room) return;
    const bounds = L.latLngBounds([OFFICE_POSITION, [room.lat, room.lon]]);
    map.flyToBounds(bounds, {
      paddingTopLeft: padding.topLeft,
      paddingBottomRight: padding.bottomRight,
      maxZoom: 16,
      duration: 0.6,
    });
  }, [room, map]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export default function MapView({ rooms, selected, hovered, pin, pinMode, onSelect, onMapClick, followPadding }) {
  const theme = useTheme();
  const { band, primary, background, text } = theme.palette;
  const [zoom, setZoom] = useState(13);

  return (
    <MapContainer
      center={OFFICE_POSITION}
      zoom={13}
      preferCanvas
      zoomControl={false}
      style={{ height: '100%', width: '100%', cursor: pinMode ? 'crosshair' : undefined }}
    >
      <TileLayer
        key={`base-${theme.palette.mapTiles}`}
        url={`${TILE_ROOT}/World_${theme.palette.mapTiles}_Gray_Base/MapServer/tile/{z}/{y}/{x}`}
        attribution='Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        className="base-tiles"
        maxNativeZoom={16}
        maxZoom={19}
      />
      <TileLayer
        key={`labels-${theme.palette.mapTiles}`}
        url={`${TILE_ROOT}/World_${theme.palette.mapTiles}_Gray_Reference/MapServer/tile/{z}/{y}/{x}`}
        maxNativeZoom={16}
        maxZoom={19}
      />
      <ZoomRadius onChange={setZoom} />
      <ZoomControl position="topleft" />
      <MapEvents onClick={onMapClick} />
      <FollowSelection room={selected} padding={followPadding} />

      {STOP_RINGS.map(km => (
        <Circle
          key={km}
          center={OFFICE_POSITION}
          radius={km * 1000}
          interactive={false}
          pathOptions={{ color: primary.main, weight: 1, opacity: 0.22, dashArray: '2 10', fill: false }}
        />
      ))}
      <Circle
        center={OFFICE_POSITION}
        radius={MAX_DISTANCE * 1000}
        interactive={false}
        pathOptions={{ color: primary.main, weight: 1.5, opacity: 0.55, dashArray: '2 8', fill: false }}
      />

      <RoomMarkers rooms={rooms} radius={markerRadius(zoom)} bandColors={band} strokeColor={background.default} onSelect={onSelect} />

      {hovered && hovered.id !== selected?.id && (
        <CircleMarker
          center={[hovered.lat, hovered.lon]}
          radius={10}
          interactive={false}
          pathOptions={{ color: text.primary, weight: 2, fill: false }}
        />
      )}

      {selected && (
        <>
          <Polyline
            positions={[OFFICE_POSITION, [selected.lat, selected.lon]]}
            interactive={false}
            pathOptions={{ color: primary.main, weight: 3, dashArray: '1 9', lineCap: 'round' }}
          />
          <CircleMarker
            center={[selected.lat, selected.lon]}
            radius={15}
            interactive={false}
            pathOptions={{ color: background.default, weight: 4, fill: false, opacity: 0.85 }}
          />
          <CircleMarker
            center={[selected.lat, selected.lon]}
            radius={12}
            bubblingMouseEvents={false}
            pathOptions={{ color: primary.main, weight: 3, fillColor: band[rentBand(selected.rent).key], fillOpacity: 1 }}
          >
            <Tooltip permanent direction="right" offset={[14, 0]} className="drop-label">
              {formatKm(selected.distance)} km
            </Tooltip>
          </CircleMarker>
        </>
      )}

      {pin && (
        <>
          <Circle
            center={[pin.lat, pin.lng]}
            radius={PIN_RADIUS * 1000}
            interactive={false}
            pathOptions={{ color: theme.palette.secondary.main, weight: 1.5, dashArray: '6 6', fillColor: theme.palette.secondary.main, fillOpacity: 0.06 }}
          />
          <Marker position={pin} icon={pinIcon(theme.palette.secondary.main)} interactive={false} />
        </>
      )}

      <Marker position={OFFICE_POSITION} icon={officeIcon} zIndexOffset={1000}>
        <Tooltip direction="top" offset={[0, -16]} className="office-label">
          Office · {OFFICE.name}
        </Tooltip>
      </Marker>
    </MapContainer>
  );
}
