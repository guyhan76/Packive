# Packive Development Roadmap & Rules
> Last updated: 2026-03-10
> Project: Packive - Package Design Platform
> Goal: 칼선전개도 기반 패키지 디자인 ~ 인쇄용 데이터 출력 원스톱 플랫폼
> Target: 기업가치 100억원+ / Pacdora급 도전

---

## 현재 완료된 기능
- CMYK 색상 피커 (FOGRA39 ICC LUT 기반)
- PDF/PNG/칼선 내보내기 (PDF: CMYK 벡터, K100 적용)
- 칼선전개도 업로드 (EPS/AI/PDF/SVG)
- 칼선전개도 API 연동 (칼선=빨강, 접힘선=초록 구분)
- 텍스트 추가/편집 (Noto Sans KR 등 한글 폰트)
- 텍스트 아웃라인 변환 (text-to-outlines)
- 도형 추가 (고정 형태, 크기 조절)
- 바코드/QR 생성
- 별색(Spot Color) 기본 기능
- 3D 목업 미리보기 (기본 버전, 보강 필요)
- 다중 셀 선택, 셀 병합
- 백업 & Git 관리
- 표 기능 (래스터 방식 - 캔버스 정상, 내보내기 벡터 변환 필요)

---

## 내보내기 전략
- **PDF (CMYK 벡터)** — 인쇄용 + Illustrator 편집용 (PDF → AI 변환 가능)
- **PNG** — 미리보기 / SNS 공유용
- **칼선전개도 PDF** — 칼선만 별도 출력
- **SVG 삭제** — 인쇄 현업에서 미사용, PDF가 완전 대체
  - 글로벌 인쇄 표준: PDF/X-1a
  - Illustrator에서 PDF 열기 → AI로 저장 가능
  - SVG 벡터 변환 문제 원천 제거

---

## 수익 모델
- 구독 기반 (월/연 정액)
- 모든 기능은 구독자에게 무료 제공 (추가 유료 옵션 없음)
- 배경 제거 포함 전 기능 구독 내 무제한 사용

---

## 개발 Phase 순서

### Phase 1 — 표 기능 완성 (1~2주)
**목표**: 어도비 일러스트 방식의 벡터 표
**방법**: 독립 Fabric.js 객체 (Rect + Line + Textbox) 배치, Group 사용 안함
**핵심 원칙**:
- 각 셀 = 독립 Rect (배경) + Textbox (텍스트)
- 테두리 = 독립 Line (가로선, 세로선)
- _tableId 메타데이터로 논리적 연결
- PDF 내보내기 시 벡터 출력 보장
- table-to-vector.ts 삭제 가능
**테스트 순서**:
1. Rect 1개 + Line 1개 + Textbox 1개 캔버스 추가 → PDF 내보내기 확인
2. 셀 1개짜리 표 → PDF 확인
3. 2×2 표 → PDF 확인
4. 4×2 표 + 셀 병합 + 한글 → PDF + Illustrator 열기 확인
5. 매 단계 백업

### Phase 2 — 줄자 기능 (3~5일)
**목표**: 어도비 일러스트와 동일한 정밀 눈금자
- mm/px 단위 눈금자 (상단, 좌측)
- 눈금자에서 드래그로 가이드라인 생성
- 객체 간 거리 측정 표시
- 스냅 기능 (가이드라인, 객체 가장자리)

### Phase 3 — 도형 벡터 편집 (2~3주)
**목표**: 도형의 앵커 포인트를 드래그하여 자유 변형
- 앵커 포인트 표시/선택/이동
- 베지어 곡선 핸들 조작
- 포인트 추가/삭제
- Fabric.js Path 객체 기반 커스텀 편집 UI

### Phase 4 — 패스 따기 / 펜 도구 (2~3주)
**목표**: 이미지 위에 패스를 그려 원하는 부분만 추출
- 펜 도구로 점을 찍어 패스 생성
- 베지어 곡선 지원
- 클리핑 마스크로 이미지 일부 추출
- Phase 3의 베지어 편집 기반 위에 구축

### Phase 5 — Panel Map (1~2주)
**목표**: 칼선전개도의 각 면을 자동 인식하고 개별 편집
- 전개도의 닫힌 경로를 파싱하여 개별 면 분리
- 면 클릭으로 선택
- 면별 색상/이미지/디자인 적용
- 면별 안전 영역 표시

### Phase 6 — AI 기능 (3~4주)
**목표**: AI 기반 디자인 보조 도구
- 광고 문구 생성 AI
- 단순 로고/아이콘 생성 AI
- 벡터 텍스트 생성 AI
- **배경 제거 AI** — BRIA RMBG 2.0 (ONNX Runtime Web), 브라우저 처리, 구독자 무료 무제한
  - 서버 비용 0원 (클라이언트 측 처리)
  - 상품 사진(명확한 경계) 90%+ 커버
  - 향후 품질 요구 증가 시 구독 티어 상위 플랜에 서버 API 포함 검토
