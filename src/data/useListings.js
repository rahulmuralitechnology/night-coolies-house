import { useEffect, useState } from 'react';
import { MAX_DISTANCE, MIN_RENT, SOURCE_KEYS } from '../config';
import { distanceFromOffice, withinRadius } from '../lib/geo';
import {
  fetchOlxPage, parseOlxItem,
  fetchNoBrokerPage, parseNoBrokerItem,
  fetchMagicBricksPage, parseMagicBricksItem,
  SQUAREYARDS_LOCALITY_SLUGS, fetchSquareYardsPage, parseSquareYardsItem,
  fetchStanzaResidences, parseStanzaItem,
} from './sources';

const OLX_MAX_PAGES = 25;
const NOBROKER_MAX_PAGES = 40;
const MAGICBRICKS_MAX_PAGES = 60;
const SQUAREYARDS_MAX_PAGES_PER_LOCALITY = 15;
const SQUAREYARDS_PARALLEL_LOCALITIES = 4;
const PAGE_DELAY_MS = 300; // avoid rate limits

const pause = () => new Promise(resolve => setTimeout(resolve, PAGE_DELAY_MS));

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const ENTITY_PATTERN = /&(?:(amp|lt|gt|quot|apos|nbsp)|#(\d+)|#x([\da-f]+));/gi;

// Some sources send HTML-escaped text, sometimes escaped twice ("&amp;amp;")
function decodeEntities(text) {
  let current = text || '';
  for (let pass = 0; pass < 3; pass++) {
    const next = current.replace(ENTITY_PATTERN, (_, name, dec, hex) => (
      name ? ENTITIES[name.toLowerCase()] : String.fromCodePoint(dec ? parseInt(dec, 10) : parseInt(hex, 16))
    ));
    if (next === current) break;
    current = next;
  }
  return current;
}

const initialSourceState = () =>
  Object.fromEntries(SOURCE_KEYS.map(key => [key, { status: 'loading', count: 0 }]));

export function useListings(reloadKey) {
  const [rooms, setRooms] = useState([]);
  const [sources, setSources] = useState(initialSourceState);

  useEffect(() => {
    let cancelled = false;
    const seenIds = new Set();
    const counts = Object.fromEntries(SOURCE_KEYS.map(key => [key, 0]));

    setRooms([]);
    setSources(initialSourceState());

    const setSource = (key, patch) => {
      if (cancelled) return;
      setSources(prev => ({ ...prev, [key]: { ...prev[key], ...patch } }));
    };

    const addListings = (key, listings, parse) => {
      if (cancelled) return;
      const batch = [];
      listings.forEach(item => {
        const room = withinRadius(parse(item));
        if (!room || room.rent < MIN_RENT || seenIds.has(room.id)) return;
        seenIds.add(room.id);
        room.title = decodeEntities(room.title);
        room.place = decodeEntities(room.place);
        room.description = decodeEntities(room.description);
        batch.push(room);
      });
      if (!batch.length) return;
      counts[key] += batch.length;
      setRooms(prev => prev.concat(batch));
      setSource(key, { count: counts[key] });
    };

    // Runs one source to completion and records whether it finished or failed
    const run = async (key, task) => {
      try {
        await task();
        setSource(key, { status: 'done' });
      } catch (err) {
        console.error(`Error loading ${key}`, err);
        setSource(key, { status: counts[key] ? 'partial' : 'error' });
      }
    };

    async function fetchOlx() {
      for (let page = 1; page <= OLX_MAX_PAGES && !cancelled; page++) {
        const listings = await fetchOlxPage(page);
        if (!listings.length) break;
        addListings('olx', listings, parseOlxItem);
        await pause();
      }
    }

    async function fetchNoBroker() {
      for (let page = 1; page <= NOBROKER_MAX_PAGES && !cancelled; page++) {
        const listings = await fetchNoBrokerPage(page);
        if (!listings.length) break;
        addListings('nobroker', listings, parseNoBrokerItem);

        // Results are sorted by distance, so stop once past the radius
        const last = listings[listings.length - 1];
        if (distanceFromOffice(last.latitude, last.longitude) > MAX_DISTANCE) break;
        await pause();
      }
    }

    async function fetchMagicBricks() {
      const rawSeen = new Set();
      for (let page = 1; page <= MAGICBRICKS_MAX_PAGES && !cancelled; page++) {
        const listings = await fetchMagicBricksPage(page);
        // Past the last page MagicBricks repeats earlier results instead of returning nothing
        const fresh = listings.filter(item => !rawSeen.has(item.id));
        if (!fresh.length) break;
        fresh.forEach(item => rawSeen.add(item.id));
        addListings('magicbricks', fresh, parseMagicBricksItem);
        await pause();
      }
    }

    async function fetchSquareYardsLocality(slug) {
      const rawSeen = new Set();
      for (let page = 1; page <= SQUAREYARDS_MAX_PAGES_PER_LOCALITY && !cancelled; page++) {
        const listings = await fetchSquareYardsPage(slug, page);
        const fresh = listings.filter(item => !rawSeen.has(item.id));
        if (!fresh.length) break;
        fresh.forEach(item => rawSeen.add(item.id));
        addListings('squareyards', fresh, parseSquareYardsItem);
        await pause();
      }
    }

    async function fetchSquareYards() {
      const queue = [...SQUAREYARDS_LOCALITY_SLUGS];
      let failures = 0;
      const workers = Array.from({ length: SQUAREYARDS_PARALLEL_LOCALITIES }, async () => {
        while (queue.length && !cancelled) {
          const slug = queue.shift();
          try {
            await fetchSquareYardsLocality(slug);
          } catch (err) {
            failures++;
            console.error('Error loading Square Yards locality', slug, err);
          }
        }
      });
      await Promise.all(workers);
      if (failures === SQUAREYARDS_LOCALITY_SLUGS.length) throw new Error('All Square Yards localities failed');
    }

    async function fetchStanza() {
      addListings('stanza', await fetchStanzaResidences(), parseStanzaItem);
    }

    run('olx', fetchOlx);
    run('nobroker', fetchNoBroker);
    run('magicbricks', fetchMagicBricks);
    run('squareyards', fetchSquareYards);
    run('stanza', fetchStanza);

    return () => { cancelled = true; };
  }, [reloadKey]);

  const loading = Object.values(sources).some(source => source.status === 'loading');
  return { rooms, sources, loading };
}
