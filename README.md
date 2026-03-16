# UBS Customer Service Chatbot

AI-powered customer service chatbot for UBS Wealth Management, serving High Net Worth Individual (HNWI) clients. Built with a LangGraph plan-and-execute agentic workflow, FastAPI backend, and React frontend.

## Architecture

```
Client (React) ──> FastAPI ──> LangGraph Workflow
                     │              │
                     │         ┌────┴─────┐
                     │      Planner    Synthesizer
                     │         │
                     │    ┌────┴────────────────────────────┐
                     │    │         Executor (loop)          │
                     │    │                                  │
                     │    │  ┌─────────────┐ ┌───────────┐  │
                     │    │  │  Wealth     │ │  Private   │  │
                     │    │  │  Advisory   │ │  Banking   │  │
                     │    │  └──────┬──────┘ └─────┬─────┘  │
                     │    │  ┌──────┴──────┐ ┌─────┴─────┐  │
                     │    │  │  Client     │ │  Lending   │  │
                     │    │  │  Services   │ │  & Credit  │  │
                     │    │  └──────┬──────┘ └─────┬─────┘  │
                     │    │  ┌──────┴──────┐ ┌─────┴─────┐  │
                     │    │  │ Compliance  │ │    FX &    │  │
                     │    │  │   & Tax     │ │  Treasury  │  │
                     │    │  └─────────────┘ └───────────┘  │
                     │    └──────────────┬──────────────────┘
                     │                   │
                     │         MCP Servers (Streamable HTTP)
                     │         ├── Banking Ops    :9001 (mock)
                     │         ├── Knowledge      :9002 (mock)
                     │         ├── Service Wkflow :9003 (mock)
                     │         └── RAG Server     :9004 (real ChromaDB)
                     │
              ┌──────┼──────────┐
           Postgres  Redis    ChromaDB
           (sessions)(mem0)   (RAG vectors)
```

**Planner** analyzes each client query using Gemini structured output and routes to one or more specialist agents. **Executor** dispatches steps sequentially to the selected agents, each connected to MCP servers via Streamable HTTP. **Synthesizer** combines all agent outputs into a single polished response with follow-up suggestions and escalation flags.

All LLM calls use **Gemini structured outputs** (Pydantic models enforced at the API level) for reliable parsing.

## Specialist Agents

| Agent | MCP Server | Responsibilities |
|---|---|---|
| **Wealth Advisory** | Banking Ops (:9001) | Portfolio performance, investment strategy, market insights, asset allocation, estate planning |
| **Private Banking** | Knowledge (:9002) | Account operations, fund transfers, card services, statements, multi-currency management |
| **Client Services** | Service Workflow (:9003) | Onboarding, KYC/AML, document requests, appointments, escalations (uses RAG) |
| **Lending & Credit** | Banking Ops (:9001) | Lombard lending, mortgages, credit lines, structured lending, margin facilities |
| **Compliance & Tax** | Knowledge (:9002) | CRS/FATCA reporting, cross-border tax, regulatory updates, documentation (uses RAG) |
| **FX & Treasury** | Service Workflow (:9003) | Foreign exchange, currency hedging, FX derivatives, treasury management |

## Project Structure

