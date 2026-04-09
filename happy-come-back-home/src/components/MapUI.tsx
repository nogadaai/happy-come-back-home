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

export default function MapUI({ from, to, mode = 'driving' }: { from: string; to: string; mode?: 'transit' | 'driving' | 'taxi' }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDirections = useCallback(async () => {
    if (!from || !to) return;
    setErrorMsg(null);
    try {
      const directionsService = new window.google.maps.DirectionsService();

      const travelMode = mode === 'transit' 
        ? window.google.maps.TravelMode.TRANSIT 
        : window.google.maps.TravelMode.DRIVING;

      const result = await directionsService.route({
        origin: from,
        destination: to,
        travelMode,
      });

      setDirections(result);
    } catch (err: any) {
      console.error(err);
      let msg = `[${mode}] 경로를 불러올 수 없습니다.`;
      
      if (err.code === 'ZERO_RESULTS') {
        msg = '해당 구간의 경로를 찾을 수 없습니다. (국내 자가용 경로는 구글 맵에서 제한될 수 있습니다.)';
      } else if (err.code === 'REQUEST_DENIED') {
        msg = '구글 맵 Directions API 권한이 거부되었습니다. 콘솔 설정을 확인해주세요.';
      } else if (err.code === 'OVER_QUERY_LIMIT') {
        msg = 'API 호출 할당량을 초과했습니다.';
      }
      
      setErrorMsg(msg);
      setDirections(null);
    }
  }, [from, to, mode]);

  useEffect(() => {
    if (isLoaded && from && to) {
      fetchDirections();
    }
  }, [isLoaded, from, to, fetchDirections]);

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
