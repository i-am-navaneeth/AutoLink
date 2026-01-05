'use client';

import { useEffect, useRef } from 'react';
import { GoogleMap } from '@react-google-maps/api';

type LatLng = {
  lat: number;
  lng: number;
};

type PassengerRideMapProps = {
  pilotLocation: LatLng | null;
};

const containerStyle = {
  width: '100%',
  height: '300px',
};

export default function PassengerRideMap({
  pilotLocation,
}: PassengerRideMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  // ✅ Create marker once map is ready
  useEffect(() => {
    if (!mapRef.current || !pilotLocation || markerRef.current) return;

    markerRef.current = new google.maps.Marker({
      map: mapRef.current,
      position: pilotLocation,
      icon: {
        url: '/pilot-marker.png', // optional
        scaledSize: new google.maps.Size(40, 40),
      },
    });
  }, [pilotLocation]);

  // ✅ Update marker position on pilot movement
  useEffect(() => {
    if (!pilotLocation || !markerRef.current) return;

    markerRef.current.setPosition({
      lat: pilotLocation.lat,
      lng: pilotLocation.lng,
    });

    mapRef.current?.panTo(pilotLocation);
  }, [pilotLocation]);

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      zoom={15}
      center={pilotLocation ?? { lat: 12.9716, lng: 77.5946 }}
      onLoad={(map) => {
        mapRef.current = map;
      }}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
      }}
    />
  );
}
