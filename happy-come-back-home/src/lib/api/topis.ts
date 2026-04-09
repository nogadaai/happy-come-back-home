export interface TopisResponse<T> {
  [key: string]: {
    list_total_count: number;
    RESULT: {
      CODE: string;
      MESSAGE: string;
    };
    row: T[];
  };
}

const TOPIS_BASE_URL = "http://openapi.seoul.go.kr:8088";
const API_KEY = process.env.SEOUL_TOPIS_API_KEY || "";

/**
 * 서울 TOPIS API 통신 모듈
 * @param serviceName 호출할 서비스 명 (예: 'TrafficInfo')
 * @param startIndex 시작 인덱스
 * @param endIndex 종료 인덱스
 * @param format 응답 포맷 (json, xml 등)
 * @returns 응답 데이터
 */
export async function fetchTopisData<T>(
  serviceName: string,
  startIndex: number = 1,
  endIndex: number = 5,
  format: string = "json"
): Promise<T[]> {
  const url = `${TOPIS_BASE_URL}/${API_KEY}/${format}/${serviceName}/${startIndex}/${endIndex}/`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃
  
  const startTime = Date.now();
  
  try {
    let response;
    let retries = 2; // 최대 2회 재시도
    
    while (retries >= 0) {
      try {
        response = await fetch(url, {
          signal: controller.signal,
          next: { revalidate: 60 } // Next.js 캐싱 1분
        });
        if (response.ok) break;
        if (response.status === 429) {
          logError("RATE_LIMIT", `TOPIS API [${serviceName}] Rate Limited (429). Retrying...`);
        } else {
          throw new Error(`HTTP Error Status: ${response.status}`);
        }
      } catch (err) {
        if (retries === 0) throw err;
      }
      retries--;
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기 후 재시도
    }

    
    clearTimeout(timeoutId);
    
    if (!response || !response.ok) {
      throw new Error(`Failed after retries or HTTP Error Status: ${response?.status}`);
    }
    
    const data = (await response.json()) as TopisResponse<T>;
    const responseTime = Date.now() - startTime;
    
    // 구조가 맞는지 확인
    if (data && data[serviceName] && data[serviceName].RESULT.CODE === "INFO-000") {
      logInfo(`TOPIS API [${serviceName}] Call Success. Time: ${responseTime}ms`);
      return data[serviceName].row;
    } else {
      const errCode = data?.[serviceName]?.RESULT?.CODE || "UNKNOWN";
      const errMsg = data?.[serviceName]?.RESULT?.MESSAGE || "Wrong Response Structure";
      throw new Error(`[${errCode}] ${errMsg}`);
    }
    
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        logError("TIMEOUT", `TOPIS API [${serviceName}] Timeout exceeded 5000ms`);
        throw new Error("요청 시간이 초과되었습니다 (Timeout).");
      } else {
        logError("API_FAIL", `TOPIS API [${serviceName}] Failed: ${error.message}`);
        throw error;
      }
    }
    logError("API_FAIL", `TOPIS API [${serviceName}] Failed: Unknown error`);
    throw new Error("Unknown error");
  }
}

// 에러/정보 로깅 유틸 (포맷: [Time] [Level] [Module] [ErrorCode] Message)
function logInfo(message: string) {
  const now = new Date().toISOString();
  console.log(`[${now}] [INFO] [TopisAPI] [NONE] ${message}`);
}

function logError(code: string, message: string) {
  const now = new Date().toISOString();
  console.error(`[${now}] [ERROR] [TopisAPI] [${code}] ${message}`);
}
