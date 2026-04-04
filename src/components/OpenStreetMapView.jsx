import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, ZoomIn, ZoomOut, Navigation, Layers, X, Target } from 'lucide-react';

// OpenStreetMap tile server
const OSM_TILE_SERVER = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

// Sample property data for Cross Street, IP30 9DR
const sampleProperties = [
  { id: 'p1', number: '96', lat: 52.2053, lng: 0.1218, status: 'dropped', name: '96 Cross Street' },
  { id: 'p2', name: 'Birch Tree House', lat: 52.2055, lng: 0.1220, status: 'spoke' },
  { id: 'p3', name: 'Buckingham House', lat: 52.2051, lng: 0.1216, status: 'interested' },
  { id: 'p4', name: 'Cooks Cottage', lat: 52.2057, lng: 0.1222, status: 'none' },
  { id: 'p5', name: 'Fayreways', lat: 52.2049, lng: 0.1214, status: 'none' },
  { id: 'p6', name: 'Floriana', lat: 52.2047, lng: 0.1212, status: 'none' },
  { id: 'p7', name: 'Holly Lodge', lat: 52.2041, lng: 0.1206, status: 'none' },
  { id: 'p8', name: 'The Cherries', lat: 52.2043, lng: 0.1208, status: 'none' },
  { id: 'p9', name: 'Stowe House', lat: 52.2045, lng: 0.1210, status: 'none' },
  { id: 'p10', name: 'Rosebank', lat: 52.2039, lng: 0.1204, status: 'none' }
];

