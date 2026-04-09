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

  const fetchDirections = useCallback(async (targetMode: google.maps.TravelMode) => {
    if (!from || !to) return;
    
    try {
      const directionsService = new window.google.maps.DirectionsService();
      const result = await directionsService.route({
        origin: from,
        destination: to,
        travelMode: targetMode,
      });
      setDirections(result);
      setErrorMsg(null);
      return true;
    } catch (err: any) {
      console.warn(`[MapUI] Failed to load directions for ${targetMode}:`, err.code);
      return false;
    }
  }, [from, to]);

  useEffect(() => {
    if (isLoaded && from && to) {
      const load = async () => {
        const primaryMode = (mode === 'driving' || mode === 'taxi') 
          ? window.google.maps.TravelMode.DRIVING 
          : window.google.maps.TravelMode.TRANSIT;

        const success = await fetchDirections(primaryMode);
        
        // 한국 내 DRIVING 실패 시 TRANSIT으로 자동 Fallback
        if (!success && primaryMode === window.google.maps.TravelMode.DRIVING) {
          console.info("[MapUI] Retrying with TRANSIT fallback...");
          const fallbackSuccess = await fetchDirections(window.google.maps.TravelMode.TRANSIT);
          if (!fallbackSuccess) {
            setErrorMsg("경로를 찾을 수 없습니다. (한국 내 차량 탐색 제한)");
          } else {
             setErrorMsg("차량 경로 탐색이 제한되어 대중교통 경로를 표시합니다.");
          }
        } else if (!success) {
          setErrorMsg("경로 데이터를 불러올 수 없습니다.");
        }
      };
      load();
    }
  }, [isLoaded, from, to, mode, fetchDirections]);

  if (!isLoaded) {
    return <div style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Map Loading...</div>;
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {errorMsg && (
        <div style={{ 
          position: 'absolute', top: 12, left: 12, right: 12, zIndex: 10, 
          padding: '10px 14px', background: '#333', color: '#fff', 
          borderRadius: '8px', fontSize: '12px', fontWeight: '500',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)',
          opacity: 0.9
        }}>
          💡 {errorMsg}
        </div>
      )}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={11}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        }}
      >
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: {
                strokeColor: mode === 'driving' || mode === 'taxi' ? '#4A90E2' : '#34A853',
                strokeWeight: 6,
                strokeOpacity: 0.8
              }
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}
