# PrepWise AI – Complete System Documentation
### The Intelligent Cloud & DevOps Technical Assessment Platform

---

## 1. Executive Summary

**PrepWise AI** is a state-of-the-art educational technology and technical assessment platform engineered to prepare aspiring Cloud Engineers, DevOps Professionals, and System Administrators for rigorous technical interviews. It bridges the gap between theoretical knowledge and real-world industrial expectations.

By integrating the **Google Gemini API** (using the modern, server-side `@google/genai` SDK) with a sophisticated, NLP-based **Syntactic Local Fallback Engine**, PrepWise AI guarantees high availability, rich evaluation matrices, and zero-latency failovers. Candidates can practice structured interview tracks, evaluate their resumes against ATS parsers, access contextual visualizer dashboards, and explore dynamic architectural blueprints.

---

## 2. Global Architecture & System Topology

PrepWise AI is architected as a high-performance **full-stack application** built on **React 18**, **TypeScript**, **Express**, and **Vite**. 

```
                                  +---------------------------------------+
                                  |         User Web Browser (Client)     |
                                  |     React 18 SPA + Tailwind CSS 4.x    |
                                  |     Framer Motion Layout Transitions  |
                                  +-------------------+-------------------+
                                                      |
                                                      |  HTTPS JSON Payloads
                                                      v
                                  +---------------------------------------+
                                  |         Express Web Server (Node.js)  |
                                  |         Binds to Port 3000 / 0.0.0.0  |
                                  +---------+-------------------+---------+
                                            |                   |
                     If API Key Available   |                   | If API Quota/Offline
                                            v                   v
                        +-------------------+---+   +-----------+-------------------+
                        |   Google Gemini API   |   | Syntactic Fallback Engine     |
                        |   @google/genai SDK   |   | Multi-Category NLP Heuristics |
                        |   Structured JSON     |   | Cosine & Keyword Matrices     |
                        +-----------------------+   +-------------------------------+
                                            \                   /
                                             v                 v
                                  +---------------------------------------+
                                  |        Persistent Data Layers         |
                                  |  Firebase Auth + Cloud Firestore DB   |
                                  +---------------------------------------+
```

### Key Architectural Constraints
* **Ingress Mapping**: The application runs behind a reverse proxy routing external web traffic exclusively through **Port 3000**. The Express dev and production servers are hard-coded to listen on host `0.0.0.0` and port `3000`.
* **Multi-Environment Support**: Fully compatible with local testing environments, ephemeral cloud instances (such as Google Cloud Run containers), serverless runtimes (via `vercel.json` rewrite configurations), and native web platforms.

---

## 3. Directory Layout & Module Structure

The project has a modular, scalable directory layout optimized for clean separation of concerns:

```
├── .github/                      # CI/CD Workflows for GitHub Actions
├── android/                      # Native Android runtime envelope
├── api/                          # Unified Serverless Backend / Controllers
│   ├── _handlers/                # Specific Domain Request Controllers
│   │   ├── analyze-resume.ts     # ATS resume parser and recommendations builder
│   │   ├── ask-ms.ts             # Direct expert interaction endpoint
│   │   ├── evaluate-answer.ts    # Answer assessment controller (Dual-Engine)
│   │   ├── evaluate-interview.ts # Session level metrics generator
│   │   ├── generate-questions.ts # Adaptive question list pool builder
│   │   └── question-bank.ts      # Structured reference questions for tech tracks
│   └── _utils.ts                 # Local Syntactic NLP Fallback & Math algorithms
├── assets/                       # Vector illustrations & structural media
├── components.json               # Shadcn/ui system mappings (if utilized)
├── Dockerfile                    # Multi-stage optimized production docker environment
├── docker-compose.yml            # Multi-service local launch file
├── firebase-applet-config.json   # Initial client configuration mapping
├── firebase-blueprint.json       # Structural database models & indices schema
├── firestore.rules               # Granular security logic policies for data security
├── index.html                    # Frontend main entry page
├── ios/                          # Native iOS runtime envelope
├── Jenkinsfile                   # Declarative CI/CD pipeline configuration
├── metadata.json                 # Core application configuration (PrepWise AI)
├── package.json                  # System modules, commands & script definitions
├── public/                       # Assets directly exposed to browser root
├── pubspec.yaml                  # Flutter/Dart package specifier for cross-platform wrappers
├── server.ts                     # Multi-mode Express Web server entry point
├── src/                          # React client application code
│   ├── components/               # Custom UI modules
│   │   └── CloudHub.tsx          # Dynamic DevOps Blueprinting & Command Terminal
│   ├── App.tsx                   # Central React container, Routing, and Views
│   ├── index.css                 # Global styles and Tailwind directives
│   └── main.tsx                  # Client-side mounting point
├── test-domains.ts               # Local validation test suites
├── tsconfig.json                 # TypeScript compilation setup
├── vercel.json                   # Vercel Serverless Function rewrites mapping
└── vite.config.ts                # Client assets optimization configurations
```

