# A straightforward production image for a student research prototype:
# favors correctness and easy local Docker Compose use over minimal image size.
FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

COPY . .
# A placeholder DATABASE_URL lets `prisma generate` run during the build;
# the real value is supplied at container start by docker-compose/.env.
RUN DATABASE_URL="file:./build-placeholder.db" npx prisma generate \
  && DATABASE_URL="file:./build-placeholder.db" npm run build \
  && rm -f build-placeholder.db

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 selamcode \
  && chown -R selamcode:nodejs /app
USER selamcode

EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
# Apply pending migrations, seed exercises (idempotent), then start the server.
CMD ["sh", "-c", "npx prisma migrate deploy && node prisma/seed.mjs && npm run start"]
