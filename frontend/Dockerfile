# Use official Node runtime as a parent image
FROM node:20-alpine

# Set work directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Run Vite in host mode to allow external access
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
