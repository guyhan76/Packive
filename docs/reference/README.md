# docs/reference/

Packive 다이라인 엔진과 박스 분류의 근거가 되는 외부 산업 표준 및 템플릿 원본.
편집하지 말 것 — 참조 전용.

## standards/

| 파일 | 출처 | 용도 |
|---|---|---|
| `fefco_code.pdf` | FEFCO (Fédération Européenne des Fabricants de Carton Ondulé) | 골판지 박스 표준 코드(0201, 0203, 0215 등) 도면·치수·접힘 규칙의 1차 자료. `dieline-templates.ts`의 box id 명명·치수 가이드의 근거. |
| `ecma_code.pdf` | ECMA (European Carton Makers Association) | 판지 박스(A식, B식 등) 표준 코드의 1차 자료. ECMA A20/A55/B10/B20 다이라인 정의의 근거. |

CLAUDE.md 법적 검토(2026-02-28)에 따라: 코드 번호(0201, A20 등) 참조는 안전.
공식 발행물의 도면 이미지를 직접 복제해 제품 UI에 노출하는 것은 금지.
이 PDF들은 개발 참조용으로만 보관한다.

## dieline-templates/

| 파일 | 출처 | 용도 |
|---|---|---|
| `dct_template_0201_raw.json` | DieCutTemplates(DCT) API raw response | FEFCO 0201 표준 박스 다이라인 템플릿의 외부 정의(변수, 접힘선, 미리보기 SVG URL). EPM API와의 폴백 비교용. |
| `dct_template_0201a_raw.json` | 동상 | 0201A 변종(글루 플랩 외측). |

DCT는 CLAUDE.md 다이라인 우선순위에서 폴백 위치. 호출 형식·필드 명세 참고.

## 용량 주의
- `fefco_code.pdf` ~30 MB, `ecma_code.pdf` ~22 MB.
- git에 직접 보관 중. 추후 저장소 비대화가 부담스러우면 git LFS로 전환 검토.
