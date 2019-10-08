import * as http from 'http';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import * as nunjucks from 'nunjucks';
import webpackDevConfig from '../webpack/webpack.dev.js';
import { router } from './routes';
import internationalization from './../locale/en.json';
import { pageNotFoundHandler, serverErrorHandler } from './handlers/error-handler';

const path = require('path');

import express = require('express');

import { setupSession } from './session';

const port: number | string = process.env.PORT || 3000;
const app: express.Application = express();

app.use(setupSession());

nunjucks.configure([
  'views',
  path.resolve('node_modules/govuk-frontend/')
], {
  autoescape: true,
  express: app,
  noCache: true
});

if (process.env.NODE_ENV === 'development') {
  const [ serverDevConfig, clientDevConfig ] = webpackDevConfig;
  const compiler = webpack([ serverDevConfig, clientDevConfig ]);
  const wpDevMiddleware = webpackDevMiddleware(compiler);

  app.use(wpDevMiddleware);
}
/**
 *  Internationalization Config
 */
app.locals.i18n = internationalization;

app.use(express.static('build', { maxAge: 31557600000 }));
app.use(router);

/**
 *  Error Handlers
 */
app.use(pageNotFoundHandler);
app.use(serverErrorHandler);

const server: http.Server = app.listen(port, () => {
  // tslint:disable-next-line no-console
  console.log('server started at http://localhost:' + port);
});

export function getServer() {
  return server;
}
