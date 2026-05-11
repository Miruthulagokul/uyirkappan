import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { TopNav } from '@/components/TopNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MapLibre } from '@/components/MapLibre';
import { EtaPill } from '@/components/EtaPill';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Location, Hospital, AmbulanceType } from '@/lib/types';
import { debouncedGeocodeSearch, GeocodeSuggestion } from '@/lib/geocode';
import { getRoute, calculateFare, formatDistance } from '@/lib/routing';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

const Book = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Pickup
  const [pickup, setPickup] = useState<Location | null>(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');

  // Step 2: Hospital & Ambulance
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [ambulanceType, setAmbulanceType] = useState<AmbulanceType>('BLS');
  const [route, setRoute] = useState<[number, number][] | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; eta: number; fare: number } | null>(null);

  // Step 3: Confirmation
  const [contactPhone, setContactPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOffers, setShowOffers] = useState(false);

  const handleAddressSearch = (query: string) => {
    setPickupAddress(query);
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    debouncedGeocodeSearch(query, setSuggestions);
  };

  const handleSelectSuggestion = (suggestion: GeocodeSuggestion) => {
    const location = { lat: parseFloat(suggestion.lat), lng: parseFloat(suggestion.lon) };
    setPickup(location);
    setPickupAddress(suggestion.display_name);
    setSuggestions([]);
  };

  const handleMapClick = (location: Location) => {
    setPickup(location);
    setPickupAddress(`${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`);
  };

  const handleStep1Next = async () => {
    if (!pickup || !patientName || !patientPhone) {
      toast({ title: t('common.error'), description: 'Please fill all fields', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const nearbyHospitals = await api.getNearbyHospitals(pickup.lat, pickup.lng);
      setHospitals(nearbyHospitals);
      setStep(2);
    } catch (error) {
      toast({ title: t('common.error'), description: 'Failed to load hospitals', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleHospitalSelect = async (hospital: Hospital) => {
    if (!pickup) return;
    setSelectedHospital(hospital);
    setLoading(true);
    try {
      const routeData = await getRoute(pickup, hospital.location);
      if (routeData) {
        setRoute(routeData.geometry);
        const fare = calculateFare(routeData.distance, ambulanceType);
        setRouteInfo({ distance: routeData.distance, eta: routeData.duration, fare });
      }
    } catch (error) {
      console.error('Route calculation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Next = () => {
    if (!selectedHospital) {
      toast({ title: t('common.error'), description: 'Please select a hospital', variant: 'destructive' });
      return;
    }
    setStep(3);
  };

  const handleConfirmBooking = async () => {
    if (!contactPhone || otp !== '1234') {
      toast({ title: t('common.error'), description: 'Invalid OTP (use 1234)', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const booking = await api.createBooking({
        pickup: pickup!,
        hospital: selectedHospital!,
        ambulanceType,
        patientName,
        patientPhone,
        contactPhone,
        fare: routeInfo!.fare,
        distance: routeInfo!.distance,
        eta: routeInfo!.eta,
      });

      setShowOffers(true);

      // Simulate offer acceptance after 5 seconds
      setTimeout(() => {
        toast({ title: 'Offer Accepted!', description: 'Ambulance is on the way' });
        navigate(`/track/${booking.id}`);
      }, 5000);
    } catch (error) {
      toast({ title: t('common.error'), description: 'Booking failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (showOffers) {
    return (
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{t('booking.findingAmbulances')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <LoadingSpinner />
                <p className="text-center text-muted-foreground">
                  Waiting for ambulance offers... (15s)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{t('booking.title')}</h1>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full ${s === step ? 'bg-primary' : s < step ? 'bg-accent' : 'bg-muted'}`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Pickup */}
        {step === 1 && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('booking.step1')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">{t('booking.searchAddress')}</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      value={pickupAddress}
                      onChange={(e) => handleAddressSearch(e.target.value)}
                      placeholder="Type to search..."
                      className="pl-10"
                    />
                  </div>
                  {suggestions.length > 0 && (
                    <ul className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-border bg-card p-2">
                      {suggestions.map((s, i) => (
                        <li
                          key={i}
                          onClick={() => handleSelectSuggestion(s)}
                          className="cursor-pointer rounded-md px-3 py-2 text-sm hover:bg-accent"
                        >
                          {s.display_name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patient-name">{t('booking.patientName')}</Label>
                  <Input
                    id="patient-name"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patient-phone">{t('booking.patientPhone')}</Label>
                  <Input
                    id="patient-phone"
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="+91"
                  />
                </div>

                <Button onClick={handleStep1Next} disabled={loading} className="w-full">
                  {loading ? t('common.loading') : t('booking.next')}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <MapLibre
              center={pickup || { lat: 13.0827, lng: 80.2707 }}
              markers={pickup ? [{ location: pickup, color: '#0EA5E9' }] : []}
              onMapClick={handleMapClick}
              className="h-[600px]"
            />
          </div>
        )}

        {/* Step 2: Hospital & Ambulance */}
        {step === 2 && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('booking.selectHospital')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {hospitals.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => handleHospitalSelect(h)}
                        className={`w-full rounded-lg border-2 p-4 text-left transition-smooth ${selectedHospital?.id === h.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                      >
                        <div className="font-semibold">{h.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {h.capabilities.join(', ')}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('booking.ambulanceType')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={ambulanceType} onValueChange={(v) => setAmbulanceType(v as AmbulanceType)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="BLS" id="bls" />
                      <Label htmlFor="bls">{t('booking.bls')} - ₹500 base</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ALS" id="als" />
                      <Label htmlFor="als">{t('booking.als')} - ₹800 base</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="NEO" id="neo" />
                      <Label htmlFor="neo">{t('booking.neo')} - ₹1200 base</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {routeInfo && (
                <Card>
                  <CardContent className="space-y-3 pt-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('booking.distance')}</span>
                      <span className="font-mono font-semibold">{formatDistance(routeInfo.distance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('booking.eta')}</span>
                      <EtaPill seconds={routeInfo.eta} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('booking.fare')}</span>
                      <span className="font-mono text-lg font-bold text-accent">₹{routeInfo.fare.toFixed(0)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  {t('booking.back')}
                </Button>
                <Button onClick={handleStep2Next} disabled={!selectedHospital} className="flex-1">
                  {t('booking.next')}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            <MapLibre
              center={pickup || { lat: 13.0827, lng: 80.2707 }}
              markers={[
                ...(pickup ? [{ location: pickup, color: '#0EA5E9', popup: 'Pickup' }] : []),
                ...(selectedHospital ? [{ location: selectedHospital.location, color: '#22C55E', popup: selectedHospital.name }] : []),
              ]}
              route={route || undefined}
              className="h-[600px]"
            />
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="mx-auto max-w-md">
            <Card>
              <CardHeader>
                <CardTitle>{t('booking.step3')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contact">{t('booking.contact')}</Label>
                  <Input
                    id="contact"
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otp">{t('booking.otp')} (use 1234)</Label>
                  <Input
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    maxLength={4}
                  />
                </div>

                <div className="rounded-lg bg-muted p-4">
                  <h4 className="mb-2 font-semibold">Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div>Patient: {patientName}</div>
                    <div>Hospital: {selectedHospital?.name}</div>
                    <div>Type: {ambulanceType}</div>
                    <div className="font-mono text-lg font-bold text-accent">
                      Total: ₹{routeInfo?.fare.toFixed(0)}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    {t('booking.back')}
                  </Button>
                  <Button onClick={handleConfirmBooking} disabled={loading} className="flex-1">
                    {loading ? t('common.loading') : t('booking.confirm')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Book;
