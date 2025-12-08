# ----------------------------------------------------------------------
# Stage 1: Dependency Installation (Base Builder)
# ----------------------------------------------------------------------
FROM node:20-alpine AS deps

# Set the working directory inside the container
WORKDIR /app

# Copy package files (package.json and lockfile) to install dependencies
# This step is crucial for caching, as dependencies only reinstall if these files change
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# ----------------------------------------------------------------------
# Stage 2: Next.js Build
# ----------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy node_modules from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the application source code
# This includes the 'src' directory, next.config.ts, etc.
COPY . .

# Run the Next.js build command
# The Next.js output is optimized for production
RUN npm run build

# ----------------------------------------------------------------------
# Stage 3: Production Server (Minimal Image)
# ----------------------------------------------------------------------
# We use a minimal node image that only needs to run the application
FROM node:20-alpine AS runner

# Set the node environment to production
ENV NODE_ENV production

# Next.js defaults to running on port 3000
ENV PORT 3000
EXPOSE 3000

WORKDIR /app

# Copy optimized build files and production dependencies
# Copy the built output (.next) from the 'builder' stage
COPY --from=builder /app/.next ./.next
# Copy static assets and public files
COPY --from=builder /app/public ./public
# Copy necessary package files for runtime
COPY --from=builder /app/package.json ./package.json

# Install only production dependencies (no dev dependencies)
RUN npm install --omit=dev

# Command to run the Next.js production server
CMD ["npm", "start"]
