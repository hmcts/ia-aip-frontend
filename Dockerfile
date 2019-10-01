# ---- Base image ----
FROM hmctspublic.azurecr.io/base/node/stretch-slim-lts-10:10-stretch-slim AS base
COPY . .
RUN yarn install && yarn build
EXPOSE 3000
