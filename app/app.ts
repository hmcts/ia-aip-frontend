import config from 'config';
import express from 'express';
import * as http from 'http';
import * as nunjucks from 'nunjucks';
import path from 'path';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import internationalization from '../locale/en.json';
import webpackDevConfig from '../webpack/webpack.dev.js';
import { pageNotFoundHandler, serverErrorHandler } from './handlers/error-handler';
import { logErrorMiddleware, logRequestMiddleware } from './middleware/logger';
import { router } from './routes';
import { setupSession } from './session';
import Logger from './utils/logger';

const port: number | string = process.env.PORT || 3000;
const app: express.Application = express();

/**
 * Development Configuration
 */
if (process.env.NODE_ENV === 'development') {
  const [ serverDevConfig, clientDevConfig ] = webpackDevConfig;
  const compiler = webpack([ serverDevConfig, clientDevConfig ]);
  const wpDevMiddleware = webpackDevMiddleware(compiler);

  app.use(wpDevMiddleware);
}

app.use(express.static('build', { maxAge: 31557600000 }));
app.use(router);

/**
 * Redis Session Configuration
 */
app.use(setupSession());

/**
 * Nunjucks Views configurations
 */
nunjucks.configure([
  'views',
  path.resolve('node_modules/govuk-frontend/')
], {
  autoescape: true,
  express: app,
  noCache: true
});

/**
 *  Logger Config
 */
const iKey = config.get('appInsights.instrumentationKey');
const logger: Logger = new Logger(iKey);
app.locals.logger = logger;

app.use(logRequestMiddleware);
app.use(logErrorMiddleware);

/**
 *  Internationalization Config
 */
app.locals.i18n = internationalization;

/**
 *  Error Handlers
 */
app.use(pageNotFoundHandler);
app.use(serverErrorHandler);

const server: http.Server = app.listen(port, () => {
  logger.trace('server started at http://localhost' + port, 'APP');
});

export function getServer() {
  return server;
}
