'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '400px',
  borderRadius: '8px'
};

const center = {
  lat: 37.5665,
  lng: 126.9780 // Default to Seoul
};

export default function MapUI({ from, to }: { from: string; to: string }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDirections = useCallback(async () => {
    if (!from || !to) return;
    try {
      const directionsService = new window.google.maps.DirectionsService();

      const result = await directionsService.route({
        origin: from,
        destination: to,
        travelMode: window.google.maps.TravelMode.TRANSIT, // Use TRANSIT or DRIVING based on what gives best traffic
        // Since Google Maps in Korea might only support TRANSIT officially for directions easily, let's try TRANSIT.
        // Actually, for traffic and shortest path, DRIVING is usually requested.
      });

      setDirections(result);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('출발지 또는 목적지의 경로를 찾을 수 없습니다.');
    }
  }, [from, to]);

  // DRIVING routing in Korea via Google Maps API might fail due to local regulations (often only Transit works). 
  // Let's use DRIVING first, if it fails fallback to TRANSIT.
  const fetchDrivingDirections = useCallback(async () => {
    if (!from || !to) return;
    setErrorMsg(null);
    try {
      const directionsService = new window.google.maps.DirectionsService();

      const result = await directionsService.route({
        origin: from,
        destination: to,
        travelMode: window.google.maps.TravelMode.DRIVING,
      });

      setDirections(result);
    } catch (err: unknown) {
      console.warn("Driving route failed, attempting transit...", err);
      fetchDirections();
    }
  }, [from, to, fetchDirections]);

  useEffect(() => {
    if (isLoaded && from && to) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchDrivingDirections();
    }
  }, [isLoaded, from, to, fetchDrivingDirections]);

  if (!isLoaded) {
    return <div style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Map Loading...</div>;
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {errorMsg && (
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, padding: 10, background: 'red', color: 'white', borderRadius: 4 }}>
          {errorMsg}
        </div>
      )}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={11}
      >
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: false,
              polylineOptions: {
                strokeColor: '#0066FF',
                strokeWeight: 5,
                strokeOpacity: 0.8
              }
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}