```
├── apps/
│   ├── api/                    FastAPI backend
│   │   ├── auth/               LDAP authentication (mock) + JWT
│   │   ├── chat/               Chat session CRUD + message handling
│   │   ├── database/           SQLAlchemy async models (Postgres)
│   │   ├── memory/             mem0 + Redis short-context memory
│   │   ├── workflow/           LangGraph agentic workflow
│   │   │   ├── agents/         6 specialist agents
│   │   │   ├── tools/          MCP client + RAG retrieval tool
│   │   │   ├── planner.py      Structured plan generation (Gemini)
│   │   │   ├── executor.py     Agent dispatch loop
│   │   │   ├── graph.py        StateGraph definition + synthesizer
│   │   │   └── state.py        Pydantic state/output models
│   │   ├── config.py           Pydantic Settings (.env)
│   │   ├── logging_config.py   structlog + OpenTelemetry trace context
│   │   └── main.py             App entrypoint + Scalar API docs
│   └── ui/                     React + TypeScript frontend (Vite)
│       └── src/
│           ├── api/             Typed API client
│           ├── components/      Sidebar, ChatWindow, MessageBubble
│           ├── hooks/           useAuth
│           ├── pages/           LoginPage, ChatPage
│           └── types/           TypeScript types matching Pydantic models
├── rag/                        RAG pipeline + server
│   ├── config.py               Pipeline settings
│   ├── ingest.py               PDF/DOCX → ChromaDB (cosine similarity)
│   └── server.py               MCP server that queries ChromaDB for top-k chunks
├── mocks/                      Mock MCP servers for local development
│   ├── base.py                 Shared JSON-RPC handler factory
│   ├── banking_ops_server.py   Mock banking ops + wealth advisory + lending (:9001)
│   ├── knowledge_server.py     Mock private banking + compliance + knowledge (:9002)
│   └── service_workflow_server.py  Mock client services + FX treasury (:9003)
├── docs/                       Source documents for RAG (place PDFs/DOCX here)
├── models/                     Auto-downloaded embedding models (gitignored)
├── tests/
├── pyproject.toml              Dependencies + poe tasks
├── uv.lock                     Locked dependencies
├── Dockerfile                  Multi-stage: backend + frontend
├── docker-compose.yml          All services (Postgres, Redis, mocks, RAG, backend, frontend)
├── .env.example                Environment variable template
└── .gitignore
```

## Prerequisites

### Python 3.12+

Verify with:

```bash
python3 --version
```

### uv (Python package manager)

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Verify with:

```bash
uv --version
```

### Node.js 22+ and npm

