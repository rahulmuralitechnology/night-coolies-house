import { OFFICE, MAX_DISTANCE } from '../config';

// Every source parses into the same listing shape:
// { id, source, url, lat, lon, title, place, description, rent, images, summary, owner, postedAt, bhk, furnishing, listedBy, area }
// `place` is the short "Society, Locality" label; titles are often boilerplate like "3 BHK Flat for Rent in Hebbal"
// OLX is called directly; the other sites don't allow cross-origin requests, so they go through
// the proxies in vite.config.js (dev) and public/_redirects (Netlify).

export const NEARBY_LOCALITIES = [
  'Hebbal', 'Yelahanka', 'Yelahanka New Town', 'Jakkur', 'Sahakara Nagar', 'Thanisandra',
  'RT Nagar', 'Kodigehalli', 'Vidyaranyapura', 'Nagavara', 'HBR Layout', 'Hennur', 'Hennur Road',
  'Sanjay Nagar', 'Byatarayanapura', 'Kempapura', 'Ganga Nagar', 'Bellary Road', 'Mathikere',
  'Yeshwanthpur', 'Kalyan Nagar', 'Jalahalli', 'Rachenahalli', 'Amruthahalli', 'Malleswaram',
  'Thindlu', 'Kogilu', 'Bhoopasandra', 'Dollars Colony', 'Geddalahalli',
];

const FURNISHING_PATTERNS = [
  [/semi[\s-]?furnished/i, 'semi-furnished'],
  [/un[\s-]?furnished|not furnished/i, 'unfurnished'],
  [/furnished/i, 'furnished'],
];

function detectFurnishing(text) {
  const match = FURNISHING_PATTERNS.find(([pattern]) => pattern.test(text || ''));
  return match ? match[1] : '';
}

