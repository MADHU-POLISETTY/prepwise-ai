import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Cpu, 
  Copy, 
  Check, 
  Terminal, 
  Cloud, 
  Server, 
  GitBranch, 
  FileCode, 
  Play, 
  Layers, 
  Database,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface CloudHubProps {
  onBack: () => void;
  showToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
}

export function CloudHub({ onBack, showToast }: CloudHubProps) {
  const [activeSubTab, setActiveSubTab] = useState<'aws' | 'docker' | 'cicd'>('aws');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast("Configuration copied to clipboard!", "success");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // 1. Dockerfile
  const dockerfileContent = `# ===============================================
# STAGE 1: Build Phase
# ===============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (leverage layer cache)
COPY package*.json ./
RUN npm ci

# Copy full source and build full-stack assets
COPY . .
ENV NODE_ENV=production
RUN npm run build

# ===============================================
# STAGE 2: Production Lightweight Runtime
# ===============================================
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled backend CJS server and client dist bundles
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/api ./api

# Expose the standard container ingress routing port
EXPOSE 3000

# Run the unified production server entrypoint
CMD ["node", "dist/server.cjs"]`;

  // 2. docker-compose.yml
  const composeContent = `version: '3.8'

services:
  # PrepWise AI Full-Stack Application
  prepwise-app:
    build:
      context: .
      dockerfile: Dockerfile
    image: prepwise-ai:latest
    container_name: prepwise-core-service
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - GEMINI_API_KEY=\${GEMINI_API_KEY}
      - FIREBASE_PRIVATE_KEY=\h_secret
    restart: always
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"`;

  // 3. GitHub Actions CI/CD Pipeline (.github/workflows/deploy-aws.yml)
  const githubActionsContent = `name: PrepWise AI - Production CI/CD (AWS Deployment)

on:
  push:
    branches:
      - main

permissions:
  contents: read

jobs:
  build-and-deploy:
    name: Build, Dockerize and Deploy to AWS ECS
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v3
        with:
          aws-access-key-id: \${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Login to Amazon ECR (Elastic Container Registry)
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build, Tag, and Push Image to Amazon ECR
        env:
          ECR_REGISTRY: \${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: prepwise-ai
          IMAGE_TAG: \${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG -t $ECR_REGISTRY/$ECR_REPOSITORY:latest .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY --all-tags

      - name: Render Amazon ECS Task Definition
        id: render-task-def
        uses: aws-actions/amazon-ecs-render-task-definition@v1
        with:
          task-definition: task-definition.json
          container-name: prepwise-app
          image: \${{ steps.login-ecr.outputs.registry }}/prepwise-ai:latest

      - name: Deploy Task Definition to Amazon ECS Service
        uses: aws-actions/amazon-ecs-deploy-task-definition@v2
        with:
          task-definition: \${{ steps.render-task-def.outputs.task-definition }}
          service: prepwise-production-service
          cluster: prepwise-production-cluster
          wait-for-service-stability: true`;

  // 4. Jenkins Declarative Pipeline (Jenkinsfile)
  const jenkinsContent = `pipeline {
    agent any

    environment {
        AWS_REGISTRY = "123456789012.dkr.ecr.us-east-1.amazonaws.com"
        IMAGE_NAME   = "prepwise-ai"
        AWS_REGION   = "us-east-1"
    }

    stages {
        stage('Repository Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Linter & Static Analysis') {
            steps {
                sh 'npm install'
                sh 'npm run lint'
            }
        }

        stage('Dockerize Build') {
            steps {
                script {
                    sh "docker build -t \${AWS_REGISTRY}/\${IMAGE_NAME}:latest ."
                }
            }
        }

        stage('AWS Authenticate & Push') {
            steps {
                script {
                    withCredentials([[
                        $class: 'AmazonWebServicesCredentialsBinding',
                        credentialsId: 'aws-ci-cd-credentials'
                    ]]) {
                        sh "aws ecr get-login-password --region \${AWS_REGION} | docker login --username AWS --password-stdin \${AWS_REGISTRY}"
                        sh "docker push \${AWS_REGISTRY}/\${IMAGE_NAME}:latest"
                    }
                }
            }
        }

        stage('Rolling Deployment to AWS') {
            steps {
                sh "aws ecs update-service --cluster prepwise-production-cluster --service prepwise-production-service --force-new-deployment --region \${AWS_REGION}"
            }
        }
    }
}`;

  return (
    <div className="space-y-6 pb-24 animate-fade-in text-left">
      {/* Top Header Identity */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="flex justify-between items-center bg-indigo-950/15 p-4 rounded-3xl border border-indigo-900/20"
      >
        <div className="space-y-0.5">
          <span className="text-[9px] font-mono text-indigo-400 font-extrabold uppercase tracking-widest block">Cloud Infrastructure</span>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400 animate-pulse" /> DevOps & Deploy Hub
          </h2>
          <p className="text-[10px] text-zinc-400">AWS, Docker, and CI/CD Orchestration blueprints.</p>
        </div>
        
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1 text-xs text-zinc-400 hover:text-white transition bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-2xl cursor-pointer hover:bg-zinc-850"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
      </motion.div>

      {/* Primary Sub-Tabs Navigation */}
      <motion.div 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
        className="flex bg-zinc-950/80 p-1 rounded-2xl border border-zinc-850/60 shrink-0"
      >
        <button
          onClick={() => setActiveSubTab('aws')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
            activeSubTab === 'aws'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
          }`}
        >
          <Cloud className="w-3.5 h-3.5" />
          <span>AWS Cloud Deploy</span>
        </button>

        <button
          onClick={() => setActiveSubTab('docker')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
            activeSubTab === 'docker'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Docker Sandbox</span>
        </button>

        <button
          onClick={() => setActiveSubTab('cicd')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
            activeSubTab === 'cicd'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>CI/CD Pipelines</span>
        </button>
      </motion.div>

      {/* Tab Area Content */}
      <div className="space-y-4">
        
        {/* TAB 1: AWS CLOUD DEPLOYMENT */}
        {activeSubTab === 'aws' && (
          <div className="space-y-4">
            
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
              className="bg-gradient-to-br from-[#101423] to-[#04060b] border border-indigo-900/20 p-4 rounded-3xl space-y-4"
            >
              <div className="flex items-center space-x-2 pb-1 border-b border-indigo-950/40">
                <Cloud className="w-5 h-5 text-indigo-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white">AWS Deploy Blueprint (Project Portfolio Standard)</h3>
              </div>
              
              <p className="text-[11.5px] text-zinc-300 leading-relaxed">
                For a robust, industry-compliant final year project or professional portfolio, deploy <strong>PrepWise AI</strong> to Amazon Web Services using either a serverless container approach or virtual machine servers. Below is the structured checklist.
              </p>

              {/* AWS Deploy Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <motion.div 
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.25, ease: "easeOut" }}
                  className="bg-black/20 p-3.5 rounded-2xl border border-zinc-900 space-y-2"
                >
                  <div className="flex items-center space-x-2 text-indigo-300">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold">Option A: AWS App Runner (Easiest)</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    Provides a fully managed container service. Directly pulls your source from GitHub or Docker ECR, configures port 3000, and deploys with automatic HTTPS and certificate management. Perfect for quick reviews!
                  </p>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.25, ease: "easeOut" }}
                  className="bg-black/20 p-3.5 rounded-2xl border border-zinc-900 space-y-2"
                >
                  <div className="flex items-center space-x-2 text-emerald-300">
                    <Server className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold">Option B: AWS ECS Fargate (Production)</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    True Enterprise Grade deployment. Orchestrates the app in container tasks on AWS Elastic Container Service (ECS) with serverless Fargate nodes, shielded behind an Application Load Balancer.
                  </p>
                </motion.div>
              </div>

              {/* Step by Step CLI checklist */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-black">Step-by-Step AWS Rollout Commands</h4>
                
                <div className="space-y-2.5">
                  <motion.div 
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3, ease: "easeOut" }}
                    className="space-y-1"
                  >
                    <span className="text-[10px] font-mono text-zinc-400 font-bold block">1. Authenticate local AWS Command Line Interface (CLI):</span>
                    <pre className="bg-black text-[10px] font-mono text-zinc-300 p-2.5 rounded-xl border border-zinc-900 overflow-x-auto select-all">
aws configure
# Enter AWS Access Key, AWS Secret Access Key, and Default region (e.g. us-east-1)</pre>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.35, ease: "easeOut" }}
                    className="space-y-1"
                  >
                    <span className="text-[10px] font-mono text-zinc-400 font-bold block">2. Create and Login to private AWS ECR Repository:</span>
                    <pre className="bg-black text-[10px] font-mono text-zinc-300 p-2.5 rounded-xl border border-zinc-900 overflow-x-auto select-all">
# Create Registry repo
aws ecr create-repository --repository-name prepwise-ai --region us-east-1

# Authenticate local Docker daemon to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com</pre>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4, ease: "easeOut" }}
                    className="space-y-1"
                  >
                    <span className="text-[10px] font-mono text-zinc-400 font-bold block">3. Tag & Push Container:</span>
                    <pre className="bg-black text-[10px] font-mono text-zinc-300 p-2.5 rounded-xl border border-zinc-900 overflow-x-auto select-all">
docker tag prepwise-ai:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/prepwise-ai:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/prepwise-ai:latest</pre>
                  </motion.div>
                </div>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.45, ease: "easeOut" }}
                className="bg-indigo-950/20 p-3 rounded-2xl border border-indigo-500/10 flex items-start space-x-2.5 text-[10px] text-zinc-400 leading-relaxed"
              >
                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-indigo-300 block mb-0.5">Architectural Suggestion: AWS Systems Manager Parameter Store</span>
                  Store sensitive credentials like <code className="text-white">GEMINI_API_KEY</code> and Firebase configurations inside AWS Parameter Store or Secrets Manager. Inject them dynamically at boot to avoid hardcoding secrets in codebase repository commits!
                </div>
              </motion.div>

            </motion.div>

          </div>
        )}

        {/* TAB 2: DOCKER CONTAINERIZATION */}
        {activeSubTab === 'docker' && (
          <div className="space-y-4">
            
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
              className="bg-gradient-to-br from-[#101423] to-[#04060b] border border-indigo-900/20 p-4 rounded-3xl space-y-4"
            >
              <div className="flex items-center justify-between pb-1 border-b border-indigo-950/40">
                <div className="flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-indigo-400 animate-pulse" />
                  <h3 className="text-sm font-bold text-white">Multi-Stage Dockerfile Blueprint</h3>
                </div>
                <button
                  onClick={() => copyToClipboard(dockerfileContent, 'dockerfile')}
                  className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl px-2.5 py-1 text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition"
                >
                  {copiedKey === 'dockerfile' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'dockerfile' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <p className="text-[11.5px] text-zinc-300 leading-relaxed">
                This is a production-grade <strong>multi-stage build Dockerfile</strong> tailored for your Node.js backend & Vite client application. It compiles TypeScript bundles in the builder layer, discarding heavy <code>node_modules</code> to yield a final container image of minimal footprint.
              </p>

              <div className="relative">
                <pre className="bg-black text-[10px] font-mono text-zinc-300 p-3 rounded-2xl border border-zinc-900 overflow-x-auto max-h-72 select-all leading-normal">
                  {dockerfileContent}
                </pre>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25, ease: "easeOut" }}
              className="bg-gradient-to-br from-[#101423] to-[#04060b] border border-indigo-900/20 p-4 rounded-3xl space-y-4"
            >
              <div className="flex items-center justify-between pb-1 border-b border-indigo-950/40">
                <div className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">docker-compose.yml</h3>
                </div>
                <button
                  onClick={() => copyToClipboard(composeContent, 'compose')}
                  className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl px-2.5 py-1 text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition"
                >
                  {copiedKey === 'compose' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'compose' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <p className="text-[11.5px] text-zinc-300 leading-relaxed">
                Use this docker-compose file for unified single-command local sandbox execution. Automatically handles binding environment variables and mounting system logs.
              </p>

              <div className="relative">
                <pre className="bg-black text-[10px] font-mono text-zinc-300 p-3 rounded-2xl border border-zinc-900 overflow-x-auto max-h-72 select-all leading-normal">
                  {composeContent}
                </pre>
              </div>
            </motion.div>

          </div>
        )}

        {/* TAB 3: CI/CD PIPELINES */}
        {activeSubTab === 'cicd' && (
          <div className="space-y-4">
            
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
              className="bg-gradient-to-br from-[#101423] to-[#04060b] border border-indigo-900/20 p-4 rounded-3xl space-y-4"
            >
              <div className="flex items-center justify-between pb-1 border-b border-indigo-950/40">
                <div className="flex items-center space-x-2">
                  <GitBranch className="w-5 h-5 text-indigo-400 animate-pulse" />
                  <h3 className="text-sm font-bold text-white">GitHub Actions YAML (.github/workflows/deploy-aws.yml)</h3>
                </div>
                <button
                  onClick={() => copyToClipboard(githubActionsContent, 'ghactions')}
                  className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl px-2.5 py-1 text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition"
                >
                  {copiedKey === 'ghactions' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'ghactions' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <p className="text-[11.5px] text-zinc-300 leading-relaxed">
                Automate your delivery pipeline completely! Every git push to your <code>main</code> branch triggers this GitHub Workflow to compile assets, compile server bundles, register the Docker metadata layer, push to Amazon ECR, and execute a zero-downtime rolling update on AWS ECS Fargate.
              </p>

              <div className="relative">
                <pre className="bg-black text-[10px] font-mono text-zinc-300 p-3 rounded-2xl border border-zinc-900 overflow-x-auto max-h-72 select-all leading-normal">
                  {githubActionsContent}
                </pre>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25, ease: "easeOut" }}
              className="bg-gradient-to-br from-[#101423] to-[#04060b] border border-indigo-900/20 p-4 rounded-3xl space-y-4"
            >
              <div className="flex items-center justify-between pb-1 border-b border-indigo-950/40">
                <div className="flex items-center space-x-2">
                  <FileCode className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Declarative Jenkinsfile</h3>
                </div>
                <button
                  onClick={() => copyToClipboard(jenkinsContent, 'jenkinsfile')}
                  className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl px-2.5 py-1 text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition"
                >
                  {copiedKey === 'jenkinsfile' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'jenkinsfile' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <p className="text-[11.5px] text-zinc-300 leading-relaxed">
                Prefer self-hosted Jenkins pipelines? Here is the declarative Jenkins pipeline scripting to check out, lint, test, build container, and roll out to AWS.
              </p>

              <div className="relative">
                <pre className="bg-black text-[10px] font-mono text-zinc-300 p-3 rounded-2xl border border-zinc-900 overflow-x-auto max-h-72 select-all leading-normal">
                  {jenkinsContent}
                </pre>
              </div>
            </motion.div>

          </div>
        )}

      </div>
    </div>
  );
}
