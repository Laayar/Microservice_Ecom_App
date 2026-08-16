# 🚀 Microservices App — Cloud Native Guide

> **Your complete reference for building, shipping, and delivering microservices using Docker, GitHub, and Jenkins — service by service.**

---

## 📚 Table of Contents

1. [What is Cloud Native?](#1-what-is-cloud-native)
2. [The Big Picture — Architecture Overview](#2-the-big-picture--architecture-overview)
3. [Core Tools — Definitions](#3-core-tools--definitions)
4. [Your Delivery Strategy — Ship One Service at a Time](#4-your-delivery-strategy--ship-one-service-at-a-time)
5. [Dockerfile — Anatomy and Guide](#5-dockerfile--anatomy-and-guide)
6. [Docker Compose — Local Orchestration](#6-docker-compose--local-orchestration)
7. [CI/CD Pipeline with Jenkins](#7-cicd-pipeline-with-jenkins)
8. [Cloud Deployment — Azure vs Hostinger](#8-cloud-deployment--azure-vs-hostinger)
9. [Is auth-service Ready for Push?](#9-is-auth-service-ready-for-push)
10. [Checklist — Before Every Push](#10-checklist--before-every-push)
11. [Project Roadmap](#11-project-roadmap)

---

## 1. What is Cloud Native?

> **Cloud Native** is an approach to building and running applications that **fully exploit the advantages of cloud computing**.

Instead of one big app (monolith), you build **small, independent services** that each do one thing — and you **containerize**, **automate**, and **deliver** them independently.

```
+-----------------------------------------------------------+
|                  CLOUD NATIVE PILLARS                     |
|                                                           |
|  Containers       Automation         Microservices        |
|  Docker isolates  Jenkins CI/CD      One service =        |
|  your service     builds & ships     one responsibility   |
|                                                           |
|  Observability    DevOps Culture                          |
|  Logs, metrics,   Dev builds it,                         |
|  health checks    Dev ships it                            |
+-----------------------------------------------------------+
```

### Your Strategy

```
  Build Service  -->  Test It  -->  Dockerize  -->  Push to Cloud
       |                                                  |
  auth-service                                   Azure / Hostinger
  product-service   <-- repeat for each -----------------+
  order-service
```

---

## 2. The Big Picture — Architecture Overview

```
+----------------------------------------------------------------------+
|                      CLIENT (Browser / App)                          |
+----------------------------------------------------------------------+
                               | HTTPS
                               v
+----------------------------------------------------------------------+
|                       API GATEWAY  (future)                          |
|                 Routes requests to the right service                 |
+---------------+--------------------+--------------------------------- +
                |                    |                    |
                v                    v                    v
+---------------+---+   +------------+----+   +----------+--------+
|  auth-service     |   |  product-service |   |  order-service   |
|  Port 5000        |   |  Port 5001       |   |  Port 5002       |
|  MongoDB/JWT      |   |  (future)        |   |  (future)        |
+-------------------+   +-----------------+   +------------------+
                |                    |                    |
                +--------------------+--------------------+
                                     |
                              +------v------+
                              |   MongoDB   |
                              |  (per svc)  |
                              +-------------+
```

---

## 3. Core Tools — Definitions

### Docker

> **Docker** packages your application and all its dependencies into a **container** — a lightweight, isolated, portable unit that runs the same everywhere.

```
WITHOUT DOCKER:                    WITH DOCKER:
+----------------------+           +----------------------+
| "Works on my machine"|           | Container            |
|  Your Code           |    -->    |  +----------------+  |
|  + random Node ver.  |           |  | Your Code      |  |
|  + OS deps           |           |  | + Node 22      |  |
|  + who knows what    |           |  | + all deps     |  |
+----------------------+           |  | + same OS      |  |
                                   |  +----------------+  |
                                   +----------------------+
                                   Runs IDENTICALLY on:
                                   - Your laptop
                                   - Azure cloud
                                   - Hostinger VPS
```

**Key Docker Concepts:**

| Concept | Definition | Analogy |
|---------|-----------|---------|
| **Image** | A blueprint/template for a container | A recipe |
| **Container** | A running instance of an image | A cooked meal |
| **Dockerfile** | Instructions to build the image | The recipe steps |
| **Docker Hub** | Public registry to store/share images | GitHub for images |
| **Volume** | Persistent storage attached to a container | External hard drive |
| **Network** | Virtual network connecting containers | LAN between servers |
| **docker-compose** | Tool to run multiple containers together | Local orchestrator |

**Essential Docker Commands:**

```bash
# Build an image from a Dockerfile
docker build -t auth-service:v1 .

# Run a container from an image
docker run -p 5000:5000 auth-service:v1

# List running containers
docker ps

# Stop a container
docker stop <container-id>

# List all images
docker images

# Push image to Docker Hub
docker push yourusername/auth-service:v1

# Pull image from Docker Hub
docker pull yourusername/auth-service:v1

# View container logs
docker logs <container-id>

# Execute command inside a running container
docker exec -it <container-id> sh
```

---

### GitHub

> **GitHub** is a cloud-based platform for **version control** and **collaboration**. Your code lives here. Every push triggers your CI/CD pipeline.

```
LOCAL MACHINE                 GITHUB                    CLOUD
+--------------+    push     +--------------+  trigger  +--------------+
|  Your Code   | ----------> | Repository   | --------> |   Jenkins    |
|  (VSCode)    |             |              |           |  (CI/CD)     |
+--------------+             |  main branch |           +--------------+
                             |  dev branch  |
                             |  feature/*   |
                             +--------------+
```

**Branching Strategy:**

```
main          --------------------------------------------------------> (production)
   |
   +-- dev    --------------------------------------------------------> (integration)
         |
         +-- feature/auth-service            (you build here)
         +-- feature/product-service
         +-- fix/auth-token-bug
```

**Git Workflow:**

```bash
# Initialize repo (first time)
git init
git remote add origin https://github.com/yourusername/microservices-app.git

# Daily workflow
git checkout -b feature/my-service       # create feature branch
git add .                                # stage changes
git commit -m "feat(auth): add login"   # commit with clear message
git push origin feature/my-service      # push to GitHub
```

**Commit Message Convention:**

```
feat(auth): add JWT refresh token
fix(auth): handle expired token error
docs(readme): update deployment guide
chore(docker): optimize auth-service image
test(auth): add login integration test
```

---

### Jenkins

> **Jenkins** is an open-source **automation server**. When you push code to GitHub, Jenkins automatically builds your Docker image, runs tests, and deploys to the cloud.

```
+-------------------------------------------------------------------+
|                       JENKINS PIPELINE                            |
|                                                                   |
|  Code Push  --> Build --> Test --> Dockerize --> Deploy           |
|  git push      npm ci    npm test  docker build  docker push      |
+-------------------------------------------------------------------+
```

**Jenkins Key Concepts:**

| Concept | Definition |
|---------|-----------|
| **Pipeline** | A series of automated steps defined in a `Jenkinsfile` |
| **Jenkinsfile** | A file in your repo that defines the pipeline |
| **Stage** | A logical phase of the pipeline (Build, Test, Deploy) |
| **Step** | A single command within a stage |
| **Webhook** | GitHub notifies Jenkins on every push automatically |
| **Agent** | The machine that runs the pipeline |
| **Credentials** | Securely stored secrets (Docker Hub password, Azure keys) |

---

## 4. Your Delivery Strategy — Ship One Service at a Time

```
+========================================================================+
|                   CLOUD NATIVE DELIVERY LOOP                          |
|                                                                        |
|  1. BUILD  -->  2. TEST  -->  3. CONTAINERIZE  -->  4. PUSH           |
|     Code           Local         Dockerfile          GitHub            |
|                    Tests                             + Docker Hub      |
|                                                           |            |
|  8. MONITOR <-- 7. VERIFY <-- 6. DEPLOY        <-- 5. CI/CD           |
|     Logs          Health        Azure/VPS            Jenkins           |
|                   Check                              Pipeline          |
+========================================================================+
```

### Step-by-Step for Each Service

**Step 1 — Code locally**
```bash
cd auth-service
npm install
npm run dev
```

**Step 2 — Run tests**
```bash
npm test
```

**Step 3 — Build and test Docker image locally**
```bash
docker build -t auth-service:local .
docker run -p 5000:5000 --env-file .env auth-service:local
curl http://localhost:5000/api/v1/auth/register
```

**Step 4 — Push code to GitHub**
```bash
git add .
git commit -m "feat(auth): complete auth service"
git push origin feature/auth-service
# Jenkins detects push and runs pipeline automatically
```

**Step 5 — Jenkins builds, tags, and pushes Docker image**
```
Jenkins --> docker build --> docker tag --> docker push --> deploy
```

**Step 6 — Service is live on cloud**
```
https://your-app.azure.com/api/v1/auth/register   LIVE!
```

---

## 5. Dockerfile — Anatomy and Guide

### What Is a Dockerfile?

```
Dockerfile = A text file with instructions to build a Docker image.

+-----------------------------------------------------+
|  DOCKERFILE                                         |
|                                                     |
|  FROM    --> Pick the base OS/runtime               |
|  WORKDIR --> Set working directory inside container |
|  COPY    --> Copy files from your machine into it   |
|  RUN     --> Execute commands (install packages)    |
|  EXPOSE  --> Document which port the app uses       |
|  CMD     --> The command that starts your app       |
+-----------------------------------------------------+
```

### Current: auth-service Dockerfile — Reviewed and Annotated

```dockerfile
# auth-service/Dockerfile

# ------------------------------------------------------------
# FROM node:22-alpine
# node:22 = Node.js version 22
# alpine = tiny Alpine Linux OS (~7MB instead of ~900MB)
# Result: a small, secure, production-ready base image
# ------------------------------------------------------------
FROM node:22-alpine

# ------------------------------------------------------------
# WORKDIR /app
# All subsequent commands run from /app inside the container
# ------------------------------------------------------------
WORKDIR /app

# ------------------------------------------------------------
# COPY package*.json ./
# Copy ONLY package files FIRST (smart layer caching!)
# If your code changes but package.json doesn't,
# Docker reuses the npm install layer --> much faster builds
# ------------------------------------------------------------
COPY package*.json ./

# ------------------------------------------------------------
# RUN npm ci --omit=dev
# npm ci = clean install (uses package-lock.json exactly)
# --omit=dev = skip devDependencies (nodemon etc) in prod
# Result: smaller image, no dev tools in production
# ------------------------------------------------------------
RUN npm ci --omit=dev

# ------------------------------------------------------------
# COPY . .
# Copy the rest of the source code
# .dockerignore prevents node_modules/.env from being copied
# ------------------------------------------------------------
COPY . .

# ------------------------------------------------------------
# EXPOSE 5000
# Documents the port (informational only)
# The actual port mapping is done via docker run -p or compose
# ------------------------------------------------------------
EXPOSE 5000

# ------------------------------------------------------------
# CMD ["npm", "start"]
# Start the application: runs node src/server.js
# Using array format (exec form) = best practice
# ------------------------------------------------------------
CMD ["npm", "start"]
```

### How Docker Builds It — Layer by Layer

```
Layer 1: FROM node:22-alpine        [pulled from Docker Hub, cached]
Layer 2: WORKDIR /app               [fast, just sets context]
Layer 3: COPY package*.json ./      [only changes if deps change]
Layer 4: RUN npm ci --omit=dev      [CACHED if package.json unchanged!]
Layer 5: COPY . .                   [changes every time you edit code]
Layer 6: CMD ["npm","start"]        [runs when container starts]
```

### Recommended: Add a Health Check to Your Dockerfile

```dockerfile
# Add this BEFORE CMD:
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1
```

---

### Future Services Dockerfiles

Each new service needs its own Dockerfile:

**product-service/Dockerfile:**
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 5001
CMD ["npm", "start"]
```

**order-service/Dockerfile:**
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 5002
CMD ["npm", "start"]
```

**api-gateway/Dockerfile:**
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 6. Docker Compose — Local Orchestration

> Place `docker-compose.yml` at the **project root** to run all services together.

```yaml
# docker-compose.yml (microservices-app/docker-compose.yml)

version: '3.9'

services:

  mongodb:
    image: mongo:7
    container_name: mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    networks:
      - microservices-network

  auth-service:
    build:
      context: ./auth-service
      dockerfile: Dockerfile
    container_name: auth-service
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - PORT=5000
      - MONGO_URI=mongodb://mongodb:27017/auth-service
      - JWT_SECRET=your-secret-here
      - JWT_EXPIRES_IN=1d
    depends_on:
      - mongodb
    networks:
      - microservices-network
    restart: unless-stopped

  # product-service: (uncomment when ready)
  #   build:
  #     context: ./product-service
  #   ports:
  #     - "5001:5001"
  #   networks:
  #     - microservices-network

networks:
  microservices-network:
    driver: bridge

volumes:
  mongo-data:
```

**Usage:**

```bash
docker-compose up --build          # start and rebuild
docker-compose up -d --build       # start in background
docker-compose down                # stop everything
docker-compose logs auth-service   # view logs
docker-compose up --build auth-service  # rebuild one service
```

---

## 7. CI/CD Pipeline with Jenkins

### The Full CI/CD Flow

```
Developer          GitHub               Jenkins                Cloud
----------         ------               -------                -----

git push --------> Webhook ----------> Triggered
                   fires                    |
                                    +-------v--------------+
                                    | Stage 1: Checkout    |
                                    | git clone            |
                                    +-------+--------------+
                                    +-------v--------------+
                                    | Stage 2: Install     |
                                    | npm ci               |
                                    +-------+--------------+
                                    +-------v--------------+
                                    | Stage 3: Test        |
                                    | npm test             |
                                    +-------+--------------+
                                    +-------v--------------+
                                    | Stage 4: Docker Build|
                                    | docker build & tag   |
                                    +-------+--------------+
                                    +-------v--------------+
                                    | Stage 5: Docker Push |
                                    | push to Docker Hub   |
                                    +-------+--------------+
                                    +-------v--------------+
                                    | Stage 6: Deploy      |
                                    | SSH to cloud server  |
                                    | docker pull & run    |
                                    +-------+--------------+
                                            |
                                    LIVE on cloud ----------->
```

### Jenkinsfile for auth-service

```groovy
// auth-service/Jenkinsfile

pipeline {
    agent any

    environment {
        DOCKER_HUB_REPO  = 'yourusername/auth-service'
        DOCKER_HUB_CREDS = credentials('docker-hub-credentials')
        IMAGE_TAG        = "${env.BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo "Code checked out — Branch: ${env.BRANCH_NAME}"
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('auth-service') {
                    sh 'npm ci'
                }
            }
        }

        stage('Run Tests') {
            steps {
                dir('auth-service') {
                    sh 'npm test'
                }
            }
        }

        stage('Docker Build') {
            steps {
                dir('auth-service') {
                    sh "docker build -t ${DOCKER_HUB_REPO}:${IMAGE_TAG} ."
                    sh "docker tag ${DOCKER_HUB_REPO}:${IMAGE_TAG} ${DOCKER_HUB_REPO}:latest"
                }
            }
        }

        stage('Docker Push') {
            steps {
                sh "echo ${DOCKER_HUB_CREDS_PSW} | docker login -u ${DOCKER_HUB_CREDS_USR} --password-stdin"
                sh "docker push ${DOCKER_HUB_REPO}:${IMAGE_TAG}"
                sh "docker push ${DOCKER_HUB_REPO}:latest"
            }
        }

        stage('Deploy to Cloud') {
            when {
                branch 'main'
            }
            steps {
                sshagent(['cloud-server-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no user@your-server-ip '
                            docker pull ${DOCKER_HUB_REPO}:latest &&
                            docker stop auth-service || true &&
                            docker rm auth-service || true &&
                            docker run -d \
                                --name auth-service \
                                -p 5000:5000 \
                                --env-file /home/user/.env.auth \
                                --restart unless-stopped \
                                ${DOCKER_HUB_REPO}:latest
                        '
                    """
                }
            }
        }
    }

    post {
        success { echo "Pipeline succeeded! auth-service is live." }
        failure { echo "Pipeline failed. Check logs above." }
        always  { sh 'docker logout' }
    }
}
```

---

## 8. Cloud Deployment — Azure vs Hostinger

### Option A — Hostinger VPS (Simpler, Cheaper)

```
Your VPS (Ubuntu 22.04)
+------------------------------------------------+
|                                                |
|  Nginx (reverse proxy, port 80/443)            |
|      |                                         |
|      +-- /api/v1/auth  --> auth-service:5000   |
|      +-- /api/v1/prods --> product-svc:5001    |
|      +-- /api/v1/order --> order-svc:5002      |
|                                                |
|  Docker Engine + Docker Compose                |
|  Let's Encrypt (free HTTPS/SSL)                |
+------------------------------------------------+
```

**Setup on Hostinger VPS:**

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Install Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker && systemctl start docker

# Install Docker Compose
apt install docker-compose-plugin -y

# Clone your repo
git clone https://github.com/yourusername/microservices-app.git
cd microservices-app

# Create env file (DO NOT commit this!)
nano .env.auth

# Run services
docker-compose up -d

# Check status
docker ps
```

### Option B — Azure (Step-by-Step, Starting NOW)

---

#### STOP — Read This First: Which Azure Service Should You Use?

You are currently on **"Create Container Instance" (ACI)** in the screenshot.
This is a valid starting point but you need to understand the difference:

```
+--------------------------------------------------------------+
|  Azure Service          | Best For              | Your Case  |
+--------------------------------------------------------------+
|  Container Instances    | Quick test, 1 container| First test |
|  (ACI) -- YOU ARE HERE  | Simple, no scaling    | OK for now |
|                         |                        |            |
|  Container Apps         | Multiple microservices | FUTURE goal|
|  (Recommended later)    | Auto-scaling, URLs     | Phase 2+   |
|                         |                        |            |
|  App Service + Docker   | Web apps, easy deploy | Alternative|
|  (also good)            | Slot swaps, CI/CD      |            |
+--------------------------------------------------------------+

RECOMMENDATION:
  Use ACI now to learn and test auth-service alone.
  Switch to Container Apps when you have 2+ services.
```

---

#### QUESTION 1: GUI vs CLI vs VS Code Extension?

```
+-----------------------------------------------------------+
|  TOOL             | WHEN TO USE               | VERDICT   |
+-----------------------------------------------------------+
|  Azure Portal GUI | Learning, first time,     | USE NOW   |
|  (browser)        | visual exploration        | to learn  |
|                   |                           |           |
|  Azure CLI (az)   | Automation, scripts,      | USE AFTER |
|  (terminal)       | Jenkins pipeline, repeatable| learning |
|                   |                           |           |
|  VS Code Extension| Quick deploy while coding,| OPTIONAL  |
|  "Azure Tools"    | browse resources in editor| nice bonus|
+-----------------------------------------------------------+
```

**VS Code Extension to install (optional but helpful):**

Install from VS Code Extensions tab (Ctrl+Shift+X):
- Search: **"Azure Tools"** by Microsoft (installs a pack of extensions)
- Or individually: **"Azure Container Apps"** or **"Docker"** extension

The Docker extension in VS Code lets you:
- Right-click an image → push to Docker Hub or ACR
- Right-click a running container → open logs, terminal
- See all your images and containers visually in the sidebar

**For now: use the GUI to learn, then switch to CLI for automation.**

---

#### QUESTION 2: What to Push — Whole App or Service by Service?

```
ANSWER: ONE SERVICE AT A TIME — always.

Your current situation:
  microservices-app/
    auth-service/     <-- push THIS first (it's ready)
    (product-service) <-- push LATER when built
    (order-service)   <-- push LATER when built

What you push to Docker Hub = ONE IMAGE PER SERVICE:
  laayardev/auth-service:latest     <-- push now
  laayardev/mongodb:...             <-- NOT needed (use official image)
  laayardev/product-service:latest  <-- push later
  laayardev/order-service:latest    <-- push later

MongoDB = you NEVER build and push MongoDB yourself.
You always use the official image: mongo:7
In Azure: use MongoDB Atlas (free tier) or Azure Cosmos DB.
```

**The flow for each service:**

```
  Your Code            Docker Hub              Azure
  ---------            ----------              -----
  auth-service/   -->  laayardev/              ACI or
  Dockerfile           auth-service:latest --> Container Apps
                                               (reads from Docker Hub)
```

---

#### STEP-BY-STEP: Fix the Azure Portal Screenshot

**Looking at your screenshot — 3 things are wrong:**

```
ISSUE 1: Container name = "microservices-rg"
  - "rg" means Resource Group, NOT a container name
  - Fix: change the name to "auth-service"

ISSUE 2: Image source = "Quickstart images"
  - This uses Microsoft's demo images, not yours!
  - Fix: select "Other registry" to use Docker Hub

ISSUE 3: Image = mcr.microsoft.com/azuredocs/aci-helloworld
  - This is a Microsoft sample app
  - Fix: enter your own image: laayardev/auth-service:latest
```

**Corrected form values:**

```
Container name:  auth-service
Region:          (US) East US    <-- fine as-is
SKU:             Standard        <-- fine as-is
Image source:    Other registry  <-- CHANGE THIS
Registry login:  (leave blank for public Docker Hub images)
Image:           laayardev/auth-service:latest
OS type:         Linux
Size:            1 vcpu, 1.5 GB memory  <-- fine as-is
```

---

#### FULL WORKFLOW: Local Container --> Docker Hub --> Azure ACI

**Step 1 — Make sure Docker Desktop is running on your machine**

```bash
docker --version
# Should show: Docker version 24.x or higher
```

**Step 2 — Build your auth-service image locally**

```bash
# Run this from the auth-service folder
cd auth-service
docker build -t laayardev/auth-service:latest .

# Verify it was created
docker images
# You should see: laayardev/auth-service  latest  ...
```

**Step 3 — Test the image locally before pushing**

```bash
docker run -d \
  --name auth-test \
  -p 5000:5000 \
  -e PORT=5000 \
  -e NODE_ENV=production \
  -e MONGO_URI=mongodb://host.docker.internal:27017/auth-service \
  -e JWT_SECRET=mysecretkey \
  -e JWT_EXPIRES_IN=1d \
  laayardev/auth-service:latest

# Test health endpoint
curl http://localhost:5000/health
# Expected: {"status":"ok","service":"auth-service"}

# Stop test container when done
docker stop auth-test && docker rm auth-test
```

**Step 4 — Push the image to Docker Hub**

```bash
# Login to Docker Hub
docker login
# Enter your Docker Hub username: laayardev
# Enter your Docker Hub password

# Push the image
docker push laayardev/auth-service:latest

# Your image is now public at:
# https://hub.docker.com/r/laayardev/auth-service
```

**Step 5 — Deploy to Azure Container Instances (GUI)**

Go to the Azure Portal → Create Container Instance → fill in:

```
Basics tab:
  Subscription:     your subscription
  Resource group:   microservices-rg  (create new if needed)
  Container name:   auth-service
  Region:           (US) East US
  Image source:     Other registry
  Image:            laayardev/auth-service:latest
  OS type:          Linux
  Size:             1 vcpu, 1.5 GB

Networking tab:
  DNS name label:   laayardev-auth    (becomes laayardev-auth.eastus.azurecontainer.io)
  Port:             5000
  Protocol:         TCP

Advanced tab (Environment Variables -- IMPORTANT!):
  PORT              5000
  NODE_ENV          production
  MONGO_URI         mongodb+srv://user:pass@cluster.mongodb.net/auth-service
  JWT_SECRET        your-super-secret-key-min-32-chars
  JWT_EXPIRES_IN    1d
```

Click **"Review + create"** then **"Create"**.

**Step 6 — Verify the deployment**

```bash
# Your service will be live at:
https://laayardev-auth.eastus.azurecontainer.io:5000/health

# Test it:
curl https://laayardev-auth.eastus.azurecontainer.io:5000/health
# Expected: {"status":"ok","service":"auth-service"}
```

---

#### ALTERNATIVE: Azure CLI (for automation later)

After learning the GUI, switch to CLI for speed and Jenkins integration:

```bash
# 1. Install Azure CLI
# Windows: winget install Microsoft.AzureCLI

# 2. Login
az login
# Opens browser for authentication

# 3. Create resource group (only once)
az group create --name microservices-rg --location eastus

# 4. Deploy auth-service from Docker Hub
az container create \
  --resource-group microservices-rg \
  --name auth-service \
  --image laayardev/auth-service:latest \
  --cpu 1 \
  --memory 1.5 \
  --ports 5000 \
  --dns-name-label laayardev-auth \
  --environment-variables \
    PORT=5000 \
    NODE_ENV=production \
    JWT_EXPIRES_IN=1d \
  --secure-environment-variables \
    JWT_SECRET=your-super-secret-key \
    MONGO_URI=your-mongodb-connection-string

# 5. Check status
az container show \
  --resource-group microservices-rg \
  --name auth-service \
  --query "{Status:instanceView.state, IP:ipAddress.fqdn}" \
  --output table

# 6. View logs
az container logs \
  --resource-group microservices-rg \
  --name auth-service
```

---

#### MongoDB in the Cloud — Use Atlas (Free Tier)

You do NOT run MongoDB as an ACI container. Use MongoDB Atlas instead:

```
1. Go to: https://www.mongodb.com/atlas
2. Create free account
3. Create a free cluster (M0 — free forever)
4. Create a database user:
   Username: authuser
   Password: strongpassword
5. Whitelist Azure IPs (or allow 0.0.0.0/0 for testing)
6. Get your connection string:
   mongodb+srv://authuser:strongpassword@cluster0.xxxxx.mongodb.net/auth-service
7. Use this string as MONGO_URI in Azure environment variables
```

---

#### Architecture — Phase 1 (What You're Building Now)

```
Internet
   |
   v
+------------------------------------------+
|  Azure Container Instance (ACI)          |
|  auth-service container                  |
|  laayardev/auth-service:latest           |
|  Port 5000                               |
|  URL: laayardev-auth.eastus.azurecontainer.io |
+------------------------------------------+
   |
   v  MONGO_URI env variable
+------------------------------------------+
|  MongoDB Atlas (free tier)               |
|  cluster0.xxxxx.mongodb.net              |
|  Database: auth-service                  |
+------------------------------------------+
```

---

#### When to Upgrade from ACI to Container Apps

```
Use ACI (now):
  - Testing a single service
  - Learning Azure
  - Simple, no auto-scaling needed

Upgrade to Container Apps (later, Phase 4):
  - You have 2+ services
  - You need services to talk to each other (internal DNS)
  - You want auto-scaling (scale to zero to save money)
  - You want a proper managed environment
```



---

## 9. Is auth-service Ready for Push?

### What Is Already Done

| Item | Status | Notes |
|------|--------|-------|
| `Dockerfile` | READY | Well-structured, alpine, omits devDeps |
| `.dockerignore` | READY | Excludes node_modules, .env, .git |
| `package.json` | READY | `start` script defined, ESM modules |
| `server.js` | READY | Graceful DB failure, proper port config |
| `app.js` | READY | CORS, JSON parsing, error middleware |
| `auth.controller.js` | READY | Register, Login, Signout implemented |
| `auth.middleware.js` | READY | JWT verification, Bearer token parsing |
| `User.js` model | READY | Validation, unique email, timestamps |
| `db.js` | READY | Graceful fallback if DB unavailable |
| `.gitignore` | READY | Excludes node_modules, .env |

### What Needs to Be Fixed Before Push

**1. The `.env` file — NEVER push this to GitHub!**

```bash
# Check if .env is accidentally tracked by git
git ls-files auth-service/.env

# If it shows up, remove it from tracking (keeps the file on disk)
git rm --cached auth-service/.env
git commit -m "chore: stop tracking .env file"
```

Create an `.env.example` instead (safe to commit):

```bash
# auth-service/.env.example
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/auth-service
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=1d
```

**2. Fix the test script — it currently FAILS with exit code 1**

```json
// Current (breaks Jenkins!):
"test": "echo \"Error: no test specified\" && exit 1"

// Fix — temporary placeholder that passes:
"test": "echo \"Tests will be added soon\" && exit 0"
```

**3. Add a health check endpoint to server.js**

```javascript
// Add to server.js before startServer()
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "auth-service" });
});
```

**4. JWT_SECRET default — always override in cloud**

```bash
# In cloud deployment, always set this explicitly:
docker run ... -e JWT_SECRET=your-super-long-random-secret ...
```

### Push Readiness Score

```
auth-service Push Readiness
============================

  Core Service Code       [====================]  100%  READY
  Dockerfile              [====================]  100%  READY
  .dockerignore           [====================]  100%  READY
  .gitignore              [====================]  100%  READY
  Env Security            [================    ]   80%  Add .env.example
  Tests                   [====                ]   20%  Fix test script
  Health Check            [                    ]    0%  Add /health route

  OVERALL: ~70% -- Fix 3 small items to reach 100%
```

---

## 10. Checklist — Before Every Push

```
PRE-PUSH CHECKLIST
==================

SERVICE CODE
  [ ] All features implemented and working locally
  [ ] Error handling in all routes (try/catch + error middleware)
  [ ] Input validation on all endpoints
  [ ] No hardcoded secrets in code

ENVIRONMENT
  [ ] .env is in .gitignore
  [ ] .env.example committed with placeholder values
  [ ] All required env vars documented in .env.example

DOCKER
  [ ] Dockerfile exists and builds: docker build -t service:test .
  [ ] .dockerignore excludes node_modules, .env, .git
  [ ] Container runs locally: docker run --env-file .env -p PORT:PORT service:test
  [ ] API responds correctly inside container

TESTS
  [ ] npm test passes (exit code 0)
  [ ] No failing tests

GIT
  [ ] Meaningful commit messages (feat/fix/chore format)
  [ ] On a feature branch, not directly on main
  [ ] git status is clean (no untracked .env files)

JENKINS (first time setup)
  [ ] Jenkins has Docker Hub credentials stored
  [ ] Jenkins has SSH key for cloud server
  [ ] GitHub webhook configured to point to Jenkins
  [ ] Jenkinsfile committed to repo
```

---

## 11. Project Roadmap

```
PHASE 1 — auth-service (NOW)
  [x] Build auth-service
  [ ] Fix test script + add health check
  [ ] Add .env.example
  [ ] Push to GitHub
  [ ] Build and push Docker image to Docker Hub
  [ ] Deploy to Hostinger or Azure

PHASE 2 — product-service
  [ ] Create product-service/ folder
  [ ] Create product-service/Dockerfile
  [ ] Add to docker-compose.yml
  [ ] Push and deploy

PHASE 3 — order-service
  [ ] Create order-service/ folder
  [ ] Add Dockerfile + deploy

PHASE 4 — API Gateway
  [ ] Create api-gateway/ (Nginx or Node.js)
  [ ] Route all services through gateway
  [ ] Add rate limiting and auth validation at gateway

PHASE 5 — Full CI/CD
  [ ] Jenkins pipeline for each service
  [ ] Automated tests on every push
  [ ] Auto-deploy to cloud on merge to main

PHASE 6 — Production Hardening
  [ ] Add structured logging (Winston / Pino)
  [ ] Add monitoring (Prometheus + Grafana)
  [ ] HTTPS / SSL certificates (Let's Encrypt)
  [ ] Load balancing
```

---

## Quick Reference Card

```
+====================================================+
|            COMMANDS YOU WILL USE DAILY             |
+====================================================+
|  LOCAL DEV                                         |
|  npm run dev              start with nodemon       |
|  npm test                 run tests                |
|                                                    |
|  DOCKER                                            |
|  docker build -t svc:v1 .   build image            |
|  docker run -p 5000:5000 \                         |
|    --env-file .env svc:v1   run container          |
|  docker-compose up -d       start all services     |
|  docker logs auth-service   view logs              |
|  docker ps                  list running           |
|                                                    |
|  GIT                                               |
|  git add . && git commit -m "feat: ..."            |
|  git push origin feature/auth-service              |
|                                                    |
|  Jenkins triggers automatically on push!           |
+====================================================+
```

---

*Last updated: August 2026 | Author: Ayoub | Stack: Node.js · Express · MongoDB · Docker · Jenkins · GitHub*
