import axios from 'axios';

export interface AddressSuggestion {
  display_name: string;
  lat: number;
  lon: number;
}

export const getAddressSuggestions = async (query: string): Promise<AddressSuggestion[]> => {
  if (!query || query.length < 2) return [];

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: query,
        format: 'json',
        limit: 5,
        addressdetails: 1,
      },
      headers: {
        'User-Agent': 'WingWatch/1.0',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching address suggestions:', error);
    return [];
  }
}; 