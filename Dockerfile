# ---- Base image ----
FROM hmctspublic.azurecr.io/base/node/alpine-lts-10:10-alpine as base
COPY . .
RUN yarn install && yarn build
EXPOSE 3000
