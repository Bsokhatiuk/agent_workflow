# One image: the server serves the API, the bot webhook and the built Mini App.
FROM node:24-slim AS base
RUN npm install -g pnpm@12.16.1
WORKDIR /app

FROM base AS build
COPY . .
RUN pnpm install --frozen-lockfile && pnpm build

FROM base AS runtime
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json apps/server/
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile --prod --filter "server..."
COPY --from=build /app/packages/shared/dist packages/shared/dist
COPY --from=build /app/apps/server/dist apps/server/dist
COPY --from=build /app/apps/web/dist apps/web/dist
ENV NODE_ENV=production
ENV WEB_DIST_DIR=/app/apps/web/dist
USER node
EXPOSE 3000
# Migrations: docker run <image> node apps/server/dist/src/migrate.js latest
CMD ["node", "apps/server/dist/src/main.js"]
