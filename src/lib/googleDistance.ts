type LocationPoint = {
  address: string;
  lat: number;
  lng: number;
};

export async function getDistanceInKm(
  pickup: LocationPoint,
  dropoff: LocationPoint
): Promise<number> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error('Google Maps API key missing');
  }

  const origins = `${pickup.lat},${pickup.lng}`;
  const destinations = `${dropoff.lat},${dropoff.lng}`;

  const url =
    `https://maps.googleapis.com/maps/api/distancematrix/json` +
    `?origins=${origins}` +
    `&destinations=${destinations}` +
    `&units=metric` +
    `&key=${apiKey}`;

  const res = await fetch(url);
  const json = await res.json();

  if (
    json.status !== 'OK' ||
    json.rows?.[0]?.elements?.[0]?.status !== 'OK'
  ) {
    console.error('Distance API response:', json);
    throw new Error('Failed to calculate distance');
  }

  const meters = json.rows[0].elements[0].distance.value;
  return meters / 1000;
}
