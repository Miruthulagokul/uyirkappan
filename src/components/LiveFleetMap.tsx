import { useEffect, useState } from 'react';
import { MapLibre } from '@/components/MapLibre';
import { Ambulance } from '@/lib/types';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';

interface LiveFleetMapProps {
  className?: string;
}

const statusColors: Record<string, string> = {
  ONLINE: '#22C55E',
  BUSY: '#F59E0B',
  OFFLINE: '#94A3B8',
};

export const LiveFleetMap = ({ className = '' }: LiveFleetMapProps) => {
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await api.getAllAmbulances();
      setAmbulances(data);
    };
    load();

    // Simulate live movement
    const interval = setInterval(() => {
      setAmbulances(prev =>
        prev.map(amb => ({
          ...amb,
          location: amb.status === 'ONLINE' ? {
            lat: amb.location.lat + (Math.random() - 0.5) * 0.002,
            lng: amb.location.lng + (Math.random() - 0.5) * 0.002,
          } : amb.location,
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const markers = ambulances.map(amb => ({
    location: amb.location,
    color: statusColors[amb.status] || '#94A3B8',
    popup: `${amb.registration} (${amb.type}) — ${amb.driver?.name || 'Unassigned'} — ${amb.status}`,
  }));

  return (
    <div className={className}>
      <div className="mb-2 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-green-500" />
          <span className="text-xs text-muted-foreground">Online ({ambulances.filter(a => a.status === 'ONLINE').length})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <span className="text-xs text-muted-foreground">Busy ({ambulances.filter(a => a.status === 'BUSY').length})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-slate-400" />
          <span className="text-xs text-muted-foreground">Offline ({ambulances.filter(a => a.status === 'OFFLINE').length})</span>
        </div>
      </div>
      <MapLibre
        center={{ lat: 13.0527, lng: 80.2511 }}
        markers={markers}
        className="h-[400px]"
      />
    </div>
  );
};
