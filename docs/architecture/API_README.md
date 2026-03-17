# services/api

Cloud Run backend for ArgusVene (`co-founder`).

## Current local draft features

- `POST /sessions` create session
- `POST /sessions/:id/transcript` ingest transcript text
- `GET /sessions/:id` fetch latest snapshot summary
- `GET /sessions/:id/stream` SSE updates
- in-memory session store (local)
- mock LLM adapter (local)

## Planned GCP mode

- `FirestoreSessionStore`
- `GeminiLLMAdapter` (GenAI SDK / ADK)
- Cloud Run deployment


## Quick local test

1. `npm run dev --workspace=@argusvene/api`
2. `curl -X POST http://127.0.0.1:8080/sessions`
3. `curl -X POST http://127.0.0.1:8080/sessions/<id>/transcript -H "content-type: application/json" -d "{\"speakerLabel\":\"CEO\",\"text\":\"Compare cost and timeline for plan A and plan B\"}"`


## GCP runtime notes

- Set `ARGUSVENE_RUNTIME=gcp`
- Install adapters before running in GCP mode:
  - `npm install --workspace=@argusvene/api @google-cloud/firestore @google/genai`
- Configure env: `GOOGLE_CLOUD_PROJECT`, `GOOGLE_API_KEY`, `GEMINI_MODEL`
- `GeminiLLMAdapter` uses Google GenAI SDK first and falls back to REST only if SDK path fails.
