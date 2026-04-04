# Use the official Bun image
FROM oven/bun:latest AS base
WORKDIR /app

# --- Step 1: Build Frontend ---
FROM base AS frontend-builder
# Copy only necessary files for frontend build to leverage Docker caching
COPY frontend/package.json frontend/bun.lock ./frontend/
RUN cd frontend && bun install --frozen-lockfile
COPY frontend/ ./frontend/
RUN cd frontend && bun run build

# --- Step 2: Prepare Runner ---
FROM base AS runner
# Copy root package files
COPY package.json bun.lock ./
# Copy backend workspace package files
COPY backend-express/package.json backend-express/bun.lock ./backend-express/
RUN bun install --frozen-lockfile

# Copy backend source
COPY backend-express/ ./backend-express/
# Copy the BUILT frontend to the path expected by the backend
# Your app.ts uses: path.join(__dirname, "..", "..", "frontend", "dist")
# In the runner, we'll place it in /app/frontend/dist so that if the backend
# is in /app/backend-express, the relative path works.
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Build backend (TypeScript)
RUN cd backend-express && bun run build

# Set environment to production
ENV NODE_ENV=production
# Expose the internal port (Matches your fly.toml internal_port)
EXPOSE 3001

# Run the backend using the --filter to target the workspace
CMD ["bun", "run", "--filter", "backend-express", "start"]
