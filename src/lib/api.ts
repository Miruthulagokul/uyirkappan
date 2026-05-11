import {
  Booking, Hospital, Ambulance, Offer, Driver,
  DashboardMetrics, AnalyticsData, TripHistory, DriverEarnings,
  EmergencyRequest, EmergencyType, AmbulanceType, BookingStatus,
  Notification,
} from './types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001';

// ─── Mock Data ──────────────────────────────────────────────────────────────

const mockHospitals: Hospital[] = [
  {
    id: 'h1', name: 'Apollo Hospital',
    location: { lat: 13.0475, lng: 80.2565, address: 'Greams Road, Chennai' },
    capabilities: ['ICU', 'TRAUMA', 'NEO', 'CARDIO'],
    phone: '+914428293333', subscriptionPlan: 'PRO',
    activePatients: 142, totalBeds: 500, availableBeds: 48,
  },
  {
    id: 'h2', name: 'Fortis Malar Hospital',
    location: { lat: 13.0569, lng: 80.2481, address: 'Adyar, Chennai' },
    capabilities: ['ICU', 'CARDIO', 'NEURO'],
    phone: '+914442891000', subscriptionPlan: 'BASIC',
    activePatients: 89, totalBeds: 180, availableBeds: 23,
  },
  {
    id: 'h3', name: 'MIOT International',
    location: { lat: 13.0332, lng: 80.2358, address: 'Manapakkam, Chennai' },
    capabilities: ['TRAUMA', 'NEO', 'ORTHO'],
    phone: '+914422491000', subscriptionPlan: 'PRO',
    activePatients: 210, totalBeds: 600, availableBeds: 62,
  },
  {
    id: 'h4', name: 'Kauvery Hospital',
    location: { lat: 13.0618, lng: 80.2609, address: 'Alwarpet, Chennai' },
    capabilities: ['ICU', 'CARDIO', 'NEURO', 'TRAUMA'],
    phone: '+914440006000', subscriptionPlan: 'PRO',
    activePatients: 176, totalBeds: 350, availableBeds: 31,
  },
  {
    id: 'h5', name: 'Sri Ramachandra Hospital',
    location: { lat: 13.0365, lng: 80.1420, address: 'Porur, Chennai' },
    capabilities: ['ICU', 'TRAUMA', 'NEO', 'ORTHO'],
    phone: '+914445928500', subscriptionPlan: 'BASIC',
    activePatients: 120, totalBeds: 400, availableBeds: 55,
  },
];

const mockDrivers: Driver[] = [
  { id: 'd1', name: 'Rajesh Kumar', phone: '+919876543210', rating: 4.8, licenseNumber: 'TN0120190001234', verificationStatus: 'VERIFIED', totalTrips: 342, joinedAt: '2024-03-15', isOnline: true },
  { id: 'd2', name: 'Priya Sharma', phone: '+919876543211', rating: 4.9, licenseNumber: 'TN0120200005678', verificationStatus: 'VERIFIED', totalTrips: 518, joinedAt: '2023-11-20', isOnline: true },
  { id: 'd3', name: 'Arun Patel', phone: '+919876543212', rating: 4.7, licenseNumber: 'TN0120210009012', verificationStatus: 'VERIFIED', totalTrips: 156, joinedAt: '2024-08-10', isOnline: true },
  { id: 'd4', name: 'Deepa Rajan', phone: '+919876543213', rating: 4.6, licenseNumber: 'TN0120190003456', verificationStatus: 'VERIFIED', totalTrips: 289, joinedAt: '2024-01-05', isOnline: false },
  { id: 'd5', name: 'Suresh Babu', phone: '+919876543214', rating: 4.5, licenseNumber: 'TN0120200007890', verificationStatus: 'PENDING', totalTrips: 45, joinedAt: '2025-02-01', isOnline: false },
  { id: 'd6', name: 'Kavitha Devi', phone: '+919876543215', rating: 4.8, licenseNumber: 'TN0120210001357', verificationStatus: 'VERIFIED', totalTrips: 403, joinedAt: '2023-07-12', isOnline: true },
];

