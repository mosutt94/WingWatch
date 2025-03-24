# WingWatch

A responsive web application that helps bird watchers locate recent bird sightings in their chosen area or current location using the eBird API.

## Features

- Search for locations or use current location
- Filter by specific bird species
- Adjustable search radius
- Customizable date range for sightings
- Interactive map with sighting pins
- List view of all sightings
- Mobile-friendly responsive design

## Tech Stack

- React with TypeScript
- Vite
- Leaflet.js for mapping
- Material-UI for components
- eBird API for bird sighting data
- Netlify for deployment

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with your eBird API key:
   ```
   VITE_EBIRD_API_KEY=your_api_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

The application is configured for deployment on Netlify. Make sure to:

1. Set up your eBird API key in Netlify's environment variables
2. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

## API Key

You'll need an eBird API key to use this application. You can obtain one by:

1. Creating an eBird account at https://ebird.org
2. Going to your account settings
3. Requesting an API key

## License

MIT
