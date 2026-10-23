import { OFFICE, MAX_DISTANCE } from '../config';

export function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function distanceFromOffice(lat, lon) {
  return getDistance(OFFICE.lat, OFFICE.lon, lat, lon);
}

export function withinRadius(room) {
  if (!room) return null;
  const distance = distanceFromOffice(room.lat, room.lon);
  if (distance > MAX_DISTANCE) return null;
  return { ...room, distance };
}
