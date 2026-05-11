import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { TopNav } from '@/components/TopNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapLibre } from '@/components/MapLibre';
import { EtaPill } from '@/components/EtaPill';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Location, EmergencyType, Offer } from '@/lib/types';
import { reverseGeocode } from '@/lib/geocode';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import {
  Heart, Car, Wind, Baby, Flame, HelpCircle,
  MapPin, CheckCircle2, AlertTriangle, Clock, Star, Phone,
} from 'lucide-react';

const emergencyTypes: { type: EmergencyType; icon: typeof Heart; label: string; translationKey: string }[] = [
  { type: 'CARDIAC', icon: Heart, label: 'Cardiac', translationKey: 'cardiac' },
  { type: 'ACCIDENT', icon: Car, label: 'Accident', translationKey: 'accident' },
  { type: 'BREATHING', icon: Wind, label: 'Breathing', translationKey: 'breathing' },
  { type: 'PREGNANCY', icon: Baby, label: 'Pregnancy', translationKey: 'pregnancy' },
  { type: 'BURN', icon: Flame, label: 'Burn', translationKey: 'burn' },
  { type: 'OTHER', icon: HelpCircle, label: 'Other', translationKey: 'other' },
];

type EmergencyStep = 'SOS' | 'LOCATION' | 'TYPE' | 'MEDICAL' | 'SEARCHING' | 'OFFERS' | 'DISPATCHED';

