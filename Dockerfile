# Multi-stage / Production Dockerfile for SportStore E-Commerce
FROM node:22-alpine AS base

WORKDIR /app

# Cài đặt các gói phụ thuộc cần thiết cho build native
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package descriptors
COPY package*.json ./

# Cài đặt production dependencies với legacy peer deps
RUN npm install --legacy-peer-deps --omit=dev

# Copy toàn bộ mã nguồn
COPY . .

# Môi trường chạy
ENV NODE_ENV=production
ENV PORT=3000

# Mở cổng 3000
EXPOSE 3000

# Chạy ứng dụng
CMD ["node", "index.js"]
