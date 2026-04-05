# Use the official Bun image
FROM oven/bun:latest AS base
WORKDIR /app

# Stage 1: Install Dependencies (All)
FROM base AS install
# Copy root manifests and lockfile (wildcard handles .lockb or .lock)
COPY package.json bun.lock* ./
# IMPORTANT: Copy all workspace manifests to satisfy Bun's strict workspace validation
COPY frontend/package.json ./frontend/
COPY backend-express/package.json ./backend-express/

# Install root & workspace dependencies
RUN bun install --frozen-lockfile

# Stage 2: Build App
FROM base AS build
# Copy node_modules from the install stage
COPY --from=install /app/node_modules ./node_modules
# Copy all source files
COPY . .

# Build the frontend and backend workspaces
RUN cd frontend && bun run build
RUN cd backend-express && bun run build

# Stage 3: Runner (Production)
FROM base AS runner
# Copy only the necessary manifests for production filtering
COPY package.json bun.lock* ./
COPY backend-express/package.json ./backend-express/
# Note: We do NOT copy frontend folder into the FINAL runner if it's only serving the dist
# However, to satisfy Bun's workspaces array in root package.json if it's present, 
# we might need to create an empty directory or strip the workspace field.
RUN mkdir -p frontend

# Install only production dependencies for the target workspace
RUN bun install --frozen-lockfile --production --filter backend-express

# Copy the built artifacts from the build stage
COPY --from=build /app/frontend/dist /app/frontend/dist
COPY --from=build /app/backend-express/dist /app/backend-express/dist
# Copy the built backend source
COPY --from=build /app/backend-express /app/backend-express

# Set environment
ENV NODE_ENV=production
EXPOSE 3001

# Execute the backend
CMD ["bun", "run", "--filter", "backend-express", "start"]
