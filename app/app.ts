import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import expectCt from 'expect-ct';
import express from 'express';
import helmet from 'helmet';
import webpack from 'webpack';
import webpackDevMiddleware, { Options } from 'webpack-dev-middleware';
import internationalization from '../locale/en.json';
import webpackDevConfig from '../webpack/webpack.dev.js';
import { configureLogger, configureNunjucks, configureS2S } from './app-config';
import { pageNotFoundHandler, serverErrorHandler } from './handlers/error-handler';
import { logErrorMiddleware, logRequestMiddleware } from './middleware/logger';
import { filterRequest } from './middleware/xss-middleware';
import { paths } from './paths';
import { router } from './routes';
import { setupSession } from './session';

function createApp() {
  const app: express.Application = express();
  const environment: string = process.env.NODE_ENV;

  configureHelmet(app);

  app.use(setupSession());
  configureLogger(app);
  configureNunjucks(app);
  configureS2S(app);

  app.set('trust proxy', 1);
  app.locals.i18n = internationalization;
  app.locals.paths = paths;
  if (environment !== 'test') app.use(logRequestMiddleware);
  app.use(express.static('build', { maxAge: 31557600000 }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(csurf());
  app.post('*', filterRequest);

  if (environment === 'development') {
    const [ serverDevConfig, clientDevConfig ] = webpackDevConfig;
    const compiler = webpack([ serverDevConfig, clientDevConfig ]);
    const options = { stats: 'errors-only' } as Options;
    const wpDevMiddleware = webpackDevMiddleware(compiler, options);
    app.use(wpDevMiddleware);
  }

  app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
  });
  app.use(router);
  app.use(logErrorMiddleware);
  app.use(pageNotFoundHandler);
  app.use(serverErrorHandler);

  return app;
}

function configureHelmet(app) {
  // by setting HTTP headers appropriately.
  app.use(helmet());

  // Helmet referrer policy
  app.use(helmet.referrerPolicy({ policy: 'origin' }));

  // Helmet content security policy (CSP) to allow only assets from same domain.
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [ '\'self\'' ],
      fontSrc: [ '\'self\' data:' ],
      scriptSrc: [
        '\'self\'',
        'www.google-analytics.com',
        'www.googletagmanager.com',
        'tagmanager.google.com'
      ],
      styleSrc: [
        '\'self\'',
        'tagmanager.google.com',
        'fonts.googleapis.com/'
      ],
      connectSrc: [ '\'self\'', 'www.gov.uk' ],
      mediaSrc: [ '\'self\'' ],
      frameSrc: [
        '\'self\'',
        'www.googletagmanager.com',
        'vcc-eu4.8x8.com'
      ],
      frameAncestors: [
        '\'self\'',
        'www.googletagmanager.com'
      ],
      imgSrc: [
        '\'self\'',
        '\'self\' data:',
        'www.google-analytics.com',
        'www.googletagmanager.com',
        'tagmanager.google.com',
        'vcc-eu4.8x8.com'
      ]
    }
  }));

  app.use(helmet.permittedCrossDomainPolicies());
  app.use(expectCt({ enforce: true, maxAge: 60 }));
  app.use(helmet.featurePolicy({
    features: {
      accelerometer: [ '\'none\'' ],
      ambientLightSensor: [ '\'none\'' ],
      autoplay: [ '\'none\'' ],
      camera: [ '\'none\'' ],
      geolocation: [ '\'none\'' ],
      gyroscope: [ '\'none\'' ],
      magnetometer: [ '\'none\'' ],
      microphone: [ '\'none\'' ],
      payment: [ '\'none\'' ],
      speaker: [ '\'none\'' ],
      usb: [ '\'none\'' ],
      vibrate: [ '\'none\'' ]
    }
  }));
  app.use(helmet.noCache());
}

export {
  createApp
};