- **이미지→벡터 변환 (Image Trace)** — 로고, 아이콘용
- 사진 이미지는 래스터 유지 (300dpi, 업계 표준)

### Phase 7 — 추천 템플릿 (1~2주)
**목표**: 칼선전개도 규격별 디자인 템플릿
- FEFCO 코드/박스 유형별 템플릿 라이브러리
- 사용자 선택 시 전개도에 맞춰 자동 배치
- 템플릿 커스터마이징

### Phase 8 — 인쇄 필수 기능 (2~3주)
**목표**: 전문 인쇄 품질 보장
- **재단물림(Bleed) 5mm 자동 생성**
  - 라이브러리: clipper2-ts (Angus Johnson의 Clipper2 TypeScript 포트)
  - API 전개도: 빨강 칼선 경로 → inflatePaths(경로, 5mm, Round, Polygon)
  - 사용자 업로드: 전체 선 union → 최외곽 윤곽 → 5mm 오프셋 (사용자 개입 불필요)
  - 곡선 path: flatten 후 폴리곤 변환 → offset → SVG path 복원
  - 테스트: 단순 사각형 → FEFCO 표준 → 복잡 곡선 순서
- **별색(Spot Color) 보강** — PANTONE 매칭, PDF에 별색 채널 포함
- **Overprint / Knockout 설정**
- **Preflight 검사** — 해상도, RGB잔존, 폰트미변환, Bleed미설정 자동 경고

### Phase 9 — 3D 목업 미리보기 보강 (2~3주)
**목표**: Pacdora급 3D 미리보기
- 기존 3D 기능을 디자인 에디터와 통합
- 실시간 디자인 반영
- 다양한 박스 유형 지원
- 조명/배경 설정

### Phase 10 — 칼선전개도 UI/UX 재설계 (1~2주)
**목표**: 전개도 선택 페이지 UI/UX 개선
- API 연동 전개도 브라우징
- 치수 입력으로 전개도 자동 생성 (향후)
- FEFCO 코드별 분류/검색

### Phase 11 — 협업 및 승인 워크플로우 (2~3주)
**목표**: 팀 작업 지원
- 실시간 협업 (디자이너 + 클라이언트)
- 코멘트/마크업
- 버전 관리 (v1, v2, v3...)
- 클라이언트 승인 버튼 → 인쇄용 파일 자동 생성
- 바코드 규격 자동 검증 (EAN-13, UPC-A, ITF-14)

---

## 개발 규칙 (반드시 준수)

### 1. 백업 규칙
- **코드 수정 전**: 반드시 관련 파일 백업
- **Phase 시작 전**: 전체 src 백업 + Git tag
- **하루 작업 종료 시**: Git commit + 백업
- 백업 폴더: C:\Users\user\Desktop\dev\packive\backups\

### 2. 개발 방식
- **작은 단위 테스트 우선**: 최소 기능 확인 후 확장
- **한 번에 한 파일만 수정**: 여러 파일 동시 수정 금지
- **매 단계 확인**: 수정 → 빌드 확인 → 기능 확인 → 다음 단계
- **실패 시 즉시 복원**: 3회 시도 실패하면 복원 후 재설계

### 3. 금지 사항
- Fabric.js Group으로 표 만들기 금지 (좌표 시스템 문제)
- DOM API(DOMParser/XMLSerializer)로 SVG 조작 금지 (네임스페이스 문제)
- 한 번에 100줄 이상 코드 작성 금지 (검증 불가)
- 백업 없이 파일 덮어쓰기 금지

### 4. 파일 구조
- src/lib/table-engine.ts — 표 데이터 구조 및 생성
- src/lib/table-to-vector.ts — 표 벡터 변환 (Phase 1 완료 후 삭제 예정)
- src/lib/text-to-outlines.ts — 텍스트 아웃라인 변환
- src/lib/pdf-cmyk-export.ts — PDF CMYK 내보내기
- src/components/editor/unified-editor.tsx — 메인 에디터

### 5. 경쟁사 대비 핵심 차별점
- 칼선전개도 → 디자인 → 3D 미리보기 → 인쇄용 출력 원스톱
- CMYK/별색 네이티브 지원 (Canva에 없음)
- Bleed 5mm 자동 생성 (Pacdora에 없음)
- AI 배경 제거 구독자 무료 무제한 (서버 비용 0)
- Image Trace (래스터→벡터 변환)
- Panel Map으로 면별 디자인
- PDF 내보내기 → Illustrator AI 변환 가능

---

## 기술 스택
- Next.js + TypeScript
- Fabric.js (캔버스 엔진)
- clipper2-ts (Bleed 오프셋)
- opentype.js (텍스트 아웃라인)
- svg2pdf.js + jsPDF (PDF 생성)
- ONNX Runtime Web + BRIA RMBG 2.0 (AI 배경 제거, 브라우저 처리)
- FOGRA39 ICC (CMYK 변환)

---

## 복원 포인트
- `backup-before-table-rewrite` — 표 Group 방식 시도 전
- `backup-restored-raster-20260309_220044` — 래스터 표 복원 (현재 안정 상태)
