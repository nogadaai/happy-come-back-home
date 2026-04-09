'use client';

import React, { useEffect, useState } from 'react';
import MapUI from './MapUI';

interface RouteResultProps {
  from: string;
  to: string;
}

export interface RouteSummaryData {
  from: string;
  to: string;
  totalTimeMinutes: number;
  transfers: number;
  detailedLinks: {
    linkId: string;
    speed: string;
    roadName: string;
    timeMin: number;
  }[];
}

export default function RouteResult({ from, to }: RouteResultProps) {
  const [loading, setLoading] = useState(false);
  const [trafficData, setTrafficData] = useState<RouteSummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!from || !to) return;

    const fetchRoute = async () => {
      setLoading(true);
      setError(null);
      try {
        // 구글 지도에서 받아온 출발지와 목적지를 파라미터로 현 백엔드 API에 전송
        const urlParams = new URLSearchParams({ from, to });
        const res = await fetch(`/api/traffic?${urlParams.toString()}`);
        if (!res.ok) {
          throw new Error('경로 데이터를 가져오는데 실패했습니다.');
        }
        const data = await res.json();
        setTrafficData(data.data || null);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('경로 데이터를 가져오는데 실패했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [from, to]);

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        최적의 경로를 계산 중입니다...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'red', background: '#ffe6e6', borderRadius: '8px' }}>
        {error}
      </div>
    );
  }

  if (trafficData) {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {from} <br/><br/>➡️ {to}
            </h3>
            <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>
              현재 실시간 도로 정보 요약입니다.
            </p>
            <div style={{ padding: '8px', background: 'var(--accent-primary)', color: '#fff', borderRadius: '4px', fontWeight: 'bold' }}>
              ⏱ 누적 소요시간: 약 {trafficData.totalTimeMinutes}분
            </div>
            <div style={{ padding: '8px', marginTop: '4px', background: '#e0e0e0', color: '#333', borderRadius: '4px', fontWeight: 'bold' }}>
              🔄 예상 환승: {trafficData.transfers}회
            </div>
            <ul style={{ marginTop: '16px', listStyleType: 'disc', paddingLeft: '20px' }}>
              {trafficData.detailedLinks && trafficData.detailedLinks.length > 0 ? (
                trafficData.detailedLinks.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: '8px', lineHeight: '1.4' }}>
                    <span style={{ fontWeight: 'bold' }}>도로구간 {item.linkId.slice(-4)}</span> ({item.roadName})<br />
                    속도: <strong style={{ color: Number(item.speed) < 20 ? 'red' : 'green' }}>{item.speed}km/h</strong> (약 {item.timeMin}분 소요)
                  </li>
                ))
              ) : (
                <li>검색된 교통 구간 목록이 없습니다.</li>
              )}
            </ul>
          </div>
        </div>
        <div style={{ flex: '1 1 400px', minHeight: '400px', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
          <MapUI from={from} to={to} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
      방금 전 업데이트된 실시간 교통 정보 대기 중...
    </div>
  );
}
