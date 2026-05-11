import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building2, Clock, IndianRupee, AlertTriangle } from 'lucide-react';
import { Location } from '@/lib/types';

interface DriverRequestCardProps {
  request: {
    id: string;
    patientName: string;
    pickup: Location;
    hospital: string;
    distance: number;
    fare: number;
    eta: number;
    emergencyType: string;
  };
  countdown: number;
  onAccept: () => void;
  onReject: () => void;
}

export const DriverRequestCard = ({ request, countdown, onAccept, onReject }: DriverRequestCardProps) => {
  const urgencyColor = countdown <= 10 ? 'text-destructive' : countdown <= 20 ? 'text-warning' : 'text-primary';

  return (
    <Card className="mb-4 border-destructive bg-destructive/5">
      <CardContent className="pt-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="font-bold text-destructive">New Emergency Request</span>
          </div>
          <div className={`flex items-center gap-1 font-mono text-lg font-bold ${urgencyColor}`}>
            <Clock className="h-4 w-4" />
            {countdown}s
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4 h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-destructive transition-all duration-1000"
            style={{ width: `${(countdown / 30) * 100}%` }}
          />
        </div>

        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-destructive/10 text-destructive">
              {request.emergencyType}
            </Badge>
            <span className="font-semibold">{request.patientName}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{request.pickup.address || `${request.pickup.lat.toFixed(4)}, ${request.pickup.lng.toFixed(4)}`}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4 shrink-0" />
            <span>{request.hospital}</span>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-3 rounded-lg bg-muted p-3">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Distance</div>
            <div className="font-mono font-semibold">{(request.distance / 1000).toFixed(1)} km</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">ETA</div>
            <div className="font-mono font-semibold text-primary">{Math.ceil(request.eta / 60)} min</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Fare</div>
            <div className="font-mono font-semibold text-green-600">₹{request.fare}</div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onReject}
            className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
          >
            Reject
          </Button>
          <Button onClick={onAccept} className="flex-1 bg-green-600 hover:bg-green-700">
            Accept
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
