# Step 1: Build the React app
FROM node:22-alpine AS builder

WORKDIR /app

# Accept build-time argument for API URL
ARG VITE_API_URL
# Make it available as an environment variable for Vite
ENV VITE_API_URL=$VITE_API_URL

# Copy package.json and lockfile first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the production-ready files
RUN npm run build

# Step 2: Serve the app using a lightweight web server
FROM nginx:alpine

# Copy the build output to nginx html folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
