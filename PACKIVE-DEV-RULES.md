# PACKIVE 개발 규칙 및 프로젝트 가이드

> 이 파일은 AI 어시스턴트가 매 세션 시작 시 반드시 읽어야 하는 프로젝트 바이블입니다.
> 새 채팅 또는 맥락 초기화 시: PACKIVE-DEV-RULES.md 파일을 읽고 시작해. 이 파일의 규칙을 반드시 지켜.
> 마지막 업데이트: 2026-02-26

## 1. 프로젝트 개요

### 1.1 Packive란?
Packive는 AI 기반 올인원 패키지 디자인 자동화 SaaS 플랫폼입니다.
- 대표: 패키징 업계 26년 경력 전문가
- 목표: D2C 브랜드와 소규모 스타트업이 전문 디자이너 없이도 30분 안에 인쇄 가능한 패키지를 완성
- 핵심 가치: 정확하고 정밀한 칼선전개도(Dieline) 제공 - 디자인 - 3D 프리뷰 - 원클릭 제조 연결

### 1.2 왜 이 프로젝트를 하는가?
- 맞춤 박스 제작에 50만~300만원 비용, 2~4주 소요
- Esko ArtiosCAD는 너무 비싸고 복잡 (엔터프라이즈 전용)
- Pacdora, Packlane 등은 기능이 제한적
- D2C 브랜드는 전문 구조 설계사를 고용할 여력이 없음


### 1.3 경쟁 포지셔닝 (투자 브리핑용)
- Esko ArtiosCAD: 너무 비싸고 복잡 (엔터프라이즈 전용)
- Packlane/Pacdora: 인쇄 품질 기능 부족 (CMYK/별색/아웃라인 미지원)
- Canva: 패키징 전문 기능 없음 (칼선/면인식/인쇄규격 없음)
- PACKIVE = Esko의 정밀함 + Canva의 쉬운 UX + AI 자동화. 시장에 없는 제품.

### 1.4 기술 스택
- 프레임워크: Next.js (App Router)
- 언어: TypeScript
- 에디터 캔버스: Fabric.js v6
- 스타일링: Tailwind CSS
- 칼선 생성: EasyPackMaker API (개발 단계) + Boxshot (런칭 후 추가)
- 파일 변환: Inkscape CLI (PDF-SVG), Ghostscript (EPS-PDF), 자체 CorelDRAW EPS 파서
- 프로젝트 경로: C:\Users\user\Desktop\dev\packive
- 메인 에디터: src/components/editor/unified-editor.tsx
- API 라우트: src/app/api/convert-file/route.ts
- 캐시: cache/dielines/ , 공개: public/dielines/ , 샘플: public/dielines/samples/

### 1.5 시장 기회
- 글로벌 패키지 디자인 소프트웨어 시장: 2030년 40B달러 (CAGR 10.2%)
- 한국 시장: 2025년 약 30조원 - 2032년 47조원 전망

## 2. UI/UX 디자인 원칙 (모든 기능에 적용)

### 2.1 핵심 철학
- 전문가(패키징 디자이너)도 초보자(D2C 브랜드 대표)도 쉽게 사용
- 직관적이면서 편리하고, 기능/버튼/절차가 정리정돈 잘 된 플랫폼
- 일관성 유지: 색상, 간격, 폰트, 아이콘 스타일 통일
- 세계 최고 수준의 UI/UX (Adobe Illustrator의 전문성 + Canva의 접근성)

### 2.2 디자인 규칙
- 버튼/아이콘: 기능이 즉시 이해되는 직관적 디자인
- 패널 레이아웃: 좌측(도구) / 중앙(캔버스) / 우측(속성) 3단 구조 유지
- 색상 체계: 주요 액션은 강조색, 보조 기능은 회색 톤
- 여백과 간격: 일정한 패딩/마진으로 시각적 안정감
- 피드백: 모든 사용자 액션에 즉각적 시각 피드백 제공
- 단축키: 전문가를 위한 키보드 단축키 (Adobe 호환)
- 모바일 대응: 반응형 레이아웃 고려

### 2.3 새 기능 추가 시 체크리스트
- [ ] 기존 UI 스타일과 일관성 확인
- [ ] 초보자가 설명 없이 사용 가능한가
- [ ] 전문가가 빠르게 작업할 수 있는가
- [ ] 버튼/패널 위치가 논리적 흐름에 맞는가
- [ ] 시각적 피드백이 있는가

## 3. 절대 변경 금지 목록 (DO NOT TOUCH)

아래 항목은 어떤 상황에서도 수정, 삭제, 덮어쓰기 금지입니다.

### 2.1 캔버스 크기 및 스케일링
- pxPerUnit (엔진 모드): Math.max(fitScale, 1.5)
- pxPerUnit (업로드 모드): fitScale (Math.max 없이 그대로 사용)
- 빈 캔버스 netW: cw - 40 (wrapper 기준, 절대 고정값 1200 사용 금지)
- 빈 캔버스 netH: ch - 40 (wrapper 기준, 절대 고정값 900 사용 금지)

