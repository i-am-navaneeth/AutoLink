type FareInput = {
  distanceKm: number;
  rideType: 'quick' | 'share';
  isNight?: boolean;
};

export function calculateFare({
  distanceKm,
  rideType,
  isNight = false,
}: FareInput): number {
  let fare = 0;

  /* ---------- QUICK RIDE ---------- */
  if (rideType === 'quick') {
    if (distanceKm <= 1) {
      fare = 30;
    } else {
      fare = 30 + (distanceKm - 1) * 16;
    }
  }

  /* ---------- SHARE RIDE ---------- */
  if (rideType === 'share') {
    if (distanceKm <= 2) {
      fare = 20;
    } else {
      fare = 20 + (distanceKm - 2) * 4;
    }
  }

  /* ---------- NIGHT FARE ---------- */
  if (isNight) {
    fare = fare * 1.5;
  }

  return Math.round(fare);
}
