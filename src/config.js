export const APP_NAME = 'Night Coolies House';

export const OFFICE = {
  name: 'LTM Tower S2, Solaris',
  area: 'Hebbal',
  lat: 13.0690331,
  lon: 77.5919998,
};

export const MAX_DISTANCE = 10; // km
export const KM_BAND = 2; // roster is grouped into drop stops this many km apart
export const PIN_RADIUS = 2; // km around a dropped pin
export const MIN_RENT = 1000; // lease and placeholder listings show rents like ₹1

export const SOURCE_KEYS = ['nobroker', 'magicbricks', 'squareyards', 'olx', 'stanza'];

export const SOURCES = {
  olx: { name: 'OLX', approximate: true },
  nobroker: { name: 'NoBroker' },
  magicbricks: { name: 'MagicBricks' },
  squareyards: { name: 'Square Yards' },
  stanza: { name: 'Stanza Living', perBed: true },
};

export const RENT_BANDS = [
  { key: 'budget', label: 'Under ₹10k', min: 0, max: 10000 },
  { key: 'mid', label: '₹10k–20k', min: 10000, max: 20000 },
  { key: 'upper', label: '₹20k–35k', min: 20000, max: 35000 },
  { key: 'premium', label: '₹35k+', min: 35000, max: Infinity },
];

export function rentBand(price) {
  return RENT_BANDS.find(band => price >= band.min && price < band.max) || RENT_BANDS[RENT_BANDS.length - 1];
}
