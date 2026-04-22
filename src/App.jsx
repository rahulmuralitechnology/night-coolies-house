import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RefreshCw, Moon, Sun, Download, Share2, Heart, Scale, BarChart3, MapPin, X } from 'lucide-react';

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

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    }
  });
  return null;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [furnishingFilter, setFurnishingFilter] = useState('all');
  const [listingTypeFilter, setListingTypeFilter] = useState('all');
  const [minArea, setMinArea] = useState('');
  const [maxArea, setMaxArea] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [customCenter, setCustomCenter] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
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

              // Extract furnishing status
              const furnishingParam = item.parameters?.find(p => p.key === 'furnished');
              const furnishing = furnishingParam?.value_name?.toLowerCase() || '';

              // Extract listing type
              const listingTypeParam = item.parameters?.find(p => p.key === 'listed_by');
              const listingType = listingTypeParam?.value_name?.toLowerCase() || '';

              // Extract area (sqft)
              const areaParam = item.parameters?.find(p => p.key === 'ft');
              const area = areaParam?.value_name ? parseInt(areaParam.value_name) : 0;

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
                bhk: bhk,
                furnishing: furnishing,
                listingType: listingType,
                area: area
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

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(room =>
        room.title.toLowerCase().includes(query) ||
        room.description.toLowerCase().includes(query)
      );
    }

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

    // Furnishing filter
    if (furnishingFilter !== 'all') {
      filtered = filtered.filter(room => room.furnishing === furnishingFilter);
    }

    // Listing type filter
    if (listingTypeFilter !== 'all') {
      filtered = filtered.filter(room => room.listingType === listingTypeFilter);
    }

    // Area filter
    if (minArea) {
      filtered = filtered.filter(room => room.area >= parseInt(minArea));
    }
    if (maxArea) {
      filtered = filtered.filter(room => room.area <= parseInt(maxArea));
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
  }, [rooms, searchQuery, minPrice, maxPrice, bhkFilter, furnishingFilter, listingTypeFilter, minArea, maxArea, sortBy]);

  // Refresh function
  const handleRefresh = () => {
    setRooms([]);
    setFilteredRooms([]);
    setStatus('Loading...');
  };

  // Toggle favorite
  const toggleFavorite = (room) => {
    const isFavorite = favorites.some(f => f.id === room.id);
    if (isFavorite) {
      setFavorites(favorites.filter(f => f.id !== room.id));
    } else {
      setFavorites([...favorites, room]);
    }
  };

  // Toggle compare
  const toggleCompare = (room) => {
    const isInCompare = compareList.some(c => c.id === room.id);
    if (isInCompare) {
      setCompareList(compareList.filter(c => c.id !== room.id));
    } else {
      if (compareList.length < 3) {
        setCompareList([...compareList, room]);
      } else {
        alert('You can compare up to 3 rooms at a time');
      }
    }
  };

  // Export filtered results
  const handleExport = () => {
    const csv = [
      ['Title', 'Price', 'BHK', 'Area', 'Distance', 'Furnishing', 'Listing Type', 'URL'],
      ...filteredRooms.map(room => [
        room.title,
        room.price,
        room.bhk,
        room.area,
        room.distance,
        room.furnishing,
        room.listingType,
        `https://www.olx.in/item/${room.adId}`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rooms_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Share filters via URL
  const handleShare = () => {
    const params = new URLSearchParams();
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (bhkFilter !== 'all') params.set('bhk', bhkFilter);
    if (furnishingFilter !== 'all') params.set('furnishing', furnishingFilter);
    if (listingTypeFilter !== 'all') params.set('listingType', listingTypeFilter);
    if (minArea) params.set('minArea', minArea);
    if (maxArea) params.set('maxArea', maxArea);
    if (searchQuery) params.set('search', searchQuery);
    if (sortBy !== 'price-asc') params.set('sort', sortBy);

    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Share URL copied to clipboard!');
  };

  // Load filters from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('minPrice')) setMinPrice(params.get('minPrice'));
    if (params.has('maxPrice')) setMaxPrice(params.get('maxPrice'));
    if (params.has('bhk')) setBhkFilter(params.get('bhk'));
    if (params.has('furnishing')) setFurnishingFilter(params.get('furnishing'));
    if (params.has('listingType')) setListingTypeFilter(params.get('listingType'));
    if (params.has('minArea')) setMinArea(params.get('minArea'));
    if (params.has('maxArea')) setMaxArea(params.get('maxArea'));
    if (params.has('search')) setSearchQuery(params.get('search'));
    if (params.has('sort')) setSortBy(params.get('sort'));
  }, []);

  // Handle map click to set custom center
  const handleMapClick = (latlng) => {
    setCustomCenter(latlng);
  };

  // Reset to default center
  const resetCenter = () => {
    setCustomCenter(null);
  };

  // Calculate analytics
  const getAnalytics = () => {
    const roomsToAnalyze = filteredRooms.length > 0 ? filteredRooms : rooms;
    
    // Average price by BHK
    const priceByBHK = {};
    roomsToAnalyze.forEach(room => {
      if (room.bhk > 0) {
        if (!priceByBHK[room.bhk]) priceByBHK[room.bhk] = { total: 0, count: 0 };
        priceByBHK[room.bhk].total += room.priceRaw;
        priceByBHK[room.bhk].count += 1;
      }
    });

    // Room count by furnishing
    const countByFurnishing = {};
    roomsToAnalyze.forEach(room => {
      if (room.furnishing) {
        countByFurnishing[room.furnishing] = (countByFurnishing[room.furnishing] || 0) + 1;
      }
    });

    // Room count by listing type
    const countByListingType = {};
    roomsToAnalyze.forEach(room => {
      if (room.listingType) {
        countByListingType[room.listingType] = (countByListingType[room.listingType] || 0) + 1;
      }
    });

    // Price distribution
    const priceRanges = {
      'Under ₹10k': roomsToAnalyze.filter(r => r.priceRaw < 10000).length,
      '₹10k-₹20k': roomsToAnalyze.filter(r => r.priceRaw >= 10000 && r.priceRaw < 20000).length,
      '₹20k-₹35k': roomsToAnalyze.filter(r => r.priceRaw >= 20000 && r.priceRaw < 35000).length,
      'Over ₹35k': roomsToAnalyze.filter(r => r.priceRaw >= 35000).length,
    };

    return {
      totalRooms: roomsToAnalyze.length,
      avgPrice: roomsToAnalyze.reduce((sum, r) => sum + r.priceRaw, 0) / roomsToAnalyze.length || 0,
      avgPriceByBHK: Object.entries(priceByBHK).map(([bhk, data]) => ({
        bhk: parseInt(bhk),
        avg: data.total / data.count
      })),
      countByFurnishing,
      countByListingType,
      priceRanges
    };
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

  // Create location icon for center location
  const locationIcon = L.divIcon({
    className: 'location-icon',
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#002f34" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });

  return (
    <div className={darkMode ? 'dark-mode' : ''}>
      <div className="controls-panel">
        <div className="control-group">
          <label>Search:</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title/description..."
          />
        </div>
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
          <label>Min Area (sqft):</label>
          <input
            type="number"
            value={minArea}
            onChange={(e) => setMinArea(e.target.value)}
            placeholder="Min"
          />
          <label>Max Area (sqft):</label>
          <input
            type="number"
            value={maxArea}
            onChange={(e) => setMaxArea(e.target.value)}
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
          <label>Furnishing:</label>
          <select value={furnishingFilter} onChange={(e) => setFurnishingFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="furnished">Furnished</option>
            <option value="semi-furnished">Semi-Furnished</option>
            <option value="unfurnished">Unfurnished</option>
          </select>
        </div>
        <div className="control-group">
          <label>Listed By:</label>
          <select value={listingTypeFilter} onChange={(e) => setListingTypeFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="owner">Owner</option>
            <option value="builder">Builder</option>
            <option value="dealer">Dealer</option>
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
        <div className="control-group buttons">
          <button onClick={handleRefresh} className="refresh-btn">
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button onClick={() => setDarkMode(!darkMode)} className="dark-mode-btn">
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            <span>{darkMode ? 'Light' : 'Dark'}</span>
          </button>
          <button onClick={handleExport} className="export-btn">
            <Download size={16} />
            <span>Export</span>
          </button>
          <button onClick={handleShare} className="share-btn">
            <Share2 size={16} />
            <span>Share</span>
          </button>
          <button onClick={() => setShowFavorites(!showFavorites)} className="favorites-btn">
            <Heart size={16} />
            <span>Favorites ({favorites.length})</span>
          </button>
          <button onClick={() => setShowCompare(!showCompare)} className="compare-btn">
            <Scale size={16} />
            <span>Compare ({compareList.length})</span>
          </button>
          <button onClick={() => setShowLegend(!showLegend)} className="legend-btn">
            <MapPin size={16} />
            <span>Legend</span>
          </button>
          <button onClick={() => setShowAnalytics(!showAnalytics)} className="analytics-btn">
            <BarChart3 size={16} />
            <span>Analytics</span>
          </button>
        </div>
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
        <MapClickHandler onMapClick={handleMapClick} />
        <Marker position={[CENTER.lat, CENTER.lon]} icon={locationIcon}>
          <Popup>Default Center Location</Popup>
        </Marker>
        {customCenter && (
          <>
            <Marker position={[customCenter.lat, customCenter.lon]} icon={locationIcon}>
              <Popup>Custom Center Location</Popup>
            </Marker>
            <Circle
              center={[customCenter.lat, customCenter.lon]}
              radius={MAX_DISTANCE * 1000}
              pathOptions={{ color: '#002f34', fillColor: '#002f34', fillOpacity: 0.1 }}
            />
          </>
        )}
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
      {showLegend && (
        <div className="legend">
          <div className="legend-header">
            <h4>Price Legend</h4>
            <button onClick={() => setShowLegend(false)} className="close-btn">
              <X size={20} />
            </button>
          </div>
          <div className="legend-content">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#4CAF50' }}></div>
              <span>&lt; ₹10,000 (Budget)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#2196F3' }}></div>
              <span>₹10,000 - ₹20,000 (Mid-range)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#FF9800' }}></div>
              <span>₹20,000 - ₹35,000 (Upper-mid)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#F44336' }}></div>
              <span>&gt; ₹35,000 (Premium)</span>
            </div>
          </div>
        </div>
      )}
      {customCenter && (
        <div className="custom-center-info">
          <span>Custom center set. <button onClick={resetCenter} className="reset-link">Reset</button></span>
        </div>
      )}
      {hoveredRoom && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{hoveredRoom.title}</h3>
              <div className="modal-actions">
                <button onClick={() => toggleFavorite(hoveredRoom)} className="modal-action-btn">
                  {favorites.some(f => f.id === hoveredRoom.id) ? '❤️' : '🤍'}
                </button>
                <button onClick={() => toggleCompare(hoveredRoom)} className="modal-action-btn">
                  {compareList.some(c => c.id === hoveredRoom.id) ? '⚖️' : '📊'}
                </button>
              </div>
            </div>
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
      {showFavorites && (
        <div className="side-panel">
          <div className="side-panel-header">
            <h3>Favorites ({favorites.length})</h3>
            <button onClick={() => setShowFavorites(false)} className="close-btn">
              <X size={20} />
            </button>
          </div>
          <div className="side-panel-content">
            {favorites.length === 0 ? (
              <p>No favorites yet</p>
            ) : (
              favorites.map(room => (
                <div key={room.id} className="room-card" onMouseEnter={() => setHoveredRoom(room)}>
                  <h4>{room.title}</h4>
                  <p>₹{room.price} | {room.distance} km</p>
                  <button onClick={() => toggleFavorite(room)} className="remove-btn">Remove</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {showCompare && (
        <div className="compare-panel">
          <div className="compare-header">
            <h3>Compare Rooms ({compareList.length})</h3>
            <button onClick={() => setShowCompare(false)} className="close-btn">
              <X size={20} />
            </button>
          </div>
          <div className="compare-content">
            {compareList.length === 0 ? (
              <p>No rooms selected for comparison</p>
            ) : (
              <div className="compare-grid">
                {compareList.map(room => (
                  <div key={room.id} className="compare-card">
                    <img src={room.images[0] || ''} alt={room.title} className="compare-image" />
                    <h4>{room.title}</h4>
                    <p><strong>Price:</strong> ₹{room.price}</p>
                    <p><strong>BHK:</strong> {room.bhk}</p>
                    <p><strong>Area:</strong> {room.area} sqft</p>
                    <p><strong>Distance:</strong> {room.distance} km</p>
                    <p><strong>Furnishing:</strong> {room.furnishing}</p>
                    <p><strong>Listed by:</strong> {room.listingType}</p>
                    <button onClick={() => toggleCompare(room)} className="remove-btn">Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {showAnalytics && (
        <div className="analytics-panel">
          <div className="analytics-header">
            <h3>Analytics</h3>
            <button onClick={() => setShowAnalytics(false)} className="close-btn">
              <X size={20} />
            </button>
          </div>
          <div className="analytics-content">
            {(() => {
              const analytics = getAnalytics();
              return (
                <>
                  <div className="analytics-section">
                    <h4>Overview</h4>
                    <p><strong>Total Rooms:</strong> {analytics.totalRooms}</p>
                    <p><strong>Average Price:</strong> ₹{analytics.avgPrice.toFixed(0)}</p>
                  </div>
                  <div className="analytics-section">
                    <h4>Price Distribution</h4>
                    {Object.entries(analytics.priceRanges).map(([range, count]) => (
                      <p key={range}><strong>{range}:</strong> {count} rooms</p>
                    ))}
                  </div>
                  <div className="analytics-section">
                    <h4>Average Price by BHK</h4>
                    {analytics.avgPriceByBHK.map(item => (
                      <p key={item.bhk}><strong>{item.bhk} BHK:</strong> ₹{item.avg.toFixed(0)}</p>
                    ))}
                  </div>
                  <div className="analytics-section">
                    <h4>Rooms by Furnishing</h4>
                    {Object.entries(analytics.countByFurnishing).map(([type, count]) => (
                      <p key={type}><strong>{type}:</strong> {count} rooms</p>
                    ))}
                  </div>
                  <div className="analytics-section">
                    <h4>Rooms by Listing Type</h4>
                    {Object.entries(analytics.countByListingType).map(([type, count]) => (
                      <p key={type}><strong>{type}:</strong> {count} rooms</p>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
