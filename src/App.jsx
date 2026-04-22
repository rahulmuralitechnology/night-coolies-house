import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CENTER = { lat: 12.9499095, lon: 77.5925484 };
const MAX_DISTANCE = 5; // km
const MAX_PAGES = 25; // safety limit

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

async function fetchPage(page) {
  const url = `https://api.olx.in/relevance/v4/search?category=1723&location=4058803&size=40&page=${page}&sorting=asc-price&lang=en-IN`;

  const res = await fetch(url);
  const data = await res.json();
  return data?.data || [];
}

function App() {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [status, setStatus] = useState('Loading...');
  const [totalShown, setTotalShown] = useState(0);
  const [hoveredRoom, setHoveredRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bhkFilter, setBhkFilter] = useState('all');
  const [sortBy, setSortBy] = useState('price-asc');
  const seenIdsRef = useRef(new Set());

  useEffect(() => {
    async function fetchAllRooms() {
      setLoading(true);
      seenIdsRef.current = new Set(); // Reset seen IDs on each fetch
      setRooms([]); // Clear previous rooms
      let total = 0;

      for (let page = 1; page <= MAX_PAGES; page++) {
        setStatus(`Fetching page ${page}...`);

        try {
          const listings = await fetchPage(page);

          if (!listings.length) break;

          let newItems = 0;

          listings.forEach(item => {
            const id = item.id;
            if (seenIdsRef.current.has(id)) return;
            seenIdsRef.current.add(id);

            const lat = item?.locations?.[0]?.lat;
            const lon = item?.locations?.[0]?.lon;

            if (!lat || !lon) return;

            const distance = getDistance(CENTER.lat, CENTER.lon, lat, lon);

            if (distance <= MAX_DISTANCE) {
              newItems++;
              total++;

              // Extract BHK from main_info or parameters
              const bhkMatch = item.main_info?.match(/(\d+)\s*BHK/i) ||
                              item.parameters?.find(p => p.key === 'rooms')?.value_name;
              const bhk = bhkMatch ? parseInt(bhkMatch) : 0;

              setRooms(prev => [...prev, {
                id,
                adId: item.ad_id,
                lat,
                lon,
                title: item.title,
                description: item.description || '',
                price: item.price?.value?.display || item.price?.value?.raw?.toString() || 'N/A',
                priceRaw: item.price?.value?.raw || 0,
                distance: distance.toFixed(2),
                distanceRaw: distance,
                images: item.images?.map(img => img.url) || [],
                mainInfo: item.main_info || '',
                userName: item.user_name || '',
                createdDate: item.created_at || '',
                bhk: bhk
              }]);
            }
          });

          if (newItems === 0) {
            console.log(`Page ${page}: no nearby results`);
          }

          await new Promise(r => setTimeout(r, 300)); // avoid rate limit

        } catch (err) {
          console.error("Error on page", page, err);
          break;
        }
      }

      setTotalShown(total);
      setStatus(`Done ✅ Showing ${total} rooms within 5km`);
      setLoading(false);
    }

    fetchAllRooms();
  }, []);

  // Filter and sort rooms
  useEffect(() => {
    let filtered = [...rooms];

    // Price filter
    if (minPrice) {
      filtered = filtered.filter(room => room.priceRaw >= parseFloat(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(room => room.priceRaw <= parseFloat(maxPrice));
    }

    // BHK filter
    if (bhkFilter !== 'all') {
      filtered = filtered.filter(room => room.bhk === parseInt(bhkFilter));
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.priceRaw - b.priceRaw;
        case 'price-desc':
          return b.priceRaw - a.priceRaw;
        case 'distance-asc':
          return a.distanceRaw - b.distanceRaw;
        case 'distance-desc':
          return b.distanceRaw - a.distanceRaw;
        case 'date-newest':
          return new Date(b.createdDate) - new Date(a.createdDate);
        case 'date-oldest':
          return new Date(a.createdDate) - new Date(b.createdDate);
        default:
          return 0;
      }
    });

    setFilteredRooms(filtered);
  }, [rooms, minPrice, maxPrice, bhkFilter, sortBy]);

  // Refresh function
  const handleRefresh = () => {
    setRooms([]);
    setFilteredRooms([]);
    setStatus('Loading...');
  };

  // Get marker color based on price
  const getMarkerColor = (price) => {
    if (price < 10000) return '#4CAF50'; // Green - budget
    if (price < 20000) return '#2196F3'; // Blue - mid-range
    if (price < 35000) return '#FF9800'; // Orange - upper-mid
    return '#F44336'; // Red - premium
  };

  // Create custom marker icon
  const createCustomIcon = (price) => {
    const color = getMarkerColor(price);
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

  return (
    <div>
      <div className="controls-panel">
        <div className="control-group">
          <label>Min Price (₹):</label>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min"
          />
          <label>Max Price (₹):</label>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max"
          />
        </div>
        <div className="control-group">
          <label>BHK:</label>
          <select value={bhkFilter} onChange={(e) => setBhkFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4">4+ BHK</option>
          </select>
        </div>
        <div className="control-group">
          <label>Sort By:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="distance-asc">Distance: Nearest</option>
            <option value="distance-desc">Distance: Farthest</option>
            <option value="date-newest">Date: Newest</option>
            <option value="date-oldest">Date: Oldest</option>
          </select>
        </div>
        <button onClick={handleRefresh} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>
      <div id="status">
        {status} {filteredRooms.length !== rooms.length && `(Filtered: ${filteredRooms.length}/${rooms.length})`}
      </div>
      {loading && <div className="loading-spinner">Loading...</div>}
      <MapContainer center={[CENTER.lat, CENTER.lon]} zoom={13} style={{ height: '100vh' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <Marker position={[CENTER.lat, CENTER.lon]}>
          <Popup>Center Location</Popup>
        </Marker>
        {filteredRooms.map(room => (
          <Marker
            key={room.id}
            position={[room.lat, room.lon]}
            icon={createCustomIcon(room.priceRaw)}
            eventHandlers={{
              mouseover: () => setHoveredRoom(room),
              mouseout: () => setHoveredRoom(null),
              click: () => window.open(`https://www.olx.in/item/${room.adId}`, '_blank'),
            }}
          >
            <Popup>
              <div className="popup">
                <b>{room.title}</b><br />
                Price: ₹{room.price}<br />
                Distance: {room.distance} km<br />
                <a href={`https://www.olx.in/item/${room.adId}`} target="_blank" rel="noopener noreferrer">View on OLX</a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {hoveredRoom && (
        <div className="modal">
          <div className="modal-content">
            <h3>{hoveredRoom.title}</h3>
            {hoveredRoom.images.length > 0 && (
              <div className="image-gallery">
                <img src={hoveredRoom.images[0]} alt={hoveredRoom.title} className="main-image" />
                {hoveredRoom.images.length > 1 && (
                  <div className="thumbnail-strip">
                    {hoveredRoom.images.slice(1, 5).map((img, idx) => (
                      <img key={idx} src={img} alt={`${hoveredRoom.title} ${idx + 2}`} className="thumbnail" />
                    ))}
                  </div>
                )}
              </div>
            )}
            <p className="main-info">{hoveredRoom.mainInfo}</p>
            <p><strong>Price:</strong> ₹{hoveredRoom.price}</p>
            <p><strong>Distance:</strong> {hoveredRoom.distance} km</p>
            <p><strong>Listed by:</strong> {hoveredRoom.userName}</p>
            <p><strong>Posted:</strong> {new Date(hoveredRoom.createdDate).toLocaleDateString()}</p>
            <p className="description"><strong>Description:</strong> {hoveredRoom.description}</p>
            <a href={`https://www.olx.in/item/${hoveredRoom.adId}`} target="_blank" rel="noopener noreferrer" className="olx-link">View on OLX</a>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