---

## 4. Backend Architecture & Controller Specifications

The unified backend layer handles secure request routing, Gemini API invocation, and mathematical processing.

### A. Core Server (`server.ts`)
The Express server handles dual-mode execution:
1. **Development Mode (`process.env.NODE_ENV !== 'production'`)**: Dynamically boots a local Vite instance in middleware mode, routing asset requests instantly to Vite's compiler while intercepting server API routes `/api/*`.
2. **Production Mode**: Serves pre-built client files statically from the `/dist` directory and implements SPA fallbacks.
* Binds exclusively to host `0.0.0.0` and port `3000`.

### B. API Route Handlers (`api/_handlers/`)

#### 1. `evaluate-answer.ts`
* **Purpose**: Evaluates user answers to individual technical questions.
* **Flow**: Resolves the target question context and answer text, tries to call the Gemini API first, and automatically falls back to the local syntactic engine if credentials or quotas fail.
* **Output Format**: Structured JSON mapping scores (0-10), key metric alignments, and analytical suggestions.

#### 2. `generate-questions.ts`
* **Purpose**: Dynamically compiles customized collections of questions tailored to specialized domains (AWS, Docker, Linux, Git), desired difficulty level, target role, and preferred target company.
* **Flow**: Combines curated question banks with Generative AI synthesis to compile adaptive, non-repetitive interview paths.

#### 3. `analyze-resume.ts`
* **Purpose**: Performs a thorough resume ATS audit.
* **Flow**: Extracts text metrics, parses structural headers, computes a keyword match percentage against Cloud/DevOps standard requirements, and provides a formatted list of recommendations to optimize CV formats for automated ATS parsers.

#### 4. `ask-ms.ts`
* **Purpose**: Operates as a dynamic assistant chat interface where students can directly ask open-ended questions about complex cloud setups, immediately receiving highly structured career coaching.

---

## 5. Dual-Engine Evaluation Framework

PrepWise AI implements a dual-evaluation system to guarantee that users always receive structured, accurate feedback, even when offline or during API rate limits.

```
                  +----------------------------------------------+
                  |           Evaluate Answer Requested          |
                  +----------------------+-----------------------+
                                         |
                                         v
                         Are Gemini Credentials Present?
                                      / \
                                     /   \
                               Yes  /     \  No / Timeout
                                   v       v
                     +-------------------+   +----------------------------+
                     |  Gemini AI Engine |   | Local Syntactic NLP Engine |
                     |  Structured Output|   | Heuristic Keyword Maps     |
                     +-------------------+   +----------------------------+
```

### Engine A: The Generative AI Engine (Google Gemini)
* Powered by the modern `@google/genai` TypeScript SDK.
* Leverages structured JSON output parsing parameters to force Gemini models into outputting strict validation models matching the expected UI interfaces without syntax breakage.

