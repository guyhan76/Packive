# scripts/

EasyPackMaker(EPM) API 기반 다이라인 캐시·미리보기 생성 스크립트.
모두 로컬에서 `npm run dev`가 켜진 상태에서 `node scripts/<file>.js` 형태로 실행한다.

## 주의: API 비용
- EPM API는 **건당 USD 0.47**.
- 동일 파라미터 재호출은 캐시 히트로 **무료**.
- 캐시는 `public/dielines/cache/*.json`.
- 캐시 전체 삭제 후 재생성하면 25개 박스 기준 약 USD 12 소모. 꼭 필요할 때만.

## 메인 도구 (반복 사용)

| 파일 | 용도 |
|---|---|
| `batch-precache.js` | 25개 표준 박스 다이라인을 일괄 캐시 생성. 새 박스 추가/캐시 무효화 시 사용. |
| `batch-generate-previews.js` | 박스 선택 카드용 미리보기 SVG를 `public/dielines/previews/`에 생성. |
| `batch-regen-clean.js` | 미리보기 SVG를 클린 옵션(KnifeInfo/Sizes false)으로 재생성. |

## 일회성 디버깅 (참조용 보존)

| 파일 | 용도 |
|---|---|
| `batch-regen-all25.js` | 25개 박스 일괄 재생성 (캐시 클린 후 1회 실행했던 스크립트). |
| `batch-regen-failed.js` | 실패한 박스 7종 재시도 (디버깅 중 1회용). |
| `batch-retry-failed.js` | 위와 동일 목적의 변종. |
| `batch-final-retry.js` | 최종 재시도 변종. fefco-0310 H 파라미터 보정 포함. |
| `batch-b10b20.js` | ECMA B10/B20 Lid 옵션 단발 생성. |

일회성 5개는 필요 없다고 판단되면 `_archive/old-scripts/`로 옮겨도 됨.

## npm script 등록 제안 (현재 미등록)

`package.json` `scripts`에 다음을 추가하면 `pnpm run` 으로 호출 가능:

```json
"scripts": {
  "precache:dielines": "node scripts/batch-precache.js",
  "previews:dielines": "node scripts/batch-generate-previews.js",
  "previews:regen-clean": "node scripts/batch-regen-clean.js"
}
```

이 후 사용 예: `pnpm run precache:dielines`.

## 환경 변수
스크립트 본체에는 키가 없고, `/api/dieline` 라우트(`src/app/api/dieline/route.ts`)가 `.env.local`의
`EPM_USERNAME`, `EPM_PASSWORD`를 사용한다. 따라서 로컬 dev 서버만 띄우면 동작.
