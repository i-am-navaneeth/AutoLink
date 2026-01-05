'use client';

import { GoogleMap, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import { useEffect, useState } from 'react';

type LatLng = {
  lat: number;
  lng: number;
};

type RouteMapProps = {
  pickup: LatLng;
  dropoff: LatLng;
  onRouteCalculated?: (data: {
    distanceKm: number;
    durationMin: number;
  }) => void;
};

const containerStyle = {
  width: '100%',
  height: '350px',
};

export default function RouteMap({
  pickup,
  dropoff,
  onRouteCalculated,
}: RouteMapProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ['places'],
  });

  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    const service = new google.maps.DirectionsService();

    service.route(
      {
        origin: pickup,
        destination: dropoff,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          setDirections(result);

          const leg = result.routes[0].legs[0];
          const distanceKm = leg.distance!.value / 1000;
          const durationMin = Math.ceil(leg.duration!.value / 60);

          onRouteCalculated?.({
            distanceKm,
            durationMin,
          });
        }
      }
    );
  }, [isLoaded, pickup, dropoff]);

  if (!isLoaded) return null;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={pickup}
      zoom={14}
    >
      {directions && <DirectionsRenderer directions={directions} />}
    </GoogleMap>
  );
}
