# Use the official Bun image
FROM oven/bun:latest AS base
WORKDIR /app

# --- Step 1: Build Frontend ---
FROM base AS frontend-builder
COPY . .
RUN bun install --frozen-lockfile
RUN cd frontend && bun run build

# --- Step 2: Runner ---
FROM base AS runner
# Copy everything correctly to satisfy Bun workspaces
COPY . .

# Install all dependencies (production + dev if needed for build, but here just everything to keep it simple and fix workspace resolution)
RUN bun install --frozen-lockfile

# Copy the built frontend artifacts from the frontend-builder stage
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Build the backend source code
RUN cd backend-express && bun run build

# Set environment variables
ENV NODE_ENV=production
EXPOSE 3001

# Start the application using Bun workspaces filter
CMD ["bun", "run", "--filter", "backend-express", "start"]
