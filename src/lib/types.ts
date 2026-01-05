/* =========================================================
   USER & PILOT
   ========================================================= */

export interface User {
  id: string;
  name: string;
  email?: string;
  mobile?: string;
  role: 'passenger' | 'pilot' | 'admin';
  avatarUrl?: string;

  metadata?: Record<string, any>; // preferences like quiet ride, share
  savedAddresses?: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  }[];

  preferredPaymentMethod?: 'CASH' | 'UPI' | 'CARD';
}

export interface Pilot extends User {
  role: 'pilot';

  licenseNumber?: string;
  licenseImageUrl?: string;

  vehicleNumber?: string;
  vehicleType?: 'AUTO' | 'TAXI' | 'MOTORBIKE';
  vehicleModel?: string;
  vehicleColor?: string;

  bankAccount?: any; // should be encrypted / server-only
  autoAccept?: boolean;
  availability?: boolean;

  preferredOperatingArea?: any; // geo polygon or center + radius
  subscriptionId?: string;

  isVerified: boolean;
}

/* =========================================================
   RIDE
   ========================================================= */

export interface Ride {
  id: string;

  passengerId: string;
  pilotId?: string;

  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;

  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;

  scheduledTime?: string;

  status:
    | 'requested'
    | 'matched'
    | 'accepted'
    | 'started'
    | 'completed'
    | 'cancelled';

  fareEstimate?: number;
  distanceKm?: number;

  metadata?: Record<string, any>;

  createdAt: string;
  updatedAt: string;
}

/* =========================================================
   SUBSCRIPTIONS / BILLING
   ========================================================= */

export interface Plan {
  id: string;
  name: string;
  interval: 'daily' | 'monthly' | 'yearly';
  price: number;
  features: Record<string, any>;
}

export interface LedgerEntry {
  id: string;
  pilotId: string;
  rideId?: string;

  amount: number;
  kind: 'payout' | 'fee' | 'refund' | 'bonus';

  createdAt: string;
}

/* =========================================================
   NOTIFICATIONS
   ========================================================= */

export interface Notification {
  id: string;
  userId: string;

  type: string;
  payload: Record<string, any>;

  read: boolean;
  createdAt: string;
}

/* =========================================================
   RIDE REQUEST (QUICK RIDE / MATCHING)
   ========================================================= */

export interface RideRequest {
  id: string;

  passenger: User;

  pickupLocation: string;
  destination: string;

  offeredFare: number;
  distance: number;

  status: 'pending' | 'accepted' | 'declined' | 'started';

  // ✅ NEW (do NOT rename anything else)
  rideDate: string | null; // null = instant (NOW) ride
}


/* =========================================================
   ANALYTICS
   ========================================================= */

export interface MonthlyEarning {
  month: string; // YYYY-MM
  total: number;
}
