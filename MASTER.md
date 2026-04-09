# MASTER.md - GPHarness Project Guide

이 문서는 GPHarness 파이프라인의 핵심 가이드로서, 프로젝트의 전반적인 목적(WHY), 기술(WHAT), 방법(HOW)을 정의합니다. GPHarness 내의 모든 에이전트(Planner, Generator, Evaluator)는 이 문서를 최상위 컨텍스트로 참조합니다.

## 1. 프로젝트 목적 (WHY)
에이전틱 워크플로우에서 모놀리식 코드가 양산되는 문제를 방지하고, 에이전트 간 협업(멀티 에이전트 오케스트레이션)을 통해 안전하고 유지보수 가능한 소프트웨어를 구축합니다.

## 2. 아키텍처 및 포함 항목 (WHAT)
- `tasks/prd.md`: 업무 정의서(PRD)의 기준 양식 제공. (Trigger 포인트)
- `.tech/agents/`: 페르소나 정의 (Planner, Generator, Evaluator).
- `.tech/rules/`: 전역 코딩, 스타일, 보안 규칙 (`global_rules.md`).
- `.tech/skills/`: 온디맨드로 로딩되는 특화 스킬 및 명령어 가이드.

## 3. 운영 원칙 및 워크플로우 (HOW)
GPHarness 파이프라인은 6단계(Phase)로 진행됩니다.

1. **Foundation**: 파일 구조(`MASTER.md`, `prd.md`) 초기화.
2. **Context Build**: 관련 사내 문서/API 문서 등 참조 주입.
3. **Planning**: Planner 에이전트가 `prd.md`를 바탕으로 `Plans.md`와 `feature_list.json` 생성.
4. **Generation**: Generator 에이전트들이 (필요시 병렬로 5개까지) 기능 구현 수행 및 Git 커밋.
5. **Evaluation**: Evaluator 에이전트가 QA 및 UI 테스트 진행.
6. **Reporting**: 평가 리포트(`EVAL_REPORT.md`) 및 아티팩트 피드백 루프 수행.

> [!CAUTION]
> Tier 3 작업(시스템 명령, 치명적인 설정 변경)은 반드시 사용자(Human)의 승인을 거치거나 Agent Decides 설정에 따라 안전하게 격리되어 실행되어야 합니다.
