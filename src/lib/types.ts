export type BookingStatus =
  | 'REQUESTED'
  | 'OFFERING'
  | 'ACCEPTED'
  | 'ENROUTE'
  | 'AT_PICKUP'
  | 'TO_HOSPITAL'
  | 'COMPLETED'
  | 'CANCELED';

export type AmbulanceType = 'BLS' | 'ALS' | 'NEO';

export type EmergencyType = 'CARDIAC' | 'ACCIDENT' | 'BREATHING' | 'PREGNANCY' | 'BURN' | 'OTHER';

export type DriverStatus = 'ONLINE' | 'OFFLINE' | 'BUSY';

export type AmbulanceStatus = 'ONLINE' | 'OFFLINE' | 'BUSY';

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface Hospital {
  id: string;
  name: string;
  location: Location;
  capabilities: string[];
  distance?: number;
  eta?: number;
  phone?: string;
  subscriptionPlan?: 'FREE' | 'BASIC' | 'PRO';
  activePatients?: number;
  totalBeds?: number;
  availableBeds?: number;
}

export interface Ambulance {
  id: string;
  registration: string;
  type: AmbulanceType;
  location: Location;
  status: AmbulanceStatus;
  driver?: Driver;
  lastActive?: string;
  totalTrips?: number;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  rating: number;
  avatar?: string;
  licenseNumber?: string;
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  totalTrips?: number;
  joinedAt?: string;
  isOnline?: boolean;
}

export interface Booking {
  id: string;
  code: string;
  status: BookingStatus;
  pickup: Location;
  hospital: Hospital;
  ambulanceType: AmbulanceType;
  emergencyType?: EmergencyType;
  patientName: string;
  patientPhone: string;
  contactPhone: string;
  fare: number;
  distance: number;
  eta: number;
  ambulance?: Ambulance;
  route?: [number, number][];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  medicalInfo?: MedicalInfo;
}

export interface MedicalInfo {
  bloodType?: string;
  allergies?: string;
  conditions?: string;
  medications?: string;
}

export interface Offer {
  id: string;
  ambulance: Ambulance;
  distance: number;
  eta: number;
  fare: number;
}

export interface EmergencyRequest {
  id: string;
  location: Location;
  emergencyType: EmergencyType;
  patientName?: string;
  patientPhone?: string;
  medicalInfo?: MedicalInfo;
  status: 'SEARCHING' | 'OFFERS_RECEIVED' | 'DISPATCHED' | 'CANCELED';
  offers: Offer[];
  selectedOffer?: Offer;
  createdAt: string;
}

export interface TripHistory {
  id: string;
  code: string;
  date: string;
  pickup: string;
  hospital: string;
  fare: number;
  distance: number;
  duration: number; // minutes
  status: 'COMPLETED' | 'CANCELED';
  rating?: number;
  patientName: string;
  ambulanceType: AmbulanceType;
}

export interface DashboardMetrics {
  activeTrips: number;
  avgEta: number;
  completionRate: number;
  totalBookings: number;
  totalRevenue: number;
  onlineAmbulances: number;
  totalAmbulances: number;
  onlineDrivers: number;
  totalDrivers: number;
  registeredHospitals: number;
  todayTrips: number;
  todayRevenue: number;
}

export interface AnalyticsData {
  tripsOverTime: { date: string; trips: number; revenue: number }[];
  tripsByType: { type: AmbulanceType; count: number; revenue: number }[];
  tripsByStatus: { status: string; count: number }[];
  responseTimeTrend: { date: string; avgMinutes: number }[];
  peakHours: { hour: number; trips: number }[];
  hospitalLoad: { hospital: string; patients: number; capacity: number }[];
}

export interface DriverEarnings {
  today: number;
  thisWeek: number;
  thisMonth: number;
  todayTrips: number;
  weekTrips: number;
  monthTrips: number;
  rating: number;
  acceptanceRate: number;
}

export interface Notification {
  id: string;
  type: 'REQUEST' | 'STATUS' | 'ALERT' | 'SYSTEM';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}
