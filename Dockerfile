FROM node:22.13.1-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

# Source will be mounted from host

CMD ["pnpm", "run" , "dev"]
