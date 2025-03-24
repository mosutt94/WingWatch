import axios from 'axios';

interface GeocodingResult {
  lat: number;
  lng: number;
  name: string;
}

export const geocodeLocation = async (location: string): Promise<GeocodingResult> => {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: location,
        format: 'json',
        limit: 1,
      },
      headers: {
        'User-Agent': 'WingWatch/1.0',
      },
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        name: result.display_name,
      };
    }

    throw new Error('Location not found');
  } catch (error) {
    console.error('Error geocoding location:', error);
    throw error;
  }
}; 