function joinPlace(project, locality) {
  const parts = [project, locality].map(part => (part || '').trim()).filter(Boolean);
  if (parts.length === 2 && parts[0].toLowerCase() === parts[1].toLowerCase()) parts.pop();
  return parts.join(', ');
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

// Redirects point at the real domain, which the browser would block, and only happen past the last page
async function fetchHtml(url) {
  const res = await fetch(url, { redirect: 'manual' });
  if (res.type === 'opaqueredirect') return '';
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

// OLX

export async function fetchOlxPage(page) {
  const data = await fetchJson(`https://api.olx.in/relevance/v4/search?category=1723&location=4058803&size=40&page=${page}&sorting=asc-price&lang=en-IN`);
  return data?.data || [];
}

export function parseOlxItem(item) {
  const lat = item?.locations?.[0]?.lat;
  const lon = item?.locations?.[0]?.lon;
  if (!lat || !lon) return null;

  const param = key => item.parameters?.find(p => p.key === key)?.value_name;
  const bhkMatch = item.main_info?.match(/(\d+)\s*BHK/i)?.[1] || param('rooms');

  return {
    id: `olx-${item.id}`,
    source: 'olx',
    url: `https://www.olx.in/item/${item.ad_id}`,
    lat,
    lon,
    title: item.title || '',
    place: joinPlace(null, item.locations_resolved?.SUBLOCALITY_LEVEL_1_name),
    description: item.description || '',
    rent: item.price?.value?.raw || 0,
    images: item.images?.map(img => img.url) || [],
    summary: item.main_info || '',
    owner: item.user_name || '',
    postedAt: item.created_at || '',
    bhk: parseInt(bhkMatch) || 0,
    furnishing: detectFurnishing(param('furnished')),
    listedBy: param('listed_by')?.toLowerCase() || '',
    area: parseInt(param('ft')) || 0,
  };
}

// NoBroker

export const NOBROKER_PAGE_SIZE = 500;

export async function fetchNoBrokerPage(page) {
  const searchParam = btoa(JSON.stringify([{ lat: OFFICE.lat, lon: OFFICE.lon, placeId: 'x', placeName: 'Base' }]));
  const data = await fetchJson(`/api/nobroker/v3/multi/property/RENT/filter?searchParam=${encodeURIComponent(searchParam)}&radius=${MAX_DISTANCE}&sharedAccomodation=0&city=bangalore&size=${NOBROKER_PAGE_SIZE}&pageNo=${page}`);
  return data?.data || [];
}

const NOBROKER_FURNISHING = {
  FULLY_FURNISHED: 'furnished',
  SEMI_FURNISHED: 'semi-furnished',
  NOT_FURNISHED: 'unfurnished',
};

export function parseNoBrokerItem(item) {
  // Lease listings have no monthly rent
  if (!item.latitude || !item.longitude || !item.rent) return null;

  return {
    id: `nobroker-${item.id}`,
    source: 'nobroker',
    url: `https://www.nobroker.in${item.detailUrl}`,
    lat: item.latitude,
    lon: item.longitude,
    title: item.propertyTitle?.trim() || item.title || '',
    place: joinPlace(/independent|standalone/i.test(item.society || '') ? null : item.society, item.locality),
    description: [item.secondaryTitle, item.address].filter(Boolean).join(' — '),
    rent: item.rent,
    images: item.photos
      ?.map(p => p.imagesMap?.original)
      .filter(Boolean)
      .map(file => `https://assets.nobroker.in/images/${item.id}/${file}`) || [],
    summary: [item.typeDesc, item.formattedDeposit && `Deposit ₹${item.formattedDeposit}`, item.locality?.trim()].filter(Boolean).join(' · '),
    owner: item.ownerName || '',
    postedAt: item.activationDate ? new Date(item.activationDate).toISOString() : '',
    bhk: parseInt(item.type?.match(/\d+/)?.[0]) || 0,
    furnishing: NOBROKER_FURNISHING[item.furnishing] || '',
    listedBy: 'owner',
    area: item.propertySize || 0,
  };
}

// MagicBricks

const MAGICBRICKS_PROPERTY_TYPES = 'Multistorey-Apartment,Builder-Floor-Apartment,Penthouse,Studio-Apartment,Residential-House,Villa';
const MAGICBRICKS_STATE_MARKER = 'window.SERVER_PRELOADED_STATE_ = ';
const MAGICBRICKS_LISTED_BY = { owner: 'owner', builder: 'builder', agent: 'dealer' };

export async function fetchMagicBricksPage(page) {
  const params = new URLSearchParams({
    proptype: MAGICBRICKS_PROPERTY_TYPES,
    cityName: 'Bangalore',
    Locality: NEARBY_LOCALITIES.join(','),
    page: String(page),
  });
  const html = await fetchHtml(`/api/magicbricks/property-for-rent/residential-real-estate?${params}`);

  const start = html.indexOf(MAGICBRICKS_STATE_MARKER);
  if (start === -1) return [];
  const end = html.indexOf('</script>', start);
  const json = html.slice(start + MAGICBRICKS_STATE_MARKER.length, end).trim().replace(/;$/, '');
  return JSON.parse(json).searchResult || [];
}

export function parseMagicBricksItem(item) {
  if (!item.pmtLat || !item.pmtLong || !item.price) return null;

  return {
    id: `magicbricks-${item.id}`,
    source: 'magicbricks',
    url: `https://www.magicbricks.com/propertyDetails/${item.url}`,
    lat: item.pmtLat,
    lon: item.pmtLong,
    title: item.propertyTitle?.trim() || item.auto_desc || '',
    place: joinPlace(item.prjname, item.lmtDName),
    description: item.seoDesc || item.auto_desc || '',
    rent: item.price,
    images: item.allImgPath?.length ? item.allImgPath : [item.image].filter(Boolean),
    summary: [item.furnishedD, item.lmtDName].filter(Boolean).join(' · '),
    owner: item.contName || item.oname || '',
    postedAt: item.postDateT || '',
    bhk: parseInt(item.bedroomD) || 0,
    furnishing: detectFurnishing(item.furnishedD),
    listedBy: MAGICBRICKS_LISTED_BY[item.userType?.toLowerCase()] || '',
    area: item.caSqFt || 0,
  };
}

// Square Yards

export const SQUAREYARDS_LOCALITY_SLUGS = [
  'hebbal', 'yelahanka', 'yelahanka-new-town', 'sahakara-nagar', 'thanisandra', 'rt-nagar',
  'kodigehalli', 'vidyaranyapura', 'nagavara', 'hbr-layout', 'hennur', 'hennur-road', 'sanjay-nagar',
  'byatarayanapura', 'kempapura', 'ganga-nagar', 'bellary-road', 'mathikere', 'yeshwanthpur',
  'kalyan-nagar', 'jalahalli', 'rachenahalli',
];

// Price and unit type are on the listing cards; coordinates are only in the schema.org JSON-LD
export async function fetchSquareYardsPage(localitySlug, page) {
  // Square Yards redirects ?page=1 to the bare URL
  const query = page > 1 ? `?page=${page}` : '';
  const html = await fetchHtml(`/api/squareyards/rent/property-for-rent-in-${localitySlug}-bangalore${query}`);
  const doc = new DOMParser().parseFromString(html, 'text/html');

  const geoById = {};
  doc.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
    try {
      const data = JSON.parse(script.textContent);
      const id = data?.url?.match(/\/(\d+)$/)?.[1];
      if (id && data.geo) geoById[id] = data;
    } catch {
      // Not every JSON-LD block is a listing
    }
  });

  const listings = [];
  const seen = new Set();
  doc.querySelectorAll('[data-propertyid][data-price]').forEach(el => {
    const id = el.dataset.propertyid;
    if (seen.has(id) || !geoById[id]) return;
    seen.add(id);
    listings.push({ id, card: { ...el.dataset }, schema: geoById[id] });
  });
  return listings;
}

