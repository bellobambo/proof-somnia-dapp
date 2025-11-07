FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first (for efficient caching)
COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.* ./
COPY postcss.config.* ./
COPY tailwind.config.* ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the Next.js app
RUN npm run build


FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.* ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# Expose the app port
EXPOSE 3000

# Run the app
CMD ["npm", "start"]
