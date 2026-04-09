import { NextResponse } from 'next/server';
import { fetchTopisData } from '../../../lib/api/topis';
import { addSearchHistory } from '../../../lib/firebase';

export const dynamic = 'force-dynamic';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!from || !to) {
      return NextResponse.json({ success: false, message: '출발지와 목적지가 필요합니다.' }, { status: 400 });
    }

    console.log(`[API Search] from: ${from}, to: ${to}`);

    // 1. Google Maps Directions API 호출 (서버사이드)
    // 한국 내에서는 DRIVING이 ZERO_RESULTS를 반환할 수 있으므로 실패 시 TRANSIT으로 재시도
    let googleUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&key=${GOOGLE_MAPS_API_KEY}&mode=driving&language=ko`;
    let googleRes = await fetch(googleUrl);
    let googleData = await googleRes.json();

    // DRIVING 실패 시 TRANSIT으로 재시도
    if (googleData.status === 'ZERO_RESULTS') {
      console.warn("[Google API] DRIVING failed, retrying with TRANSIT...");
      googleUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&key=${GOOGLE_MAPS_API_KEY}&mode=transit&language=ko`;
      googleRes = await fetch(googleUrl);
      googleData = await googleRes.json();
    }

    if (googleData.status !== 'OK') {
      console.error("[Google API Error]", googleData);
      throw new Error(`Google Maps API Error: ${googleData.status}. 한국 내 차량 경로는 구글 맵에서 제한될 수 있습니다. 대중교통 경로를 확인해주세요.`);
    }

    const leg = googleData.routes[0].legs[0];
    const baseDurationMin = Math.round(leg.duration.value / 60);

    // 2. SEOUL TOPIS 실시간 교통량/속도 데이터 가져오기 (가중치 계산용)
    let topisWeight = 1.0;
    try {
      const trafficData = await fetchTopisData<any>('TrafficInfo', 1, 20);
      if (trafficData && trafficData.length > 0) {
        const avgSpeed = trafficData.reduce((acc, curr) => acc + (Number(curr.spd) || 30), 0) / trafficData.length;
        if (avgSpeed < 25) topisWeight = 1.35;
        else if (avgSpeed < 35) topisWeight = 1.15;
        else if (avgSpeed >= 50) topisWeight = 0.9;
      }
    } catch (e) {
      console.warn("[TOPIS] Weight fetch failed, using 1.0", e);
    }

    const finalTimeMinutes = Math.round(baseDurationMin * topisWeight);

    // 3. 응답 구조화
    const detailedLinks = leg.steps.map((step: any, index: number) => ({
      linkId: `STEP-${index}`,
      speed: 0, 
      roadName: step.html_instructions.replace(/<[^>]*>?/gm, ''),
      timeMin: Math.round(step.duration.value / 60) || 1,
      transportMode: step.travel_mode || 'DRIVING',
      arrivalInfo: step.distance.text
    }));

    const routeSummary = {
      transit: {
        from, to,
        totalTimeMinutes: finalTimeMinutes,
        transfers: googleData.routes[0].legs[0].steps.filter((s:any) => s.transit_details).length,
        cost: 1400,
        detailedLinks, 
      },
      driving: {
        from, to,
        totalTimeMinutes: Math.round(finalTimeMinutes * 0.8), // 대략적 추정
        transfers: 0,
        cost: 0,
        detailedLinks: googleData.request?.travel_mode === 'DRIVING' ? detailedLinks : [],
      },
      taxi: {
        from, to,
        totalTimeMinutes: Math.max(Math.round(finalTimeMinutes * 0.8), 5),
        transfers: 0,
        cost: 4800 + Math.round(finalTimeMinutes * 350),
        detailedLinks: [],
      },
    };

    // 4. Firebase 기록
    addSearchHistory(from, to, finalTimeMinutes).catch(err => console.error("[Firebase Error]", err));

    return NextResponse.json({ success: true, data: routeSummary });
  } catch (error: unknown) {
    console.error("[API Error]", error);
    const errObj = error instanceof Error ? error : new Error('Unknown error');
    return NextResponse.json({ success: false, message: errObj.message }, { status: 500 });
  }
}
