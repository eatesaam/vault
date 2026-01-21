FROM node:20-alpine AS builder
WORKDIR /app
# Hardcode the API URL here
ENV NEXT_PUBLIC_API_URL=http://localhost:8000
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
# Hardcode the API URL here
ENV NEXT_PUBLIC_API_URL=http://localhost:8000
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.js ./next.config.js
EXPOSE 4000
CMD ["npm", "start"]