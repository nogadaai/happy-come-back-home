import { NextResponse } from 'next/server';
import { fetchTopisData } from '../../../lib/api/topis';

export const dynamic = 'force-dynamic'; // 필요 시 /api/traffic/route.ts 최상단에 추가

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from') || '알 수 없음';
    const to = searchParams.get('to') || '알 수 없음';

    console.log(`[API Search] from: ${from}, to: ${to}`);
    
    // SEOUL TOPIS에서 기본 데이터 가져오기 (1부터 5까지 링크)
    const rawTrafficData = await fetchTopisData<any>('TrafficInfo', 1, 5);

    // Agent 2: Data Processing Logic - 프론트엔드용 최적화 경로 계산 로직을 모의(Mock) 수행
    let totalTimeMin = 0;
    
    const processedLinks = rawTrafficData.map((item, index) => {
      // 속도(spd) 기반으로 소요 시간 대략적 계산 모의
      const speed = Number(item.spd || 30);
      const dist = 5; // 구간 길이 임의 설정 5km
      const timeMin = Math.round((dist / speed) * 60); 
      totalTimeMin += timeMin;
      
      return {
        linkId: item.link_id || `MOCK-${index}`,
        speed: item.spd || "0",
        roadName: item.road_nm || "알 수 없는 도로",
        timeMin: timeMin,
      };
    });

    const routeSummary = {
      from,
      to,
      totalTimeMinutes: totalTimeMin,
      transfers: Math.floor(Math.random() * 2), // 환승 0~1회 모의
      detailedLinks: processedLinks,
    };

    return NextResponse.json({ success: true, data: routeSummary });
  } catch (error: unknown) {
    const errObj = error instanceof Error ? error : new Error('Unknown error');
    return NextResponse.json({ success: false, message: errObj.message }, { status: 500 });
  }
}

