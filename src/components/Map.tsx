import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BirdSighting } from '../types';

// Fix for default marker icons in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  sightings: BirdSighting[];
  center: [number, number];
  zoom: number;
  onBoundsChange?: (bounds: L.LatLngBounds) => void;
}

const Map = ({ sightings, center, zoom, onBoundsChange }: MapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map
    mapRef.current = L.map(mapContainerRef.current).setView(center, zoom);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapRef.current);

    // Add bounds change handler
    if (onBoundsChange) {
      mapRef.current.on('moveend', () => {
        const bounds = mapRef.current?.getBounds();
        if (bounds) {
          onBoundsChange(bounds);
        }
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [center, zoom, onBoundsChange]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for each sighting
    sightings.forEach((sighting) => {
      const marker = L.marker([sighting.location.lat, sighting.location.lng])
        .bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0;">${sighting.species}</h3>
            <p style="margin: 4px 0;">Count: ${sighting.count}</p>
            <p style="margin: 4px 0;">Observer: ${sighting.observerName}</p>
            <p style="margin: 4px 0;">Date: ${new Date(sighting.date).toLocaleDateString()}</p>
            <p style="margin: 4px 0;">Location: ${sighting.location.name}</p>
            <a href="${sighting.checklistUrl}" target="_blank" rel="noopener noreferrer" 
               style="display: inline-block; margin-top: 8px; color: #2e7d32; text-decoration: none;">
              View Checklist →
            </a>
          </div>
        `)
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });

    // If we have sightings, fit the map to show all markers
    if (sightings.length > 0) {
      const bounds = L.latLngBounds(sightings.map(s => [s.location.lat, s.location.lng]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [sightings]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height: '100%', width: '100%', minHeight: '400px' }}
    />
  );
};

export default Map; 