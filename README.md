[README.md](https://github.com/user-attachments/files/30266625/README.md)
# PrepWise AI – AI-Powered Cloud & DevOps Interview Platform

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-API-4285F4?style=flat-square&logo=google-gemini&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

An intelligent, next-generation educational technology and technical assessment platform engineered to prepare aspiring Cloud Engineers, DevOps Professionals, and System Administrators for rigorous technical interviews.

---

## 🚀 Project Overview

**PrepWise AI** is a state-of-the-art Web application designed as a **final-year capstone project**. It bridges the gap between theoretical knowledge and real-world industry interviews by combining standard domains of practice with Generative AI-powered adaptive evaluation. 

Using **Google Gemini API** (via the modern `@google/genai` SDK), PrepWise AI evaluates candidates' technical answers in real-time. It provides semantic feedback, standard code reference metrics, and similarity analyses (via TF-IDF, embeddings, or exact token overlaps) alongside a robust **Local-Fallback Assessment Engine** to ensure high availability and zero-latency failover.

---

## ✨ Features

- **🎯 Specialized Tech Tracks**
  - **AWS Preparation**: Focuses on VPC design, IAM policies, serverless architectures, and multi-region high availability.
  - **Docker Preparation**: Covers image layer optimization, multi-stage builds, networking, volume mounts, and container hardening.
  - **Linux Preparation**: Evaluates system administration, Bash scripting, systemd service management, and cron job operations.
  - **Git & GitHub Preparation**: Challenges candidates on branching strategies, merge conflicts, rebase procedures, and git internal mechanics.
  
- **📄 Resume ATS Scanner**
  - Instant parsing of resume context against target Cloud/DevOps roles.
  - Computes ATS Match Percentage, detects structural keywords, and offers structural recommendations.
  
- **🧠 Hybrid Dual-Engine AI Answer Evaluation**
  - **Primary Engine**: Generates real-time, context-specific assessment grades (0-10) using modern structured JSON schemas with Google Gemini models.
  - **Local-Fallback Engine**: In the event of API limits or server failures, a secondary syntactic analyzer executes local cosine similarity matching and token relevance mapping.

- **📊 Dynamic Analytics Dashboard**
  - Displays progress trends, average mock interview scores, topic-by-topic strong and weak indicators, and preparation metrics using responsive, high-contrast visualizers.

- **👤 User Profiles**
  - Track target roles, experience levels, average assessment grades, and chronological interview attempt logs.

---

## 🏗️ Architecture Diagram

```
                 +-----------------------------------------+
                 |            User Browser (UI)            |
                 |     (React 18 + Tailwind CSS + Vite)    |
                 +--------------------+--------------------+
                                      |
                                      |  HTTP POST / GET
                                      v
                 +--------------------+--------------------+
                 |          Express Backend Server         |
                 |               (Node.js)                 |
                 +----------+--------------------+---------+
                            |                    |
                            | Use Google SDK     | Fallback Engine (Local)
                            v                    v
              +-------------+-------------+  +---+-------------------------+
              |   Google Gemini API       |  | Cosine Similarity (TF-IDF)  |
              |   (Structured Schema)     |  | NLP Static Verification     |
              +---------------------------+  +-----------------------------+
```

---

## 📂 Folder Structure

```
├── api/                       # API route handlers (Vercel Serverless Functions)
│   ├── _handlers/             # Core functional endpoint controllers
│   │   ├── analyze-resume.ts  # ATS Resume optimization logic
│   │   ├── ask-ms.ts          # Direct interaction helper
│   │   ├── evaluate-answer.ts # Adaptive grading core logic
│   │   ├── evaluate-interview.ts # Full session review logic
│   │   ├── generate-questions.ts # Adaptive question generation
│   │   ├── question-bank.ts   # Curated topic-wise questions pool
│   │   └── health.ts          # Server operational check
│   └── _utils.ts              # Mathematical algorithms & fallback fallback code
├── src/                       # Frontend SPA codebase (React)
│   ├── components/            # Reusable UI modules & charts
│   ├── App.tsx                # Principal visual container
│   ├── index.css              # Global styles (Tailwind imports)
│   └── main.tsx               # Client bootstrap entry point
├── server.ts                  # Multi-mode Express dev/prod web server
├── package.json               # System modules & execution triggers
├── tsconfig.json              # TypeScript compilation setup
├── vercel.json                # Serverless deployment configuration
└── vite.config.ts             # Client asset build configuration
```

---

## 🛠️ Installation Steps

Follow these instructions to run PrepWise AI locally or in your sandbox:

### Prerequisites
- **Node.js** v18.x or above
- **npm** v9.x or above

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/prepwise-ai.git
cd prepwise-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```
Open `.env` and configure your API keys (see [Environment Variables](#-environment-variables) below).

### 4. Start the Server in Development Mode
To boot the full-stack server (Vite + Express Proxy on port 3000):
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
To bundle the frontend SPA assets and compile the server code:
```bash
npm run build
```

---

## 🔑 Environment Variables

The platform relies on the following key environment parameters:

```env
# Google Gemini API key used on the server side (Never exposed to browser)
GEMINI_API_KEY=your_gemini_api_key_here

# Mode of deployment (production or development)
NODE_ENV=development
```

---

## 🖼️ Screenshots

> *Tip: Once deployed, upload your platform screenshots here to complete your showcase.*

| Dashboard | Mock Practice Run |
|---|---|
| <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80" width="350" alt="Dashboard Mockup"/> | <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80" width="350" alt="Session Mockup"/> |

---

## 🔮 Future Enhancements

1. **🎙️ Speech-to-Text Integration (WebSpeech API)**
   Allow users to deliver oral answers, mirroring genuine face-to-face interactive video calls.
2. **🛡️ Custom Enterprise Sandboxes**
   Enable technical recruiters to upload custom question banks and evaluate candidate answers in private company pipelines.
3. **📈 Multi-User Persistent Authentication**
   Incorporate cloud user state saving (such as Google Firebase Firestore/Auth) for lifetime progress tracking.

---


> **PrepWise AI – Full-Stack Lead Developer (Academic Capstone Project)**
> - Engineered an AI-driven educational technology platform using **React 18**, **TypeScript**, **Express**, and **Vite** designed to test and prepare engineers for Cloud & DevOps roles.
> - Integrated **Google Gemini API** leveraging the modern `@google/genai` SDK with strict JSON output schemas to automatically evaluate, grade, and provide detailed structural feedback on candidate answers.
> - Built a robust **Local Fallback Assessment Engine** that implements NLP algorithms and cosine string matching to guarantee continuous performance during API downtime or network outages.
> - Structured a high-performance unified server configuration compatible with both serverless host environments (Vercel API) and persistent container setups (Cloud Run).
