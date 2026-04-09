# 기술 사양서 및 구현 계획 (Plans.md)

## 1. 개요
*현업 문제*: 퇴근시간 실시간 교통상황이 반영된 정확한 귀가 시간 및 최단 경로 파악
*솔루션*: Next.js Web UI 및 SEOUL TOPIS 오픈 API 데이터, Firebase DB를 활용한 길찾기 서비스 구현

## 2. 모듈 아키텍처 (Architecture)
### 프론트엔드 (UI/UX)
- **프레임워크**: Next.js 15 (App Router 기반)
- **스타일링**: Tailwind CSS
- **컴포넌트 설계**: Server Component 중심 구성으로 SEO 및 렌더링 최적화 보장 (Client Component는 필요시 폼, 인터랙티브 맵에 배치)

### 인프라 / 백엔드 연동
- **BaaS**: Firebase (Authentication: 익명/OAuth, Database: Cloud Firestore)
- **API 연동**: SEOUL TOPIS 오픈 API 통신 모듈 (Next.js 로직 내 Server Actions 또는 API Routes를 통해 키 보안 유지)

## 3. 핵심 모듈별 책임 (Single Responsibility)
- **`lib/firebase.ts`**: Firebase App 인스턴스 초기화 및 DB 인스턴스 반환 로직 담당.
- **`app/api/route/route.ts` (또는 Server Action)**: SEOUL TOPIS API의 End-Point 연결 관리 및 요청 파라미터 매핑 책임.
- **`components/MapUI.tsx`**: 경로 반환값을 시각적으로 표시하는 컴포넌트 역할 한정.

## 4. 보안 및 에러 핸들링
- `env.local`을 이용한 Secrets 격리. GPHarness Global Rule에 의거하여 환경 변수에 민감 정보를 주입.
- Seoul TOPIS 연동부에서 네트워크 Timeout, 429 Too Many Requests 등을 대비한 Retry / Fallback UI 구성(에러 코드 표출).
  
## 5. 단계적 구현 계획 (Phases mapped to `feature_list.json`)
- [Phase 1 (T01)] Firebase 초기화 및 기본 UI Layout (환경 변수 적용)
- [Phase 2 (T02)] TOPIS API 통합 클래스 작성 및 Unit Test
- [Phase 3 (T03)] 유저 Input 폼 (출도착명 검색) 및 실시간 API 연계
- [Phase 4 (T04)] 결과 표시 및 예상시간/UI 시각화
