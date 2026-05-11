import { useEffect, useRef } from 'react';
import maplibregl, { Map, Marker, LngLatBoundsLike } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Location } from '@/lib/types';

interface MapLibreProps {
  center?: Location;
  markers?: { location: Location; color?: string; popup?: string }[];
  route?: [number, number][];
  className?: string;
  onMapClick?: (location: Location) => void;
}

const TILE_URL =
  import.meta.env.VITE_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

export const MapLibre = ({
  center = { lat: 13.0827, lng: 80.2707 },
  markers = [],
  route,
  className = '',
  onMapClick,
}: MapLibreProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: [TILE_URL],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap Contributors',
          },
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
          },
        ],
      },
      center: [center.lng, center.lat],
      zoom: 12,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    if (onMapClick) {
      map.current.on('click', (e) => {
        onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      });
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update markers
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    markers.forEach((markerData) => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = markerData.color || '#0EA5E9';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([markerData.location.lng, markerData.location.lat])
        .addTo(map.current!);

      if (markerData.popup) {
        marker.setPopup(new maplibregl.Popup().setHTML(markerData.popup));
      }

      markersRef.current.push(marker);
    });
  }, [markers]);

  // Update route
  useEffect(() => {
    if (!map.current || !route) return;

    const sourceId = 'route';

    if (map.current.getSource(sourceId)) {
      map.current.removeLayer('route-line');
      map.current.removeSource(sourceId);
    }

    map.current.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route,
        },
      },
    });

    map.current.addLayer({
      id: 'route-line',
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#0EA5E9',
        'line-width': 4,
      },
    });

    // Fit bounds to route
    const bounds = route.reduce(
      (bounds, coord) => bounds.extend(coord as [number, number]),
      new maplibregl.LngLatBounds(route[0] as [number, number], route[0] as [number, number])
    );

    map.current.fitBounds(bounds as LngLatBoundsLike, { padding: 50 });
  }, [route]);

  // Update center
  useEffect(() => {
    if (!map.current) return;
    map.current.flyTo({ center: [center.lng, center.lat], zoom: 14 });
  }, [center.lat, center.lng]);

  return (
    <div ref={mapContainer} className={`min-h-[60vh] w-full rounded-2xl ${className}`} />
  );
};
