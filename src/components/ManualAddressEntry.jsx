import React, { useState } from 'react';
import { X, MapPin, Save } from 'lucide-react';

export default function ManualAddressEntry({ onAddressSave, onClose }) {
  const [address, setAddress] = useState({
    houseName: '',
    houseNumber: '',
    street: '',
    town: '',
    city: '',
    postcode: ''
  });

  const handleInputChange = (field, value) => {
    setAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Format the address
    const parts = [];
    if (address.houseNumber) parts.push(address.houseNumber);
    if (address.houseName) parts.push(address.houseName);
    if (address.street) parts.push(address.street);
    if (address.town) parts.push(address.town);
    if (address.city) parts.push(address.city);
    if (address.postcode) parts.push(address.postcode);
    
    const formattedAddress = parts.join(', ');
    onAddressSave(formattedAddress);
  };

  const isFormValid = address.street && address.postcode;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Enter Address Manually</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Fill in the address details below
          </p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs opacity-70 mb-2 block">House Number</label>
              <input
                type="text"
                value={address.houseNumber}
                onChange={(e) => handleInputChange('houseNumber', e.target.value)}
                placeholder="e.g., 96"
                className="w-full p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs opacity-70 mb-2 block">House Name (optional)</label>
              <input
                type="text"
                value={address.houseName}
                onChange={(e) => handleInputChange('houseName', e.target.value)}
                placeholder="e.g., Rosebank"
                className="w-full p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs opacity-70 mb-2 block">Street Name *</label>
            <input
              type="text"
              value={address.street}
              onChange={(e) => handleInputChange('street', e.target.value)}
              placeholder="e.g., Cross Street"
              className="w-full p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs opacity-70 mb-2 block">Town</label>
              <input
                type="text"
                value={address.town}
                onChange={(e) => handleInputChange('town', e.target.value)}
                placeholder="e.g., Elmswell"
                className="w-full p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs opacity-70 mb-2 block">City</label>
              <input
                type="text"
                value={address.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="e.g., Bury St. Edmunds"
                className="w-full p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs opacity-70 mb-2 block">Postcode *</label>
            <input
              type="text"
              value={address.postcode}
              onChange={(e) => handleInputChange('postcode', e.target.value.toUpperCase())}
              placeholder="e.g., IP30 9DR"
              className="w-full p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-colors"
            />
          </div>

          {/* Preview */}
          {isFormValid && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-xs opacity-70 mb-1">Preview:</div>
              <div className="text-sm font-medium">
                {[
                  address.houseNumber,
                  address.houseName,
                  address.street,
                  address.town,
                  address.city,
                  address.postcode
                ].filter(Boolean).join(', ')}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isFormValid}
              className="flex-1 px-4 py-2 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Address
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 