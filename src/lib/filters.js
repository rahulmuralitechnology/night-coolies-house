import { RENT_BANDS, SOURCES } from '../config';

export const SORTS = [
  { value: 'distance-asc', label: 'Nearest first' },
  { value: 'price-asc', label: 'Rent: low to high' },
  { value: 'price-desc', label: 'Rent: high to low' },
  { value: 'date-newest', label: 'Newest listed' },
  { value: 'area-desc', label: 'Largest first' },
];

export const DEFAULT_FILTERS = {
  search: '',
  bands: [],
  bhk: 'any',
  minRent: '',
  maxRent: '',
  minArea: '',
  maxArea: '',
  furnishing: 'any',
  listedBy: 'any',
  sources: [],
  sort: 'distance-asc',
};

const LIST_KEYS = ['bands', 'sources'];

// Fields beyond the quick row (search, rent bands, BHK, sort), used for the "More filters" badge
export function countAdvancedFilters(filters) {
  return ['minRent', 'maxRent', 'minArea', 'maxArea', 'furnishing', 'listedBy', 'sources']
    .filter(key => {
      const value = filters[key];
      if (Array.isArray(value)) return value.length > 0;
      return value !== DEFAULT_FILTERS[key];
    }).length;
}

export function isDefaultFilters(filters) {
  return Object.keys(DEFAULT_FILTERS).every(key => {
    if (key === 'sort') return true;
    const value = filters[key];
    return Array.isArray(value) ? value.length === 0 : value === DEFAULT_FILTERS[key];
  });
}

export function applyFilters(rooms, filters) {
  const query = filters.search.trim().toLowerCase();
  const minRent = parseFloat(filters.minRent);
  const maxRent = parseFloat(filters.maxRent);
  const minArea = parseFloat(filters.minArea);
  const maxArea = parseFloat(filters.maxArea);
  const bands = RENT_BANDS.filter(band => filters.bands.includes(band.key));

  const result = rooms.filter(room => {
    if (query && ![room.title, room.place, room.description, room.summary].some(text => (text || '').toLowerCase().includes(query))) return false;
    if (bands.length && !bands.some(band => room.rent >= band.min && room.rent < band.max)) return false;
    if (!Number.isNaN(minRent) && room.rent < minRent) return false;
    if (!Number.isNaN(maxRent) && room.rent > maxRent) return false;
    if (!Number.isNaN(minArea) && room.area < minArea) return false;
    if (!Number.isNaN(maxArea) && room.area > maxArea) return false;
    if (filters.bhk !== 'any') {
      const bhk = parseInt(filters.bhk);
      if (bhk >= 4 ? room.bhk < 4 : room.bhk !== bhk) return false;
    }
    if (filters.furnishing !== 'any' && room.furnishing !== filters.furnishing) return false;
    if (filters.listedBy !== 'any' && room.listedBy !== filters.listedBy) return false;
    if (filters.sources.length && !filters.sources.includes(room.source)) return false;
    return true;
  });

  const time = room => (room.postedAt ? new Date(room.postedAt).getTime() : 0);
  const comparators = {
    'distance-asc': (a, b) => a.distance - b.distance,
    'price-asc': (a, b) => a.rent - b.rent,
    'price-desc': (a, b) => b.rent - a.rent,
    'date-newest': (a, b) => time(b) - time(a),
    'area-desc': (a, b) => b.area - a.area,
  };
  return result.sort(comparators[filters.sort] || comparators['distance-asc']);
}

export function filtersFromUrl(search) {
  const params = new URLSearchParams(search);
  const filters = { ...DEFAULT_FILTERS };
  Object.keys(DEFAULT_FILTERS).forEach(key => {
    if (!params.has(key)) return;
    const value = params.get(key);
    filters[key] = LIST_KEYS.includes(key) ? value.split(',').filter(Boolean) : value;
  });
  filters.sources = filters.sources.filter(key => key in SOURCES);
  if (!SORTS.some(sort => sort.value === filters.sort)) filters.sort = DEFAULT_FILTERS.sort;
  return filters;
}

export function filtersToSearch(filters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (value.length) params.set(key, value.join(','));
    } else if (value !== DEFAULT_FILTERS[key]) {
      params.set(key, value);
    }
  });
  const search = params.toString();
  return search ? `?${search}` : '';
}

export function toCsv(rooms) {
  const escape = value => {
    const text = String(value ?? '');
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const header = ['Source', 'Title', 'Rent (₹/month)', 'BHK', 'Area (sqft)', 'Distance (km)', 'Furnishing', 'Listed by', 'URL'];
  const rows = rooms.map(room => [
    SOURCES[room.source].name,
    room.title,
    room.rent,
    room.bhk || '',
    room.area || '',
    room.distance.toFixed(2),
    room.furnishing,
    room.listedBy,
    room.url,
  ]);
  return [header, ...rows].map(row => row.map(escape).join(',')).join('\n');
}
