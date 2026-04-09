'use client';

import React, { useEffect, useState } from 'react';
import MapUI from './MapUI';

interface RouteResultProps {
  from: string;
  to: string;
}

export interface RouteModeData {
  from: string;
  to: string;
  totalTimeMinutes: number;
  transfers: number;
  cost: number;
  detailedLinks: {
    linkId: string;
    speed: number;
    roadName: string;
    timeMin: number;
    transportMode?: 'WALKING' | 'BUS' | 'SUBWAY' | 'DRIVING' | 'TAXI';
    arrivalInfo?: string;
  }[];
}

export interface RouteSummaryData {
  transit: RouteModeData;
  driving: RouteModeData;
  taxi: RouteModeData;
}

type TabMode = 'transit' | 'driving' | 'taxi';

const getTransportIcon = (mode?: string) => {
  switch (mode) {
    case 'WALKING': return '🚶';
    case 'BUS': return '🚌';
    case 'SUBWAY': return '🚇';
    case 'DRIVING': return '🚗';
    case 'TAXI': return '🚕';
    default: return '📍';
  }
};

export default function RouteResult({ from, to }: RouteResultProps) {
  const [loading, setLoading] = useState(false);
  const [trafficData, setTrafficData] = useState<RouteSummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabMode>('transit');

  useEffect(() => {
    if (!from || !to) return;

    const fetchRoute = async () => {
      setLoading(true);
      setError(null);
      try {
        const urlParams = new URLSearchParams({ from, to });
        const res = await fetch(`/api/traffic?${urlParams.toString()}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || '경로 데이터를 가져오는데 실패했습니다.');
        }
        const data = await res.json();
        setTrafficData(data.data || null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : '네트워크 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [from, to]);

  if (loading) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '24px', marginBottom: '16px' }}>🛰️</div>
        <div style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>실시간 교통 상황과 구글 탐색 경로를 결합 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#ff4d4f', background: '#fff2f0', borderRadius: '12px', border: '1px solid #ffccc7' }}>
        <strong>⚠️ 안내:</strong> {error}
      </div>
    );
  }

  if (trafficData) {
    const activeData = trafficData[activeTab];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Tab Selection */}
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-secondary)', padding: '6px', borderRadius: '14px' }}>
          {(['transit', 'driving', 'taxi'] as TabMode[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1, padding: '12px', border: 'none', borderRadius: '10px', cursor: 'pointer',
                fontWeight: 'bold', fontSize: '14px', transition: 'all 0.2s',
                background: activeTab === tab ? '#fff' : 'transparent',
                color: activeTab === tab ? 'var(--accent-primary)' : 'var(--text-secondary)',
                boxShadow: activeTab === tab ? '0 4px 6px -1px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              {tab === 'transit' ? '🚌 대중교통' : tab === 'driving' ? '🚗 자가용' : '🚕 택시'}
            </button>
          ))}
        </div>

        {/* Info Card */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <div style={{ marginBottom: '4px' }}>분석된 경로 요약</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    {activeData.from.split(' (')[0]} → {activeData.to.split(' (')[0]}
                  </div>
                </div>
                <div style={{ padding: '4px 8px', background: '#e6f7ff', color: '#1890ff', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #91d5ff' }}>
                  실시간 TOPIS 반영
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', marginBottom: '20px' }}>
                <span style={{ fontSize: '32px', fontWeight: '800', color: 'var(--accent-primary)' }}>{activeData.totalTimeMinutes}</span>
                <span style={{ fontSize: '16px', fontWeight: '600', paddingBottom: '6px' }}>분 소요 예정</span>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                {activeTab === 'transit' && <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>환승 {activeData.transfers}회</div>}
                {activeData.cost > 0 && <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>예상 {activeData.cost.toLocaleString()}원</div>}
              </div>

              {/* Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {activeData.detailedLinks.map((item, idx) => (
                  <div key={idx} style={{ position: 'relative', paddingLeft: '32px', paddingBottom: '24px' }}>
                    {/* Line */}
                    {idx !== activeData.detailedLinks.length - 1 && (
                      <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: 0, width: '2px', background: 'var(--border-color)' }} />
                    )}
                    {/* Icon Dot */}
                    <div style={{ 
                      position: 'absolute', left: 0, top: 0, width: '24px', height: '24px', 
                      borderRadius: '50%', background: 'var(--bg-primary)', border: '2px solid var(--border-color)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', zIndex: 2
                    }}>
                      {getTransportIcon(item.transportMode)}
                    </div>
                    {/* Text */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '2px' }}>{item.roadName}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>약 {item.timeMin}분 {item.arrivalInfo && `· ${item.arrivalInfo}`}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div style={{ width: '100%', height: '400px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              <MapUI from={from} to={to} mode={activeTab} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-secondary)', border: '2px dashed var(--border-color)', borderRadius: '16px' }}>
      위의 양식을 입력하여 최적의 퇴근 경로를 확인하세요.
    </div>
  );
}
