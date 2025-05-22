# ---- base image to inherit from ----
FROM node:24.0.2-slim AS common

COPY ./src/app /app/

WORKDIR /app

RUN npm ci

CMD ["npm", "start"]
