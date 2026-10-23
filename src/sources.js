// These sites don't allow cross-origin requests, so they go through the Vite proxy in vite.config.js.
// None of them sort by distance, so MagicBricks and Square Yards are searched by the localities around the base.

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

// Redirects point at the real domain, which the browser would block, and only happen past the last page
async function fetchHtml(url) {
  const res = await fetch(url, { redirect: 'manual' });
  if (res.type === 'opaqueredirect') return '';
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

// MagicBricks

const MAGICBRICKS_PROPERTY_TYPES = 'Multistorey-Apartment,Builder-Floor-Apartment,Penthouse,Studio-Apartment,Residential-House,Villa';
const MAGICBRICKS_STATE_MARKER = 'window.SERVER_PRELOADED_STATE_ = ';

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

const MAGICBRICKS_LISTED_BY = { owner: 'owner', builder: 'builder', agent: 'dealer' };

export function parseMagicBricksItem(item) {
  if (!item.pmtLat || !item.pmtLong || !item.price) return null;
  const bhk = parseInt(item.bedroomD) || 0;

  return {
    id: `magicbricks-${item.id}`,
    source: 'magicbricks',
    url: `https://www.magicbricks.com/propertyDetails/${item.url}`,
    lat: item.pmtLat,
    lon: item.pmtLong,
    title: item.propertyTitle?.trim() || item.auto_desc || '',
    description: item.seoDesc || item.auto_desc || '',
    price: item.price.toLocaleString('en-IN'),
    priceRaw: item.price,
    images: item.allImgPath?.length ? item.allImgPath : [item.image].filter(Boolean),
    mainInfo: [bhk && `${bhk} BHK`, item.caSqFt && `${item.caSqFt} sqft`, item.furnishedD, item.lmtDName].filter(Boolean).join(' · '),
    userName: item.contName || item.oname || '',
    createdDate: item.postDateT || '',
    bhk,
    furnishing: detectFurnishing(item.furnishedD),
    listingType: MAGICBRICKS_LISTED_BY[item.userType?.toLowerCase()] || '',
    area: item.caSqFt || 0
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
  const priceRaw = parseInt(card.price);
  if (!lat || !lon || !priceRaw) return null;

  const description = (schema.description || '').replace(/&nbsp;/g, ' ');
  const bhk = parseInt(card.unittype) || parseInt(schema.numberOfRooms) || 0;
  const area = parseInt(schema.floorSize) || 0;

  return {
    id: `squareyards-${id}`,
    source: 'squareyards',
    url: card.url || schema.url,
    lat,
    lon,
    title: schema.name || card.name || '',
    description,
    price: priceRaw.toLocaleString('en-IN'),
    priceRaw,
    images: [card.image || schema.image].filter(Boolean),
    mainInfo: [card.unittype, area && `${area} sqft`, card.locality].filter(Boolean).join(' · '),
    userName: '',
    createdDate: '',
    bhk,
    furnishing: detectFurnishing(description),
    listingType: '',
    area
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
  const priceRaw = item.discountedPrice || item.startingPrice;
  if (!item.latitude || !item.longitude || !priceRaw || item.soldOut) return null;

  return {
    id: `stanza-${item.residenceId}`,
    source: 'stanza',
    url: `https://www.stanzaliving.com/${item.slug}`,
    lat: item.latitude,
    lon: item.longitude,
    title: `${item.name} (PG, ${item.genderName || 'Co-living'})`,
    description: `Stanza Living PG in ${item.micromarketName || 'Bengaluru'}. Price is per bed, starting from.`,
    price: priceRaw.toLocaleString('en-IN'),
    priceRaw,
    images: [item.imageUrl].filter(Boolean),
    mainInfo: ['PG', item.genderName, item.micromarketName, item.pricingPlan].filter(Boolean).join(' · '),
    userName: 'Stanza Living',
    createdDate: '',
    bhk: 0,
    furnishing: 'furnished',
    listingType: '',
    area: 0
  };
}
