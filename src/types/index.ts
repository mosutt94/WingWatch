export interface BirdSighting {
  checklistId: string;
  observerName: string;
  date: string;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  species: string;
  count: number;
  checklistUrl: string;
}

export interface SearchFilters {
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  radius: number;
  dateRange: {
    start: string;
    end: string;
  };
  species?: string;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
} 