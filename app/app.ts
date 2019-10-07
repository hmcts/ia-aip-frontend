import * as http from 'http';
import path from 'path';
import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import * as nunjucks from 'nunjucks';
import webpackDevConfig from '../webpack/webpack.dev.js';

import { router } from './routes';

import expressSession from 'express-session';
import * as redis from 'redis';
import redisConnect from 'connect-redis';
import config from 'config';

const port: number | string = process.env.PORT || 3000;
const app: express.Application = express();

const useReddis = config.get('session.useReddis') === 'true';
const isSecure = config.get('session.cookie.secure') === 'true';

if (useReddis) {
  const redisStore: expressSession.Store = redisConnect(expressSession);
  const redisClient = redis.createClient();

  redisClient.on('error', (err) => {
    // tslint:disable-next-line no-console
    console.log('Redis error: ', err);
  });
  const store = new redisStore({
    url: config.get('session.redis.url'),
    ttl: config.get('session.redis.ttlInSeconds'),
    client: redisClient
  });
  app.use(expressSession({
    cookie: {
      httpOnly: true,
      maxAge: config.get('session.cookie.maxAgeInMs'),
      secure: isSecure
    },
    resave: true,
    saveUninitialized: true,
    secret: config.get('session.redis.secret'),
    rolling: true,
    store
  }));
} else {
  app.use(expressSession({
    secret: config.get('session.redis.secret'),
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }));
}

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

app.use(express.static('build', { maxAge: 31557600000 }));
app.use(router);

app.get('/health', (req: expressSession.Request, res: expressSession.Response) => {
  req.session.health = req.session.health ? req.session.health + 1 : 1;
  res.json({ status: 'UP', count: req.session.health });
});
app.get('/liveness', (req: expressSession.Request, res: expressSession.Response) => {
  res.json({});
});
app.get('/health/liveness', (req: expressSession.Request, res: expressSession.Response) => {
  res.json({});
});

const server: http.Server = app.listen(port, () => {
  // tslint:disable-next-line no-console
  console.log('server started at http://localhost:' + port);
});

export function getServer() {
  return server;
}
