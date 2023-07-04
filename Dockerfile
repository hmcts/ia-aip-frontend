# ---- Base image ----
FROM hmctspublic.azurecr.io/base/node:20-alpine as base

USER hmcts
COPY --chown=hmcts:hmcts . .
RUN yarn install --immutable && yarn build
EXPOSE 3000
