# ---- Base image ----
FROM hmctsprod.azurecr.io/base/node:24-alpine as base

USER hmcts
COPY --chown=hmcts:hmcts . .
RUN yarn install --immutable && yarn build
EXPOSE 3000
