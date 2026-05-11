import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TopNav } from '@/components/TopNav';
import { StatusBadge } from '@/components/StatusBadge';
import { StatusTimeline } from '@/components/StatusTimeline';
import { EtaPill } from '@/components/EtaPill';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MapLibre } from '@/components/MapLibre';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Booking } from '@/lib/types';
import { api } from '@/lib/api';
import { subscribeToBooking } from '@/lib/socket';
import { Phone, Share2, Star, Copy, MapPin, Building2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Track = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { t } = useTranslation();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [ambulanceLocation, setAmbulanceLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [etaCountdown, setEtaCountdown] = useState<number>(0);

  useEffect(() => {
    if (!bookingId) return;

    const loadBooking = async () => {
      try {
        const data = await api.getBooking(bookingId);
        setBooking(data);
        setEtaCountdown(data.eta);
        if (data.ambulance?.location) {
          setAmbulanceLocation(data.ambulance.location);
        }
      } catch (error) {
        toast({ title: t('common.error'), description: 'Failed to load booking', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    loadBooking();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToBooking(bookingId, (data) => {
      if (data.location) {
        setAmbulanceLocation(data.location);
      }
      if (data.status) {
        setBooking((prev) => (prev ? { ...prev, status: data.status } : null));
      }
      if (data.eta) {
        setBooking((prev) => (prev ? { ...prev, eta: data.eta } : null));
        setEtaCountdown(data.eta);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [bookingId, t]);

  // ETA countdown timer
  useEffect(() => {
    if (!booking || booking.status === 'COMPLETED' || booking.status === 'CANCELED') return;

    const interval = setInterval(() => {
      setEtaCountdown(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [booking]);

  // Simulate ambulance movement along route
  useEffect(() => {
    if (!booking || booking.status === 'COMPLETED' || booking.status === 'CANCELED') return;

    const interval = setInterval(() => {
      setAmbulanceLocation(prev => {
        if (!prev || !booking) return prev;
        const target = booking.status === 'ENROUTE' || booking.status === 'ACCEPTED'
          ? booking.pickup
          : booking.hospital.location;
        const dx = (target.lat - prev.lat) * 0.05;
        const dy = (target.lng - prev.lng) * 0.05;
        return {
          lat: prev.lat + dx + (Math.random() - 0.5) * 0.0005,
          lng: prev.lng + dy + (Math.random() - 0.5) * 0.0005,
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [booking]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'Track Ambulance',
        text: `Track my ambulance booking: ${booking?.code}`,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast({ title: 'Link Copied', description: 'Tracking link copied to clipboard' });
    }
  };

  const handleCopyCode = () => {
    if (booking?.code) {
      navigator.clipboard.writeText(booking.code);
      toast({ title: 'Copied', description: `Booking code ${booking.code} copied` });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <LoadingSpinner />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold">{t('common.error')}</h2>
          <p className="text-muted-foreground">Booking not found</p>
        </div>
      </div>
    );
  }

  const markers = [
    { location: booking.pickup, color: '#0EA5E9', popup: 'Pickup' },
    { location: booking.hospital.location, color: '#22C55E', popup: booking.hospital.name },
    ...(ambulanceLocation ? [{ location: ambulanceLocation, color: '#F59E0B', popup: 'Ambulance' }] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t('tracking.title')}</h1>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-lg text-muted-foreground">{booking.code}</span>
              <button onClick={handleCopyCode} className="text-muted-foreground hover:text-foreground">
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Map */}
          <div className="lg:col-span-2">
            <MapLibre
              center={ambulanceLocation || booking.pickup}
              markers={markers}
              route={booking.route}
              className="h-[500px] lg:h-[600px]"
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* ETA Card */}
            {booking.status !== 'COMPLETED' && booking.status !== 'CANCELED' && (
              <Card>
                <CardContent className="py-6 text-center">
                  <div className="text-sm text-muted-foreground mb-2">Estimated Arrival</div>
                  <EtaPill seconds={etaCountdown} />
                  <div className="mt-2 font-mono text-sm text-muted-foreground">
                    {Math.floor(etaCountdown / 60)}:{String(etaCountdown % 60).padStart(2, '0')} remaining
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('tracking.timeline')}</CardTitle>
              </CardHeader>
              <CardContent>
                <StatusTimeline currentStatus={booking.status} />
              </CardContent>
            </Card>

            {/* Driver Info */}
            {booking.ambulance?.driver && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{t('tracking.driver')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <span className="font-semibold text-primary">{booking.ambulance.driver.name[0]}</span>
                      </div>
                      <div>
                        <div className="font-semibold">{booking.ambulance.driver.name}</div>
                        <div className="text-sm text-muted-foreground">{booking.ambulance.registration}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-yellow-400" />
                      <span className="font-mono font-semibold">{booking.ambulance.driver.rating}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <a href={`tel:${booking.ambulance.driver.phone}`}>
                        <Phone className="mr-2 h-4 w-4" />
                        {t('tracking.callDriver')}
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trip Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('tracking.tripDetails')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  <div>
                    <div className="text-muted-foreground">{t('tracking.patient')}</div>
                    <div className="font-semibold">{booking.patientName}</div>
                    <div className="text-xs text-muted-foreground">{booking.pickup.address || `${booking.pickup.lat.toFixed(4)}, ${booking.pickup.lng.toFixed(4)}`}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  <div>
                    <div className="text-muted-foreground">{t('tracking.hospital')}</div>
                    <div className="font-semibold">{booking.hospital.name}</div>
                  </div>
                </div>
                <div className="flex justify-between border-t border-border pt-3">
                  <span className="text-muted-foreground">{t('tracking.ambulanceType')}</span>
                  <span className="font-semibold">{booking.ambulanceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('tracking.fare')}</span>
                  <span className="font-mono text-lg font-bold text-green-600">₹{booking.fare.toFixed(0)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Track;
