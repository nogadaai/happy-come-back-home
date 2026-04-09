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

    const buildTransitLinks = (data: any[]) => {
      const walkSpeed = 4;
      const busSpeed = Number(data[0]?.spd || 20);
      const subwaySpeed = 45;

      return [
        {
          linkId: 'TRANSIT-0', speed: walkSpeed, roadName: 'sk플래닛 -> 판교역 버스정류장 (도보)',
          timeMin: 7, transportMode: 'WALKING', arrivalInfo: ''
        },
        {
          linkId: 'TRANSIT-1', speed: busSpeed, roadName: '판교역 버스정류장 (721번 버스 이용)',
          timeMin: 12, transportMode: 'BUS', arrivalInfo: '3분 후 도착'
        },
        {
          linkId: 'TRANSIT-2', speed: walkSpeed, roadName: '판교역 (환승 이동)',
          timeMin: 5, transportMode: 'WALKING', arrivalInfo: '환승 팁: 1번 출구 이용'
        },
        {
          linkId: 'TRANSIT-3', speed: subwaySpeed, roadName: '2호선 지하철 (건대입구역 방면)',
          timeMin: 15, transportMode: 'SUBWAY', arrivalInfo: '곧 도착'
        },
        {
          linkId: 'TRANSIT-4', speed: walkSpeed, roadName: '건국대학교 정문 (도보 이동)',
          timeMin: 8, transportMode: 'WALKING', arrivalInfo: ''
        }
      ];
    };

    const processStandardLinks = (data: any[], mode: 'driving' | 'taxi') => {
      const method = mode === 'taxi' ? '택시 이용' : '자가용 주행';
      return data.map((item, index) => {
        const speed = Number(item.spd || 30);
        const dist = 1.2;
        const timeMin = Math.round((dist / speed) * 60);
        return {
          linkId: item.link_id || `LINK-${index}`,
          speed: speed,
          roadName: `${item.road_nm || "도로 구간"} (${method})`,
          timeMin: timeMin,
          transportMode: mode === 'taxi' ? 'TAXI' : 'DRIVING',
          arrivalInfo: '',
        };
      });
    };

    const transitLinks = buildTransitLinks(rawTrafficData);
    const drivingLinks = processStandardLinks(rawTrafficData, 'driving');
    const taxiLinks = processStandardLinks(rawTrafficData, 'taxi');

    const calculateTotalTime = (links: any[]) => links.reduce((acc, curr) => acc + curr.timeMin, 0);

    const routeSummary = {
      transit: {
        from, to,
        totalTimeMinutes: calculateTotalTime(transitLinks),
        transfers: 1,
        cost: 1400,
        detailedLinks: transitLinks,
      },
      driving: {
        from, to,
        totalTimeMinutes: calculateTotalTime(drivingLinks),
        transfers: 0,
        cost: 0,
        detailedLinks: drivingLinks,
      },
      taxi: {
        from, to,
        totalTimeMinutes: Math.max(calculateTotalTime(drivingLinks) - 5, 5),
        transfers: 0,
        cost: 4800 + Math.round(calculateTotalTime(drivingLinks) * 200),
        detailedLinks: taxiLinks,
      },
    };

    return NextResponse.json({ success: true, data: routeSummary });
  } catch (error: unknown) {
    const errObj = error instanceof Error ? error : new Error('Unknown error');
    return NextResponse.json({ success: false, message: errObj.message }, { status: 500 });
  }
}

