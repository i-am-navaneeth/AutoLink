import type { User, Pilot, RideRequest, Ride, MonthlyEarning } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';


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
