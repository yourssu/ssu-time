# Frontend Deployment & CI/CD Guide

이 문서는 `ssu-time` 프론트엔드 애플리케이션의 AWS 배포 아키텍처와 자동화된 CI/CD 파이프라인에 대해 설명합니다.

## 1. 배포 아키텍처

본 프로젝트는 AWS의 서버리스 서비스를 활용하여 안정적이고 확장 가능하며 비용 효율적으로 배포됩니다.

- **도메인**: `ssu-time.yourssu.com`
- **핵심 구조**: **S3** + **CloudFront** + **ACM** + **Route 53**
- **동작 방식**:
  1. 사용자가 `https://ssu-time.yourssu.com`에 접속합니다.
  2. **Route 53**가 도메인을 **CloudFront** 배포로 연결합니다.
  3. **CloudFront**는 **ACM**에서 발급된 SSL 인증서로 HTTPS 통신을 처리하고, 캐시된 콘텐츠를 사용자에게 빠르게 전송합니다.
  4. 캐시가 없는 경우, OAC(Origin Access Control)를 통해 비공개 **S3** 버킷에서 원본 파일을 가져와 사용자에게 전달합니다.

### AWS 리소스 상세 정보

- **S3 Bucket**:
  - **버킷 이름**: `<S3_BUCKET_NAME>`
  - **역할**: React 앱 빌드 결과물(HTML, JS, CSS 등 정적 파일) 저장.
  - **설정**: 모든 퍼블릭 액세스가 차단된 비공개 버킷. CloudFront를 통해서만 접근 가능.

- **CloudFront Distribution**:
  - **배포 ID**: `E20FWG8Q28W5MH`
  - **도메인**: `<CLOUDFRONT_DOMAIN_NAME>`
  - **역할**: CDN, SSL 종료, 사용자 트래픽의 진입점.
  - **주요 설정**:
    - S3 접근 제어를 위한 OAC(Origin Access Control) 사용.
    - HTTP를 HTTPS로 자동 리디렉션.
    - SPA 라우팅을 위해 403, 404 오류 발생 시 `/index.html`로 리디렉션.

- **ACM (AWS Certificate Manager)**:
  - `ssu-time.yourssu.com` 도메인을 위한 퍼블릭 SSL 인증서를 발급.
  - **비용은 무료**이며, 자동으로 갱신됩니다.
  - **리전**: `us-east-1` (CloudFront 연동을 위해 필수)

- **Route 53**:
  - `yourssu.com` 호스팅 영역에 `ssu-time.yourssu.com`에 대한 `A` 타입 별칭(Alias) 레코드가 설정되어 CloudFront 배포를 가리킵니다.

## 2. CI/CD 자동 배포 파이프라인

GitHub Actions를 사용하여 배포 과정을 자동화했습니다.

- **워크플로우 파일**: `.github/workflows/deploy.yml`
- **실행 조건**: `main` 브랜치에 코드가 푸시(push)될 때, `frontend/@ssu-time/frontend/` 디렉터리 내에 변경 사항이 있는 경우에만 실행됩니다. (수동 실행도 가능)

### 자동화 프로세스

1.  **AWS 자격 증명 획득**: OIDC를 통해 GitHub Actions가 IAM 역할을 수임하여 안전하게 임시 AWS 자격 증명을 얻습니다.
2.  **프로젝트 빌드**: `npm install` 및 `npm run build`를 실행하여 프로덕션 파일을 생성합니다.
3.  **S3에 배포**: 빌드된 `dist` 폴더의 내용을 `s3://<S3_BUCKET_NAME>` 버킷에 동기화합니다. (`--delete` 옵션으로 이전 파일은 삭제)
4.  **CloudFront 캐시 무효화**: `aws cloudfront create-invalidation` 명령으로 CloudFront의 모든 엣지 로케이션 캐시를 무효화하여 사용자가 즉시 최신 버전을 볼 수 있도록 합니다.

### IAM 보안 설정

- **IAM OIDC 공급자**: AWS 계정이 GitHub Actions를 신뢰하도록 설정되었습니다.
- **IAM 역할**:
  - **역할 이름**: `GitHubActions-ssu-time-deploy`
  - **신뢰 관계**: `leo/ssu-time` GitHub 리포지토리에서만 역할을 수임할 수 있도록 제한됩니다.
  - **권한 정책**: S3 버킷 동기화 및 CloudFront 캐시 무효화에 필요한 최소한의 권한만 부여되어 있습니다.

## 3. 향후 배포 방법

프론트엔드 코드를 수정한 후, 해당 변경 사항을 **`main` 브랜치로 푸시(push)하기만 하면 됩니다.** 모든 배포 과정은 GitHub Actions가 자동으로 처리합니다.
� 자동으로 처리합니다.
�로 처리합니다.
