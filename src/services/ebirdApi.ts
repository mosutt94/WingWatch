import axios from 'axios';
import { BirdSighting, SearchFilters } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://wingwatch-api.netlify.app/api/ebird';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getRecentSightings = async (filters: SearchFilters): Promise<BirdSighting[]> => {
  try {
    const { location, radius, dateRange, species } = filters;
    const endpoint = species
      ? `/data/obs/geo/recent/${encodeURIComponent(species)}`
      : '/data/obs/geo/recent';
    
    const params = {
      lat: location.lat,
      lng: location.lng,
      dist: radius,
      back: 7, // Default to 7 days if not specified
      maxResults: 100,
    };

    const response = await api.get(endpoint, { params });
    
    if (!Array.isArray(response.data)) {
      throw new Error('Invalid response format from eBird API');
    }

    // Create a Map to store unique sightings by checklist ID
    const uniqueSightings = new Map();

    response.data.forEach((sighting: any) => {
      const key = sighting.subId;
      if (!uniqueSightings.has(key)) {
        uniqueSightings.set(key, {
          checklistId: sighting.subId,
          observerName: sighting.userDisplayName || 'Anonymous',
          date: sighting.obsDt,
          location: {
            lat: sighting.lat,
            lng: sighting.lng,
            name: sighting.locName || 'Unknown Location',
          },
          species: sighting.comName,
          count: sighting.howMany || 1,
          checklistUrl: `https://ebird.org/checklist/${sighting.subId}`,
        });
      }
    });

    return Array.from(uniqueSightings.values());
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Invalid eBird API key. Please check your configuration.');
      }
      if (error.response?.status === 404) {
        throw new Error('No sightings found for the specified criteria.');
      }
    }
    console.error('Error fetching bird sightings:', error);
    throw error;
  }
};

export const searchSpecies = async (query: string): Promise<string[]> => {
  try {
    const response = await api.get('/ref/taxonomy/ebird', {
      params: {
        fmt: 'json',
        species: query,
      },
    });

    if (!Array.isArray(response.data)) {
      throw new Error('Invalid response format from eBird API');
    }

    // Create a Set to store unique species names
    const uniqueSpecies = new Set<string>();

    // Filter and format the species names
    response.data
      .filter((species: any) => species.comName)
      .forEach((species: any) => {
        const name = species.comName;
        if (name.toLowerCase().includes(query.toLowerCase())) {
          uniqueSpecies.add(name);
        }
      });

    // Convert Set to Array and limit results
    return Array.from(uniqueSpecies).slice(0, 10);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Invalid eBird API key. Please check your configuration.');
      }
      console.error('API Error:', error.response?.data);
    }
    console.error('Error searching species:', error);
    throw error;
  }
}; 