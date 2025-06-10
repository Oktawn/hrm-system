FROM node:22 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/templates ./src/templates
COPY package*.json ./
RUN npm ci --only=production
RUN mkdir -p uploads/documents
CMD ["npm", "run", "start"]