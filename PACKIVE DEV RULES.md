
---

## 2026-02-27 작업 기록

### 1. CMYK Fill/Stroke 수동 입력 수정 ✅
- **파일**: `src/components/editor/unified-editor.tsx`
- **위치**: Fill CMYK (line ~2028), Stroke CMYK (line ~2047)
- **내용**: `<input type="number">` 필드에서 직접 타이핑 불가 → 수동 입력 가능하도록 수정
- **동작**: 숫자 입력 후 Tab/Enter → 색상 즉시 반영

### 2. Measure 도구 → Adobe Illustrator 스타일 리디자인 ✅
- **파일**: `src/components/editor/unified-editor.tsx`
- **수정 함수**: `drawMeasure`, `removeMeasureObjects`, `toggleMeasure`, Measure 버튼 SVG
- **변경 사항**:
  - 측정선: 주황색(#E65100) 두꺼운 선 → 검정(#333) 가는 선 + 양끝 삼각형 화살표
  - 시작점: 주황 dot → 십자형(+) 크로스헤어
  - 거리 라벨: 모노스페이스 폰트, 반투명 배경
  - 보조선: 수평/수직 회색 점선 + ΔX/ΔY mm 값
  - 각도 표시: 각도값(°) + 호(arc) 표시
  - 색상 팔레트: #333333, #666666, #999999
  - 아이콘: 대각선+화살표+십자 SVG로 교체
- **`_isMeasure` 플래그**: 모든 측정 객체에 부여, 제거 시 필터링에 사용

### 3. 측정 단위 변환 버그 수정 ✅
- **파일**: `src/components/editor/unified-editor.tsx`
- **수정 함수**: `calcDistance`, `drawMeasure` (dxMM, dyMM)

#### 3-1. 이중 곱셈 제거
- **변경 전**: `distPx / scale * 0.3528`
- **변경 후**: `distPx / scale`
- **원인**: `scaleRef`가 이미 px/mm 비율이므로 0.3528 추가 곱셈은 이중 변환

#### 3-2. SVG 96 DPI 대응
- Inkscape SVG: 96 DPI 기준 (1 user unit = 0.2646 mm)
- **변경**: `unitFactor = useEngineRef.current ? 1 : 0.2646`
- 엔진 모드: mm 단위이므로 unitFactor = 1
- SVG 모드: 96 DPI이므로 unitFactor = 0.2646

#### 3-3. scaleRef 정확도 개선
- `loadDielineOnCanvas` 내에서 `fitScale`을 `scaleRef.current`에 저장
- SVG 업로드 핸들러에서도 그룹 스케일을 `scaleRef`에 반영
- **최종 정밀도**: ±2% (마우스 클릭 정밀도 한계)

### 4. SVG 이중 로드 버그 수정 ✅
- **파일**: `src/components/editor/unified-editor.tsx`
- **원인**: SVG 업로드 핸들러가 직접 캔버스에 그룹 추가 + `setDielineSVG`로 캔버스 재생성 → `ReloadDieline` useEffect가 다시 로드
- **해결**:
  - 업로드 핸들러에서 직접 캔버스 추가 코드 제거
  - `setDielineSVG`만 설정 → 캔버스 초기화 useEffect에서 1회만 `loadDielineOnCanvas` 호출
  - `ReloadDieline` useEffect 중복 호출 비활성화
  - `loadDielineOnCanvas` 호출 횟수: 2회 → 1회

### 5. 첫 업로드 시 칼선 미표시 버그 수정 ✅
- **파일**: `src/components/editor/unified-editor.tsx`
- **원인**: `svgLoadedByUploadRef` 플래그가 캔버스 재생성 후 `loadDielineOnCanvas` 호출을 차단
- **해결**: 로드 흐름을 단일 경로로 통일 (캔버스 초기화 useEffect → loadDielineOnCanvas)

### 6. 업로드 안내 모달 추가 ✅
- **파일**: `src/components/editor/unified-editor.tsx`
- **추가 상태**: `showUploadGuide` (useState)
- **동작**: Upload Dieline 버튼 클릭 → 안내 모달 표시 → "파일 선택" 클릭 → 파일 다이얼로그
- **모달 내용**:
  - 지원 형식: SVG, EPS, AI, PDF, PS
  - 칼선 색상 규칙: 빨간색=절단선, 초록색=접힘선(오시선)
  - 파일 준비 가이드라인 6개 항목
  - 교체 경고 문구
  - 취소 / 파일 선택 버튼

### 7. 모달 한글 번역 ✅
- **파일**: `src/components/editor/unified-editor.tsx`
- **번역 항목** (총 11개):
  - Upload Dieline File → 칼선 전개도 업로드
  - Supported formats → 지원 형식
  - Guidelines → 안내사항
  - red strokes (cut lines) → 빨간색 선 (칼선/절단선)
  - green strokes (fold/crease) → 초록색 선 (접힘선/오시선)
  - 가이드라인 4개 항목 한글화
  - 경고 문구 한글화
  - Cancel → 취소, Choose File → 파일 선택

---

### 핵심 기술 메모

| 항목 | 값 |
|---|---|
| SVG 단위 변환 (Inkscape 96 DPI) | 1 user unit = 0.2646 mm |
| SVG 단위 변환 (72 DPI, 참고용) | 1 pt = 0.3528 mm |
| 엔진 모드 단위 | mm (unitFactor = 1) |
| 측정 객체 식별 플래그 | `_isMeasure: true` |
| 칼선 그룹 식별 | `name: '__dieline_group__'`, `_isDieLine: true` |
| scaleRef | `loadDielineOnCanvas`의 fitScale 값 저장 |
| useEngineRef | 엔진 모드 여부 (true=mm, false=SVG pt) |
| 측정 정밀도 | ±2% (마우스 클릭 한계) |

### 남은 과제
- [ ] 다국어 전환 (한/영)
- [ ] Spot Color 지원
- [ ] Bleed Guide (재단선 가이드)
- [ ] AI/PDF 디자인 편집 지원

---

## 2026-02-28 Packive 전체 법적 검토 보고서

### 검토 목적
Packive 플랫폼의 모든 기능, 라이브러리, 리소스에 대해 저작권, 상표권, 특허, 라이선스 위반 여부를 사전 검토하여 법적 리스크를 제거한다.

---

### A. 핵심 프레임워크 및 라이브러리

| 패키지 | 라이선스 | 상업적 사용 | 의무사항 | 판정 |
|---|---|---|---|---|
| Next.js 16 | MIT | ✅ 가능 | 저작권 고지 유지 | ✅ 안전 |
| React 19 | MIT | ✅ 가능 | 저작권 고지 유지 | ✅ 안전 |
| Fabric.js 7 | MIT | ✅ 가능 | 저작권 고지 유지 | ✅ 안전 |
| Three.js | MIT | ✅ 가능 | 저작권 고지 유지 | ✅ 안전 |
| @react-three/fiber | MIT | ✅ 가능 | 저작권 고지 유지 | ✅ 안전 |
| @react-three/drei | MIT | ✅ 가능 | 저작권 고지 유지 | ✅ 안전 |
| jsPDF | MIT | ✅ 가능 | 저작권 고지 유지 | ✅ 안전 |
| Zustand | MIT | ✅ 가능 | 저작권 고지 유지 | ✅ 안전 |
| Zod | MIT | ✅ 가능 | 저작권 고지 유지 | ✅ 안전 |
| Tailwind CSS 4 | MIT | ✅ 가능 | 저작권 고지 유지 | ✅ 안전 |
| Radix UI | MIT | ✅ 가능 | 저작권 고지 유지 | ✅ 안전 |
| clsx / tailwind-merge | MIT | ✅ 가능 | 저작권 고지 유지 | ✅ 안전 |
| class-variance-authority | Apache 2.0 | ✅ 가능 | 저작권 고지 + NOTICE 파일 | ✅ 안전 |
| lucide-react | ISC | ✅ 가능 | 저작권 고지 유지 | ✅ 안전 |
| react-hot-toast | MIT | ✅ 가능 | 저작권 고지 유지 | ✅ 안전 |
| bwip-js (바코드) | MIT | ✅ 가능 | 저작권 고지 유지 | ✅ 안전 |
| qrcode | MIT | ✅ 가능 | 저작권 고지 유지 | ✅ 안전 |

**의무 조치:** `/about` 또는 `/licenses` 페이지에 모든 MIT/ISC/Apache 라이선스 고지문을 포함해야 함.

---

### B. 결제/인프라 서비스

| 서비스 | 라이선스/약관 | 상업적 사용 | 판정 |
|---|---|---|---|
| Stripe (@stripe/stripe-js) | Stripe 서비스 약관 | ✅ 사업자 가입 후 사용 가능 | ✅ 안전 |
| Supabase (@supabase/supabase-js) | Apache 2.0 + Supabase 서비스 약관 | ✅ Free/Pro 플랜 사용 가능 | ✅ 안전 |
| Prisma | Apache 2.0 | ✅ 가능 | ✅ 안전 |
| shadcn/ui | MIT | ✅ 가능 (컴포넌트 복사 방식) | ✅ 안전 |

---

### C. ⚠️ 폰트 (FONTS) — 주의 필요

현재 사용 중인 폰트 목록:

#### ✅ 안전한 폰트 (Google Fonts — SIL OFL / Apache 2.0)
| 폰트 | 라이선스 | 상업적 사용 | 판정 |
|---|---|---|---|
| Noto Sans KR | SIL OFL | ✅ 가능 | ✅ 안전 |
| Noto Serif KR | SIL OFL | ✅ 가능 | ✅ 안전 |
| Black Han Sans | SIL OFL | ✅ 가능 | ✅ 안전 |
| Jua | SIL OFL | ✅ 가능 | ✅ 안전 |
| Gothic A1 | SIL OFL | ✅ 가능 | ✅ 안전 |
| Noto Sans JP | SIL OFL | ✅ 가능 | ✅ 안전 |
| Noto Serif JP | SIL OFL | ✅ 가능 | ✅ 안전 |
| Inter | SIL OFL | ✅ 가능 | ✅ 안전 |
| Montserrat | SIL OFL | ✅ 가능 | ✅ 안전 |
| Poppins | SIL OFL | ✅ 가능 | ✅ 안전 |
| Lato | SIL OFL | ✅ 가능 | ✅ 안전 |
| Open Sans | SIL OFL | ✅ 가능 | ✅ 안전 |
| Roboto | Apache 2.0 | ✅ 가능 | ✅ 안전 |
| Playfair Display | SIL OFL | ✅ 가능 | ✅ 안전 |
| Lora | SIL OFL | ✅ 가능 | ✅ 안전 |
| Merriweather | SIL OFL | ✅ 가능 | ✅ 안전 |
| Bebas Neue | SIL OFL | ✅ 가능 | ✅ 안전 |
| Anton | SIL OFL | ✅ 가능 | ✅ 안전 |
| Oswald | SIL OFL | ✅ 가능 | ✅ 안전 |
| Pacifico | SIL OFL | ✅ 가능 | ✅ 안전 |
| Dancing Script | SIL OFL | ✅ 가능 | ✅ 안전 |

#### ⚠️ 주의 필요 폰트
| 폰트 | 라이선스 | 문제 | 조치 |
|---|---|---|---|
| Arial | Microsoft 독점 | 웹에서 CSS 시스템 폰트로 참조는 OK, 폰트 파일 번들 배포 금지 | ⚠️ CSS fallback으로만 사용, 파일 포함 금지 |
| Georgia | Microsoft 독점 | 동일 | ⚠️ CSS fallback으로만 사용 |
| Courier New | Microsoft 독점 | 동일 | ⚠️ CSS fallback으로만 사용 |

**조치:** Arial, Georgia, Courier New는 CSS `font-family` 스택에서 시스템 폰트 fallback으로 참조하는 것은 합법. 그러나 Packive가 이 폰트 파일(.ttf/.woff)을 서버에서 호스팅하거나 번들에 포함해서는 안 됨. 사용자 PC에 설치된 폰트를 참조하는 것일 뿐임. **현재 코드의 `"Arial, sans-serif"` 형태는 안전함.**

향후 폰트 추가 시 반드시 SIL OFL 또는 Apache 2.0 라이선스 확인 필요. 상용 폰트(Helvetica, Futura, Avenir 등) 절대 포함 금지.

---

### D. ⚠️ Spot Color / Pantone — 주의 필요

**상세 분석: 이전 섹션(2026-02-28 Spot Color 법적 검토) 참조**

요약:
- "PANTONE" 상표를 색상 이름에 사용: ❌ 금지 (라이선스 없이)
- Pantone 번호→HEX 자동 변환 데이터베이스 내장: ❌ 금지
- 사용자가 텍스트로 "Pantone 185 C" 입력 (인쇄 지시용): ✅ Nominative Fair Use
- CIELAB HLC 색상 시스템 사용: ✅ CC 라이선스, 완전 안전
- 자체 명명 색상 라이브러리 (PKV-xxxx): ✅ 자체 창작물

---

### E. FEFCO / ECMA 박스 표준 코드

| 항목 | 상태 | 설명 |
|---|---|---|
| FEFCO 코드 번호 (0201, 0215 등) | ✅ 안전 | 업계 표준 분류 번호로 자유롭게 참조 가능. Esko, packQ, Pacdora 등 모든 패키지 소프트웨어가 사용 중 |
| FEFCO 공식 도면 이미지 복제 | ⚠️ 주의 | FEFCO 공식 PDF 도면의 직접 복제는 저작권 이슈 가능. 자체 생성한 SVG 다이라인은 안전 |
| ECMA 코드 번호 | ✅ 안전 | FEFCO와 동일하게 업계 표준 분류 체계 |
| 자체 생성 다이라인 SVG | ✅ 안전 | Packive가 자체 제작한 파라메트릭 다이라인 |

**조치:** FEFCO 코드 번호 참조는 합법. 단, FEFCO 공식 발행물(PDF, 이미지)을 직접 복제하지 말 것. Packive가 자체 생성한 SVG 다이라인은 완전 안전.

---

### F. OpenAI API (AI 리뷰 기능)

| 항목 | 상태 | 설명 |
|---|---|---|
| OpenAI API 상업적 사용 | ✅ 가능 | OpenAI Terms: "you own the Output" |
| AI 생성 디자인 리뷰 텍스트 | ✅ 가능 | 출력물 저작권은 사용자에게 귀속 |
| AI 생성 이미지 사용 | ✅ 가능 | 상업적 사용 허용 (OpenAI TOS 확인) |
| API 비용 | 사용량 기반 과금 | Packive 사업 비용으로 반영 필요 |

**조치:** OpenAI API 사용약관 준수. AI 생성 콘텐츠에 "AI-assisted" 표시 권장 (법적 의무는 아니지만 투명성 확보).

---

### G. SVG 형식 / 내보내기 기능

| 항목 | 상태 | 설명 |
|---|---|---|
| SVG 형식 자체 | ✅ 안전 | W3C 오픈 표준, 특허 로열티 프리 |
| PNG 내보내기 | ✅ 안전 | PNG는 특허 프리 형식 |
| PDF 내보내기 (jsPDF) | ✅ 안전 | jsPDF는 MIT 라이선스 |
| 사용자 업로드 SVG/EPS/PDF | ✅ 안전 | 사용자 콘텐츠 — 사용자 책임 |

---

### H. 바코드/QR코드

| 항목 | 상태 | 설명 |
|---|---|---|
| bwip-js (바코드 생성) | ✅ MIT | 상업적 사용 가능 |
| qrcode (QR코드 생성) | ✅ MIT | 상업적 사용 가능 |
| 바코드 표준 (EAN, UPC, Code128 등) | ✅ 안전 | 국제 표준 — 자유 사용 |
| QR코드 표준 | ✅ 안전 | ISO/IEC 18004 — 특허 만료, 자유 사용 |

---

### I. 필수 법적 조치 체크리스트

#### 즉시 필요
- [ ] `/licenses` 페이지 생성: 모든 오픈소스 라이선스 고지문 표시
- [ ] 이용약관(Terms of Service): 사용자 콘텐츠 책임 면책 조항
- [ ] 색상 면책 문구: "화면 색상은 근사치이며 인쇄 결과와 다를 수 있음"
- [ ] Pantone 상표 면책: "Pantone®은 Pantone LLC의 등록 상표입니다"
- [ ] 폰트 파일 번들 확인: Arial/Georgia/Courier New .ttf/.woff 파일이 프로젝트에 포함되어 있지 않은지 확인

#### 향후 기능 추가 시 체크
- [ ] 새 폰트 추가: SIL OFL 또는 Apache 2.0 라이선스만 허용
- [ ] 새 아이콘 추가: MIT/ISC/Apache 라이선스만 허용
- [ ] 색상 시스템 추가: Pantone 데이터 내장 금지, CIELAB HLC(CC) 또는 자체 라이브러리만
- [ ] 이미지/템플릿 추가: 저작권 확인 필수
- [ ] 제3자 API 추가: 약관에서 상업적 사용 및 출력물 소유권 확인

---

### J. 요약: 리스크 등급

| 등급 | 항목 |
|---|---|
| ✅ 안전 (24개) | Next.js, React, Fabric.js, Three.js, jsPDF, Zustand, Zod, Tailwind, Radix, lucide, 모든 Google Fonts(21개), bwip-js, qrcode, Stripe, Supabase, Prisma, shadcn, OpenAI API, SVG/PNG/PDF 형식, FEFCO/ECMA 코드 번호, 바코드/QR표준 |
| ⚠️ 주의 (4개) | Arial/Georgia/Courier New (시스템 폰트 참조만 가능), Pantone (사용자 텍스트 입력만 가능, 데이터베이스 내장 금지), FEFCO 공식 도면 (자체 생성 SVG만 사용) |
| ❌ 금지 (0개) | 현재 코드에 금지 항목 없음 |

**결론: 현재 Packive 코드베이스는 법적으로 안전함. 위 ⚠️ 주의 항목의 경계선만 지키면 문제 없음.**

---

## 핵심 원칙: 모든 기능 추가 시 법적 검토 우선 (2026-02-28 확정)

### 원칙 선언
> Packive에 추가되는 모든 기능, 라이브러리, 리소스, 데이터는 구현 착수 전에 반드시 법적 검토를 완료해야 한다.
> 법적 검토 없이 구현된 기능은 배포 전 반드시 사후 검토를 수행한다.

### 필수 검토 5대 항목

| 번호 | 검토 항목 | 확인 내용 | 예시 |
|:---:|---|---|---|
| 1 | 저작권 (Copyright) | 외부 리소스의 저작권 상태 | 폰트 파일 번들링 금지 |
| 2 | 상표권 (Trademark) | 제3자 브랜드명 사용 시 Fair Use 3요건 충족 | Pantone 상표 사용 규칙 |
| 3 | 특허 (Patent) | 알고리즘, UI 패턴의 특허 침해 여부 | QR코드 특허 만료 확인 |
| 4 | 라이선스 (License) | 오픈소스 라이선스 조건 준수 | fabric.js MIT 고지 의무 |
| 5 | 개인정보 (Privacy) | 사용자 데이터 수집 시 개인정보보호법 준수 | Supabase 데이터 처리 |

### Nominative Fair Use (상표 공정 이용) 3요건
제3자 상표를 참조할 때 아래 3가지를 모두 충족해야 한다:
1. 필요성: 해당 상표 없이는 제품/서비스를 식별할 수 없음
2. 최소 사용: 필요한 만큼만 텍스트로 사용 (로고/디자인 요소 사용 금지)
3. 비후원: 후원/보증/제휴를 암시하지 않음 + 면책 문구 표기

### 법적 검토 프로세스 (기능 추가 시 필수)
기능 기획 -> 법적 리스크 식별 -> 외부 리소스 라이선스 확인 -> 상표 사용 여부 확인 -> 검토 결과 본 파일에 기록 -> 구현 착수 -> 배포 전 최종 확인

### 현재 법적 상태 요약 (2026-02-28 기준)
- 안전(24개): Next.js, React, Fabric.js, Three.js, jsPDF, Zustand, Zod, Tailwind, Radix, lucide-react, Google Fonts(21개), bwip-js, qrcode, Stripe, Supabase, Prisma, shadcn, OpenAI API, SVG/PNG/PDF 형식, FEFCO/ECMA 코드, 바코드/QR 표준
- 주의(4개): 시스템 폰트(번들링 금지), Pantone DB(자동매핑 금지), FEFCO 공식 도면(자체 SVG만)
- 금지(0개): 현재 코드에 금지 항목 없음

### 금지 행위 목록
1. Pantone 색상 번호를 HEX로 자동 변환하는 데이터베이스 내장 (저작권 침해)
2. Pantone 색상 이름을 Packive 자체 색상명으로 사용 (상표권 침해)
3. 상용 폰트 파일(Helvetica, Futura, Avenir, Arial .ttf 등) 서버 호스팅/번들 포함
4. FEFCO/ECMA 공식 발행물(PDF, 이미지) 직접 복제
5. 제3자 로고/아이콘을 무단 사용
6. 라이선스 미확인 오픈소스 라이브러리 도입

### 허용 행위 목록
1. 사용자가 텍스트로 Pantone 185 C 등 참조 입력 (Nominative Fair Use)
2. CIELAB HLC 색상 시스템 사용 (CC BY 4.0 - 출처 표기 필수)
3. Packive 자체 명명 색상 라이브러리 (PKV-xxxx)
4. Google Fonts (SIL OFL/Apache 2.0) 사용 및 호스팅
5. FEFCO/ECMA 코드 번호 참조 + 자체 생성 SVG 다이라인
6. MIT/ISC/Apache 라이선스 라이브러리 사용 (고지 의무 준수)

### 필수 면책 문구 (UI에 표시)
색상 면책: 화면에 표시되는 색상은 모니터 설정에 따라 실제 인쇄 결과와 다를 수 있습니다. 정확한 색상 재현을 위해 인쇄 교정쇄(proof)를 확인하시기 바랍니다. Pantone은 Pantone LLC의 등록 상표입니다. Packive는 Pantone LLC와 제휴 관계가 없습니다.

---

## 2026-02-28 Spot Color 구현 계획

### 작업 순서 (확정)
| 우선순위 | 작업 | 상태 |
|:---:|---|:---:|
| 1 | Spot Color 지원 (Level 1->2->3) | 진행 중 |
| 2 | SVG/PNG 내보내기 | 대기 |
| 3 | Bleed 설정 상태 추가 | 대기 |
| 4 | 다국어 전환 (한/영) - 모든 기능 완료 후 맨 마지막 | 대기 |

### Spot Color 3단계 하이브리드 구조

#### Level 1: Packive 자체 Spot Color 라이브러리 (약 100개)
- 파일: src/data/packive-spot-colors.ts
- 명명 규칙: PKV- 접두사 (예: PKV-R001 Packive Red)
- 데이터: id, name, nameKo, hex, cmyk[4], category
- 카테고리: Red, Orange, Yellow, Green, Blue, Purple, Pink, Brown, Neutral, Metallic, Pastel
- 법적 상태: 안전 - 자체 창작물
- 주의: Pantone 공식 HEX 값 복사 금지, 독립적으로 색상 선정

#### Level 2: CIELAB HLC 확장 라이브러리 (약 2040개)
- 파일: src/data/cielab-hlc-colors.ts
- 출처: freieFarbe e.V. (freiefarbe.de)
- 라이선스: CC BY 4.0 - 출처 표기 필수
- 법적 상태: 안전 (출처 표기 조건)
- UI: 가상 스크롤 적용 (2040개 성능 최적화)
- 출처 표기: Color data: CIELAB HLC Colour Atlas freieFarbe e.V., CC BY 4.0

#### Level 3: 사용자 커스텀 Spot Color
- 저장: localStorage (추후 Supabase 연동)
- 입력 필드: 색상 이름 + HEX 값 + 참조 색상명(선택, 예: Pantone 185 C)
- 법적 상태: 안전 (사용자 입력 - 사용자 책임)
- Pantone 참조: 텍스트만 저장, 자동 변환 없음 (Nominative Fair Use)
- 면책 문구 표시 필수

### UI 변경 사항
- colorMode 타입: rgb | cmyk -> rgb | cmyk | spot
- 속성 패널에 [RGB] [CMYK] [SPOT] 3개 탭
- SPOT 탭: 검색, 카테고리 필터, 색상 그리드, Fill/Stroke 전환, 커스텀 입력
- fabric.js 커스텀 속성: _spotFill, _spotFillName, _spotStroke, _spotStrokeName, _pantoneRef
- toObject 오버라이드: 커스텀 속성 직렬화 보장

### 수정 파일 목록
| 파일 | 변경 내용 |
|---|---|
| src/data/packive-spot-colors.ts | 신규 생성 - Level 1 색상 데이터 |
| src/data/cielab-hlc-colors.ts | 신규 생성 - Level 2 HLC 데이터 |
| src/components/editor/unified-editor.tsx | colorMode 확장, SPOT 탭 UI, 핸들러, selProps 확장, toObject 오버라이드 |
| PACKIVE DEV RULES.md | 본 계획 기록 |


---

## Canvas Size Rules - DO NOT CHANGE (2026-03-01)

pxPerUnit min: Math.max(fitScale, 2.0)
availW: cw - 20
availH: ch - 60
canvasW limit: Math.min(Math.round(netW * pxPerUnit), cw - 20)
canvasH limit: Math.min(Math.round(netH * pxPerUnit), ch - 60)
wrapper: pb-7 class for vertical centering

Reference canvas (FEFCO-0215 120x60x160): wrapper ~744x674, canvas ~704x537+
Canvas must be centered horizontally and vertically in center panel.
Status bar (28px) must not overlap canvas bottom.

---

## 필수 백업 규칙 (2026-03-02 확정) - MUST READ EVERY SESSION

### 원칙
> 모든 파일 수정 스크립트는 반드시 백업+검증 패턴을 포함해야 한다.
> 이 규칙은 채팅이 압축되더라도 반드시 지켜야 한다.
> RULES.MD를 읽지 않고 파일을 수정하는 것은 금지한다.

### 필수 패턴 1: 수정 전 백업
- backups 폴더에 타임스탬프 파일명으로 복사
- 경로: C:\Users\user\Desktop\dev\packive\backups\
- 형식: 파일명_YYYYMMDD_HHMMSS.확장자

### 필수 패턴 2: 수정 후 검증
- 수정 후 라인수가 백업 대비 50% 이하로 줄면 자동 복원
- export default function, fcRef, useEffect, return ( 키워드 존재 확인
- 키워드 누락시 자동 복원

### 금지 사항
1. 백업 없이 WriteAllLines/WriteAllText 호출 금지
2. 백업 없이 파일 내용 교체 스크립트 실행 금지
3. 검증 없이 스크립트 종료 금지

### 복구 방법
- backups 폴더에서 최신 타임스탬프 파일을 원본 위치로 복사

---

## 핵심 요구사항 7가지 (2026-03-02 확정) - MOST IMPORTANT

### 1. 칼선 생성
- BoxMaker API로 FEFCO/ECMA 칼선 전개도 생성
- EPS 파일 직접 업로드 지원

### 2. 모든 요소 벡터 처리
- 칼선, 텍스트, 이미지, 도형, 테이블 모두 벡터
- 텍스트 아웃라인(outline) 처리 필수

### 3. CMYK + 별색(Spot Color)
- CMYK 4원색 지원
- 별색(PKV, HLC, Custom) 지원

### 4. 특수 인쇄 레이어
- 형압(embossing), 박인쇄(foil stamping), 실크인쇄(silk printing)
- 레이어별 색상 구분

### 5. PDF 벡터 내보내기
- 모든 요소 벡터 PDF, 텍스트 아웃라인, 인쇄용 300DPI+

### 6. Adobe Illustrator 호환 (매우 중요)
- PDF를 AI에서 편집 가능, 벡터/레이어/CMYK 유지

### 7. ICC 기반 CMYK 색상 (매우 중요)
- RGB가 아닌 CMYK ICC 프로파일 기반 색상 표시
- FOGRA39 또는 Japan Color 2001 ICC 프로파일 사용
- CMYK 값이 원본, RGB는 화면 표시용 파생값
- 모든 오브젝트에 CMYK 값 원본 저장
