# ArgusVene GCP Architecture Draft (Hackathon MVP)

## Goal

해커톤 규정을 충족하면서 이후 확장(멀티도메인 시뮬레이션) 가능한 구조를 잡는다.

## Compliance Mapping (Gemini Live Agent Challenge)

- Gemini model usage -> `GeminiAdapter` (backend)
- GenAI SDK/ADK usage -> `services/api` integration layer
- Backend on Google Cloud -> `Cloud Run`
- Real-time demo -> web client + stream endpoint
- Deployment proof -> Cloud Run service/logs + code path

## MVP Runtime Topology (추천)

1. `apps/web` (초기 로컬 실행)
2. `services/api` on `Cloud Run` (필수)
3. `Firestore` (세션/이벤트/결정로그 저장)
4. `Gemini API` (Cloud Run에서 호출)

## Data Flow (초안)

1. Human audio/text -> web client
2. Web -> API transcript ingest (`POST /sessions/:id/transcript`)
3. API: world compiler -> `WorldState` 갱신
4. API: agents + interrupt policy 실행
5. API: scenario/render spec 생성
6. API: Firestore 저장
7. API -> Web live update (SSE 우선)

## Why Cloud Run + Firestore

- 해커톤 규정 충족이 명확함
- API를 stateless하게 유지 가능
- replay/demo 증빙에 유리

## Adapter Strategy (로컬/클라우드 분리)

- `LLMAdapter`
  - `MockLLMAdapter` (local)
  - `GeminiLLMAdapter` (gcp)
- `SessionStore`
  - `MemorySessionStore` (local)
  - `FirestoreSessionStore` (gcp)
- `StreamPublisher`
  - `NoopPublisher` (local test)
  - `SSEPublisher` (mvp)

## Firestore Draft Collections

- `sessions/{sessionId}`
  - metadata, latestWorldVersion, status
- `sessions/{sessionId}/events/{eventId}`
  - transcript/worldUpdate/agentAction/render events
- `sessions/{sessionId}/decisionLogs/{logId}`
  - decision memory snapshots

## Environment Variables (Draft)

- `PORT`
- `ARGUSVENE_RUNTIME` = `local | gcp`
- `GOOGLE_CLOUD_PROJECT`
- `GOOGLE_CLOUD_LOCATION`
- `GEMINI_MODEL`
- `FIRESTORE_DATABASE` (optional)

## API MVP Endpoints (Draft)

- `GET /healthz`
- `POST /sessions`
- `POST /sessions/:id/transcript`
- `GET /sessions/:id`
- `GET /sessions/:id/stream` (SSE)

## Deployment Shape (Hackathon-safe)

- `services/api` -> Cloud Run (필수 제출 증빙)
- `apps/web` -> initially local, later optional deploy
- 핵심은 backend가 GCP에서 동작하는 것
