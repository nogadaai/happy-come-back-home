'use client';

import React, { useState } from 'react';
import DaumPostcodeEmbed from 'react-daum-postcode';

export default function SearchForm({ onSearch }: { onSearch: (from: string, to: string) => void }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [openPostcode, setOpenPostcode] = useState<'from' | 'to' | null>(null);

  interface PostcodeData {
    address: string;
    addressType: string;
    bname: string;
    buildingName: string;
  }
  
  const handleComplete = (data: PostcodeData) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') extraAddress += data.bname;
      if (data.buildingName !== '') extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
      fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
    }

    if (openPostcode === 'from') setFrom(fullAddress);
    if (openPostcode === 'to') setTo(fullAddress);
    
    setOpenPostcode(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to) {
      alert('출발지와 목적지를 모두 입력해주세요.');
      return;
    }
    onSearch(from, to);
  };

  return (
    <div style={{ position: 'relative' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
            📍 출발지
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              readOnly
              placeholder="출발지를 검색하세요"
              value={from}
              onClick={() => setOpenPostcode('from')}
              style={{ 
                width: '100%', padding: '14px 16px', borderRadius: '12px', 
                border: '2px solid var(--border-color)', 
                background: 'var(--bg-primary)', color: 'var(--text-primary)', 
                cursor: 'pointer', outline: 'none', transition: 'border-color 0.2s' 
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>
            🏠 목적지
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              readOnly
              placeholder="목적지를 검색하세요"
              value={to}
              onClick={() => setOpenPostcode('to')}
              style={{ 
                width: '100%', padding: '14px 16px', borderRadius: '12px', 
                border: '2px solid var(--border-color)', 
                background: 'var(--bg-primary)', color: 'var(--text-primary)', 
                cursor: 'pointer', outline: 'none', transition: 'border-color 0.2s' 
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          style={{ 
            marginTop: '10px', padding: '16px', 
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, #4a90e2 100%)', 
            color: '#fff', border: 'none', borderRadius: '12px', 
            fontWeight: '700', fontSize: '16px', cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}
        >
          경로 검색 요약 보기
        </button>
      </form>

      {openPostcode && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '90%', maxWidth: '500px', zIndex: 1000,
          background: 'var(--bg-primary)', border: '1px solid var(--border-color)', 
          borderRadius: '16px', overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontWeight: 'bold' }}>주소 검색</span>
              <button type="button" onClick={() => setOpenPostcode(null)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', padding: '4px' }}>✕</button>
          </div>
          <DaumPostcodeEmbed onComplete={handleComplete} style={{ height: '450px' }} />
        </div>
      )}
      
      {openPostcode && (
        <div 
          onClick={() => setOpenPostcode(null)}
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 999 }} 
        />
      )}
    </div>
  );
}
