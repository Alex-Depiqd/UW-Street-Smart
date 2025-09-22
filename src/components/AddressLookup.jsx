import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, ChevronDown, ChevronUp } from 'lucide-react';
import { config } from '@/config';

// OpenStreetMap Nominatim geocoding service
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

export default function AddressLookup({ onAddressSelect, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const lookupsEnabled = config.addressLookupEnabled === true;

  // Real OpenStreetMap geocoding API call
  const searchAddresses = async (query) => {
    if (!lookupsEnabled) return; // disabled
    setIsLoading(true);
    
    if (!query.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    try {
      // Use Nominatim API for geocoding
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        addressdetails: '1',
        limit: '10',
        countrycodes: 'gb', // Focus on UK addresses
        viewbox: '-0.5,51.0,2.0,53.0', // Rough UK bounds
        bounded: '1'
      });

      const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'UW-Street-Smart-NL-Tracker/1.0'
        }
      });

      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }

      const data = await response.json();
      
      // Format the results
      const results = data.map(item => {
        const address = item.address;
        const parts = [];
        
        if (address.house_number) parts.push(address.house_number);
        if (address.house_name) parts.push(address.house_name);
        if (address.road) parts.push(address.road);
        if (address.city || address.town) parts.push(address.city || address.town);
        if (address.county) parts.push(address.county);
        if (address.postcode) parts.push(address.postcode);
        
        return parts.join(', ');
      });

      setSuggestions(results);
    } catch (error) {
      console.error('Geocoding error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!lookupsEnabled) return;
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        searchAddresses(searchTerm);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, lookupsEnabled]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedIndex(-1);
    setIsDropdownOpen(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleAddressSelect(suggestions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setSelectedIndex(-1);
    }
  };

  const handleAddressSelect = (address) => {
    onAddressSelect(address);
    setSearchTerm('');
    setSuggestions([]);
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
  };

  const handleManualEntry = () => {
    onAddressSelect('manual');
  };

  const clearInput = () => {
    setSearchTerm('');
    setSuggestions([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Find Address</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {lookupsEnabled ? 'Search for streets and addresses to add to your campaign' : 'Live search disabled. Use manual entry below.'}
          </p>
        </div>

        {/* Search Input */}
        {lookupsEnabled && (
          <div className="p-6">
            <div className="relative">
              <label className="text-xs opacity-70 mb-2 block">Find your address</label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="Type street name or postcode..."
                  className="w-full p-3 pr-12 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  {searchTerm && (
                    <button
                      onClick={clearInput}
                      className="p-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="p-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {isDropdownOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Suggestions Dropdown */}
            {isDropdownOpen && (suggestions.length > 0 || isLoading) && (
              <div
                ref={dropdownRef}
                className="mt-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto"
              >
                {isLoading ? (
                  <div className="p-4 text-center text-sm text-gray-600 dark:text-gray-400">
                    Searching addresses...
                  </div>
                ) : (
                  suggestions.map((address, index) => (
                    <button
                      key={index}
                      onClick={() => handleAddressSelect(address)}
                      className={`w-full p-3 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        index === selectedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
                      } ${index === 0 ? 'rounded-t-xl' : ''} ${
                        index === suggestions.length - 1 ? 'rounded-b-xl' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-900 dark:text-gray-100">{address}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Manual Entry Link */}
        <div className="p-6">
          <button
            onClick={handleManualEntry}
            className="text-primary-600 dark:text-primary-400 text-sm hover:underline"
          >
            Enter address manually
          </button>
        </div>

        {/* Footer */}
        {lookupsEnabled && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <p>Powered by OpenStreetMap Nominatim</p>
              <p className="mt-1">Real-time UK address search • Free and open data</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 