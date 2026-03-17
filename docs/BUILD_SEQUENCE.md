# Build Sequence

## 오늘 안에 해야 하는 순서

### Step 1. 계약 먼저

- shared domain contract 정의
- `workspace`
- `meeting_room`
- `participant`
- `agent`
- `artifact`
- `decision`
- `task`

### Step 2. API 최소 코어

- 로그인 확인
- 워크스페이스 조회/생성
- 미팅룸 생성/조회
- participant 초대/제거
- message 전송
- artifact 저장
- decision 저장
- task 저장

### Step 3. Meeting Room UI만 먼저

- 3패널 구조
- 왼쪽 transcript
- 가운데 live canvas
- 오른쪽 roster + room controls

### Step 4. Live interaction 연결

- Gemini Live 음성 연결
- 텍스트 턴 전송
- participant presence
- active agent routing

### Step 5. Canvas action loop

- 생성
- 미리보기
- 수정 지시
- 재생성

### Step 6. Outcomes 연결

- 결정 저장
- 태스크 저장
- 아티팩트 저장

## 구현 원칙

- 가장 먼저 회의실부터 만든다
- 홈/설정 페이지는 최소한만 만든다
- 작동 안 하는 기능은 UI에 올리지 않는다
- 이전 코드 참조 금지
