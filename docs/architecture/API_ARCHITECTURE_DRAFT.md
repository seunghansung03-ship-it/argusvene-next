# services/api Architecture Draft

## Runtime Modes

- `local`: `MemorySessionStore` + `MockLLMAdapter`
- `gcp`: `FirestoreSessionStore` + `GeminiLLMAdapter`

## Modules (planned)

- `src/config.ts`
- `src/server.ts`
- `src/routes/*`
- `src/orchestrator/session-orchestrator.ts`
- `src/adapters/session-store.ts`
- `src/adapters/llm-adapter.ts`
- `src/adapters/firestore-session-store.ts`
- `src/adapters/gemini-llm-adapter.ts`

## Request flow (transcript ingest)

1. validate payload
2. append `TranscriptEvent`
3. compile -> `WorldState`
4. run agents/interruption
5. generate scenarios
6. build `RenderSpec`
7. persist snapshot + events
8. publish stream update
9. return result
