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
    const activeData = trafficData[activeTab];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Tab UI Elements */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid var(--border-color)', paddingBottom: '8px' }}>
            <button
              onClick={() => setActiveTab('transit')}
              style={{
                flex: 1, padding: '12px', border: 'none', borderRadius: '8px 8px 0 0', cursor: 'pointer',
                fontWeight: 'bold', fontSize: '15px',
                background: activeTab === 'transit' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: activeTab === 'transit' ? '#fff' : 'var(--text-primary)'
              }}
            >
              🚌 대중교통
            </button>
            <button
              onClick={() => setActiveTab('driving')}
              style={{
                flex: 1, padding: '12px', border: 'none', borderRadius: '8px 8px 0 0', cursor: 'pointer',
                fontWeight: 'bold', fontSize: '15px',
                background: activeTab === 'driving' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: activeTab === 'driving' ? '#fff' : 'var(--text-primary)'
              }}
            >
              🚗 자가용
            </button>
            <button
              onClick={() => setActiveTab('taxi')}
              style={{
                flex: 1, padding: '12px', border: 'none', borderRadius: '8px 8px 0 0', cursor: 'pointer',
                fontWeight: 'bold', fontSize: '15px',
                background: activeTab === 'taxi' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: activeTab === 'taxi' ? '#fff' : 'var(--text-primary)'
              }}
            >
              🚕 택시
            </button>
        </div>

        {/* Content Section */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {activeData.from} <br/><br/>➡️ {activeData.to}
              </h3>
              <p style={{ marginTop: '8px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                선택하신 <strong style={{color: 'var(--accent-primary)'}}>
                 {activeTab === 'transit' ? '대중교통' : activeTab === 'driving' ? '자가용' : '택시'}
                </strong> 경로 정보입니다.
              </p>
              
              <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>누적 소요시간</span>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--accent-primary)' }}>약 {activeData.totalTimeMinutes}분</span>
                </div>
                
                {activeTab === 'transit' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>예상 환승</span>
                    <span style={{ fontWeight: 'bold' }}>{activeData.transfers}회</span>
                  </div>
                )}
                
                {activeData.cost > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>예상 비용</span>
                    <span style={{ fontWeight: 'bold', color: '#ff5722' }}>{activeData.cost.toLocaleString()}원</span>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeData.detailedLinks && activeData.detailedLinks.length > 0 ? (
                  activeData.detailedLinks.map((item, idx) => {
                    const isTransfer = item.roadName.includes('환승') || (item.transportMode === 'WALKING' && idx > 0 && idx < activeData.detailedLinks.length - 1);
                    return (
                      <div key={idx} style={{ 
                          position: 'relative', paddingLeft: '24px', paddingBottom: '16px',
                          borderLeft: idx === activeData.detailedLinks.length - 1 ? 'none' : '2px solid var(--border-color)'
                      }}>
                        <div style={{ 
                            position: 'absolute', left: '-12px', top: '0', width: '24px', height: '24px', 
                            background: isTransfer ? '#fffbeb' : 'var(--bg-primary)', 
                            border: `2px solid ${isTransfer ? '#f59e0b' : 'var(--border-color)'}`, 
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px',
                            zIndex: 1
                        }}>
                          {getTransportIcon(item.transportMode)}
                        </div>
                        <div style={{ 
                            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                            background: isTransfer ? '#fffbeb' : 'transparent',
                            padding: isTransfer ? '8px' : '0',
                            borderRadius: '8px',
                            marginLeft: isTransfer ? '-8px' : '0'
                        }}>
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '14px', color: isTransfer ? '#b45309' : 'var(--text-primary)' }}>
                              {item.roadName}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                               {item.speed > 0 && item.transportMode !== 'WALKING' && <span>속도: {item.speed}km/h</span>}
                               {item.speed > 0 && item.transportMode !== 'WALKING' && <span style={{margin: '0 4px'}}>|</span>}
                               <span>약 {item.timeMin}분 소요</span>
                            </div>
                          </div>
                          {item.arrivalInfo && (
                            <div style={{ 
                                padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold',
                                background: item.arrivalInfo.includes('곧') || item.arrivalInfo.includes('진입') || item.arrivalInfo.includes('팁') ? '#fff5f5' : '#f0fdf4',
                                color: item.arrivalInfo.includes('곧') || item.arrivalInfo.includes('진입') || item.arrivalInfo.includes('팁') ? '#e53e3e' : '#15803d',
                                border: `1px solid ${item.arrivalInfo.includes('곧') || item.arrivalInfo.includes('진입') || item.arrivalInfo.includes('팁') ? '#feb2b2' : '#bbf7d0'}`
                            }}>
                               {item.arrivalInfo}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p>검색된 교통 구간 목록이 없습니다.</p>
                )}
              </div>
            </div>
          </div>
          <div style={{ flex: '1 1 400px', minHeight: '400px', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
            <MapUI from={from} to={to} mode={activeTab} />
          </div>
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
