# ------------ Base Image ------------

FROM node:22-alpine

# ------------ Working Directory ------------

WORKDIR /app

# ------------ Copy package files ------------

COPY package*.json ./

# ------------ Install dependencies ------------

RUN npm ci --omit=dev

# ------------ Copy source code ------------

COPY . .

# ------------ Expose application port ------------

EXPOSE 5000

# ------------ Health Check ------------

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# ------------ Start application ------------

CMD ["npm", "start"]