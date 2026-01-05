// src/lib/fare.ts
export function calculateFare(distanceKm: number) {
  const BASE_FARE = 20;     // ₹
  const PER_KM = 12;        // ₹ per km

  return Math.round(BASE_FARE + distanceKm * PER_KM);
}