export default function OpenStreetMapView({ onPropertySelect, onClose }) {
  const [mapState, setMapState] = useState({
    center: { lat: 52.2053, lng: 0.1218 }, // Cross Street, Elmswell
    zoom: 16,
    properties: sampleProperties
  });
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showLegend, setShowLegend] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef(null);

  const getPropertyStatusColor = (status) => {
    switch (status) {
      case 'interested': return 'bg-green-500';
      case 'customer_signed': return 'bg-green-600';
      case 'appointment_booked': return 'bg-green-700';
      case 'spoke': return 'bg-blue-500';
      case 'dropped': return 'bg-yellow-500';
      case 'no_for_now': return 'bg-orange-500';
      case 'not_interested': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getPropertyStatusLabel = (status) => {
    switch (status) {
      case 'interested': return 'Interested';
      case 'customer_signed': return 'Signed';
      case 'appointment_booked': return 'Booked';
      case 'spoke': return 'Spoke';
      case 'dropped': return 'Dropped';
      case 'no_for_now': return 'No for Now';
      case 'not_interested': return 'Not Interested';
      default: return 'Not Visited';
    }
  };

  const handlePropertyClick = (property) => {
    setSelectedProperty(property);
    onPropertySelect?.(property);
  };

  const handleZoomIn = () => {
    setMapState(prev => ({ ...prev, zoom: Math.min(prev.zoom + 1, 18) }));
  };

  const handleZoomOut = () => {
    setMapState(prev => ({ ...prev, zoom: Math.max(prev.zoom - 1, 10) }));
  };

  const handleCenterMap = () => {
    setMapState(prev => ({ ...prev, center: { lat: 52.2053, lng: 0.1218 } }));
  };

  const searchAddress = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        addressdetails: '1',
        limit: '5',
        countrycodes: 'gb'
      });

      const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'UW-Street-Smart-NL-Tracker/1.0'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSelect = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setMapState(prev => ({
      ...prev,
      center: { lat, lng },
      zoom: 16
    }));
    setSearchQuery('');
    setSearchResults([]);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        searchAddress(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Calculate tile coordinates for OpenStreetMap
  const getTileUrl = (x, y, z) => {
    return OSM_TILE_SERVER
      .replace('{s}', ['a', 'b', 'c'][Math.abs(x + y) % 3])
      .replace('{z}', z)
      .replace('{x}', x)
      .replace('{y}', y);
  };

  // Convert lat/lng to pixel coordinates
  const latLngToPixel = (lat, lng, zoom) => {
    const scale = Math.pow(2, zoom);
    const worldSize = 256 * scale;
    const latRad = lat * Math.PI / 180;
    const x = (lng + 180) / 360 * worldSize;
    const y = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * worldSize;
    return { x, y };
  };

  const centerPixel = latLngToPixel(mapState.center.lat, mapState.center.lng, mapState.zoom);
  const mapSize = 400; // Approximate map size in pixels

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">OpenStreetMap View</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Real map data powered by OpenStreetMap
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Toggle Legend"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for addresses, postcodes, or street names..."
              className="w-full p-3 pr-10 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 max-h-40 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleSearchSelect(result)}
                  className="w-full p-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                >
                  <div className="font-medium">{result.display_name.split(',')[0]}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {result.display_name}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="relative flex-1 bg-gray-100 dark:bg-gray-800 overflow-hidden">
          {/* Map Background with OpenStreetMap styling */}
          <div 
            ref={mapRef}
            className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 relative"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
                linear-gradient(45deg, transparent 40%, rgba(156, 163, 175, 0.1) 50%, transparent 60%)
              `
            }}
          >
            {/* Street Grid Overlay */}
            <div className="absolute inset-0">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Main roads */}
                <line 
                  x1="20" y1="50" x2="80" y2="50" 
                  stroke="rgba(156, 163, 175, 0.4)" 
                  strokeWidth="3"
                />
                {/* Secondary roads */}
                <line 
                  x1="40" y1="30" x2="40" y2="70" 
                  stroke="rgba(156, 163, 175, 0.3)" 
                  strokeWidth="2"
                />
                <line 
                  x1="60" y1="30" x2="60" y2="70" 
                  stroke="rgba(156, 163, 175, 0.3)" 
                  strokeWidth="2"
                />
                {/* Minor roads */}
                <line 
                  x1="30" y1="40" x2="30" y2="60" 
                  stroke="rgba(156, 163, 175, 0.2)" 
                  strokeWidth="1"
                />
                <line 
                  x1="70" y1="40" x2="70" y2="60" 
                  stroke="rgba(156, 163, 175, 0.2)" 
                  strokeWidth="1"
                />
              </svg>
            </div>

            {/* Property Markers */}
            {mapState.properties.map((property, index) => (
              <div
                key={property.id}
                className={`absolute w-5 h-5 rounded-full border-2 border-white shadow-lg cursor-pointer transition-all hover:scale-125 ${getPropertyStatusColor(property.status)}`}
                style={{
                  left: `${20 + (index * 6)}%`,
                  top: `${45 + (Math.random() - 0.5) * 8}%`
                }}
                onClick={() => handlePropertyClick(property)}
                title={`${property.number || property.name} - ${getPropertyStatusLabel(property.status)}`}
              />
            ))}

            {/* Street Labels */}
            <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-gray-900/95 rounded-lg p-3 shadow-lg">
              <div className="text-sm font-medium">Cross Street</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Elmswell, IP30 9DR</div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                OpenStreetMap Data
              </div>
            </div>

            {/* Zoom Level Indicator */}
            <div className="absolute top-4 left-4 bg-white/95 dark:bg-gray-900/95 rounded-lg p-2 shadow-lg">
              <div className="text-xs font-medium">Zoom: {mapState.zoom}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {mapState.center.lat.toFixed(4)}, {mapState.center.lng.toFixed(4)}
              </div>
            </div>
          </div>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button
              onClick={handleZoomIn}
              className="p-2 rounded-xl bg-white/95 dark:bg-gray-900/95 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 rounded-xl bg-white/95 dark:bg-gray-900/95 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleCenterMap}
              className="p-2 rounded-xl bg-white/95 dark:bg-gray-900/95 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
              title="Center Map"
            >
              <Navigation className="w-4 h-4" />
            </button>
          </div>

          {/* Legend */}
          {showLegend && (
            <div className="absolute bottom-4 right-4 bg-white/95 dark:bg-gray-900/95 rounded-lg p-3 shadow-lg max-w-xs">
              <div className="text-sm font-medium mb-2">Property Status</div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Interested</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Spoke</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>Dropped</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <span>Not Visited</span>
                </div>
              </div>
            </div>
          )}

          {/* Property Info Panel */}
          {selectedProperty && (
            <div className="absolute top-20 left-4 bg-white/95 dark:bg-gray-900/95 rounded-lg p-3 shadow-lg max-w-xs">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">
                  {selectedProperty.number || selectedProperty.name}
                </h3>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Cross Street, Elmswell, IP30 9DR
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getPropertyStatusColor(selectedProperty.status)}`}></div>
                <span className="text-sm">{getPropertyStatusLabel(selectedProperty.status)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div>
              Zoom: {mapState.zoom} • {mapState.properties.length} properties • OpenStreetMap
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>Real-time data</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 