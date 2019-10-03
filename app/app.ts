const path = require('path');
import * as nunjucks from 'nunjucks';
import express = require('express');
import { RequestHandler } from 'express';

import { router } from './routes';

const port: number | string = process.env.PORT || 3000;
const isDev: boolean = process.env.NODE_ENV === 'development';

const app: express.Application = express();

interface Options {
  disableAppInsights ?: boolean;
}

function setup(sessionHandler: RequestHandler, options: Options) {
  const opts = options || {};

  nunjucks.configure([
    'views',
    path.resolve('node_modules/govuk-frontend/')
  ], {
    autoescape: true,
    express: app,
    noCache: true
  });

  app.use(express.static('build', { maxAge: 31557600000 }));
  app.use(router);

  app.get('/health', (req: express.Request, res: express.Response) => {
    res.json({ status: 'UP', version: process.version });
  });
  app.get('/liveness', (req: express.Request, res: express.Response) => {
    res.json({});
  });

  return app.listen(port, () => {
    // tslint:disable-next-line no-console
    console.log('server started at http://localhost:' + port);
  });
}

export { setup };
