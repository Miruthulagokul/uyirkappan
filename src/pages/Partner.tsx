import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TopNav } from '@/components/TopNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapLibre } from '@/components/MapLibre';
import { EtaPill } from '@/components/EtaPill';
import { DriverRequestCard } from '@/components/DriverRequestCard';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  TripHistory, DriverEarnings, Booking, Location, BookingStatus,
} from '@/lib/types';
import {
  Power, MapPin, Navigation, IndianRupee, Star, Clock,
  CheckCircle2, TrendingUp, Truck, Phone,
} from 'lucide-react';

const Partner = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [isOnline, setIsOnline] = useState(false);
  const [driverLocation, setDriverLocation] = useState<Location>({ lat: 13.0527, lng: 80.2511 });
  const [activeTrip, setActiveTrip] = useState<Booking | null>(null);
  const [incomingRequest, setIncomingRequest] = useState<{
    id: string;
    patientName: string;
    pickup: Location;
    hospital: string;
    distance: number;
    fare: number;
    eta: number;
    emergencyType: string;
  } | null>(null);
  const [earnings, setEarnings] = useState<DriverEarnings | null>(null);
  const [tripHistory, setTripHistory] = useState<TripHistory[]>([]);
  const [requestCountdown, setRequestCountdown] = useState(30);

  // Load earnings and trip history
  useEffect(() => {
    const loadData = async () => {
      const [earningsData, historyData] = await Promise.all([
        api.getDriverEarnings('d1'),
        api.getDriverTripHistory('d1'),
      ]);
      setEarnings(earningsData);
      setTripHistory(historyData);
    };
    loadData();
  }, []);

  // Simulate incoming requests when online
  useEffect(() => {
    if (!isOnline || activeTrip) return;

    const timeout = setTimeout(() => {
      setIncomingRequest({
        id: `REQ${Date.now()}`,
        patientName: 'Anitha S.',
        pickup: { lat: 13.0600, lng: 80.2550, address: '45 Anna Nagar, Chennai' },
        hospital: 'Apollo Hospital',
        distance: 3200,
        fare: 748,
        eta: 384,
        emergencyType: 'CARDIAC',
      });
      setRequestCountdown(30);
    }, 5000 + Math.random() * 10000);

    return () => clearTimeout(timeout);
  }, [isOnline, activeTrip]);

  // Request countdown
  useEffect(() => {
    if (!incomingRequest) return;

    const interval = setInterval(() => {
      setRequestCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIncomingRequest(null);
          toast({ title: 'Request expired', description: 'The request was auto-rejected due to timeout.' });
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [incomingRequest]);

  // Simulate driver location movement when on active trip
  useEffect(() => {
    if (!activeTrip) return;

    const interval = setInterval(() => {
      setDriverLocation(prev => ({
        lat: prev.lat + (Math.random() - 0.3) * 0.001,
        lng: prev.lng + (Math.random() - 0.3) * 0.001,
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [activeTrip]);

  const handleToggleOnline = async () => {
    const newStatus = !isOnline;
    try {
      await api.updateDriverStatus('d1', newStatus);
      setIsOnline(newStatus);
      toast({
        title: newStatus ? t('partner.youAreOnline') : t('partner.youAreOffline'),
        description: newStatus ? t('partner.waitingForRequests') : undefined,
      });
    } catch {
      toast({ title: t('common.error'), variant: 'destructive' });
    }
  };

  const handleAcceptRequest = () => {
    if (!incomingRequest) return;
    setActiveTrip({
      id: `BKG${Date.now()}`,
      code: `UYR${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      status: 'ACCEPTED',
      pickup: incomingRequest.pickup,
      hospital: {
        id: 'h1', name: incomingRequest.hospital,
        location: { lat: 13.0475, lng: 80.2565 },
        capabilities: ['ICU', 'TRAUMA'],
      },
      ambulanceType: 'BLS',
      patientName: incomingRequest.patientName,
      patientPhone: '+919876543210',
      contactPhone: '+919876543210',
      fare: incomingRequest.fare,
      distance: incomingRequest.distance,
      eta: incomingRequest.eta,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setIncomingRequest(null);
    toast({ title: 'Request accepted!', description: 'Navigate to pickup location.' });
  };

  const handleRejectRequest = () => {
    setIncomingRequest(null);
    toast({ title: 'Request rejected' });
  };

  const handleUpdateTripStatus = (newStatus: BookingStatus) => {
    if (!activeTrip) return;
    setActiveTrip(prev => prev ? { ...prev, status: newStatus, updatedAt: new Date().toISOString() } : null);

    const statusMessages: Record<string, string> = {
      ENROUTE: 'En route to pickup',
      AT_PICKUP: 'Arrived at pickup location',
      TO_HOSPITAL: 'Patient picked up, heading to hospital',
      COMPLETED: 'Trip completed!',
    };
    toast({ title: statusMessages[newStatus] || `Status: ${newStatus}` });

    if (newStatus === 'COMPLETED') {
      setActiveTrip(null);
    }
  };

  const getNextStatus = (): { status: BookingStatus; label: string } | null => {
    if (!activeTrip) return null;
    switch (activeTrip.status) {
      case 'ACCEPTED': return { status: 'ENROUTE', label: t('partner.navigate') };
      case 'ENROUTE': return { status: 'AT_PICKUP', label: t('partner.arrivedAtPickup') };
      case 'AT_PICKUP': return { status: 'TO_HOSPITAL', label: t('partner.patientPickedUp') };
      case 'TO_HOSPITAL': return { status: 'COMPLETED', label: t('partner.completeTrip') };
      default: return null;
    }
  };

  const nextStatus = getNextStatus();

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <div className="container mx-auto px-4 py-6">
        {/* Header with Online Toggle */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t('partner.title')}</h1>
            <p className="text-sm text-muted-foreground">
              {user?.name || 'Driver'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">
              {isOnline ? t('partner.goOffline') : t('partner.goOnline')}
            </span>
            <Switch
              checked={isOnline}
              onCheckedChange={handleToggleOnline}
              className="data-[state=checked]:bg-green-500"
              id="online-toggle"
            />
            <div className={`h-3 w-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
          </div>
        </div>

        {/* Incoming Request Alert */}
        {incomingRequest && (
          <DriverRequestCard
            request={incomingRequest}
            countdown={requestCountdown}
            onAccept={handleAcceptRequest}
            onReject={handleRejectRequest}
          />
        )}

        <Tabs defaultValue="map" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="earnings">{t('partner.earnings')}</TabsTrigger>
            <TabsTrigger value="history">{t('partner.tripHistory')}</TabsTrigger>
          </TabsList>

          {/* Map Tab */}
          <TabsContent value="map" className="space-y-4">
            {/* Active Trip Card */}
            {activeTrip ? (
              <Card className="border-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{t('partner.activeTrip')}</CardTitle>
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      {activeTrip.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground">{t('partner.patientPickup')}</div>
                      <div className="text-sm font-semibold">{activeTrip.patientName}</div>
                      <div className="text-xs text-muted-foreground truncate">{activeTrip.pickup.address}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">{t('partner.destination')}</div>
                      <div className="text-sm font-semibold">{activeTrip.hospital.name}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">ETA</div>
                      <div className="font-mono font-semibold text-primary">{Math.ceil(activeTrip.eta / 60)} min</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">{t('partner.estimatedFare')}</div>
                      <div className="font-mono font-semibold text-green-600">₹{activeTrip.fare.toFixed(0)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Distance</div>
                      <div className="font-mono font-semibold">{(activeTrip.distance / 1000).toFixed(1)} km</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" asChild>
                      <a href={`tel:${activeTrip.patientPhone}`}>
                        <Phone className="mr-2 h-4 w-4" />
                        Call Patient
                      </a>
                    </Button>
                    {nextStatus && (
                      <Button
                        onClick={() => handleUpdateTripStatus(nextStatus.status)}
                        className="flex-1"
                      >
                        {nextStatus.label}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  {isOnline ? (
                    <>
                      <Truck className="mx-auto mb-2 h-8 w-8" />
                      <p>{t('partner.waitingForRequests')}</p>
                    </>
                  ) : (
                    <>
                      <Power className="mx-auto mb-2 h-8 w-8" />
                      <p>{t('partner.youAreOffline')}</p>
                      <p className="text-sm">Toggle online to start receiving requests</p>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Map */}
            <MapLibre
              center={driverLocation}
              markers={[
                { location: driverLocation, color: '#F59E0B', popup: 'You' },
                ...(activeTrip ? [
                  { location: activeTrip.pickup, color: '#0EA5E9', popup: 'Pickup' },
                  { location: activeTrip.hospital.location, color: '#22C55E', popup: activeTrip.hospital.name },
                ] : []),
              ]}
              className="h-[400px]"
            />
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-4">
            {earnings && (
              <>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <IndianRupee className="mx-auto mb-2 h-6 w-6 text-green-500" />
                      <div className="text-2xl font-bold font-mono">₹{earnings.today.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{t('partner.today')}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <TrendingUp className="mx-auto mb-2 h-6 w-6 text-primary" />
                      <div className="text-2xl font-bold font-mono">₹{earnings.thisWeek.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{t('partner.thisWeek')}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <IndianRupee className="mx-auto mb-2 h-6 w-6 text-primary" />
                      <div className="text-2xl font-bold font-mono">₹{earnings.thisMonth.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{t('partner.thisMonth')}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Star className="mx-auto mb-2 h-6 w-6 text-yellow-400" />
                      <div className="text-2xl font-bold font-mono">{earnings.rating}</div>
                      <div className="text-xs text-muted-foreground">{t('dashboard.rating')}</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-xl font-bold">{earnings.todayTrips}</div>
                      <div className="text-xs text-muted-foreground">Today's Trips</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-xl font-bold">{earnings.weekTrips}</div>
                      <div className="text-xs text-muted-foreground">Week Trips</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-xl font-bold">{earnings.acceptanceRate}%</div>
                      <div className="text-xs text-muted-foreground">{t('partner.acceptanceRate')}</div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Trip History Tab */}
          <TabsContent value="history" className="space-y-3">
            {tripHistory.map(trip => (
              <Card key={trip.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold">{trip.code}</span>
                        <Badge variant={trip.status === 'COMPLETED' ? 'default' : 'destructive'} className="text-xs">
                          {trip.status}
                        </Badge>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {trip.pickup} → {trip.hospital}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{new Date(trip.date).toLocaleDateString()}</span>
                        <span>{trip.duration} min</span>
                        <span>{(trip.distance / 1000).toFixed(1)} km</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-lg font-bold text-green-600">₹{trip.fare}</div>
                      {trip.rating && (
                        <div className="flex items-center gap-1 justify-end">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-mono">{trip.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Partner;
