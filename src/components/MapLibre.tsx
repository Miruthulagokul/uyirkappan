import { useEffect, useRef, useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import { Location } from '@/lib/types';

interface MapLibreProps {
  center?: Location;
  markers?: { location: Location; color?: string; popup?: string }[];
  route?: [number, number][];
  className?: string;
  onMapClick?: (location: Location) => void;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

export const MapLibre = ({
  center = { lat: 13.0827, lng: 80.2707 },
  markers = [],
  route,
  className = '',
  onMapClick,
}: MapLibreProps) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [activePopup, setActivePopup] = useState<number | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const handleClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (onMapClick && e.latLng) {
        onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      }
    },
    [onMapClick]
  );

  // Fit bounds when route changes
  useEffect(() => {
    if (!mapRef.current || !route || route.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    route.forEach(([lng, lat]) => {
      bounds.extend({ lat, lng });
    });
    mapRef.current.fitBounds(bounds, 50);
  }, [route]);

  // Fly to center when it changes
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.panTo({ lat: center.lat, lng: center.lng });
  }, [center.lat, center.lng]);

  if (loadError) {
    return (
      <div className={`flex items-center justify-center rounded-2xl bg-muted ${className}`}>
        <p className="text-sm text-destructive">Failed to load Google Maps</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center rounded-2xl bg-muted ${className}`}>
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading map…</p>
        </div>
      </div>
    );
  }

  // Convert route from [lng, lat] (GeoJSON) to Google Maps LatLng
  const routePath = route?.map(([lng, lat]) => ({ lat, lng }));

  return (
    <div className={`min-h-[60vh] w-full overflow-hidden rounded-2xl ${className}`}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={{ lat: center.lat, lng: center.lng }}
        zoom={13}
        options={defaultOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleClick}
      >
        {/* Markers */}
        {markers.map((m, i) => (
          <Marker
            key={`marker-${i}-${m.location.lat}-${m.location.lng}`}
            position={{ lat: m.location.lat, lng: m.location.lng }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: m.color || '#0EA5E9',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            }}
            onClick={() => m.popup && setActivePopup(i)}
          >
            {activePopup === i && m.popup && (
              <InfoWindow onCloseClick={() => setActivePopup(null)}>
                <div className="text-sm font-medium text-gray-900">{m.popup}</div>
              </InfoWindow>
            )}
          </Marker>
        ))}

        {/* Route Polyline */}
        {routePath && routePath.length > 0 && (
          <Polyline
            path={routePath}
            options={{
              strokeColor: '#0EA5E9',
              strokeOpacity: 0.9,
              strokeWeight: 4,
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
};
