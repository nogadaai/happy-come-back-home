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
    console.log("Searching Route from:", from, "to:", to);
    onSearch(from, to);
  };

  return (
    <div style={{ position: 'relative' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
            출발지
          </label>
          <input
            type="text"
            readOnly
            placeholder="여기를 클릭하여 출발지를 검색하세요"
            value={from}
            onClick={() => setOpenPostcode('from')}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', cursor: 'pointer' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>
            목적지
          </label>
          <input
            type="text"
            readOnly
            placeholder="여기를 클릭하여 목적지를 검색하세요"
            value={to}
            onClick={() => setOpenPostcode('to')}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', cursor: 'pointer' }}
          />
        </div>
        <button
          type="submit"
          className="btn-primary"
          style={{ marginTop: '8px', padding: '12px', background: 'var(--accent-primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          최단 경로 찾기
        </button>
      </form>

      {openPostcode && (
        <div style={{
          position: 'absolute', top: '0', left: 0, width: '100%', zIndex: 100,
          border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden',
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', backgroundColor: '#333', padding: '0.6rem' }}>
            <button type="button" onClick={() => setOpenPostcode(null)} style={{ border: 'none', background: 'none', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>✕ 닫기</button>
          </div>
          <DaumPostcodeEmbed onComplete={handleComplete} style={{ height: '400px' }} />
        </div>
      )}
    </div>
  );
}
