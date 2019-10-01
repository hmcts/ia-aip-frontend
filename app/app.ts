const path = require('path');
import express from 'express';
import * as nunjucks from 'nunjucks';

import { router } from './routes';

const { PORT = 3000 } = process.env;
const isDev: Function = () => process.env.NODE_ENV === 'development';

const app = express();

nunjucks.configure([
  'views',
  path.resolve('node_modules/govuk-frontend/')
], {
  autoescape: true,
  express: app,
  noCache:  true
});

app.use(express.static('build', { maxAge: 31557600000 }));
app.use(router);

app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'UP', version: process.version });
});
app.get('/liveness', (req: express.Request, res: express.Response) => {
  res.json({});
});

app.listen(PORT, () => {
  // tslint:disable-next-line no-console
  console.log('server started at http://localhost:' + PORT);
});
