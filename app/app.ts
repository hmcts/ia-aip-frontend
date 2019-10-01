import * as http from 'http';
import path from 'path';
import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import * as nunjucks from 'nunjucks';
import webpackDevConfig from '../webpack/webpack.dev.js';

import { router } from './routes';

const port: number | string = process.env.PORT || 3000;
const app: express.Application = express();

nunjucks.configure([
  'views',
  path.resolve('node_modules/govuk-frontend/')
], {
  autoescape: true,
  express: app,
  noCache: true
});

if (process.env.NODE_ENV === 'development') {
  const compiler = webpack(webpackDevConfig);
  const wpDevMiddleware = webpackDevMiddleware(compiler, webpackDevConfig.devServer);
  app.use(wpDevMiddleware);
}

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

const server: http.Server = app.listen(port, () => {
  // tslint:disable-next-line no-console
  console.log('server started at http://localhost:' + port);
});

export function getServer() {
  return server;
}
