import { Location } from './types';

const NOMINATIM_BASE = import.meta.env.VITE_NOMINATIM_BASE || 'https://nominatim.openstreetmap.org';

export interface GeocodeSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

let debounceTimer: ReturnType<typeof setTimeout>;

export const geocodeSearch = async (query: string): Promise<GeocodeSuggestion[]> => {
  if (!query || query.length < 3) return [];

  try {
    const response = await fetch(
      `${NOMINATIM_BASE}/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=in`,
      {
        headers: {
          'User-Agent': 'Uyirkappan/1.0',
        },
      }
    );

    if (!response.ok) {
      console.warn('Nominatim rate limit or error, using fallback');
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
};

export const reverseGeocode = async (location: Location): Promise<string> => {
  try {
    const response = await fetch(
      `${NOMINATIM_BASE}/reverse?lat=${location.lat}&lon=${location.lng}&format=json`,
      {
        headers: {
          'User-Agent': 'Uyirkappan/1.0',
        },
      }
    );

    if (!response.ok) return `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`;

    const data = await response.json();
    return data.display_name || `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`;
  }
};

export const debouncedGeocodeSearch = (
  query: string,
  callback: (results: GeocodeSuggestion[]) => void,
  delay = 1000
) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    const results = await geocodeSearch(query);
    callback(results);
  }, delay);
};
