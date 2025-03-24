import { useState, useEffect } from 'react';
import { Container, Grid, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Map from './components/Map';
import SearchFilters from './components/SearchFilters';
import SightingsList from './components/SightingsList';
import { BirdSighting, SearchFilters as SearchFiltersType } from './types';
import { getRecentSightings } from './services/ebirdApi';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32',
    },
    secondary: {
      main: '#1976d2',
    },
  },
});

function App() {
  const [sightings, setSightings] = useState<BirdSighting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [center, setCenter] = useState<[number, number]>([40.7128, -74.0060]); // Default to NYC
  const [zoom, setZoom] = useState(12);

  const handleSearch = async (filters: SearchFiltersType) => {
    setIsLoading(true);
    try {
      // Update the map center first
      setCenter([filters.location.lat, filters.location.lng]);
      
      // Then fetch the sightings
      const results = await getRecentSightings(filters);
      setSightings(results);
    } catch (error) {
      console.error('Error fetching bird sightings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Update center immediately
          setCenter([latitude, longitude]);
          
          // Then search for sightings
          handleSearch({
            location: {
              lat: latitude,
              lng: longitude,
              name: 'Current Location',
            },
            radius: 10,
            dateRange: {
              start: new Date().toISOString().split('T')[0],
              end: new Date().toISOString().split('T')[0],
            },
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoading(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <SearchFilters
              onSearch={handleSearch}
              onUseCurrentLocation={handleUseCurrentLocation}
              isLoading={isLoading}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Map
              sightings={sightings}
              center={center}
              zoom={zoom}
              onBoundsChange={(bounds) => {
                // You could implement bounds-based search here
                console.log('Map bounds changed:', bounds);
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <SightingsList sightings={sightings} />
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;
