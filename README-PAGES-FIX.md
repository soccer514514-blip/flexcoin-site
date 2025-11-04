# Flexcoin — GitHub Pages 안정화 패치 (최신)
날짜: 2025-11-04

## 포함 파일
- .github/workflows/pages.yml (Pages 빌드/배포)
- package.json (간결/안정 스크립트)
- vite.config.ts (Pages 친화 빌드 출력)
- CNAME (flexcoin.io.kr 유지)
- .nojekyll (자산 경로 문제 방지)
- 404.html (SPA 라우팅 보완)

## 적용 방법
1) 이 폴더의 모든 파일을 **리포지토리 루트**에 그대로 복사/덮어쓰기 합니다.
2) 커밋 후 푸시하면 Actions가 자동 실행됩니다. (build → deploy)
3) 배포가 완료되면 https://flexcoin.io.kr 에서 확인하세요.

> 기존의 src/, public/, index.html 등 애플리케이션 소스는 그대로 유지됩니다.
