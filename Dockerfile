## Base Image
FROM node:22 AS base

WORKDIR /app

COPY package.json .
COPY pnpm-lock.yaml .

RUN npm install pnpm -g
RUN pnpm install

## Test Image
FROM base AS test

WORKDIR /app

COPY . .

CMD ["pnpm", "run", "test:e2e"]

## Builder Image
FROM base AS builder

WORKDIR /app

COPY --from=base /app/node_modules .
COPY . .

RUN pnpm run build

## Runner Image
FROM base AS runner

COPY --from=builder /app/dist .
CMD ["npm", "start"]