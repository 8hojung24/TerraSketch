## TERRASKETCH
<img src=https://github.com/8hojung24/TerraSketch/assets/67528774/dfbfd00b-d5af-4cdd-8418-82fb7962fd7c width=300><br/>
Terraform을 이용하여 사용자가 구성한 클라우드 인프라를 IaC 기반의 환경으로 자동화하는 동시에, 시각적인 다이어그램을 통해 인프라 구조를 한눈에 볼 수 있도록 하는 웹 서비스

<br/>
## 프로젝트 주요내용
<br/>
• 인프라 설계도 작성 시 필요한 기능들 제공<br/>
• 인프라 이미지를 통해 클라우드 설계도를 작성하면 설계도에 따른 코드뷰어에 Terraform 코드 렌더링함.<br/>
• 코드는 인프라 별 필수 코드와 선택옵션(주석처리)을 제공함.<br/>
• 사용자는 코드뷰어에서 코드수정이 가능함.<br/>
• 코드 다운로드 시, 보안검사도구(Snyk)를 통해 코드에 대한 문법오류, 논리오류, 구성, 보안 등을 점검함.<br/>
• 사용자는 다운받은 코드를 사용하여, AWS 인프라를 배포할 수 있음.<br/>
※ 다만, 배포 전, CSP의 자격 증명 및 공급자 구성은 사용자 역할로 두고있음.<br/>

**TerraSketch 시스템 설계**
<br/>
<img src=ttps://github.com/8hojung24/TerraSketch/assets/67528774/b6aa41f2-9b24-4369-9a16-06342698e24d width=500>

<br/>
**IaC 코드 렌더링 시스템 흐름도**
<br/>
<img src=https://github.com/Cloud-IaC-Diagram/TerraSketch/assets/67528774/0e1c80f2-13f5-4f03-9702-e437a0599fda width='600'>
<br/><br/>
**Infra Editor System UI**
<br/>
<img src=https://github.com/Cloud-IaC-Diagram/TerraSketch/assets/67528774/889ba481-d1e4-4d21-bceb-e9ff5f841856 width='600'>
<br/>
<img src=https://github.com/Cloud-IaC-Diagram/TerraSketch/assets/67528774/8695a43e-f5a0-44fb-ad3e-93e607889536 width='600'>
<br/><br/>
**보안 검사**
<br/>
<img src=https://github.com/Cloud-IaC-Diagram/TerraSketch/assets/67528774/a5215b7a-faf9-492b-93d0-27986db95232 width='600'>

