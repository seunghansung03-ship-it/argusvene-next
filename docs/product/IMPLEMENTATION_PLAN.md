# ArgusVene / co-founder - Implementation Plan

## March 1 Update

As of March 1, 2026, implementation priority shifts from "hackathon-safe demo completion" to "product-first foundation."

This means:

- fewer mock interfaces
- one clear product surface
- domain-first backend design
- persistent rooms, documents, and artifacts
- clearer use of OpenClaw as runtime infrastructure

## 1. Delivery Goal

Build the first usable product foundation for ArgusVene:

1. users can configure a meeting before entering
2. users can enter a live meeting room
3. the room supports voice transcript, chat, and multi-agent participation
4. the center surface shows active artifacts and work-in-progress outputs
5. the right side shows active agents and structured rationale
6. all important outputs are saved with project and room traceability
7. meeting outcomes can continue into project-level work

## 2. Product-First Priorities

### P0 - Foundation

- define stable domain entities
- consolidate UI into one primary meeting-room surface
- replace mockup-driven wording and structure with product terminology
- persist meeting rooms, room presets, documents, artifacts, decisions, and tasks
- define event-driven room state updates
- establish OpenClaw integration boundary

### P1 - Usable Workflow

- pre-room setup flow
- room re-entry and session restore
- document hub upload/create/list flow
- project workspace with basic workstream separation
- artifact numbering and metadata
- initial task assignment flow for agents

### P2 - Advanced Execution

- deeper agent execution flows
- stronger project management and task lifecycle
- richer artifact editors and viewers
- stronger approvals and governance

## 3. Frontend Implementation Direction

### 3.1 Consolidate the UI

Current draft files (`index`, `chat`, `clean`) represent multiple visual experiments.

Next step:

- keep one primary product UI
- retire duplicate script copies
- move shared logic into reusable modules
- treat alternate layouts as discarded exploration, not parallel product surfaces

### 3.2 Build the Core Product Screens

Required product screens:

- `Meeting Rooms`
  - room list
  - re-entry to prior rooms
- `Pre-Room Setup`
  - title, objective, agents, linked docs, expected outputs
- `Meeting Room`
  - left transcript/chat
  - center artifact/work surface
  - right agent/evidence/risk panel
- `Document Hub`
  - upload, create, browse, link
- `Project Workspace`
  - workstreams, tasks, linked artifacts

### 3.3 Meeting Room Interaction Model

Left panel:

- speaker-separated transcript
- chat input
- team conversation thread

Center panel:

- active artifact viewer
- browser surface
- generated document or UI output
- task progress

Right panel:

- participating agents
- evidence
- assumptions
- risks
- recommendations

## 4. Backend Implementation Direction

### 4.1 Role of the Backend

The backend should evolve from a simple transcript/session API into a real-time domain orchestrator.

It must coordinate:

- human inputs
- room state
- agent dispatch
- artifact generation
- decisions
- follow-up tasks

### 4.2 Target Domain Services

Planned service boundaries:

- `rooms`
- `room-presets`
- `transcripts`
- `documents`
- `artifacts`
- `decisions`
- `tasks`
- `projects`
- `agent-assignments`
- `realtime`

### 4.3 Runtime Split

Recommended separation:

- `OpenClaw`
  - runtime execution
  - tools
  - browser/system actions
  - agent process layer
- `ArgusVene backend`
  - room orchestration
  - domain state
  - evidence normalization
  - artifact and decision persistence
  - product API for the meeting-room workflow

### 4.4 State Model

The backend should use a state/event approach, not a simple request/response-only model.

Recommended flow:

1. receive transcript or chat input
2. persist `transcript_event`
3. update room context
4. decide which agents to activate
5. dispatch runtime work
6. normalize output into evidence, risks, recommendations, and artifacts
7. persist room and project updates
8. push room updates to the UI in real time

## 5. Data Model Priorities

The first stable entities should be:

- `project`
- `meeting_room`
- `room_preset`
- `document`
- `artifact`
- `decision`
- `task`
- `agent_assignment`

These should be defined in shared contracts before expanding UI or runtime behavior further.

## 6. Artifact Persistence Rules

All outputs should be traceable to origin.

Required metadata:

- `project_id`
- `meeting_room_id`
- `artifact_type`
- `sequence_no`
- `created_at`
- `created_by`

Identifiers should be readable and sortable by room and project context.

## 7. Immediate Refactor Steps

### Step 1

Update product and development docs to reflect the March 1 direction.

### Step 2

Reduce the current frontend to one canonical meeting-room UI and remove duplicated UI logic.

### Step 3

Refactor `services/api` away from a single-file route surface toward domain services.

### Step 4

Introduce persistent storage for rooms, documents, artifacts, decisions, and tasks.

### Step 5

Design and implement the OpenClaw adapter boundary for agent execution.

## 8. Definition of Useful Progress

The implementation is on the right path when a team can:

1. create or re-enter a meeting room
2. attach or create documents before the meeting
3. hold a live discussion with transcript and chat
4. see agents participate with clear evidence and rationale
5. produce and save artifacts during the meeting
6. assign follow-up work into a project workspace
