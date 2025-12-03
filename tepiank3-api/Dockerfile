FROM node:18-alpine

WORKDIR /app

# Install dependencies first (caching)
COPY package*.json ./
COPY prisma ./prisma/

# Use npm ci for deterministic installs
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma Client
# Dummy DATABASE_URL is needed for generation
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate

# Security: Run as non-root user
USER node

EXPOSE 3001

CMD ["npm", "start"]
