import { Location } from './types';

const OSRM_BASE = import.meta.env.VITE_OSRM_BASE || 'https://router.project-osrm.org';

export interface Route {
  distance: number; // meters
  duration: number; // seconds
  geometry: [number, number][];
}

const haversineDistance = (loc1: Location, loc2: Location): number => {
  const R = 6371000; // Earth radius in meters
  const φ1 = (loc1.lat * Math.PI) / 180;
  const φ2 = (loc2.lat * Math.PI) / 180;
  const Δφ = ((loc2.lat - loc1.lat) * Math.PI) / 180;
  const Δλ = ((loc2.lng - loc1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const getRoute = async (from: Location, to: Location): Promise<Route | null> => {
  try {
    const response = await fetch(
      `${OSRM_BASE}/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`
    );

    if (!response.ok) {
      console.warn('OSRM rate limit, using fallback calculation');
      const distance = haversineDistance(from, to);
      const duration = (distance / 30000) * 3600; // 30 km/h average
      return {
        distance,
        duration,
        geometry: [
          [from.lng, from.lat],
          [to.lng, to.lat],
        ],
      };
    }

    const data = await response.json();
    const route = data.routes[0];

    return {
      distance: route.distance,
      duration: route.duration,
      geometry: route.geometry.coordinates,
    };
  } catch (error) {
    console.error('Routing error:', error);
    const distance = haversineDistance(from, to);
    const duration = (distance / 30000) * 3600;
    return {
      distance,
      duration,
      geometry: [
        [from.lng, from.lat],
        [to.lng, to.lat],
      ],
    };
  }
};

export const calculateFare = (distance: number, ambulanceType: string): number => {
  const basefare = ambulanceType === 'BLS' ? 500 : ambulanceType === 'ALS' ? 800 : 1200;
  const perKm = ambulanceType === 'BLS' ? 15 : ambulanceType === 'ALS' ? 20 : 25;
  return basefare + (distance / 1000) * perKm;
};

export const formatETA = (seconds: number): string => {
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

export const formatDistance = (meters: number): string => {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};