### Engine B: The NLP & Syntactic Local Fallback Engine (`api/_utils.ts`)
In the event of network disruption or API quotas, the local engine interceptor activates automatically. It isolates prefixes, purges stop-words, and parses keywords into **seven specialized domains**:

1. **Cloud Engineering**: Intercepts requests regarding cloud providers (AWS, Azure, GCP, tenant, cloud, SaaS). Focuses on computing resource virtualization, tenant isolation, and elastic scaling.
2. **DevOps & Infrastructure**: Intercepts requests targeting automated systems (Docker, Kubernetes, Terraform, Jenkins, Ansible, pipelines). Focuses on automation orchestration, Infrastructure as Code (IaC), container lifecycles, and deployment pipelines.
3. **Frontend Architecture**: Intercepts queries targeting web visualizers (React, Vue, state management, CSS, DOM). Focuses on interactive responsive client-side structures and state-topology performance.
4. **Backend Systems**: Intercepts backend calculations (Express, Node, APIs, REST, gRPC). Focuses on domain logic and server endpoint performance.
5. **Database & Data Storage**: Intercepts persistence queries (PostgreSQL, SQL, Redis, caching, indexes). Focuses on ACID transactions, indexes, and connection footprints.
6. **AI & Machine Learning**: Intercepts data science requests (LLMs, neural networks, gradient descent). Focuses on statistical structures and neural layouts.
7. **Security & Access Control**: Intercepts security parameters (Auth, OAuth, JWT, encryption). Focuses on trust boundaries and cryptographical standards.

#### Key Feature: Specific High-Value Tool Interceptions
When a user asks about standard tools, the local engine bypasses general fallbacks to deliver detailed, expert-level mock blueprints:
* **Docker**: Isolates namespaces/cgroups, image layering, UnionFS, copy-on-write, footprint optimization, multi-stage builds, and container hardening.
* **Kubernetes**: Identifies declarative control loops, reconciliation states, pod scheduling, liveness/readiness probes, and ClusterIP routing.
* **Terraform**: Outlines state logs (`.tfstate`), plan previews (`terraform plan`), dependency graphs, state locking via S3/DynamoDB, and configuration drift.
* **Jenkins**: Illustrates pipeline-as-code files (`Jenkinsfile`), remote ephemeral builders, webhook triggers, and SonarQube quality gates.
* **Ansible**: Highlights agentless execution architectures, YAML playbooks, idempotency safeguards, and secure variable vaults (Ansible Vault).
* **React**: Discusses Virtual DOM reconciliation, fiber trees, unidirectional flows, custom hooks state lifecycles, and render cycle memoizations.
* **PostgreSQL**: Specifies database ACID transactions, Multi-Version Concurrency Control (MVCC) structures, and Composite B-Tree indexing parameters.
* **Redis**: Examines single-threaded non-blocking I/O multiplexing event loops, native data structures, and LRU/LFU cache stampede protections.
* **Git/GitHub**: Highlights Trunk-Based development vs Git Flow, interactive squashing, and Git Reflogs histories recovery.
* **AWS/Cloud Providers**: Emphasizes regions/AZ topologies, global load balancers, active-active failovers, and cost optimizations.

---

## 6. Frontend Presentation & UI Layer

The frontend application is a highly optimized client dashboard engineered using Tailwind CSS and Framer Motion.

### App.tsx (Main App Dashboard)
Controls routing states and handles the main app layouts:
* **Active Interview Simulator**: Renders active assessment sessions, handles multi-line user answer inputs, displays real-time score indicators, and coordinates session completion.
* **Interactive Resume ATS Auditor**: Supports file text uploads, processes keyword checking, and displays modular recommendations lists.
* **Candidate Performance Dashboard**: Renders visual score trendlines and topic-wise strong/weak indicators using responsive layout grids.
* **Profile Configuration Editor**: Allows students to modify target roles and experience criteria.