Required for the React frontend. Install via [nvm](https://github.com/nvm-sh/nvm):

```bash
# install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash

# load nvm into your current shell (or just open a new terminal)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# install Node.js 22
nvm install 22

# verify
node --version
npm --version
```

### Docker and Docker Compose

Required for running Postgres, Redis, and production builds.

```bash
# Install Docker Engine (Ubuntu/WSL2)
# https://docs.docker.com/engine/install/ubuntu/

# Verify
docker --version
docker compose version
```

### Gemini API Key

Obtain from [Google AI Studio](https://aistudio.google.com/apikey).

## Getting Started

### 1. Install dependencies

```bash
cd ubs-project
uv sync
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set your `GEMINI_API_KEY`. Everything else has working defaults for local development.

### 3. Start infrastructure (Postgres + Redis)

```bash
docker compose up -d postgres redis
```

### 4. Install frontend dependencies

```bash
cd apps/ui
npm install
cd ../..
```

### 5. Start mock MCP servers + RAG server

```bash
# terminal 1: mock MCP servers (banking ops, knowledge, service workflow)
poe mock-mcp

# terminal 2: RAG server (queries ChromaDB)
poe rag-server
```

### 6. Run the backend

```bash
# terminal 3
poe dev-api
```

The API is available at `http://localhost:8000`. Scalar API reference at `http://localhost:8000/docs`.

### 7. Run the frontend

```bash
# terminal 4
poe dev-ui
```

The UI is available at `http://localhost:5173`. The Vite dev server proxies `/api` requests to the backend.

### 8. Login

Use one of the mock LDAP credentials:

| Username | Password | Name |
|---|---|---|
| `jsmith` | `password123` | John Smith |
| `ajones` | `password123` | Alice Jones |
| `bwilson` | `password123` | Bob Wilson |

## Docker (Full Stack)

Build and run everything with a single command (Postgres, Redis, 3 mock MCP servers, RAG server, backend, frontend):

```bash
poe docker-up
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Scalar API Reference | http://localhost:8000/docs |
| Mock Banking Ops MCP | http://localhost:9001 |
| Mock Knowledge MCP | http://localhost:9002 |
| Mock Service Workflow MCP | http://localhost:9003 |
| RAG MCP Server | http://localhost:9004 |

Tear down (including volumes):

```bash
poe docker-down
```

## RAG Document Ingestion

Place PDF or DOCX files in the `docs/` directory, then run:

```bash
poe rag-ingestion
```

This will:
1. Extract text from all PDF (via PyMuPDF) and DOCX files
2. Chunk the text (configurable `chunk_size` and `chunk_overlap`)
3. Download the embedding model on first run (saved to `models/`)
4. Generate embeddings using `sentence-transformers/all-MiniLM-L6-v2`
5. Store vectors in ChromaDB with cosine similarity search

The RAG MCP server (`poe rag-server`) then serves these chunks to the Client Services and Compliance & Tax agents at query time.

Configure via environment variables or `.env`:

| Variable | Default | Description |
|---|---|---|
| `EMBEDDING_MODEL_NAME` | `sentence-transformers/all-MiniLM-L6-v2` | HuggingFace embedding model |
| `CHROMA_PERSIST_DIRECTORY` | `./data/chroma` | ChromaDB storage path |
| `RAG_TOP_K` | `5` | Number of chunks to retrieve per query |

## Development Tasks

All tasks are run via [poethepoet](https://poethepoet.naber.dev/) (`uv run poe <task>`):

| Task | Description |
|---|---|
| `poe dev-api` | Start the FastAPI backend with hot reload on port 8000 |
| `poe dev-ui` | Start the React frontend dev server on port 5173 |
| `poe check` | Format, lint, and type-check all Python code |
| `poe mock-mcp` | Start all 3 mock MCP servers (:9001, :9002, :9003) |
| `poe rag-server` | Start the RAG MCP server that queries ChromaDB on port 9004 |
| `poe rag-ingestion` | Ingest documents from docs/ into ChromaDB vector store |
| `poe docker-up` | Build and start all services via Docker Compose |
| `poe docker-down` | Stop and remove all Docker services and volumes |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate via LDAP, returns JWT |
| `GET` | `/api/auth/me` | Get current user profile |
| `POST` | `/api/chat/sessions` | Create a new chat session |
| `GET` | `/api/chat/sessions` | List sessions (optionally include archived) |
| `GET` | `/api/chat/sessions/{id}` | Get session with full message history |
| `PATCH` | `/api/chat/sessions/{id}` | Rename or archive a session |
| `DELETE` | `/api/chat/sessions/{id}` | Permanently delete a session |
| `POST` | `/api/chat/sessions/{id}/messages` | Send a message, receive AI response |
| `GET` | `/api/health` | Health check |

All request and response bodies are strictly validated with Pydantic models. The Scalar API reference is available at `/docs`.

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | Yes | — | Google Gemini API key |
| `GEMINI_MODEL` | No | `gemini-2.0-flash-lite` | Gemini model identifier |
| `DATABASE_URL` | No | `postgresql+asyncpg://postgres:postgres@localhost:5432/chatbot` | Postgres connection string |
| `REDIS_URL` | No | `redis://localhost:6379/0` | Redis connection string |
| `JWT_SECRET_KEY` | Yes (production) | `change-me-to-a-secure-random-string` | Secret for JWT signing |
| `LOG_LEVEL` | No | `INFO` | Logging level |
| `MCP_BANKING_OPS_URL` | No | `http://localhost:9001/mcp` | Banking ops MCP server |
| `MCP_KNOWLEDGE_URL` | No | `http://localhost:9002/mcp` | Knowledge MCP server |
| `MCP_SERVICE_WORKFLOW_URL` | No | `http://localhost:9003/mcp` | Service workflow MCP server |
| `MCP_RAG_SERVER_URL` | No | `http://localhost:9004/mcp` | RAG retrieval MCP server |
| `RAG_TOP_K` | No | `5` | Number of RAG chunks to retrieve |

## Tech Stack

| Layer | Technology |
|---|---|
| LLM | Google Gemini (structured outputs) |
| Orchestration | LangGraph (plan-and-execute) |
| Backend | FastAPI, Pydantic, SQLAlchemy (async) |
| Frontend | React 19, TypeScript, Vite |
| API Docs | Scalar |
| Database | PostgreSQL 16 (sessions, messages as JSONB) |
| Memory | mem0 + Redis |
| Vector Store | ChromaDB (cosine similarity) |
| Embeddings | sentence-transformers (HuggingFace, local) |
| Document Processing | PyMuPDF (PDF), python-docx (DOCX) |
| Tool Integration | MCP (Streamable HTTP) |
| Logging | structlog + OpenTelemetry trace context |
| Auth | Mock LDAP + JWT |
| Package Manager | uv |
| Code Quality | ruff (format + lint) + ty (type check) via uvx |
| Containerization | Docker + Docker Compose |