const Emergency = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState<EmergencyStep>('SOS');
  const [location, setLocation] = useState<Location | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [emergencyType, setEmergencyType] = useState<EmergencyType | null>(null);
  const [bloodType, setBloodType] = useState('');
  const [allergies, setAllergies] = useState('');
  const [conditions, setConditions] = useState('');
  const [offers, setOffers] = useState<Offer[]>([]);
  const [autoAcceptTimer, setAutoAcceptTimer] = useState(15);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  // Auto-detect location
  const detectLocation = useCallback(async () => {
    setLocationLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const loc: Location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      // Reverse geocode for address
      try {
        const address = await reverseGeocode(loc);
        loc.address = address;
      } catch {
        loc.address = `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`;
      }

      setLocation(loc);
      setStep('TYPE');
    } catch (error) {
      // Fallback to Chennai center
      const fallback: Location = {
        lat: 13.0827,
        lng: 80.2707,
        address: 'Chennai, Tamil Nadu (approximate)',
      };
      setLocation(fallback);
      setStep('TYPE');
      toast({
        title: 'Location approximate',
        description: 'Could not detect exact location. Please verify on map.',
        variant: 'destructive',
      });
    } finally {
      setLocationLoading(false);
    }
  }, []);

  // Handle SOS activation
  const handleSOS = () => {
    setStep('LOCATION');
    detectLocation();
  };

  // Handle emergency type selection
  const handleTypeSelect = (type: EmergencyType) => {
    setEmergencyType(type);
    setStep('MEDICAL');
  };

  // Skip medical info
  const handleSkipMedical = () => {
    handleDispatch();
  };

  // Dispatch ambulance
  const handleDispatch = async () => {
    if (!location || !emergencyType) return;
    setStep('SEARCHING');

    try {
      const request = await api.createEmergencyRequest({
        location,
        emergencyType,
        medicalInfo: { bloodType, allergies, conditions },
      });
      setRequestId(request.id);

      // Fetch offers
      const fetchedOffers = await api.getEmergencyOffers(request.id, location);
      setOffers(fetchedOffers);
      setStep('OFFERS');
      setAutoAcceptTimer(15);
    } catch (error) {
      toast({ title: t('common.error'), description: 'Failed to dispatch', variant: 'destructive' });
      setStep('TYPE');
    }
  };

  // Auto-accept countdown
  useEffect(() => {
    if (step !== 'OFFERS' || offers.length === 0) return;

    const interval = setInterval(() => {
      setAutoAcceptTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAcceptOffer(offers[0]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step, offers]);

  // Accept an offer
  const handleAcceptOffer = async (offer: Offer) => {
    if (!requestId) return;
    try {
      const booking = await api.acceptOffer(offer.id, requestId);
      setBookingId(booking.id);
      setStep('DISPATCHED');
      toast({ title: t('emergency.dispatched'), description: t('emergency.driverOnWay') });
    } catch (error) {
      toast({ title: t('common.error'), description: 'Failed to accept offer', variant: 'destructive' });
    }
  };

  // Handle map click to update location
  const handleMapClick = async (loc: Location) => {
    try {
      const address = await reverseGeocode(loc);
      setLocation({ ...loc, address });
    } catch {
      setLocation({ ...loc, address: `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}` });
    }
  };

  // ─── Render SOS Screen ──────────────────────────────────────────
  if (step === 'SOS') {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
          <h1 className="mb-2 text-3xl font-bold">{t('emergency.title')}</h1>
          <p className="mb-12 text-center text-muted-foreground">{t('emergency.subtitle')}</p>

          <button
            onClick={handleSOS}
            className="group relative flex h-48 w-48 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-lg transition-all hover:scale-105 hover:shadow-2xl active:scale-95"
            id="sos-button"
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-destructive opacity-20"></span>
            <span className="text-5xl font-black">{t('emergency.sosButton')}</span>
          </button>

          <p className="mt-6 text-sm text-muted-foreground">{t('emergency.sosHelp')}</p>
        </div>
      </div>
    );
  }

  // ─── Render Location Detection ──────────────────────────────────
  if (step === 'LOCATION') {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
          <MapPin className="mb-4 h-12 w-12 text-primary animate-bounce" />
          <h2 className="mb-2 text-2xl font-bold">{t('emergency.detectingLocation')}</h2>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // ─── Render Emergency Type Selection ────────────────────────────
  if (step === 'TYPE') {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto px-4 py-8">
          {/* Location confirmation */}
          {location && (
            <Card className="mb-6">
              <CardContent className="flex items-center gap-3 pt-6">
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-green-600">{t('emergency.locationDetected')}</div>
                  <div className="truncate text-sm text-muted-foreground">{location.address}</div>
                </div>
              </CardContent>
            </Card>
          )}

          <h2 className="mb-6 text-2xl font-bold">{t('emergency.selectType')}</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {emergencyTypes.map(({ type, icon: Icon, translationKey }) => (
              <button
                key={type}
                onClick={() => handleTypeSelect(type)}
                className={`flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all hover:border-primary hover:bg-primary/5 ${
                  emergencyType === type ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                id={`emergency-type-${type.toLowerCase()}`}
              >
                <Icon className="h-10 w-10 text-primary" />
                <span className="font-semibold">{t(`emergency.${translationKey}`)}</span>
              </button>
            ))}
          </div>

          {/* Map for location adjustment */}
          {location && (
            <div className="mt-6">
              <p className="mb-2 text-sm text-muted-foreground">Tap the map to adjust your location:</p>
              <MapLibre
                center={location}
                markers={[{ location, color: '#EF4444', popup: 'Your Location' }]}
                onMapClick={handleMapClick}
                className="h-[300px]"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Render Medical Info (Optional) ─────────────────────────────
  if (step === 'MEDICAL') {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto px-4 py-8">
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <CardTitle>{t('emergency.medicalInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="blood-type">{t('emergency.bloodType')}</Label>
                <Input
                  id="blood-type"
                  value={bloodType}
                  onChange={e => setBloodType(e.target.value)}
                  placeholder="e.g. O+, A-, B+"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allergies">{t('emergency.allergies')}</Label>
                <Input
                  id="allergies"
                  value={allergies}
                  onChange={e => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Peanuts"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conditions">{t('emergency.conditions')}</Label>
                <Input
                  id="conditions"
                  value={conditions}
                  onChange={e => setConditions(e.target.value)}
                  placeholder="e.g. Diabetes, Asthma"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={handleSkipMedical} className="flex-1">
                  Skip
                </Button>
                <Button onClick={handleDispatch} className="flex-1 bg-destructive hover:bg-destructive/90">
                  {t('emergency.dispatch')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ─── Render Searching ───────────────────────────────────────────
  if (step === 'SEARCHING') {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
          <AlertTriangle className="mb-4 h-12 w-12 text-warning animate-pulse" />
          <h2 className="mb-2 text-2xl font-bold">{t('emergency.searching')}</h2>
          <LoadingSpinner />

          {location && (
            <div className="mt-8 w-full max-w-lg">
              <MapLibre
                center={location}
                markers={[{ location, color: '#EF4444', popup: 'You' }]}
                className="h-[300px]"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Render Offers ──────────────────────────────────────────────
  if (step === 'OFFERS') {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">{t('emergency.offersFound')}</h2>
            <div className="flex items-center gap-2 rounded-full bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive">
              <Clock className="h-4 w-4" />
              {t('emergency.autoAcceptIn')} {autoAcceptTimer}s
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {offers.map((offer, index) => (
              <Card
                key={offer.id}
                className={`transition-all hover:shadow-md ${index === 0 ? 'border-primary ring-2 ring-primary/20' : ''}`}
              >
                <CardContent className="pt-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-lg font-bold text-primary">{offer.ambulance.type}</span>
                      </div>
                      <div>
                        <div className="font-semibold">{offer.ambulance.driver?.name}</div>
                        <div className="text-sm text-muted-foreground">{offer.ambulance.registration}</div>
                      </div>
                    </div>
                    {offer.ambulance.driver && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-mono text-sm font-semibold">{offer.ambulance.driver.rating}</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-4 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xs text-muted-foreground">ETA</div>
                      <div className="font-mono font-semibold text-primary">{Math.ceil(offer.eta / 60)} min</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Distance</div>
                      <div className="font-mono font-semibold">{(offer.distance / 1000).toFixed(1)} km</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Fare</div>
                      <div className="font-mono font-semibold text-green-600">₹{offer.fare}</div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleAcceptOffer(offer)}
                    className={`w-full ${index === 0 ? 'bg-primary' : ''}`}
                    variant={index === 0 ? 'default' : 'outline'}
                  >
                    {index === 0 ? `${t('emergency.autoAcceptIn')} — ${t('booking.accept')}` : t('booking.accept')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {location && (
            <div className="mt-6">
              <MapLibre
                center={location}
                markers={[
                  { location, color: '#EF4444', popup: 'You' },
                  ...offers.map(o => ({
                    location: o.ambulance.location,
                    color: '#0EA5E9',
                    popup: `${o.ambulance.driver?.name} — ${o.ambulance.registration}`,
                  })),
                ]}
                className="h-[400px]"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Render Dispatched ──────────────────────────────────────────
  if (step === 'DISPATCHED') {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
          <CheckCircle2 className="mb-4 h-16 w-16 text-green-500" />
          <h2 className="mb-2 text-3xl font-bold">{t('emergency.dispatched')}</h2>
          <p className="mb-8 text-lg text-muted-foreground">{t('emergency.driverOnWay')}</p>
          <Button size="lg" onClick={() => navigate(`/track/${bookingId}`)}>
            {t('emergency.goToTracking')}
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default Emergency;
