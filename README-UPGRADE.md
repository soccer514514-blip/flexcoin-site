
# Flexcoin Vite Upgrade Patch

Uploaded: 2025-11-04T04:37:45.184800Z

## What this fixes
- JS 경로를 **상대경로(./)** 로 변경 → i18n/카운트다운이 확실히 로드
- **글로벌 에러 배너** 추가 → 브라우저 하단에 오류 메시지 표시
- i18n/Countdown **안전한 기본값**과 폴백 처리
- 민팅 UI UX 개선(지갑 미탑재 안내)

## How to apply (초간단)
1) 이 ZIP의 파일들을 **기존 리포지토리 루트**에 덮어쓰기 업로드  
2) Commit to `main` → Actions 자동 빌드/배포  
3) `https://flexcoin.io.kr` 새로고침 → 하단 에러 배너가 보이면 메시지를 캡처해 주세요.

## 메모
- 컨트랙트 주소는 `src/modules/mint.ts`의 `ADDR`에 실제 주소로 교체하세요.
- 카운트다운 시작일은 `config/config.presale.json`에서 변경 가능.
