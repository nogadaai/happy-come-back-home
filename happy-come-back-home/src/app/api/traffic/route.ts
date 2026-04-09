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
    let rawTrafficData: any[] = [];
    try {
      rawTrafficData = await fetchTopisData<any>('TrafficInfo', 1, 5);
    } catch (e) {
      console.warn("TOPIS Error, falling back to mock data:", e);
      // API Key가 없거나(Netlify) TrafficInfo 명칭이 유효하지 않은 경우 안전하게 빈 배열 사용
      rawTrafficData = Array(5).fill({}); 
    }

    // Agent 2: Data Processing Logic - 프론트엔드용 최적화 경로 계산 로직을 모의(Mock) 수행
    let totalTimeMin = 0;
    
    const drivingProcessedLinks = rawTrafficData.map((item, index) => {
      // 속도(spd) 기반으로 자가용 시간 대략적 계산 모의
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

    const drivingTime = totalTimeMin;
    const transitTime = Math.round(totalTimeMin * 1.25 + 10); // 대중교통은 1.25배 + 10분 마진
    const taxiTime = Math.max(drivingTime - 5, 0); // 택시는 자가용보다 약간 빠르다고 가정
    
    const taxiCost = 4800 + Math.round(drivingTime * 200); // 택시비 목업: 기본요금 + 분당 가산금
    const transitCost = 1400; // 버스/지하철 기본운임

    const buildModeData = (modeTotalTime: number, cost: number, transfers: number) => ({
      from,
      to,
      totalTimeMinutes: modeTotalTime,
      transfers,
      cost,
      detailedLinks: drivingProcessedLinks,
    });

    const routeSummary = {
      transit: buildModeData(transitTime, transitCost, Math.floor(Math.random() * 2) + 1), // 환승 1~2회 모의
      driving: buildModeData(drivingTime, 0, 0),
      taxi: buildModeData(taxiTime, taxiCost, 0),
    };

    return NextResponse.json({ success: true, data: routeSummary });
  } catch (error: unknown) {
    const errObj = error instanceof Error ? error : new Error('Unknown error');
    return NextResponse.json({ success: false, message: errObj.message }, { status: 500 });
  }
}