const mockAmbulances: Ambulance[] = [
  { id: 'a1', registration: 'TN01AB1234', type: 'BLS', location: { lat: 13.0527, lng: 80.2511 }, status: 'ONLINE', driver: mockDrivers[0], lastActive: new Date().toISOString(), totalTrips: 342 },
  { id: 'a2', registration: 'TN01CD5678', type: 'ALS', location: { lat: 13.0412, lng: 80.2472 }, status: 'ONLINE', driver: mockDrivers[1], lastActive: new Date().toISOString(), totalTrips: 518 },
  { id: 'a3', registration: 'TN01EF9012', type: 'NEO', location: { lat: 13.0621, lng: 80.2634 }, status: 'ONLINE', driver: mockDrivers[2], lastActive: new Date().toISOString(), totalTrips: 156 },
  { id: 'a4', registration: 'TN01GH3456', type: 'BLS', location: { lat: 13.0389, lng: 80.2321 }, status: 'BUSY', driver: mockDrivers[3], lastActive: new Date().toISOString(), totalTrips: 289 },
  { id: 'a5', registration: 'TN01IJ7890', type: 'ALS', location: { lat: 13.0700, lng: 80.2200 }, status: 'OFFLINE', driver: mockDrivers[4], lastActive: '2025-05-10T14:30:00Z', totalTrips: 45 },
  { id: 'a6', registration: 'TN01KL2345', type: 'BLS', location: { lat: 13.0450, lng: 80.2700 }, status: 'ONLINE', driver: mockDrivers[5], lastActive: new Date().toISOString(), totalTrips: 403 },
];

// Generate realistic recent bookings
const generateMockBookings = (): Booking[] => {
  const statuses: BookingStatus[] = ['ENROUTE', 'AT_PICKUP', 'TO_HOSPITAL', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'CANCELED'];
  const names = ['Anitha S.', 'Mohan K.', 'Lakshmi R.', 'Venkat P.', 'Geetha V.', 'Ravi M.', 'Sudha N.', 'Kumar T.'];
  const now = Date.now();

  return Array.from({ length: 8 }, (_, i) => {
    const status = statuses[i];
    const hospital = mockHospitals[i % mockHospitals.length];
    const ambulance = mockAmbulances[i % mockAmbulances.length];
    const distance = 2000 + Math.random() * 15000;
    const createdAt = new Date(now - (i * 3600000 + Math.random() * 3600000)).toISOString();

    return {
      id: `BKG${1000 + i}`,
      code: `UYR${String.fromCharCode(65 + i)}${Math.floor(100 + Math.random() * 900)}`,
      status,
      pickup: { lat: 13.05 + (Math.random() - 0.5) * 0.04, lng: 80.25 + (Math.random() - 0.5) * 0.04, address: `${100 + i * 10} Anna Nagar, Chennai` },
      hospital,
      ambulanceType: ambulance.type,
      patientName: names[i],
      patientPhone: `+91987654${3210 + i}`,
      contactPhone: `+91987654${3220 + i}`,
      fare: 500 + distance / 1000 * 15,
      distance,
      eta: Math.ceil(distance / 500) * 60,
      ambulance: status !== 'CANCELED' ? ambulance : undefined,
      createdAt,
      updatedAt: createdAt,
      completedAt: status === 'COMPLETED' ? new Date(new Date(createdAt).getTime() + 1800000).toISOString() : undefined,
    };
  });
};

const mockBookings = generateMockBookings();

const generateTripHistory = (): TripHistory[] => {
  const pickups = ['T. Nagar', 'Anna Nagar', 'Adyar', 'Velachery', 'Porur', 'Mylapore', 'Besant Nagar', 'Guindy', 'Nungambakkam', 'Egmore'];
  const hospitals = mockHospitals.map(h => h.name);
  const types: AmbulanceType[] = ['BLS', 'ALS', 'NEO'];
  const names = ['Anitha S.', 'Mohan K.', 'Lakshmi R.', 'Venkat P.', 'Geetha V.', 'Ravi M.', 'Sudha N.', 'Kumar T.', 'Priya L.', 'Sanjay D.'];

  return Array.from({ length: 15 }, (_, i) => {
    const distance = 2 + Math.random() * 18;
    return {
      id: `TRP${2000 + i}`,
      code: `UYR${String.fromCharCode(65 + (i % 26))}${Math.floor(100 + Math.random() * 900)}`,
      date: new Date(Date.now() - i * 86400000 - Math.random() * 43200000).toISOString(),
      pickup: pickups[i % pickups.length],
      hospital: hospitals[i % hospitals.length],
      fare: Math.round(500 + distance * 15),
      distance: Math.round(distance * 1000),
      duration: Math.round(8 + distance * 2),
      status: i === 7 ? 'CANCELED' : 'COMPLETED',
      rating: i === 7 ? undefined : 4 + Math.round(Math.random() * 10) / 10,
      patientName: names[i % names.length],
      ambulanceType: types[i % 3],
    };
  });
};

