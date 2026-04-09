'use client';

import React, { useState } from 'react';
import SearchForm from '../components/SearchForm';
import RouteResult from '../components/RouteResult';

export default function Home() {
  const [searchParams, setSearchParams] = useState<{from: string, to: string} | null>(null);

  const handleSearch = (from: string, to: string) => {
    setSearchParams({ from, to });
  };

  return (
    <div className="container">
      <header style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Happy Come Back Home
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
          7시 전에 밥 먹으러 가자!
        </p>
      </header>

      <main>
        <section className="card" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>경로 검색</h2>
          <SearchForm onSearch={handleSearch} />
        </section>

        <section className="card">
          <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>최적의 경로 추천</h2>
          {searchParams ? (
            <RouteResult from={searchParams.from} to={searchParams.to} />
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
              출발지와 목적지를 입력하여 최적의 경로를 찾아보세요!
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
