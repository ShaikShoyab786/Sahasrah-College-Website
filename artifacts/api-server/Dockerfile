FROM node:24-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @workspace/api-server run prisma:generate
RUN pnpm --filter @workspace/api-server run build

FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
COPY --from=build /app/artifacts/api-server/package.json ./artifacts/api-server/package.json
COPY --from=build /app/artifacts/api-server/prisma ./artifacts/api-server/prisma
COPY --from=build /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=build /app/node_modules ./node_modules
RUN mkdir -p /app/uploads
EXPOSE 5000
CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]