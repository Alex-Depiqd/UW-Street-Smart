import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, ZoomIn, ZoomOut, Navigation, Layers, X } from 'lucide-react';

// Mock map data - in a real implementation, this would use a proper mapping library
const mockMapData = {
  center: { lat: 52.2053, lng: 0.1218 }, // Bury St. Edmunds area
  zoom: 13,
  streets: [
    {
      id: 's1',
      name: 'Cross Street',
      postcode: 'IP30 9DR',
      properties: [
        { id: 'p1', number: '96', lat: 52.2053, lng: 0.1218, status: 'dropped' },
        { id: 'p2', name: 'Birch Tree House', lat: 52.2055, lng: 0.1220, status: 'spoke' },
        { id: 'p3', name: 'Buckingham House', lat: 52.2051, lng: 0.1216, status: 'interested' },
        { id: 'p4', name: 'Cooks Cottage', lat: 52.2057, lng: 0.1222, status: 'none' },
        { id: 'p5', name: 'Fayreways', lat: 52.2049, lng: 0.1214, status: 'none' },
        { id: 'p6', name: 'Floriana', lat: 52.2047, lng: 0.1212, status: 'none' },
        { id: 'p7', name: 'Holly Lodge', lat: 52.2045, lng: 0.1210, status: 'none' },
        { id: 'p8', name: 'The Cherries', lat: 52.2043, lng: 0.1208, status: 'none' },
        { id: 'p9', name: 'Stowe House', lat: 52.2041, lng: 0.1206, status: 'none' },
        { id: 'p10', name: 'Rosebank', lat: 52.2039, lng: 0.1204, status: 'none' }
      ]
    }
  ]
};

export default function MapView({ onPropertySelect, onClose }) {
  const [mapData, setMapData] = useState(mockMapData);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showLegend, setShowLegend] = useState(true);
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
    setMapData(prev => ({ ...prev, zoom: Math.min(prev.zoom + 1, 18) }));
  };

  const handleZoomOut = () => {
    setMapData(prev => ({ ...prev, zoom: Math.max(prev.zoom - 1, 10) }));
  };

  const handleCenterMap = () => {
    setMapData(prev => ({ ...prev, center: mockMapData.center }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Map View</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Visual overview of campaign properties
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

        {/* Map Container */}
        <div className="relative flex-1 bg-gray-100 dark:bg-gray-800">
          {/* Mock Map Background */}
          <div 
            ref={mapRef}
            className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/20 dark:to-green-900/20 relative overflow-hidden"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
                linear-gradient(45deg, transparent 40%, rgba(156, 163, 175, 0.1) 50%, transparent 60%)
              `
            }}
          >
            {/* Street Lines */}
            <div className="absolute inset-0">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Main street line */}
                <line 
                  x1="20" y1="50" x2="80" y2="50" 
                  stroke="rgba(156, 163, 175, 0.3)" 
                  strokeWidth="2"
                />
                {/* Cross streets */}
                <line 
                  x1="40" y1="30" x2="40" y2="70" 
                  stroke="rgba(156, 163, 175, 0.2)" 
                  strokeWidth="1"
                />
                <line 
                  x1="60" y1="30" x2="60" y2="70" 
                  stroke="rgba(156, 163, 175, 0.2)" 
                  strokeWidth="1"
                />
              </svg>
            </div>

            {/* Property Markers */}
            {mapData.streets[0].properties.map((property, index) => (
              <div
                key={property.id}
                className={`absolute w-4 h-4 rounded-full border-2 border-white shadow-lg cursor-pointer transition-all hover:scale-125 ${getPropertyStatusColor(property.status)}`}
                style={{
                  left: `${20 + (index * 6)}%`,
                  top: `${45 + (Math.random() - 0.5) * 10}%`
                }}
                onClick={() => handlePropertyClick(property)}
                title={`${property.number || property.name} - ${getPropertyStatusLabel(property.status)}`}
              />
            ))}

            {/* Street Labels */}
            <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-gray-900/90 rounded-lg p-2 shadow-lg">
              <div className="text-sm font-medium">Cross Street</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">IP30 9DR</div>
            </div>
          </div>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button
              onClick={handleZoomIn}
              className="p-2 rounded-xl bg-white/90 dark:bg-gray-900/90 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 rounded-xl bg-white/90 dark:bg-gray-900/90 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleCenterMap}
              className="p-2 rounded-xl bg-white/90 dark:bg-gray-900/90 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
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
            <div className="absolute top-4 left-4 bg-white/95 dark:bg-gray-900/95 rounded-lg p-3 shadow-lg max-w-xs">
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
                Cross Street, IP30 9DR
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
              Zoom: {mapData.zoom} • {mapData.streets[0].properties.length} properties
            </div>
            <div>
              Powered by OpenStreetMap
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 