Phase: Planning
    Planner 페르소나를 활성화하여 Plans.md와 feature_list.json 생성.
    사용자에게 기술 스택 및 사양 승인 요청.

Phase: Parallel Generation
    승인 후, 3명의 Generator를 병렬 실행 모드로 가동.
    각 에이전트에게 API, Data, Frontend 역할을 할당하고 작업별 Git 커밋 수행.

Phase: Evaluation
    Evaluator를 호출하여 Playwright MCP 기반 E2E 테스트 실행. 
    기능/UI 점수 산출 및 EVAL_REPORT.md 아티팩트 발행.