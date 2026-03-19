# Packive Dev Rules

## 1. 수정 프로세스 (필수)

모든 코드 수정은 반드시 아래 순서를 따른다:

1. **진단 스크립트 실행** - 관련 코드를 전체 출력하고 구조를 파악한다
2. **원인 확인** - 로그/출력 결과를 분석하여 정확한 원인을 특정한다
3. **최소 수정** - 원인에 대한 최소한의 코드만 변경한다

금지: 추측으로 코드를 반복 수정하는 것
원칙: 진단 -> 원인 확인 -> 수정 (이 순서를 건너뛰지 않는다)


## 2. 컴포넌트 분리 (중장기)

unified-editor.tsx (현재 3,600+ 줄)를 아래와 같이 분리한다:

- CanvasArea.tsx - 캔버스 초기화, 렌더링, 줌/팬
- Ruler.tsx - 눈금자 (이미 분리됨)
- SnapOverlay.tsx - 스냅 엔진 + 오버레이 렌더링
- AIPanel.tsx - AI 탭 (Generate, Vectorize, Remove BG, Credits)
- BleedGuide.tsx - 블리드 가이드 UI
- PropertiesPanel.tsx - 우측 속성 패널
- StatusBar.tsx - 하단 상태바 (Snap, Bleed, Pre-flight, Zoom)
- ToolbarTop.tsx - 상단 툴바 (New, Upload, Hide Lines, etc.)

시점: Step 5 (Panel Map) 진입 전에 분리 완료


## 3. 버전 관리

- v0.3.0 / Step 1 / OpenAI 코드 제거, 빌드 정리
- v0.3.1-editing / Step 2 / 스냅 엔진, 정렬/분배, 가이드 삭제
- v0.4.0-print-engine / Step 3 / 블리드 가이드 + Pre-flight 검사
- v0.4.1-ai-vector / Step 4 / Recraft V4 Vector API 4개 라우트
- v0.4.2-qa-pass / QA / Ruler 정합성, 스냅, 캔버스 렌더링 수정


## 4. Recraft API 비용

- V4 Vector: 0.08 달러 (80 units)
- V4 Pro Vector: 0.30 달러 (300 units)
- Vectorization: 0.01 달러 (10 units)
- Background Removal: 0.01 달러 (10 units)
- 현재 잔액: 4.82 달러 (4,820 units)


## 5. 프로젝트 로드맵

- [x] Step 1 - OpenAI 제거 (v0.3.0)
- [x] Step 2 - 스냅 엔진 + 정렬 (v0.3.1)
- [x] Step 3 - 블리드 가이드 + Pre-flight (v0.4.0)
- [x] Step 4 - Recraft AI 통합 (v0.4.1)
- [x] QA - Ruler, 스냅, 캔버스 수정 (v0.4.2)
- [ ] Step 3-4 최종 점검 - Bleed ON/OFF, Pre-flight, Vectorize, Remove BG
- [ ] 컴포넌트 분리 - unified-editor.tsx 모듈화
- [ ] Step 5 - Panel Map (칼선 면별 배치)
- [ ] Step 6 - 칼선 템플릿 라이브러리
- [ ] Step 7 - 3D 미리보기 + AI Pre-flight


## 6. 핵심 파일 구조

src/lib/snap-engine.ts (114 lines) - 스냅 계산
src/lib/align-utils.ts (175 lines) - 정렬/분배
src/lib/bleed-guide.ts (157 lines) - 블리드 가이드
src/lib/preflight.ts (165 lines) - Pre-flight 검사
src/lib/recraft.ts (218 lines) - Recraft API 클라이언트
src/app/api/ai/generate-vector/route.ts (64 lines)
src/app/api/ai/vectorize/route.ts (59 lines)
src/app/api/ai/remove-bg/route.ts (56 lines)
src/app/api/ai/credits/route.ts (27 lines)
src/components/editor/unified-editor.tsx (3,600+ lines) - 메인 에디터 (분리 예정)
src/components/editor/ruler.tsx (176 lines) - 눈금자


## 7. 교훈 (2025-03 QA에서 배운 것)

- overflow:auto 안에서 CSS flex center는 신뢰할 수 없다
- Ruler 정합성은 Ruler 코드를 먼저 분석해야 한다
- PowerShell regex 매칭은 코드 변경 후 패턴이 달라지면 실패한다
- 3,600줄 단일 파일은 유지보수의 적이다
- requestRenderAll()을 Canvas 생성 직후 호출해야 흰 배경이 보인다
- 캔버스 위치와 Ruler 0점은 반드시 동일한 기준점을 사용해야 한다