export function parseSquareYardsItem({ id, card, schema }) {
  const lat = parseFloat(schema.geo.latitude);
  const lon = parseFloat(schema.geo.longitude);
  const rent = parseInt(card.price);
  if (!lat || !lon || !rent) return null;

  const description = (schema.description || '').replace(/&nbsp;/g, ' ');

  return {
    id: `squareyards-${id}`,
    source: 'squareyards',
    url: card.url || schema.url,
    lat,
    lon,
    title: card.propertyTitle || schema.name || card.name || '',
    place: joinPlace(card.projectname, card.sublocalityname),
    description,
    rent,
    images: [card.image || schema.image].filter(Boolean),
    summary: card.locality || '',
    owner: '',
    postedAt: '',
    bhk: parseInt(card.unittype) || parseInt(schema.numberOfRooms) || 0,
    furnishing: detectFurnishing(description),
    listedBy: '',
    area: parseInt(schema.floorSize) || 0,
  };
}

// Stanza Living (PG / co-living, priced per bed)

export async function fetchStanzaResidences() {
  const html = await fetchHtml('/api/stanza/bangalore');
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const nextData = doc.getElementById('__NEXT_DATA__');
  if (!nextData) return [];
  return JSON.parse(nextData.textContent)?.props?.pageProps?.cityMapData || [];
}

export function parseStanzaItem(item) {
  const rent = item.discountedPrice || item.startingPrice;
  if (!item.latitude || !item.longitude || !rent || item.soldOut) return null;

  return {
    id: `stanza-${item.residenceId}`,
    source: 'stanza',
    url: `https://www.stanzaliving.com/${item.slug}`,
    lat: item.latitude,
    lon: item.longitude,
    title: `${item.name} PG`,
    place: joinPlace(`${item.name} PG`, item.micromarketName),
    description: `Stanza Living co-living residence in ${item.micromarketName || 'Bengaluru'}. Rent shown is the starting price per bed.`,
    rent,
    images: [item.imageUrl].filter(Boolean),
    summary: [item.genderName, item.micromarketName].filter(Boolean).join(' · '),
    owner: 'Stanza Living',
    postedAt: '',
    bhk: 0,
    furnishing: 'furnished',
    listedBy: '',
    area: 0,
  };
}
