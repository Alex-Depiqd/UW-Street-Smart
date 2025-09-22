// Configuration file for API keys and settings
export const config = {
  // Google Places API Configuration
  googlePlaces: {
    apiKey: process.env.REACT_APP_GOOGLE_PLACES_API_KEY || 'YOUR_GOOGLE_API_KEY',
    baseUrl: 'https://maps.googleapis.com/maps/api/place',
    searchTypes: ['establishment', 'geocode'],
    countryCode: 'gb'
  },
  
  // OpenStreetMap fallback (if needed)
  openStreetMap: {
    baseUrl: 'https://nominatim.openstreetmap.org',
    userAgent: 'UW-Street-Smart-NL-Tracker/1.0'
  },

  // Feature flags
  addressLookupEnabled: false
};

// Usage instructions:
// 1. Get a Google Places API key from Google Cloud Console
// 2. Enable Places API in your Google Cloud project
// 3. Set billing up (required for Places API)
// 4. Add your API key to environment variables:
//    REACT_APP_GOOGLE_PLACES_API_KEY=your_api_key_here
// 5. For production, restrict the API key to your domain