### 2.2 캔버스 초기화
- fcRef.current = canvas 할당은 한 번만, 중복 선언 금지
- enableRetinaScaling: true 유지

### 2.3 칼선(Dieline) 로딩
- loadDielineOnCanvas 내부 fitScale: padding 60, 자동 축소. 수정 금지
- reload useEffect에 캔버스 크기 재조정 코드 절대 추가 금지

### 2.4 칼선 잠금 (업계 표준)
- 칼선 그룹은 canvas.add() 이후에 lock 속성 적용
- 그룹 생성 시점에 lock 넣으면 무시됨 - 반드시 add() 후 set()

### 2.5 코드 구조 규칙
- 함수/변수 중복 선언 금지
- try/catch 블록 삭제 금지
- JSX 닫기 태그 확인 필수
- PowerShell 정규식 이스케이프 필수

## 4. 칼선 처리 파이프라인

### 3.1 EasyPackMaker 칼선 (FEFCO/ECMA)
- EasyPackMaker - PDF 다운로드 - Inkscape SVG 변환 (300 DPI) - 캐시 저장
- SVG 특성: 28~31개 개별 path, CUT=빨강, CREASE=녹색 (색상 분류됨)
- classifyStroke 함수로 자동 분류 - 색상 적용

### 3.2 고객 EPS 업로드 (CorelDRAW 8)
- CorelDRAW EPS - 자체 파서 (Ghostscript/Inkscape 건너뜀) - SVG 직접 생성
- 파서 위치: src/app/api/convert-file/route.ts의 parseCorelDrawEPS 함수
- 감지 방법: 파일 내용에서 wCorel 또는 CorelDRAW 패턴 검색
- SVG 특성: 22~291개 개별 path, 모두 검정색 (#000000), stroke-width 0.72
- Y축 플립 처리: scale(1,-1) translate(0,-totalH)
- classifyStroke에서 검정/어두운 색은 unknown 반환 - 원래 색상 유지

### 3.3 일반 EPS/AI/PDF 업로드
- Ghostscript (EPS/AI-PDF) - Inkscape (PDF-SVG, 300 DPI)
- GS 경로: C:\Program Files\gs\gs10.06.0\bin\gswin64c.exe
- Inkscape 경로: C:\Program Files\Inkscape\bin\inkscape.com

### 3.4 칼선 잠금/해제
- 기본: 잠금 (업계 표준 - Packlane, Canva, Packhelp 등 동일)
- UI: Lock/Unlock 토글 버튼
- 잠금 시: selectable:false, evented:false, 모든 lock 속성 true
- 해제 시: selectable:true, evented:true, 모든 lock 속성 false

## 5. SVG 캐시 시스템

### 4.1 핵심 원리
- EasyPackMaker PDF - Inkscape SVG 변환 - SVG만 캐시 보관
- PDF는 임시 파일이므로 변환 후 즉시 삭제
- 같은 박스타입 + 같은 치수 요청 시 캐시에서 즉시 반환 (API 호출 0, 비용 0)

### 4.2 캐시 파일 구조
- 캐시 경로: cache/dielines/
- 공개 경로: public/dielines/
- 파일명 규칙: {boxType}_{L}_{W}_{D}.svg

### 4.3 현재 캐시된 SVG (4개)
| # | 파일명 | 크기 | paths | SVG 크기 (pt) |
|---|---|---|---|---|
| 1 | FEFCO-0215_120_60_160.svg | 10.9KB | 31 | 1495x1140 |
| 2 | FEFCO-0201_300_200_250.svg | 9.1KB | 28 | 3991x1799 |
| 3 | ECMA-A20.20.03.03_80_40_120.svg | 10.1KB | 30 | 975x864 |
| 4 | FEFCO-0215_200_100_250.svg | 10.9KB | 31 | 2402x1775 |

### 4.4 고객 EPS 파서 결과 (5개 샘플)
| # | 원본 | SVG | paths |
|---|---|---|---|
| 1 | A1형.EPS (20.5KB) | A1_type_clean.svg (4.7KB) | 22 |
| 2 | B형 3면접착.EPS (22KB) | B_type_3side_clean.svg (6.3KB) | 28 |
| 3 | B형 하단조립.EPS (21.9KB) | B_type_bottom_clean.svg (6.5KB) | 30 |
| 4 | 맞뚜껑.EPS (21.6KB) | matching_lid_clean.svg (6.1KB) | 28 |
| 5 | 신한-대게박스.EPS (80.9KB) | shinhan_crab_box_clean.svg (69.2KB) | 291 |

### 4.5 비용 절감 효과
- 개발 단계: Trial 5회로 무제한 테스트 가능 (캐시 사용)
- 운영 단계: 캐시 적중률 60~80% 예상 - API 호출 60~80% 절감
- SVG 1개 = 5~70KB, 1만 개 캐시 = 약 500MB (서버 부담 없음)

## 6. EasyPackMaker API 연동

### 5.1 API 정보
- 엔드포인트: POST https://easypackmaker.com/generator/api
- Content-Type: application/json
- 응답 형식: JSON
- 토큰: SHA-256 해시 서명 (비-객체 파라미터 + Password - 키 정렬 - 값 연결 - SHA-256)

### 5.2 토큰 생성 알고리즘
1. 요청에서 비-객체 파라미터만 추출 (ModelParams, ModelOptions 제외)
2. Password 키-값 쌍 추가
3. 키를 알파벳 순으로 정렬
4. 값만 연결하여 문자열 생성
5. SHA-256 해시 계산 = Token

### 5.3 요청 예시
UserName: Guyhan76, Token: SHA-256해시, OrderId: 1001
ModelName: fefco_0215
ModelParams: L=120, W=60, D=160, Th=1.5, Units=mm
ModelOptions: DimensionType=Crease, KnifeInfo=true, GlueZone=false, Sizes=true

### 5.4 API 접근 상태
- UserName: Guyhan76
- API Password: 미발급 (API 모드 전환 요청 필요)
- 상태: EasyPackMaker contacts 페이지에서 API 모드 전환 요청 전송 필요
- 요청 후 Personal Account 페이지에 API Password 항목 생성됨

### 5.5 API 요금제
- API Basic: 건당 0.47달러 (종량제) - 개발 단계 추천
- API 200: 월 53.30달러 (200회/월, 건당 0.27달러)
- API 1000: 월 93.32달러 (1000회/월, 건당 0.09달러)
- 템플릿: 폴딩카톤 300 + 골판지 288 + 봉투/폴더/백 49 = 637개

### 5.6 LinesColors 옵션
- cutColor: #ff0000 (빨강)
- creaseColor: #00ff00 (녹색)
- perforationColor: #9b9b4b
- zipperColor: #3c8080
- infoColor: #00438a
- 기본값 복원: LinesColors=reset

## 7. 에디터 기능 현황

### 6.1 캔버스 및 뷰포트
- 캔버스 크기: wrapper 기준 동적 계산
- 줌: 25%~800%, 마우스 휠 또는 +/- 버튼
- 팬: Space+드래그, Alt+드래그, 마우스 가운데 버튼 드래그
- Fit 버튼: 100% 줌 + 뷰포트 위치 리셋

### 6.2 오브젝트 도구
- 텍스트: 추가, 드래그, 더블클릭 편집 (완료)
- 이미지: 업로드, 캔버스 중앙 배치, 드래그/크기조절 (완료)
- 도형: 추가 (완료)
- Packaging Marks: 패널 (완료)

### 6.3 편집 기능
- Undo/Redo: Ctrl+Z / Ctrl+Y (완료)
- 복사/붙여넣기: Ctrl+C/V/X (완료)
- 레이어: 우측 Layers 탭 (완료)
- 칼선 위 디자인 오버레이 (완료)
- 칼선 표시/숨김 토글 (완료)
- 칼선 잠금/해제 토글 (완료)

### 6.4 파일 업로드
- EPS (CorelDRAW): 자체 파서 - 즉시 SVG (검정 벡터, 선명)
- EPS/AI (일반): Ghostscript - Inkscape 파이프라인
- PDF: Inkscape 직접 변환
- 업로드 후 헤더에 파일명 표시 (완료)

## 8. 내보내기(Export) 구현 단계

[1단계] 기본 내보내기 (즉시 구현 가능)
- [ ] SVG 내보내기: canvas.toSVG()
- [ ] PNG 내보내기: canvas.toDataURL multiplier 3
- [ ] 다운로드 버튼 UI 추가

[2단계] PDF 내보내기 (2~4주)
- [ ] pdf-lib 라이브러리 도입
- [ ] 칼선 레이어 + 디자인 레이어 분리하여 PDF 생성
- [ ] RGB to CMYK 변환
- [ ] 300 DPI 이상 이미지 품질 보장

[3단계] 전문 인쇄 기능 (1~2개월)
- [ ] 별색(Spot Color) 지정 기능
- [ ] PDF/X-1a 규격 준수
- [ ] 블리드(bleed) 3mm 자동 가이드

[4단계] 고급 인쇄 기능 (2~3개월)
- [ ] Pantone 컬러북 연동
- [ ] ZIP 묶음 다운로드 (PDF + AI + EPS)

## 9. 듀얼 API 라우팅 구조

### 8.1 흐름
1. 사용자 요청 (boxType + L, W, D, Th)
2. 캐시 확인 - HIT이면 SVG 즉시 반환
3. MISS이면 - EasyPackMaker API (PDF) - Inkscape SVG 변환
4. (런칭 후) Boxshot 지원 유형이면 Boxshot API (EPS)
5. SVG 캐시 저장 - 에디터 로드

### 8.2 구현 단계
[1단계] EasyPackMaker 가입 및 테스트 - 완료
[2단계] API 연동 구현 - API Password 대기 중
[3단계] 박스 유형 선택 UI - 미시작
[4단계] 런칭 후 Boxshot 추가 - 미시작

## 10. 전체 TODO 통합 (최신 상태)

### 완료된 기능
- [x] npm run build / npm run dev 정상
- [x] EPS/AI/PDF 업로드 - SVG 변환 - 캔버스 자동 FIT
- [x] 마우스 휠 확대/축소 (25~800%)
- [x] Space+드래그 / Alt+드래그 / 가운데버튼 드래그 패닝
- [x] Ctrl+C/V/X 복사/붙여넣기/잘라내기
- [x] Ctrl+Z/Y 실행취소/재실행
- [x] Inkscape CLI 변환 (DPI 300)
- [x] Packaging Marks 패널
- [x] 이미지 업로드 (캔버스 중앙 배치, 크기조절)
- [x] 텍스트 추가/편집/드래그
- [x] 도형 추가
- [x] EasyPackMaker Trial PDF 4개 다운로드 + SVG 변환 + 캐시 배포
- [x] CorelDRAW EPS 자체 파서 개발 (22~291 paths)
- [x] 파서를 /api/convert-file에 통합
- [x] 캔버스 100% fit 스케일링 수정
- [x] EPS 칼선 검정색 유지 (classifyStroke 수정)
- [x] EPS 업로드 시 헤더 파일명 표시
- [x] 칼선 기본 잠금 + Lock/Unlock 토글 버튼
- [x] 확대/축소 시 선명도 유지 (벡터 품질)
- [x] Fit 버튼: 100% 줌 + 뷰포트 위치 리셋
- [x] 레이어 패널 동작
- [x] 중앙 스냅 가이드라인 (오브젝트 드래그 시 마젠타 점선 표시, 캔버스 중앙 자동 스냅)

### 현재 진행할 TODO (우선순위)

[A] EasyPackMaker API 자동 호출 파이프라인 - API Password 대기 중
- [ ] A1. EasyPackMaker contacts에서 API 모드 전환 요청 전송
- [ ] A2. API Password 수신 - .env.local 저장
- [ ] A3. /api/generate-dieline 엔드포인트 구현
- [ ] A4. 에디터 자동 호출 연동 (boxType+치수 - API - SVG - 캔버스)

[B] 내보내기 구현 (섹션 7 참조)
- [x] B1. SVG/PNG 기본 내보내기
- [ ] B2. PDF 내보내기
- [ ] B3. RGB to CMYK 변환


[B2] 인쇄용 파일 처리 (섹션 11 참조)
- [ ] B2-1. 텍스트 아웃라인 변환 (Inkscape --export-text-to-path)
- [ ] B2-2. Recraft V4 Vector API 연동 (AI 벡터 이미지 생성)
- [ ] B2-3. AI 래스터 업스케일링 (300 DPI 인쇄 품질)
- [ ] B2-4. 해상도 부족 경고 시스템
- [ ] B2-5. 칼선 레이어 분리 내보내기 (인쇄용PDF + 칼선PDF)

[B3] 템플릿 시스템 (섹션 12 참조)
- [ ] B3-1. 칼선전개도 면(panel) 영역 자동 인식
- [ ] B3-2. 기본 템플릿 라이브러리 구축 (업종별 5~10개)
- [ ] B3-3. AI 템플릿 생성 (Recraft V4 + 브랜드 정보)
- [ ] B3-4. 원클릭 템플릿 적용 (전체 면 자동 배치)

[B4] CMYK/별색 컬러 시스템 (섹션 13 참조)
- [ ] B4-1. CMYK 컬러피커 + 슬라이더 UI
- [ ] B4-2. 오브젝트별 CMYK/별색 속성 저장
- [ ] B4-3. Pantone 별색 팔레트 (100~200색)
- [ ] B4-4. ICC 소프트 프루핑 (인쇄 미리보기)

[C] 플랫폼 기능
- [ ] C1. 3D 프리뷰 엔진
- [ ] C2. AI 디자인 어시스턴트 (Recraft V4 Vector + GPT-4o)
- [ ] C3. 사용자 인증 / 프로젝트 저장
- [ ] C4. 제조 마켓플레이스 MVP
- [ ] C5. 결제 시스템
- [ ] C6. 퍼블릭 베타 런칭

### 현재 위치
- 다음 작업: EasyPackMaker API Password 수신 대기 - 수신 후 A3~A4 진행
- 대기 중 병행 가능: B1 (SVG/PNG 내보내기), B2-1 (텍스트 아웃라인), B3-1 (면 인식)

## 11. 개발 일지

### [2026-02-25] 칼선 자동 로드 기반 구축
- EasyPackMaker FEFCO-0215 Trial PDF 1개 다운로드 + Inkscape SVG 변환 성공
- unified-editor.tsx에 AutoDieline useEffect 추가
- 캐시 SVG 자동 로드: public/dielines/{boxType}_{L}_{W}_{D}.svg
- 상태: 정상 작동 확인 (canvas 1144x634, 31 paths)

### [2026-02-26] 대규모 기능 완성
- EasyPackMaker Trial PDF 나머지 3개 다운로드 (FEFCO-0201, ECMA-A20, FEFCO-0215 다른 치수)
- Inkscape SVG 변환 + cache/dielines + public/dielines 배포 완료
- 고객 EPS 파일 5개 분석 (CorelDRAW 8 형식)
- Ghostscript 변환 한계 발견 (모든 path가 1개로 병합)
- CorelDRAW EPS 자체 파서 개발: PostScript drawing commands 직접 파싱
- 파서를 /api/convert-file/route.ts에 통합 (CorelDRAW 자동 감지)
- 캔버스 스케일링 수정: 업로드 모드에서 fitScale 직접 사용
- classifyStroke 수정: 검정색 - unknown 반환 (원래 색상 유지)
- EPS 업로드 시 헤더에 파일명 표시
- 칼선 기본 잠금 + Lock/Unlock 토글 버튼 추가
- canvas.add() 이후 lock 적용으로 초기 잠금 버그 수정
- 이미지 업로드 버그 수정 (c.add(img) 누락)
- 팬 기능 강화: Space+드래그, Alt+드래그, 가운데버튼 드래그
- Fit 버튼: 100% 줌 + 뷰포트 위치 리셋
- 에디터 기능 전체 테스트 통과 (텍스트/이미지/도형/레이어/Undo/Redo)
- 확대/축소 품질 확인 (25~400% 전 구간 선명)
- EasyPackMaker API 문서 분석 완료 (SHA-256 토큰 서명 방식)
- API 모드 전환 요청 준비 (API Password 발급 대기)
- 중앙 스냅 가이드라인 추가 (object:moving 이벤트, SNAP_THRESHOLD=8, 마젠타 점선)


### 2026-02-27
- Export 기능 프로 업그레이드 완료 (B1)
  - 파일명 자동 생성: boxType+치수+날짜 또는 EPS파일명+날짜
  - PNG 해상도 선택: Screen(1x) / Medium(2x) / Print(4x)
  - 칼선 분리 Export: Design+Dieline / Design Only / Dieline Only
  - SVG/PDF 동일하게 칼선 포함/제외 지원
  - Export 모달 UI 완전 개편 (옵션 패널, 파일명 미리보기)
  - _isDieLine 속성명 대소문자 버그 수정
## 12. 인쇄용 파일 처리 전략

### 11.1 텍스트 아웃라인 (Text to Path)
- 인쇄용 PDF에서 텍스트는 반드시 아웃라인(곡선화) 처리 필수
- 이유: 인쇄소에 해당 폰트가 없으면 텍스트 깨짐
- 구현: canvas.toSVG() 후 서버에서 Inkscape CLI 변환
- 명령: inkscape --export-text-to-path --export-filename=output.pdf
- Inkscape 이미 설치됨 - 추가 비용 없음

### 11.2 AI 벡터 이미지 생성 (Recraft V4 Vector)
- 문제: DALL-E/GPT-4o 이미지는 래스터(비트맵) - 인쇄 크기 한계
- 해결: Recraft V4 Vector API - 텍스트 프롬프트에서 SVG 벡터 직접 생성
- 용도: 로고, 일러스트, 패턴, 아이콘 등 패키지 디자인 핵심 요소
- 장점: 처음부터 벡터이므로 어떤 크기든 선명하게 인쇄 가능
- 가격: 벡터 이미지 1개당 0.08달러
- API 문서: https://www.recraft.ai/api

### 11.3 AI 래스터 이미지 보정 (업스케일링)
- 사진/복잡한 이미지는 래스터가 불가피
- AI 업스케일러로 해상도 4~8배 확대 - 300 DPI 인쇄 품질 확보
- 후보: Let's Enhance, Topaz Gigapixel, Upscalepics
- 해상도 부족 시 사용자에게 경고 표시 필수

### 11.4 하이브리드 AI 파이프라인
- 로고/일러스트/패턴: Recraft V4 Vector (SVG 직접 생성, 0.08달러)
- 사진/복잡한 이미지: GPT-4o 생성 후 AI 업스케일링 (300 DPI)
- 사용자 업로드 래스터: 해상도 부족 경고 + 선택적 업스케일링

### 11.5 칼선 인쇄 처리
- 칼선은 인쇄물에 나오면 안 됨 (톰슨/칼 제작용으로만 사용)
- 방법 A (레이어 분리): 디자인 레이어 + 칼선 레이어(OCG) 분리, 인쇄소에서 칼선 끄고 출력
- 방법 B (별도 파일): 인쇄용.pdf + 칼선용.pdf 따로 내보내기 (한국 인쇄소 선호)
- 방법 C (별색 칼선): CutContour 별색으로 지정, 인쇄판에 출력 안 됨 (Esko 방식)
- 권장: 방법 A+B 병행 (전체PDF, 인쇄용PDF, 칼선PDF, ZIP 묶음)

## 13. 칼선전개도 템플릿 시스템

### 12.1 개념
- 칼선전개도의 각 면(정면, 측면, 상단, 하단)을 자동 인식
- 미리 만들어진 디자인 템플릿을 한 번에 전체 면에 적용
- PACKIVE 킬러 피처 - 30초 만에 완성된 패키지 디자인

### 12.2 구현 단계
[1단계] 면 영역 자동 인식
- 칼선 SVG에서 CUT/CREASE 라인 분석
- 각 면(panel)의 좌표와 크기 계산 (정면, 측면, 상단, 하단)
- EasyPackMaker 칼선은 색상으로 CUT/CREASE 구분됨 - 파싱 가능

[2단계] 기본 템플릿 라이브러리 구축
- 업종별 디자인 프리셋 5~10개 (화장품, 식품, 전자제품, 의류 등)
- 템플릿 구성요소: 배경색, 로고 위치, 텍스트 레이아웃, 패턴
- 박스타입별 면 배치가 다르므로 타입별 매핑 테이블 필요

[3단계] AI 템플릿 생성
- Recraft V4 Vector로 박스타입에 맞는 벡터 디자인 자동 생성
- 사용자 브랜드 정보(로고, 컬러, 폰트) 입력 후 AI가 전체 면 디자인
- 생성된 SVG를 각 면에 자동 배치

### 12.3 템플릿 적용 흐름
1. 사용자가 박스타입 + 치수 선택 - 칼선전개도 생성
2. 템플릿 갤러리에서 디자인 선택 (또는 AI 자동 생성)
3. 시스템이 각 면 영역을 자동 인식
4. 템플릿의 디자인 요소를 각 면에 맞게 자동 배치
5. 사용자가 텍스트/이미지/색상 등을 커스터마이징
6. 내보내기 (인쇄용 PDF + 칼선 PDF)

## 14. CMYK/별색 컬러 시스템

### 13.1 왜 웹 에디터가 RGB를 쓰는가
- 모니터와 브라우저는 RGB 디바이스 (HTML Canvas, SVG, CSS 모두 RGB)
- 어도비 일러스트도 모니터에는 RGB로 표시, 내부 데이터만 CMYK 저장
- 핵심: 화면 표시(RGB)와 저장/내보내기(CMYK) 분리

### 13.2 PACKIVE CMYK 구현 방식
- 사용자가 CMYK 슬라이더(C,M,Y,K 각 0~100%)로 색상 선택
- 오브젝트에 커스텀 속성 저장: cmykColor: {c:0, m:100, y:100, k:0}
- 화면 표시: CMYK를 RGB로 변환하여 모니터에 표시 (소프트 프루핑)
- 내보내기: 원본 CMYK 값을 그대로 PDF에 기록 (RGB-CMYK 변환 오차 없음)

### 13.3 별색(Spot Color) 구현 방식
- Pantone 컬러 선택 시 별색 이름과 코드를 내부 저장
- 화면에는 해당 Pantone의 근사 RGB 값으로 표시
- 내보내기 시 PDF에 Separation 색공간으로 별색 채널 기록
- 주요 Pantone 색상 100~200개 미리 등록 (공식 라이선스 별도 검토)

### 13.4 구현 단계
[1단계] CMYK 컬러피커 (빠르게 가능)
- [ ] 우측 속성 패널에 CMYK 슬라이더 추가 (C,M,Y,K 각 0~100%)
- [ ] 오브젝트별 cmykColor 커스텀 속성 저장
- [ ] CMYK-RGB 변환 함수 구현 (화면 표시용)
- [ ] RGB/CMYK 모드 토글 버튼

[2단계] 별색 팔레트 (중간 난이도)
- [ ] Pantone 주요 색상 100~200개 등록
- [ ] 별색 선택 UI (검색/필터)
- [ ] 오브젝트별 spotColor 속성 저장

[3단계] ICC 소프트 프루핑 (고급)
- [ ] Korea Standard / Japan Color 2001 프로파일 적용
- [ ] 인쇄 미리보기 모드 (이렇게 인쇄됩니다)
- [ ] 색영역 경고 (CMYK로 표현 불가능한 RGB 색상 감지)


---

## 2026-03-01 완료 작업 (PDF CMYK Export 수정)

### 수정 파일
- `src/lib/pdf-cmyk-export.ts`

### 해결된 문제
- [x] 칼선전개도 PDF 출력 정상화 (일부 칼선 유실 문제 해결)
- [x] PDF 배경색 정상 출력 (좌측 상단 정사각형 → 전체 캔버스 크기 rect로 수정)
- [x] CMYK 색상값 정확 반영 (Illustrator에서 확인 완료)
- [x] 도형 fill/stroke CMYK 색상 반영
- [x] Adobe Illustrator에서 PDF 정상 열림 (포맷 에러 해결)
- [x] 한글 텍스트 PDF 출력 (NotoSansKR, Malgun Gothic 폰트 등록)
- [x] 폰트 파일 `public/fonts/`에 추가 (Arial, Georgia, NotoSansKR, Malgun Gothic)
- [x] SVG font-family 정규화 로직 추가 (svg2pdf.js 호환)
- [x] xref 테이블 재구축 로직 정리
- [x] spot color injection 비활성화 (CMYK fallback 모드로 안정화)
- [x] `replacePdfColorsInString` 순수 CMYK 변환 (UCR/brightnessBoost 제거)

### 현재 상태
- PDF 내보내기: 칼선 + 텍스트 + 도형 + 색상 모두 정상
- Illustrator 호환: 정상 (폰트 경고 "Arial" → 닫기 시 대체 표시)
- CMYK 값: 캔버스 설정값과 Illustrator 표시값 동일

### 알려진 제한사항
- 캔버스(RGB)와 PDF(CMYK) 화면 색상 차이: RGB↔CMYK 색역 차이로 인한 정상 현상
- Illustrator 폰트 경고: jsPDF 폰트 이름 매핑 차이 (기능에는 영향 없음)
- Inter 폰트는 한글 미지원 → NotoSansKR로 자동 매핑

### 등록된 PDF 폰트 (public/fonts/)
- Arial (normal, bold, italic, bolditalic)
- Georgia (normal, bold, italic, bolditalic)
- NotoSansKR (regular, bold)
- Malgun Gothic (regular, bold)

### 미완료 (향후 작업)
- [ ] spot color injection 재활성화 (안정적 방법으로)
- [ ] PDF 내보내기 UI에 CMYK 안내 문구 추가
- [ ] 캔버스 폰트 목록을 PDF 등록 폰트로 제한
- [ ] 배포 전 console.log 정리

---

## 개발 로드맵 (2026-03-01 기준)

### 완료된 항목
- [x] 4원색 CMYK PDF 변환 성공
- [x] 구글 폰트 API 연동 (1,801종 동적 로드)
- [x] 텍스트 아웃라인 변환 (opentype.js)
- [x] Adobe Illustrator 호환 (폰트 경고 없음, CMYK 값 일치)
- [x] 칼선(다이라인) PDF 포함
- [x] CORS 해결 (Next.js API route)

### 1단계: UI/UX 디자인 에디터 왼쪽 패널 개선
- [ ] 세계 최고 수준 UI/UX 설계 (Canva, Adobe, Figma 능가 목표)
- [ ] 왼쪽 패널: 도구 모음 카테고리별 정리 (텍스트, 도형, 이미지, 이모티콘, 표, 주의마크, 바코드, 줄자, 스포이드 등)
- [ ] 팝업창 기반 서브메뉴 (Illustrator 스타일)
- [ ] 헤더, 왼쪽 패널, 오른쪽 패널 각각 직관적 레이아웃
- [ ] 아이콘 + 텍스트 라벨 조합으로 초보자도 이해 가능

### 2단계: 텍스트 및 도형 기본값 개선
- [ ] 텍스트 추가 시 폰트 사이즈 최소 8pt 이상 (현재보다 크게)
- [ ] 도형 추가 시 기본 크기 15px 이상 (현재보다 크게)

### 3단계: AI 이미지 생성 + 벡터 변환
- [ ] 디자인 에디터에서 AI 이미지 생성
- [ ] 생성된 이미지를 벡터(SVG) 이미지로 변환 기능

### 4단계: 칼선 전개도 템플릿
- [ ] 전체 칼선 전개도에 디자인 템플릿 적용 가능하도록 개발
- [ ] 면 단위 색상 채움 기능 검토 및 구현

### 5단계: 스팟 컬러 및 폰트 최적화
- [ ] spot color(별색) 주입 재활성화 (금박, 은박, 형광색 등)
- [ ] 폰트 리소스 최적화 (아웃라인 변환 후 불필요 폰트 임베딩 제거)
- [ ] PDF 내보내기 UI에 CMYK 안내 문구 추가
- [ ] 배포 전 console.log 정리

### 6단계: 시작 페이지 및 박스 타입 선택 페이지 개선
- [ ] 시작 페이지 UI/UX 개선
- [ ] 두 번째 페이지 (박스 타입 선택) UI/UX 개선

### 7단계: 다국어 지원
- [ ] 모든 페이지 연동 후 다국어 지원
- [ ] 지원 언어: 영어, 한국어, 일본어 등

### 8단계: 시제품 테스트
- [ ] 실제 인쇄 시제품 테스트
- [ ] 인쇄소 피드백 반영 및 최종 조정

---

## UI/UX 종합 설계안 v2.0 (2026-03-01)

> 이 설계안은 모든 UI/UX 작업의 기준 문서입니다. 수정 시 반드시 이 방향을 따르세요.
> 핵심 원칙: 기존 기능 100% 보존. UI만 개선. 기능 삭제/변경 절대 금지.

### 설계 철학
- Adobe Illustrator의 전문성 + Canva의 접근성 = PACKIVE
- 전문가(패키징 디자이너)도 초보자(D2C 브랜드 대표)도 쉽게 사용
- 3단 구조 유지: 좌측(도구) / 중앙(캔버스) / 우측(속성)
- 절대 변경 금지 항목(섹션 3) 준수
- 모든 아이콘: SVG 통일 (이모지 사용 금지, OS 독립적)
- 확장성: AI 벡터변환, 템플릿, 3D 프리뷰, 제조연결까지 수용

### 현재 문제점
- 2,670줄 단일 파일 (유지보수 어려움)
- 이모지 아이콘 (OS별 다르게 보임, 비전문적)
- 왼쪽 패널: 카테고리 구분 없이 12개 버튼 평면 나열
- 팝업: 모두 같은 위치(left-1 top-1)에 열림
- 우측 패널: 5개 탭, Props 안에 색상까지 과도하게 중첩
- 헤더: 칼선 버튼과 줌/Undo가 혼재

### 헤더 (TOP BAR) 설계
- 왼쪽: [Back] [파일명/박스타입] [치수] [상태뱃지]
- 가운데: [Upload Dieline] [Hide Lines] [Lock] (칼선 관련 그룹)
- 오른쪽: [Undo] [Redo] | [- Zoom% + Fit] | [Export]

### 왼쪽 패널 설계 (w-16, 64px)
- 3개 카테고리로 시각 분리 (회색 라벨 + 구분선)
- 활성 도구: 좌측 파란 바(3px) + 파란 배경
- 팝업: 각 버튼의 Y좌표에 맞춰 열림

[DESIGN 카테고리]
- Select (V) — 기본 선택/이동
- Text (T) — 팝업: Heading/Subheading/Body/Custom
- Shapes (S) — 팝업: 기본도형 + 선/화살표
- Image (I) — 파일 업로드 다이얼로그
- Draw (D) — 자유 드로잉 모드

[PACKAGE 카테고리]
- Table — 성분표/영양정보 표
- Barcode — QR/EAN/UPC/Code128
- Marks — 재활용/CE/인증 마크
- Color Picker (신규) — 스포이드 도구

[UTILS 카테고리]
- Measure — 거리/각도 측정
- Delete — 선택 오브젝트 삭제
- Shortcuts — 키보드 단축키 (F1)
- (Clear Canvas는 메뉴 안으로 이동 — 실수 방지)

### 우측 패널 설계 (w-72, 280px)
- 기존 5탭 → 3탭으로 통합
- 각 섹션은 Collapsible (접기/펼치기)

[Design 탭]
- Transform: X, Y, W, H, Rotation
- Appearance: Fill (RGB/CMYK/Spot), Stroke, Opacity
- Typography (텍스트 선택 시): Font Family, Size, Weight, Style, Alignment
- Canvas Background (미선택 시)

[AI 탭] (기존 3탭 통합)
- AI Copy Generator (아코디언)
- AI Design Review (아코디언)
- AI Image Generator (아코디언)

[Layers 탭]
- 오브젝트 목록 (기존과 동일)

### 파일 분리 계획
src/components/editor/
- unified-editor.tsx — 메인 컨테이너 (800줄 이하)
- toolbar/TopBar.tsx — 헤더바
- toolbar/LeftToolbar.tsx — 왼쪽 도구 패널
- toolbar/ToolPopups.tsx — Text/Shape/Barcode/Table/Marks 팝업
- panels/RightPanel.tsx — 우측 패널 컨테이너
- panels/DesignPanel.tsx — 속성/색상/타이포그래피
- panels/AIPanel.tsx — AI Copy/Review/Image 통합
- panels/LayersPanel.tsx — 레이어 목록
- modals/ExportModal.tsx — Export 모달
- modals/ShortcutsModal.tsx — 단축키 모달
- modals/UploadGuideModal.tsx — 업로드 가이드 모달
- hooks/useCanvasHistory.ts — Undo/Redo 로직
- hooks/useCanvasTools.ts — 도구 관련 함수
- hooks/useExport.ts — Export 로직

### 확장성 매핑 (향후 기능 배치 위치)
- 3단계 AI 벡터변환 → 우측 AI탭 > AI Image 섹션 > "Convert to Vector" 버튼
- 4단계 템플릿 → 왼쪽 DESIGN 카테고리 최상단 "Templates" 버튼 → 넓은 사이드패널
- 5단계 별색 → 우측 Design탭 > Appearance > SPOT 모드 (현재 구조 유지)
- 3D 프리뷰 → 헤더 오른쪽 "3D Preview" 토글 → 캔버스 영역 전환
- 제조 마켓플레이스 → 헤더 Export 옆 "Order" 버튼

### 구현 Phase
- Phase 1: SVG 아이콘 + 왼쪽 패널 3카테고리 + 팝업 위치 수정
- Phase 2: 우측 패널 3탭 통합 + Collapsible 섹션
- Phase 3: 파일 분리 (unified-editor.tsx → 컴포넌트별)
- Phase 4: 헤더 재구성 + Export 드롭다운 + 단축키 확장

### 절대 금지 사항
- 기존 기능 삭제 또는 동작 변경 금지
- 캔버스 크기/스케일링/칼선 로딩 로직 변경 금지 (섹션 3)
- PDF CMYK 변환 로직 변경 금지
- opentype.js 텍스트 아웃라인 로직 변경 금지
- 구글 폰트 API 연동 로직 변경 금지
