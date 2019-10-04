import * as path from 'path';
import express from 'express';
import * as nunjucks from 'nunjucks';
import { router } from './routes';
import expressSession from 'express-session';
import * as redis from 'redis';
import redisConnect from 'connect-redis';
import config from 'config';

const { PORT = 3000 } = process.env;
const isDev: Function = () => process.env.NODE_ENV === 'development';

const app = express();

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

const isSecure = config.get('session.cookie.secure') === 'true';

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

app.listen(PORT, () => {
  // tslint:disable-next-line no-console
  console.log('server started at http://localhost:' + PORT);
});