### CloudHub.tsx (Cloud & DevOps blueprint engine)
Provides developers with deep, step-by-step deployment structures:
* **AWS Blueprints**: Contains complete command CLI sequences for App Runner vs Elastic Container Service (ECS) Fargate behind Application Load Balancers.
* **Containerization**: Details multi-stage optimized `Dockerfile` structures and `docker-compose.yml` multi-service specifications.
* **Continuous Integration**: Illustrates production-ready GitHub Actions YAML workflows and declarative declarative Jenkins pipelines.
* **Polished Micro-Animations**: Card containers leverage `motion/react` with staggered delays and smooth entry animations for elegant slide-ins when navigating to the screen:
```tsx
import { motion } from 'motion/react';

// Wrapper for header components
<motion.div 
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.35, ease: "easeOut" }}
/>

// Wrapper for container panels
<motion.div 
  initial={{ opacity: 0, y: 15 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
/>
```

---

## 7. Persistence & Cloud Database Design

PrepWise AI incorporates Cloud-hosted **Google Firebase Firestore** and **Firebase Authentication** layers to securely manage candidate logs and chronological interview attempts.

### Firestore Rules (`firestore.rules`)
Ensures absolute data privacy by restricting access to authorized users:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Make sure the user is fully logged in before mutating records
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/sessions/{sessionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/resumes/{resumeId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Database Blueprints (`firebase-blueprint.json`)
The structured schemas support query structures for session lookups:
* **`users` Collection**: Stores baseline profile attributes (`email`, `targetRole`, `experienceLevel`, `created_at`).
* **`sessions` Subcollection**: Tracks chronological interview logs (`timestamp`, `domain`, `difficulty`, `score_average`, `questions_answered`).
* **`resumes` Subcollection**: Maintains historic resume scanning records (`match_percentage`, `job_role`, `scanned_at`).

---

## 8. Build System & Production Compilation

PrepWise AI implements a custom production build and start pipeline to guarantee maximum cold-start performance and absolute compatibility across container layers.

### Multi-Step Compilation Pattern (`package.json`)
```json
{
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
    "start": "node dist/server.cjs"
  }
}
```

#### Why This Compilation Strategy is Essential:
1. **Frontend Compilation**: `vite build` optimizes and minifies static React, TypeScript, CSS, and asset files, outputting them into `/dist`.
2. **Backend Bundling**: `esbuild server.ts --bundle` compiles the Express TypeScript backend into a single, optimized **CommonJS bundle file** (`dist/server.cjs`).
3. **Runtime Compatibility**: By bundling imports and converting modern TypeScript paths into CommonJS outputs, we completely bypass Node's strict ESM path resolution rules. This ensures cold-start reliability in containerized cloud runtimes.
4. **Standalone execution**: Running `node dist/server.cjs` launches the web server independently with zero TS-node or compilation runtime overheads.

---

## 9. Deployment Guidelines

### Container Deployment (Docker)
The provided `Dockerfile` leverages efficient multi-stage compilation to keep image sizes extremely small:
```dockerfile
# Stage 1: Build source files
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Ephemeral runtime execution
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/server.cjs"]
```

### Serverless Hosting (Vercel)
The project is configured out-of-the-box for serverless API operations:
* **Rewrites configuration (`vercel.json`)**: Seamlessly redirects frontend routing to `index.html` while mapping backend `/api/:path*` traffic directly to serverless functions located inside `/api`.

---

## 10. Conclusion & Portfolio Profile Summary

**PrepWise AI** is a fully functional, production-ready Cloud and DevOps technical preparation platform. It demonstrates:
* **Generative AI Integration**: Mastery of the modern Google `@google/genai` structured SDK schemas.
* **Resilient Offline Architecture**: Advanced keyword parsers and syntactic NLP algorithms that guarantee zero-downtime operations.
* **Advanced Visual Presentation**: Clean visual typography pairings, responsive telemetry dashboards, and smooth entrance layouts.
* **Robust DevOps Engineering**: Structured configurations for Docker environments, cloud providers, and automated multi-stage build systems.
