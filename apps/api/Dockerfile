FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy root config and workspaces
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/

# Install dependencies (only for API workspace)
RUN pnpm install --filter api...

# Copy source
COPY apps/api/ apps/api/
COPY templates/ templates/

# Generate Prisma Client & Build
WORKDIR /app/apps/api
RUN pnpm prisma generate
RUN pnpm build

FROM node:20-alpine AS runner

# Install Typst
RUN apk add --no-cache wget xz \
    && wget https://github.com/typst/typst/releases/download/v0.11.0/typst-x86_64-unknown-linux-musl.tar.xz \
    && tar -xJf typst-x86_64-unknown-linux-musl.tar.xz \
    && mv typst-x86_64-unknown-linux-musl/typst /usr/local/bin/typst \
    && rm -rf typst-x86_64-unknown-linux-musl.tar.xz typst-x86_64-unknown-linux-musl \
    && apk del wget xz

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma/schema.prisma ./apps/api/prisma/
COPY --from=builder /app/templates /app/templates

# Install production dependencies
RUN pnpm install --prod --filter api...

WORKDIR /app/apps/api

# Re-generate Prisma Client in the runner environment
RUN pnpm prisma generate

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "dist/index.js"]
