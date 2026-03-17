# ArgusVene

`co-founder`: a structured multi-agent decision and execution workspace.

## March 1 Update

As of March 1, 2026, ArgusVene is no longer defined as a hackathon-first mock UI.
The product direction is now centered on a real meeting-room workflow:

- a live `Meeting Room` for real-time conversation, AI participation, and artifact generation
- a `Pre-Room Setup` flow for configuring a meeting before entering
- a persistent `Room History` so users can re-enter past rooms with full context
- a `Document Hub` for uploading, creating, linking, and reusing documents
- a `Project Workspace` for carrying meeting decisions into longer-running work across development, design, 3D, finance, and compliance

ArgusVene is intended to participate in live collaboration, not just summarize it.
It should listen to human discussion, distinguish speakers, call in multiple specialist agents, generate concrete outputs during the meeting, and connect decisions to follow-up execution.

## Product Definition

ArgusVene is a meeting-room-centered AI collaboration system where:

- humans talk in real time by voice and chat
- specialist agents participate as objective experts
- the system searches, reasons, generates artifacts, and supports decisions during the session
- outputs are stored, numbered, and linked back to the room and project that created them

The primary interface is a three-panel workspace:

- Left: live transcript, chat, and team conversation thread
- Center: active artifact surface (browser, document, UI example, mockup, comparison output)
- Right: active agents, evidence, assumptions, risks, recommendations, and structured rationale

## Product Layers

- `OpenClaw`: runtime body for agent execution, tools, channels, and system actions
- `Gemini`: reasoning layer for synthesis, planning, evaluation, and structured generation
- `ArgusVene`: domain layer that defines meeting logic, decision structure, evidence handling, artifact tracking, and execution flow

ArgusVene should use OpenClaw as the execution substrate, not replace it. The value of ArgusVene is the decision-domain workflow and product experience built on top.

## Core Product Areas

### 1. Meeting Room

- live voice transcript with speaker separation
- live text chat
- multi-user team room behavior similar to a group thread
- in-meeting AI participation and intervention
- shared artifact surface during discussion

### 2. Pre-Room Setup

- define meeting title and objective
- select which specialist agents will participate
- attach source documents and prior artifacts
- define expected outcomes (decision memo, comparison table, UI draft, task breakdown, etc.)

### 3. Room History

- re-enter previous meeting rooms
- restore transcript, generated artifacts, decisions, and agent activity
- use prior rooms as context for follow-up meetings

### 4. Document Hub

- upload source files
- create new documents from templates or AI generation
- link documents to projects and rooms
- store generated artifacts with origin metadata

### 5. Project Workspace

- manage long-running workstreams after meetings
- group work by project
- organize development, design, 3D, finance, compliance, and other task lanes
- assign work to agents and track outputs across rooms

## Artifact and Document Tracking

Every generated output should be traceable.

Artifacts and documents should carry:

- `project_id`
- `meeting_room_id`
- `artifact_type`
- `sequence_no`
- `created_at`
- `created_by`

This allows outputs to be identified by when and where they were created, and by which agent or workflow created them.

Example forms:

- `PRJ-001/MR-012/DOC-003`
- `PRJ-001/MR-012/UI-002`
- `PRJ-001/MR-012/DEC-001`

## Monorepo Structure

- `apps/web` - current draft UI surface
- `services/api` - current backend draft; will evolve into a domain orchestrator
- `packages/core` - shared schemas, agent contracts, and render contracts
- `infra` - deployment notes and infrastructure drafts
- `projects` - local project workspace fixtures used for development

## Current Technical Direction

The existing codebase contains a draft local visualizer and a draft API loop.
The next phase is to move from demo-first implementation to product-first architecture:

- consolidate the multiple draft web UIs into one meeting-room product surface
- move backend design from `sessions`-only MVP endpoints to project/room/document/task domain resources
- keep real-time event delivery as a first-class concern
- use OpenClaw as the runtime and tool execution layer
- preserve ArgusVene logic as a structured decision and artifact orchestration layer

## Local Draft Run

1. Start API: `npm run dev --workspace=@argusvene/api`
2. Start demo UI: `cd apps/web && python3 -m http.server 4173`
3. Open `http://127.0.0.1:4173`

The current UI is still a draft visualizer. It does not yet represent the full March 1 product direction.