const generateAnalytics = (): AnalyticsData => {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  return {
    tripsOverTime: days.map(date => ({
      date,
      trips: Math.floor(30 + Math.random() * 40),
      revenue: Math.floor(15000 + Math.random() * 25000),
    })),
    tripsByType: [
      { type: 'BLS', count: 187, revenue: 168300 },
      { type: 'ALS', count: 124, revenue: 148800 },
      { type: 'NEO', count: 56, revenue: 84000 },
    ],
    tripsByStatus: [
      { status: 'Completed', count: 312 },
      { status: 'Canceled', count: 23 },
      { status: 'In Progress', count: 18 },
      { status: 'Searching', count: 5 },
    ],
    responseTimeTrend: days.map(date => ({
      date,
      avgMinutes: 6 + Math.random() * 4,
    })),
    peakHours: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      trips: Math.floor(hour >= 7 && hour <= 22 ? 8 + Math.random() * 20 : 2 + Math.random() * 5),
    })),
    hospitalLoad: mockHospitals.map(h => ({
      hospital: h.name,
      patients: h.activePatients || 0,
      capacity: h.totalBeds || 0,
    })),
  };
};

// ─── API Methods ────────────────────────────────────────────────────────────

export const api = {
  // ── Bookings ──────────────────────────────────────────────
  createBooking: async (data: Partial<Booking>): Promise<Booking> => {
    await new Promise(r => setTimeout(r, 500));
    const booking: Booking = {
      id: `BKG${Date.now()}`,
      code: `UYR${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      status: 'REQUESTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    } as Booking;
    return booking;
  },

  getBooking: async (id: string): Promise<Booking> => {
    await new Promise(r => setTimeout(r, 300));
    const found = mockBookings.find(b => b.id === id);
    if (found) return found;
    return {
      id,
      code: 'UYRABC123',
      status: 'ENROUTE',
      pickup: { lat: 13.0527, lng: 80.2511, address: '123 Anna Salai, Chennai' },
      hospital: mockHospitals[0],
      ambulanceType: 'BLS',
      patientName: 'John Doe',
      patientPhone: '+919876543210',
      contactPhone: '+919876543210',
      fare: 750,
      distance: 5000,
      eta: 600,
      ambulance: mockAmbulances[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  getRecentBookings: async (): Promise<Booking[]> => {
    await new Promise(r => setTimeout(r, 300));
    return mockBookings;
  },

  updateBookingStatus: async (id: string, status: BookingStatus): Promise<Booking> => {
    await new Promise(r => setTimeout(r, 300));
    const booking = await api.getBooking(id);
    return { ...booking, status, updatedAt: new Date().toISOString() };
  },

  // ── Emergency ─────────────────────────────────────────────
  createEmergencyRequest: async (data: {
    location: { lat: number; lng: number; address?: string };
    emergencyType: EmergencyType;
    patientName?: string;
    patientPhone?: string;
    medicalInfo?: { bloodType?: string; allergies?: string; conditions?: string };
  }): Promise<EmergencyRequest> => {
    await new Promise(r => setTimeout(r, 800));
    return {
      id: `EMR${Date.now()}`,
      location: data.location,
      emergencyType: data.emergencyType,
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      medicalInfo: data.medicalInfo,
      status: 'SEARCHING',
      offers: [],
      createdAt: new Date().toISOString(),
    };
  },

  getEmergencyOffers: async (requestId: string, location: { lat: number; lng: number }): Promise<Offer[]> => {
    await new Promise(r => setTimeout(r, 2000 + Math.random() * 2000));
    const onlineAmbulances = mockAmbulances.filter(a => a.status === 'ONLINE');
    return onlineAmbulances.map((amb, i) => {
      const dx = amb.location.lat - location.lat;
      const dy = amb.location.lng - location.lng;
      const dist = Math.sqrt(dx * dx + dy * dy) * 111000;
      return {
        id: `OFR${Date.now()}_${i}`,
        ambulance: amb,
        distance: Math.round(dist),
        eta: Math.round(dist / 500) * 60,
        fare: Math.round((amb.type === 'BLS' ? 500 : amb.type === 'ALS' ? 800 : 1200) + (dist / 1000) * (amb.type === 'BLS' ? 15 : amb.type === 'ALS' ? 20 : 25)),
      };
    }).sort((a, b) => a.eta - b.eta);
  },

  acceptOffer: async (offerId: string, requestId: string): Promise<Booking> => {
    await new Promise(r => setTimeout(r, 500));
    return {
      id: `BKG${Date.now()}`,
      code: `UYR${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      status: 'ACCEPTED',
      pickup: { lat: 13.0527, lng: 80.2511, address: 'Auto-detected location' },
      hospital: mockHospitals[0],
      ambulanceType: 'BLS',
      patientName: 'Emergency Patient',
      patientPhone: '+919876543210',
      contactPhone: '+919876543210',
      fare: 750,
      distance: 5000,
      eta: 480,
      ambulance: mockAmbulances[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  // ── Ambulances ────────────────────────────────────────────
  getNearbyAmbulances: async (lat: number, lng: number): Promise<Ambulance[]> => {
    await new Promise(r => setTimeout(r, 500));
    return mockAmbulances;
  },

  getAllAmbulances: async (): Promise<Ambulance[]> => {
    await new Promise(r => setTimeout(r, 300));
    return mockAmbulances;
  },

  // ── Hospitals ─────────────────────────────────────────────
  getNearbyHospitals: async (lat: number, lng: number, needs?: string[]): Promise<Hospital[]> => {
    await new Promise(r => setTimeout(r, 300));
    return needs
      ? mockHospitals.filter(h => needs.some(need => h.capabilities.includes(need)))
      : mockHospitals;
  },

  getAllHospitals: async (): Promise<Hospital[]> => {
    await new Promise(r => setTimeout(r, 300));
    return mockHospitals;
  },

  // ── Drivers ───────────────────────────────────────────────
  getAllDrivers: async (): Promise<Driver[]> => {
    await new Promise(r => setTimeout(r, 300));
    return mockDrivers;
  },

  // ── Dashboard ─────────────────────────────────────────────
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    await new Promise(r => setTimeout(r, 300));
    return {
      activeTrips: 18,
      avgEta: 8.2,
      completionRate: 94.5,
      totalBookings: 1247,
      totalRevenue: 1256800,
      onlineAmbulances: mockAmbulances.filter(a => a.status === 'ONLINE').length,
      totalAmbulances: mockAmbulances.length,
      onlineDrivers: mockDrivers.filter(d => d.isOnline).length,
      totalDrivers: mockDrivers.length,
      registeredHospitals: mockHospitals.length,
      todayTrips: 42,
      todayRevenue: 38500,
    };
  },

  getAnalytics: async (): Promise<AnalyticsData> => {
    await new Promise(r => setTimeout(r, 500));
    return generateAnalytics();
  },

  // ── Driver Portal ─────────────────────────────────────────
  getDriverEarnings: async (driverId: string): Promise<DriverEarnings> => {
    await new Promise(r => setTimeout(r, 300));
    return {
      today: 2850,
      thisWeek: 18400,
      thisMonth: 67200,
      todayTrips: 4,
      weekTrips: 24,
      monthTrips: 86,
      rating: 4.8,
      acceptanceRate: 92,
    };
  },

  getDriverTripHistory: async (driverId: string): Promise<TripHistory[]> => {
    await new Promise(r => setTimeout(r, 300));
    return generateTripHistory();
  },

  updateDriverStatus: async (driverId: string, isOnline: boolean): Promise<void> => {
    await new Promise(r => setTimeout(r, 300));
  },

  // ── Notifications ─────────────────────────────────────────
  getNotifications: async (): Promise<Notification[]> => {
    await new Promise(r => setTimeout(r, 200));
    return [
      { id: 'n1', type: 'REQUEST', title: 'New Emergency', message: 'Emergency request from Anna Nagar', timestamp: new Date().toISOString(), read: false },
      { id: 'n2', type: 'STATUS', title: 'Trip Completed', message: 'Trip UYR-A321 completed successfully', timestamp: new Date(Date.now() - 3600000).toISOString(), read: false },
      { id: 'n3', type: 'ALERT', title: 'Ambulance Breakdown', message: 'TN01GH3456 reported mechanical issue', timestamp: new Date(Date.now() - 7200000).toISOString(), read: true },
      { id: 'n4', type: 'SYSTEM', title: 'System Update', message: 'Platform maintenance scheduled tonight', timestamp: new Date(Date.now() - 86400000).toISOString(), read: true },
    ];
  },
};
