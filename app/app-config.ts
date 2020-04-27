import config from 'config';
import express from 'express';
import * as _ from 'lodash';
import * as nunjucks from 'nunjucks';
import path from 'path';
import { setupIdamConfig } from './config/idam-config';
import { paths } from './paths';
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
  nunjucksEnv.addFilter('eval', function(text: string) {
    return nunjucks.renderString(text, this.ctx);
  });
  nunjucksEnv.addFilter('path', function(path: string) {
    return _.get(paths, path);
  });
}

function configureS2S(app: express.Application) {
  const s2s = S2SService.getInstance();
  app.locals.s2s = s2s;
}

function configureIdam(app: express.Application) {
  setupIdamConfig(app.locals.logger);
}

export {
  configureLogger,
  configureNunjucks,
  configureS2S,
  configureIdam
};
