# UW Street Smart - NL Activity Tracker

A Progressive Web App (PWA) designed to help UW Partners track and manage their Neighbourhood Letters campaigns efficiently. Built with React, Vite, and Tailwind CSS.

## Features

- **Offline-First PWA**: Works without internet connection, syncs when online
- **Campaign Management**: Create and track multiple neighbourhood campaigns
- **Street-Level Tracking**: Monitor progress at street and property levels
- **Quick Scripts**: Access talking points and objection handlers
- **Activity Logging**: Record drops, knocks, conversations, and follow-ups
- **Reporting**: Generate CSV exports and activity reports
- **Dark Mode**: Optimized for evening door-to-door work

## Prerequisites

Before running this project, you need to install:

1. **Node.js** (version 16 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Or install via Homebrew: `brew install node`

2. **npm** (comes with Node.js)

## Installation

1. **Clone or download the project**

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### Project Structure

```
uw-street-smart-nl-tracker/
├── public/                 # Static assets
│   ├── icons/             # PWA icons
│   ├── manifest.json      # PWA manifest
│   └── sw.js             # Service worker
├── src/
│   ├── components/        # React components
│   ├── data/             # Data models and utilities
│   ├── hooks/            # Custom React hooks
│   ├── styles/           # CSS and styling
│   ├── utils/            # Utility functions
│   ├── App.jsx           # Main app component
│   └── main.jsx          # App entry point
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
└── vite.config.js        # Vite configuration
```

## PWA Features

### Offline Support
- Service worker caches essential resources
- Works without internet connection
- Syncs data when connection is restored

### Installable
- Can be installed on mobile devices
- App-like experience with full-screen mode
- Home screen shortcuts for quick access

### Performance
- Optimized for mobile devices
- Fast loading with Vite
- Efficient caching strategies

## Data Model

### Campaign
- `id`: Unique identifier
- `name`: Campaign name (e.g., "Elmswell NL – Aug 2025")
- `area`: Postcode area (e.g., "IP30")
- `status`: draft/active/archived
- `links`: URLs for connector, quote, booking, FAQ
- `streets`: Array of street objects

### Street
- `id`: Unique identifier
- `name`: Street name
- `postcode`: Full postcode
- `status`: not_started/in_progress/completed
- `properties`: Array of property objects

### Property
- `id`: Unique identifier
- `label`: Property number/name
- `dropped`: Boolean - letter dropped
- `knocked`: Boolean - door knocked
- `spoke`: Boolean - conversation had
- `result`: none/no_answer/not_interested/maybe/interested
- `followUpAt`: DateTime for follow-up reminder

## Usage

### Creating a Campaign
1. Navigate to "Campaigns" view
2. Click "New Campaign"
3. Enter campaign details
4. Add streets and properties

### Tracking Activity
1. Select a campaign
2. Navigate to "Streets" view
3. Click on a property to open property card
4. Use action buttons to log activity:
   - **Dropped**: Mark letter as delivered
   - **Knocked**: Record door knock attempt
   - **Spoke**: Log conversation and outcome

### Using Scripts
1. Open "Scripts" drawer while on a property
2. Browse by category: Openers, Objections, Closers, SMS/WhatsApp
3. Copy and use scripts during conversations

### Quick Links
1. Open "Links" drawer
2. Access campaign-specific URLs:
   - Connector sign-up
   - Quote/eligibility form
   - Booking page
   - FAQs

## Privacy & GDPR

- **No Personal Data by Default**: Notes are property-level only
- **Consent Required**: Personal data collection requires explicit consent
- **Local Storage**: Data stored locally on device
- **Data Minimization**: Only collect necessary information
- **Retention**: Auto-purge inactive data

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari (iOS 11.3+)
- Mobile browsers with PWA support

## Troubleshooting

### App Not Loading
1. Check if Node.js is installed: `node --version`
2. Install dependencies: `npm install`
3. Clear browser cache and reload

### PWA Not Installing
1. Ensure HTTPS (required for PWA)
2. Check browser console for service worker errors
3. Verify manifest.json is accessible

### Offline Not Working
1. Check service worker registration in browser dev tools
2. Verify cache is populated
3. Test with network disconnected

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary to UW Partners. All rights reserved.

## Support

For technical support or feature requests, contact the development team.

---

**Built for UW Partners making a difference in their communities.** 