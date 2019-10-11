import config from 'config';
import express from 'express';
import * as nunjucks from 'nunjucks';
import path from 'path';
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

export {
  configureLogger,
  configureNunjucks
};
