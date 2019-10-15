import config from 'config';
import express from 'express';
import * as nunjucks from 'nunjucks';
import path from 'path';
import S2SService from './service/s2s-service';
import Logger from './utils/logger';

function configureLogger(app: express.Application) {
  const iKey = config.get('appInsights.instrumentationKey');
  const logger: Logger = new Logger(iKey);
  app.locals.logger = logger;
}

function configureNunjucks(app: express.Application) {
  const nunjucksEnv: nunjucks.Environment = nunjucks.configure([
    'views',
    path.resolve('node_modules/govuk-frontend/')
  ], {
    autoescape: true,
    express: app,
    noCache: true
  });
}

function configureS2S(app: express.Application) {
  const s2s = S2SService.getInstance();
  app.locals.s2s = s2s;
}
export {
  configureLogger,
  configureNunjucks,
  configureS2S
};
