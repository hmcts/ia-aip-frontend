# ---- Base image ----
FROM hmctspublic.azurecr.io/base/node:12-alpine as base
COPY . .
USER hmcts
RUN --shm-size=1gb yarn install --frozen-lockfile && yarn build
EXPOSE 3000
