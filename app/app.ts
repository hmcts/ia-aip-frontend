import bodyParser from 'body-parser';
import express = require('express');
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import internationalization from '../locale/en.json';
import webpackDevConfig from '../webpack/webpack.dev.js';
import { configureLogger, configureNunjucks } from './app-config';
import { pageNotFoundHandler, serverErrorHandler } from './handlers/error-handler';
import { logErrorMiddleware, logRequestMiddleware } from './middleware/logger';
import { router } from './routes';
import { setupSession } from './session';

function createApp() {
  const app: express.Application = express();
  app.use(setupSession());
  configureLogger(app);
  configureNunjucks(app);
  app.locals.i18n = internationalization;
  app.use(logRequestMiddleware);
  app.use(express.static('build', { maxAge: 31557600000 }));
  app.use(bodyParser.urlencoded({ extended: true }));

  if (process.env.NODE_ENV === 'development') {
    const [ serverDevConfig, clientDevConfig ] = webpackDevConfig;
    const compiler = webpack([ serverDevConfig, clientDevConfig ]);
    const wpDevMiddleware = webpackDevMiddleware(compiler);
    app.use(wpDevMiddleware);
  }
  app.use(router);
  app.use(logErrorMiddleware);
  app.use(pageNotFoundHandler);
  app.use(serverErrorHandler);

  return app;
}

export {
  createApp
};
