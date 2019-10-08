import config from 'config';
import * as http from 'http';
import path from 'path';
import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import * as nunjucks from 'nunjucks';
import Logger from './utils/logger';
import { router } from './routes';
import webpackDevConfig from '../webpack/webpack.dev.js';
import {
  logErrorMiddleware,
  logRequestMiddleware
} from './middleware/logger';

const port: number | string = process.env.PORT || 3000;
const app: express.Application = express();

const iKey = config.get('appInsights.instrumentationKey');
const logger: Logger = new Logger(iKey);
app.locals.logger = logger;

nunjucks.configure([
  'views',
  path.resolve('node_modules/govuk-frontend/')
], {
  autoescape: true,
  express: app,
  noCache: true
});

if (process.env.NODE_ENV === 'development') {
  const [ serverDevConfig, clientDevConfig] = webpackDevConfig;
  const compiler = webpack([ serverDevConfig, clientDevConfig ]);
  const wpDevMiddleware = webpackDevMiddleware(compiler);

  app.use(wpDevMiddleware);
}
app.use(logRequestMiddleware);
app.use(express.static('build', { maxAge: 31557600000 }));
app.use(router);

app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'UP', version: process.version });
});
app.get('/liveness', (req: express.Request, res: express.Response) => {
  res.json({});
});
app.get('/health/liveness', (req: express.Request, res: express.Response) => {
  res.json({});
});

app.use(logErrorMiddleware);

const server: http.Server = app.listen(port, () => {
  // tslint:disable-next-line no-console
  console.log('server started at http://localhost:' + port);
});

export function getServer() {
  return server;
}
