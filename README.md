# TERRASKETCH

<img src="https://github.com/8hojung24/TerraSketch/assets/67528774/dfbfd00b-d5af-4cdd-8418-82fb7962fd7c" width="300"><br/>

Terraform을 이용하여 사용자가 구성한 클라우드 인프라를 IaC 기반의 환경으로 자동화하는 동시에, 시각적인 다이어그램을 통해 인프라 구조를 한눈에 볼 수 있도록 하는 웹 서비스
<br/>

## 프로젝트 주요 내용
- **인프라 설계도 작성 시 필요한 기능들 제공**
- 인프라 이미지를 통해 클라우드 설계도를 작성하면 설계도에 따른 코드뷰어에 Terraform 코드 렌더링
- 코드는 인프라별 필수 코드와 선택 옵션(주석 처리)을 제공
- 사용자는 코드뷰어에서 코드 수정 가능
- 코드 다운로드 시, 보안 검사 도구(Snyk)를 통해 코드에 대한 문법 오류, 논리 오류, 구성, 보안 등을 점검
- 사용자는 다운로드한 코드를 사용하여 AWS 인프라를 배포 가능
※ 배포 전, CSP의 자격 증명 및 공급자 구성은 사용자 역할로 두고 있음
<br/>

## 프로젝트 개발과정
- 그림 그리기 오픈소스, Excalidraw를 수정하여 서비스 제공
- [프론트] 코드뷰어, 인프라 선택창
- [백엔드] Excalidraw의 기존 아이콘 속성에 Terraform 객체, 변수를 생성
- [백엔드] 그룹핑 되어있는 경우 Terraform 객체를 찾지 못함 → 그룹, State에 대한 Terraform 객체 및 함수들 작성
- AWS 인프라 이미지, 인프라 별 Terraform 코드 정리(Firebase 연동)
- 파일 다운 기능 및 다운로드 된 파일이 보안검사도구(Snyk)에 연동되게 함.
<br/>

## IaC 코드 렌더링 시스템 흐름도
<img src="https://github.com/Cloud-IaC-Diagram/TerraSketch/assets/67528774/0e1c80f2-13f5-4f03-9702-e437a0599fda" width="400">
<br/>

## Infra Editor System UI
<img src="https://github.com/Cloud-IaC-Diagram/TerraSketch/assets/67528774/889ba481-d1e4-4d21-bceb-e9ff5f841856" width="500">
<br/>
<img src="https://github.com/Cloud-IaC-Diagram/TerraSketch/assets/67528774/8695a43e-f5a0-44fb-ad3e-93e607889536" width="500">
<br/>

## 보안 검사(Snyk 연동)
<img src="https://github.com/Cloud-IaC-Diagram/TerraSketch/assets/67528774/a5215b7a-faf9-492b-93d0-27986db95232" width="500">
<br/>

## IaC 코드 안전성
1. **암호화 키 설정**
    - KMS(Key Management Service)를 통해 키를 관리할 때, 보안 위험을 최소화하기 위해 관리자 역할과 암복호화 역할을 분리해야 하며, IAM 또는 키 정책 작성 시 kms 값에 와일드카드를 사용하지 않아야 한다.
    - IaC 구성 파일에 민감한 정보를 하드코딩하지 않고, 비밀 관리 도구를 사용해 안전하게 관리해야한다.
    <br/>
    <div style="text-align: center;">
      <img src="https://github.com/8hojung24/TerraSketch/assets/67528774/2f43eb8f-244c-477b-bd9a-9fe89ee12187" width="400">
    </div>

2. **네트워크 설정**
    - IaC 코드에서 잘못된 네트워크 설정과 관련된 클라우드 보안 위협은 대부분 승인되지 않은 사용자의 무단 액세스에서 기인한다. 이를 방지하기 위해서는 네트워크 범위를 제한하여 사용자에게 정확한 권한을 할당해야 한다.
    - 안전한 IaC 네트워크 설정 방법으로는 HTTP 사용 제한, VPC 사용 시 공용 IP 자동 할당 방지, CIDR IP 값 제한 등이 있다.
    <br/>
    <div style="text-align: center;">
      <img src="https://github.com/8hojung24/TerraSketch/assets/67528774/a5036f30-caa9-4e15-8922-81de94b97970" width="400">
    </div>

3. **IAM 설정**
    - 클라우드 보안 위협은 대부분 과도한 권한 설정, 정책 오류에 의해 발생합니다. 이에 사용자와 리소스에 대한 최소 권한 부여, 세분화된 접근 제어가 필요하다.
    - IaC를 통해 IAM 설정을 자동화할 경우, 코드 기반의 일관된 정책 적용, 자동화, 버전 관리가 가능하며, IAM 설정의 변경 사항을 추적하여 보안 위협에 대응할 수 있다.
    <br/>
    <div style="text-align: center;">
      <img src="https://github.com/8hojung24/TerraSketch/assets/67528774/662323cd-8a63-4fd8-8f83-4809e3427c9d" width="400">
    </div>

4. **데이터베이스 설정**
    - IaC 데이터베이스 설정 및 저장소 암호화와 관련하여 클라우드 내 개인정보의 안전한 저장과 전송을 보장하기 위해 보안 정책을 수립하고 관리해야한다.
    <br/>
    <div style="text-align: center;">
      <img src="https://github.com/8hojung24/TerraSketch/assets/67528774/bf4135b1-1dfc-467e-8fee-29a9c638b392" width="400">
    </div>
