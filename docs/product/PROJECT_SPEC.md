# ArgusVene / co-founder - Product Spec

## March 1 Update

As of March 1, 2026, ArgusVene is being reframed from a hackathon-first prototype into a product-first system.

The earlier framing of "live AI decision participant for C-level meetings" remains directionally useful, but it is too narrow for the actual product intent.

The updated product definition is:

`ArgusVene is a meeting-room-centered multi-agent collaboration and execution system that participates in live human discussion, generates real outputs during the session, structures decisions, and carries those decisions into project execution.`

## 1. Product Essence

ArgusVene is not a simple chat assistant and not just a meeting summarizer.

It is a structured AI work system where:

- humans collaborate in real time by voice and chat
- multiple specialist agents participate as objective experts
- the system can search, inspect evidence, and create deliverables while the meeting is still happening
- decisions are recorded and connected to follow-up actions and project work

## 2. Core User Experience

The main product experience is a persistent `Meeting Room`.

Each room is a real-time collaboration environment with a three-panel interface:

- Left panel: live transcript, chat, and team conversation thread
- Center panel: active work surface where artifacts, browser activity, documents, and generated outputs appear
- Right panel: participating agents, evidence, assumptions, risks, recommendations, and structured rationale

The room should support:

- live voice participation
- speaker distinction across multiple human participants
- text chat alongside voice
- natural AI interventions during discussion
- continuous generation of concrete outputs inside the room

## 3. Product Areas

### 3.1 Pre-Room Setup

Before entering a room, users should be able to configure:

- meeting title
- meeting purpose
- participating agents
- linked documents
- desired output types
- linked project or workstream

### 3.2 Meeting Room

Inside the room, ArgusVene should:

- receive conversation in real time
- maintain structured context
- activate relevant specialist agents
- show active work in the center panel
- surface reasoning and evidence on the right
- preserve a full activity record

### 3.3 Room History

Users must be able to:

- re-enter previous rooms
- recover prior transcript context
- review generated artifacts
- inspect decisions and follow-up tasks
- continue a prior room as an ongoing thread of work

### 3.4 Document Hub

The document hub should support:

- bulk upload of source files
- creation of new documents
- linking documents to rooms and projects
- reuse of prior documents in future rooms
- browsing generated artifacts by project and room origin

### 3.5 Project Workspace

ArgusVene is not limited to meetings. Meeting output must continue into project execution.

A project workspace should support:

- project-level organization
- workstream separation (development, design, 3D, finance, compliance, etc.)
- task tracking and assignment
- agent-specific work allocation
- linkage between tasks, documents, decisions, and generated artifacts

## 4. Core Capabilities

### 4.1 Real-Time Collaboration Input

- live speech-to-text
- multi-speaker separation
- text chat input
- shared room conversation thread

### 4.2 Specialist Multi-Agent Participation

Agents should act as role-specific experts such as:

- product/design
- engineering
- strategy
- finance
- compliance
- operations

They should not act as generic clones. Each agent should produce domain-specific evidence, risks, constraints, and recommendations.

### 4.3 In-Meeting Execution

During the room session, agents should be able to:

- search the web or internal references
- inspect linked documents
- produce UI examples or mockups
- draft documents and briefs
- generate comparison tables
- support execution planning

### 4.4 Structured Decision Support

ArgusVene should convert discussion into:

- evidence
- assumptions
- risks
- recommendations
- decisions
- next-step tasks

### 4.5 Persistent Outputs

Every output must be persisted and traceable.

This includes:

- uploaded documents
- generated documents
- UI drafts
- comparison artifacts
- decision records
- assigned tasks

## 5. Domain Model

The product should be designed around these core entities:

- `project`
- `meeting_room`
- `room_preset`
- `participant`
- `agent`
- `transcript_event`
- `document`
- `artifact`
- `evidence`
- `decision`
- `task`
- `agent_assignment`

## 6. Artifact Identity and Traceability

Generated outputs should be identifiable by both room and project.

Required metadata:

- `project_id`
- `meeting_room_id`
- `artifact_type`
- `sequence_no`
- `created_at`
- `created_by`

Representative identifier formats:

- `PRJ-001/MR-012/DOC-003`
- `PRJ-001/MR-012/UI-002`
- `PRJ-001/MR-012/TASK-004`

## 7. Architecture Direction

The intended architecture is layered:

- `OpenClaw` as the runtime body:
  - agent execution
  - tool usage
  - channel handling
  - browser/system actions
- `Gemini` as the reasoning brain:
  - synthesis
  - planning
  - evaluation
  - structured output generation
- `ArgusVene` as the domain and product layer:
  - meeting logic
  - decision structure
  - evidence and artifact management
  - room/workspace UX

ArgusVene should not rebuild the entire runtime from scratch if OpenClaw can serve as the execution substrate.

## 8. MVP Boundary (Product-First)

### Included in the next meaningful MVP

- meeting room creation and re-entry
- pre-room setup
- live transcript and chat thread
- center artifact surface
- right-side agent/evidence panel
- document hub basics
- project workspace basics
- artifact persistence with origin metadata
- structured decision capture

### Deferred beyond the first product pass

- broad multi-channel messaging distribution
- full enterprise permissions model
- deep third-party integrations across all systems
- fully autonomous, no-approval execution flows

## 9. Product Test

A successful product session should allow a team to:

1. set up a room around a real objective
2. hold a live discussion
3. receive grounded agent participation during the discussion
4. generate useful outputs while still in the room
5. save those outputs with traceable metadata
6. carry decisions forward into project work
