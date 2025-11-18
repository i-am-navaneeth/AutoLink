export interface User {
    id: string;
    name: string;
    email?: string;
    mobile?: string;
    gender?: 'Male' | 'Female' | 'Other';
    avatarUrl: string;
  }
  
  export interface Pilot extends User {
    license: string;
    panCard: string;
    vehiclePhotoUrl: string;
    emergencyContact: string;
    vehicle: {
      number: string;
      type: 'Auto-rickshaw' | 'Cab';
    };
    isVerified: boolean;
  }
  
  export interface Ride {
    id: string;
    pilot: Pilot;
    origin: string;
    destination: string;
    departureTime: string;
    estimatedArrivalTime: string;
    availableSeats: number;
    price: number;
  }
  
  export interface RideRequest {
    id: string;
    passenger: User;
    pickupLocation: string;
    destination: string;
    offeredFare: number;
    distance: number;
    status: 'pending' | 'accepted' | 'declined' | 'started';
  }
  
  export interface MonthlyEarning {
    month: string;
    total: number;
  }
  