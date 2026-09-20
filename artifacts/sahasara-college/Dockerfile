FROM node:24-bookworm-slim AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
ENV PORT=4173
ENV BASE_PATH=/
RUN pnpm --filter @workspace/sahasara-college run build

FROM nginx:1.27-alpine
COPY --from=build /app/artifacts/sahasara-college/dist/public /usr/share/nginx/html
COPY artifacts/sahasara-college/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80