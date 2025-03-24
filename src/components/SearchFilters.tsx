import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Slider,
  Typography,
  Button,
  Autocomplete,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { SearchFilters as SearchFiltersType } from '../types';
import { searchSpecies } from '../services/ebirdApi';
import { geocodeLocation } from '../services/geocoding';
import { getAddressSuggestions, AddressSuggestion } from '../services/addressSuggestions';

interface SearchFiltersProps {
  onSearch: (filters: SearchFiltersType) => void;
  onUseCurrentLocation: () => void;
  isLoading: boolean;
}

const SearchFilters = ({ onSearch, onUseCurrentLocation, isLoading }: SearchFiltersProps) => {
  const [location, setLocation] = useState('');
  const [species, setSpecies] = useState('');
  const [radius, setRadius] = useState(10);
  const [speciesOptions, setSpeciesOptions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isLoadingSpecies, setIsLoadingSpecies] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<AddressSuggestion | null>(null);

  useEffect(() => {
    const fetchAddressSuggestions = async () => {
      if (location.length >= 2) {
        setIsLoadingAddresses(true);
        const suggestions = await getAddressSuggestions(location);
        setAddressSuggestions(suggestions);
        setIsLoadingAddresses(false);
      } else {
        setAddressSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(fetchAddressSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [location]);

  const handleSpeciesSearch = async (query: string) => {
    if (query.length >= 2) {
      setIsLoadingSpecies(true);
      setError(null);
      try {
        console.log('Searching for species:', query);
        const results = await searchSpecies(query);
        console.log('Species search results:', results);
        setSpeciesOptions(results);
      } catch (error) {
        console.error('Error searching species:', error);
        setError('Failed to search for species. Please try again.');
        setSpeciesOptions([]);
      } finally {
        setIsLoadingSpecies(false);
      }
    } else {
      setSpeciesOptions([]);
    }
  };

  const handleLocationSelect = async (suggestion: AddressSuggestion | null) => {
    if (suggestion) {
      setSelectedLocation(suggestion);
      setLocation(suggestion.display_name);
      try {
        onSearch({
          location: {
            lat: suggestion.lat,
            lng: suggestion.lon,
            name: suggestion.display_name,
          },
          radius,
          dateRange: {
            start: new Date().toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0],
          },
          species: species || undefined,
        });
      } catch (error) {
        console.error('Error searching location:', error);
        setError('Failed to search location. Please try again.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!location) {
      setError('Please enter a location');
      return;
    }

    try {
      if (selectedLocation) {
        // If we have a selected location, use its coordinates
        onSearch({
          location: {
            lat: selectedLocation.lat,
            lng: selectedLocation.lon,
            name: selectedLocation.display_name,
          },
          radius,
          dateRange: {
            start: new Date().toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0],
          },
          species: species || undefined,
        });
      } else {
        // Otherwise, geocode the entered location
        const geocodedLocation = await geocodeLocation(location);
        onSearch({
          location: geocodedLocation,
          radius,
          dateRange: {
            start: new Date().toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0],
          },
          species: species || undefined,
        });
      }
    } catch (error) {
      console.error('Error geocoding location:', error);
      setError('Location not found. Please try a different location.');
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6">Search Filters</Typography>
          
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          <Autocomplete
            freeSolo
            options={addressSuggestions}
            getOptionLabel={(option) => 
              typeof option === 'string' ? option : option.display_name
            }
            value={selectedLocation}
            onChange={(_, newValue) => handleLocationSelect(newValue as AddressSuggestion)}
            onInputChange={(_, newInputValue) => setLocation(newInputValue)}
            loading={isLoadingAddresses}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Location"
                placeholder="Enter city or location"
                required
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isLoadingAddresses ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                {typeof option === 'string' ? option : option.display_name}
              </li>
            )}
            fullWidth
          />

          <Button
            variant="outlined"
            onClick={onUseCurrentLocation}
            disabled={isLoading}
          >
            Use Current Location
          </Button>

          <Autocomplete
            options={speciesOptions}
            value={species}
            onChange={(_, newValue) => setSpecies(newValue || '')}
            onInputChange={(_, newInputValue) => handleSpeciesSearch(newInputValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Species (optional)"
                placeholder="Search for a bird species"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isLoadingSpecies ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                {option}
              </li>
            )}
            freeSolo
            fullWidth
            loading={isLoadingSpecies}
            loadingText="Searching species..."
            noOptionsText="No species found"
            openText="Open"
            closeText="Close"
          />

          <Box>
            <Typography gutterBottom>
              Search Radius: {radius} km
            </Typography>
            <Slider
              value={radius}
              onChange={(_, value) => setRadius(value as number)}
              min={1}
              max={50}
              step={1}
              valueLabelDisplay="auto"
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading || !location}
          >
            Search
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default SearchFilters; 