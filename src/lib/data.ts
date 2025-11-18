import type { User, Pilot, RideRequest, Ride, MonthlyEarning } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export const mockPassenger: User = {
  id: 'user-1',
  name: 'Alex Doe',
  email: 'alex.doe@email.com',
  mobile: '123-456-7890',
  gender: 'Male',
  avatarUrl: PlaceHolderImages.find(img => img.id === 'user-avatar-1')?.imageUrl || '',
};

export const mockPilot: Pilot = {
  id: 'pilot-1',
  name: 'John Ryder',
  email: 'john.ryder@email.com',
  mobile: '098-765-4321',
  gender: 'Male',
  avatarUrl: PlaceHolderImages.find(img => img.id === 'user-avatar-3')?.imageUrl || '',
  license: 'D12345678',
  panCard: 'ABCDE1234F',
  vehiclePhotoUrl: PlaceHolderImages.find(img => img.id === 'vehicle-photo-1')?.imageUrl || '',
  emergencyContact: 'Jane Ryder, 555-555-5555',
  vehicle: {
    number: 'KA 01 AB 1234',
    type: 'Auto-rickshaw',
  },
  isVerified: true,
};

export const availableRides: Ride[] = [
  {
    id: 'ride-1',
    pilot: {
        ...mockPilot, 
        name: 'Ben Stokes', 
        avatarUrl: PlaceHolderImages.find(img => img.id === 'user-avatar-4')?.imageUrl || '',
        vehicle: { number: 'MH 12 XY 5678', type: 'Cab' },
    },
    origin: 'Koramangala, Bangalore',
    destination: 'Indiranagar, Bangalore',
    departureTime: '10:00 AM',
    estimatedArrivalTime: '10:30 AM',
    availableSeats: 2,
    price: 120,
  },
  {
    id: 'ride-2',
    pilot: {
        ...mockPilot,
        vehicle: { number: 'TN 07 C 9876', type: 'Auto-rickshaw' },
        avatarUrl: PlaceHolderImages.find(img => img.id === 'user-avatar-3')?.imageUrl || '',
    },
    origin: 'Whitefield, Bangalore',
    destination: 'Marathahalli, Bangalore',
    departureTime: '11:00 AM',
    estimatedArrivalTime: '11:25 AM',
    availableSeats: 1,
    price: 80,
  },
];

export const rideRequests: RideRequest[] = [
  {
    id: 'req-1',
    passenger: {
        ...mockPassenger,
        name: 'Sarah Connor',
        avatarUrl: PlaceHolderImages.find(img => img.id === 'user-avatar-2')?.imageUrl || '',
    },
    pickupLocation: 'Bellandur, Bangalore',
    destination: 'Indiranagar, Bangalore',
    offeredFare: 70,
    distance: 5.2,
    status: 'pending',
  },
  {
    id: 'req-2',
    passenger: mockPassenger,
    pickupLocation: 'Jayanagar, Bangalore',
    destination: 'MG Road, Bangalore',
    offeredFare: 100,
    distance: 8.1,
    status: 'pending',
  },
  {
    id: 'req-3',
    passenger: { ...mockPassenger, name: 'Kyle Reese' },
    pickupLocation: 'Marathahalli, Bangalore',
    destination: 'Indiranagar, Bangalore',
    offeredFare: 90,
    distance: 4.5,
    status: 'pending',
  },
];

export const pilotDashboardData = {
  ridesCompleted: 124,
  todayEarnings: 1250,
  monthlyEarnings: 32500,
  monthlyEarningsData: [
    { month: "Jan", total: Math.floor(Math.random() * 5000) + 1000 },
    { month: "Feb", total: Math.floor(Math.random() * 5000) + 1000 },
    { month: "Mar", total: Math.floor(Math.random() * 5000) + 1000 },
    { month: "Apr", total: Math.floor(Math.random() * 5000) + 1000 },
    { month: "May", total: Math.floor(Math.random() * 5000) + 1000 },
    { month: "Jun", total: 32500 },
  ] as MonthlyEarning[],
};
