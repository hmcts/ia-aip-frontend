# ---- Base image ----
FROM hmctspublic.azurecr.io/base/node:14-alpine as base
COPY . .
USER hmcts
RUN yarn install --frozen-lockfile && yarn build
EXPOSE 3000
