# ----------------------------------------------------------------------
# Stage 1: Dependency Installation (Base Builder)
# ----------------------------------------------------------------------
FROM node:20-alpine AS deps

# Set the working directory inside the container
WORKDIR /app

# Copy package files (package.json and lockfile)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# ----------------------------------------------------------------------
# Stage 2: Next.js Build (FIX IS HERE)
# ----------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# FIX: Copy package files (package.json and lockfile) into the builder stage
# The 'npm run build' command needs these files to know what to build.
COPY package.json package-lock.json ./

# Copy node_modules from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the application source code
COPY . .

# Run the Next.js build command
RUN npm run build

# ----------------------------------------------------------------------
# Stage 3: Production Server (Minimal Image)
# ----------------------------------------------------------------------
# ... (Rest of Stage 3 remains the same)
FROM node:20-alpine AS runner
ENV NODE_ENV production
ENV PORT 3000
EXPOSE 3000
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# CRITICAL FIX (Check for 'src' folder):
# If your next.config.ts or other root-level files are required at runtime,
# you may also need to copy those, but package.json is the primary fix for the error.

RUN npm install --omit=dev
CMD ["npm", "start"]