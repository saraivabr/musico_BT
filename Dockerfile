FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile || npm install

COPY . .

RUN pnpm build || npm run build

EXPOSE 3008

CMD ["node", "dist/app.js"]
