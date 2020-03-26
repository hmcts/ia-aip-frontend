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
import { handleFileUploadErrors, uploadConfiguration } from './middleware/file-upload-validation-middleware';
import { isUserAuthenticated } from './middleware/is-user-authenticated';
import { logErrorMiddleware, logRequestMiddleware } from './middleware/logger';
import { filterRequest } from './middleware/xss-middleware';
import { paths } from './paths';
import { router } from './routes';
import { setupSession } from './session';
import { getUrl } from './utils/url-utils';

const uuid = require('uuid');

function createApp() {
  const app: express.Application = express();
  const environment: string = process.env.NODE_ENV;

  // Inject nonce Id on every request.
  app.use((req, res, next) => {
    res.locals.nonce = uuid.v4();
    next();
  });

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
  app.post('*', uploadConfiguration, handleFileUploadErrors);
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
    res.locals.host = getUrl(req.protocol, req.hostname, '');
    next();
  });
  app.use(isUserAuthenticated);
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
        '\'unsafe-inline\'',
        'www.google-analytics.com',
        'www.googletagmanager.com',
        'tagmanager.google.com'
      ],
      styleSrc: [
        '\'self\'',
        'tagmanager.google.com',
        'fonts.googleapis.com/',
        (req, res) =>
          req.url.includes('/view/document/')
            ? `'unsafe-inline'`
            : `'nonce-${res.locals.nonce}'`
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
        'data:',
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
