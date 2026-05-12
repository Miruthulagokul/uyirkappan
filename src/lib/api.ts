import {
  Booking, Hospital, Ambulance, Offer, Driver,
  DashboardMetrics, AnalyticsData, TripHistory, DriverEarnings,
  EmergencyRequest, EmergencyType, AmbulanceType, BookingStatus,
  Notification,
} from './types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001';

// ─── HTTP Helper ────────────────────────────────────────────────────────────

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('uyir_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

// ─── API Methods ────────────────────────────────────────────────────────────

export const api = {
  // ── Bookings ──────────────────────────────────────────────
  createBooking: (data: Partial<Booking>): Promise<Booking> =>
    request('/api/bookings', { method: 'POST', body: JSON.stringify(data) }),

  getBooking: (id: string): Promise<Booking> =>
    request(`/api/bookings/${id}`),

  getRecentBookings: (): Promise<Booking[]> =>
    request('/api/bookings'),

  updateBookingStatus: (id: string, status: BookingStatus): Promise<Booking> =>
    request(`/api/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // ── Emergency ─────────────────────────────────────────────
  getPendingEmergencies: (): Promise<EmergencyRequest[]> =>
    request('/api/emergency'),

  createEmergencyRequest: (data: {
    location: { lat: number; lng: number; address?: string };
    emergencyType: EmergencyType;
    patientName?: string;
    patientPhone?: string;
    medicalInfo?: { bloodType?: string; allergies?: string; conditions?: string };
  }): Promise<EmergencyRequest> =>
    request('/api/emergency', { method: 'POST', body: JSON.stringify(data) }),

  getEmergencyOffers: (requestId: string, location: { lat: number; lng: number }): Promise<Offer[]> =>
    request(`/api/emergency/${requestId}/offers?lat=${location.lat}&lng=${location.lng}`),

  acceptOffer: (offerId: string, requestId: string): Promise<Booking> =>
    request(`/api/emergency/${requestId}/accept`, { method: 'POST', body: JSON.stringify({ offerId }) }),

  // ── Ambulances ────────────────────────────────────────────
  getNearbyAmbulances: (lat: number, lng: number): Promise<Ambulance[]> =>
    request(`/api/ambulances/nearby?lat=${lat}&lng=${lng}`),

  getAllAmbulances: (): Promise<Ambulance[]> =>
    request('/api/ambulances'),

  // ── Hospitals ─────────────────────────────────────────────
  getNearbyHospitals: (lat: number, lng: number, needs?: string[]): Promise<Hospital[]> => {
    const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });
    if (needs && needs.length > 0) {
      params.set('needs', needs.join(','));
    }
    return request(`/api/hospitals/nearby?${params.toString()}`);
  },

  getAllHospitals: (): Promise<Hospital[]> =>
    request('/api/hospitals'),

  // ── Drivers ───────────────────────────────────────────────
  getAllDrivers: (): Promise<Driver[]> =>
    request('/api/drivers'),

  // ── Dashboard ─────────────────────────────────────────────
  getDashboardMetrics: (): Promise<DashboardMetrics> =>
    request('/api/dashboard/metrics'),

  getAnalytics: (): Promise<AnalyticsData> =>
    request('/api/dashboard/analytics'),

  // ── Driver Portal ─────────────────────────────────────────
  getDriverEarnings: (driverId: string): Promise<DriverEarnings> =>
    request(`/api/drivers/${driverId}/earnings`),

  getDriverTripHistory: (driverId: string): Promise<TripHistory[]> =>
    request(`/api/drivers/${driverId}/trips`),

  updateDriverStatus: (driverId: string, isOnline: boolean): Promise<void> =>
    request(`/api/drivers/${driverId}/status`, { method: 'PATCH', body: JSON.stringify({ isOnline }) }),

  // ── Notifications ─────────────────────────────────────────
  getNotifications: (): Promise<Notification[]> =>
    request('/api/notifications'),
  // ── AI Triage ─────────────────────────────────────────────
  getAITriage: (emergencies: any[]): Promise<{ queue: any[] }> =>
    request('/api/ai/triage', { method: 'POST', body: JSON.stringify({ emergencies }) }),
};
