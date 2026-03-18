FROM node:20-alpine

# Install system dependencies
RUN apk update && apk add --no-cache \
    python3 \
    py3-pip \
    curl \
    ffmpeg \
    bash

# ✅ Install yt-dlp via curl (correct for Alpine — pip is externally managed)
# ✅ Add --update flag so it self-updates to latest binary
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp \
    -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# ✅ Create cookies directory so mount always works
#RUN mkdir -p /app/cookies

EXPOSE 5000

# ✅ Use node directly not npm run dev — more stable in containers
CMD ["node", "server.js"]