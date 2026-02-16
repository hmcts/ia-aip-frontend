import config from 'config';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import express, { Application, type NextFunction, type Request, type Response } from 'express';
import helmet from 'helmet';

import { v4 as uuidv4 } from 'uuid';
import webpack from 'webpack';
import webpackDevMiddleware, { Options } from 'webpack-dev-middleware';
import internationalization from '../locale/en.json';
import webpackDevConfig from '../webpack/webpack.dev.js';
import { configureIdam, configureLogger, configureNunjucks, configureS2S } from './app-config';
import { setupHealthController } from './controllers/health';
import { pageNotFoundHandler, serverErrorHandler } from './handlers/error-handler';
import {
  enforceFileSizeLimit,
  handleFileUploadErrors,
  uploadConfiguration
} from './middleware/file-upload-validation-middleware';
import { isUserAuthenticated } from './middleware/is-user-authenticated';
import { logErrorMiddleware, logRequestMiddleware } from './middleware/logger';
import { filterRequest } from './middleware/xss-middleware';
import { paths } from './paths';
import { routerSetup } from './routes';
import { setupSession } from './session';
import { getUrl } from './utils/url-utils';

const featurePolicy = require('feature-policy');

const nocache = require('nocache');

function createApp() {
  const app: express.Application = express();
  const environment: string = process.env.NODE_ENV;
  const isDevEnv = ['test', 'development', 'aatDevelopment'].includes(environment);
  const router = express.Router();

  app.use(setupHealthController(router));
  // Inject nonce Id on every request.
  app.use((req, res, next) => {
    res.locals.nonce = uuidv4();
    next();
  });

  configureHelmet(app);

  app.use(setupSession());
  configureLogger(app);
  configureIdam(app);
  configureNunjucks(app);
  configureS2S(app);

  app.set('trust proxy', 1);
  app.locals.i18n = internationalization;
  app.locals.paths = paths;
  app.locals.maxFileSizeInMb = config.get('evidenceUpload.maxFileSizeInMb');
  app.locals.supportedFormats = config.get('evidenceUpload.supportedFormats');
  app.locals.trackingScripts = config.get('trackingScripts');
  if (environment !== 'test') app.use(logRequestMiddleware);
  app.use(express.static('build', { maxAge: 31557600000 }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(csurf());
  app.post('*', uploadConfiguration, enforceFileSizeLimit, handleFileUploadErrors);
  app.post('*', filterRequest);

  if (isDevEnv) {
    const [serverDevConfig, clientDevConfig] = webpackDevConfig;
    const compiler = webpack([serverDevConfig, clientDevConfig]);
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
  app.use(routerSetup(router));
  app.use(logErrorMiddleware);
  app.use(pageNotFoundHandler);
  app.use(serverErrorHandler);

  return app;
}

function configureHelmet(app: Application) {
  app.use(
    helmet({
      referrerPolicy: {
        policy: 'origin'
      },
      contentSecurityPolicy: {
        useDefaults: false,
        directives: {
          defaultSrc: ["'self'"],
          fontSrc: ["'self'", 'data:'],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            'www.google-analytics.com',
            'www.googletagmanager.com',
            'tagmanager.google.com',
            'https://*.dynatrace.com'
          ],
          styleSrc: [
            "'self'",
            'tagmanager.google.com',
            'fonts.googleapis.com',
            (req: Request, res: Response) =>
              req.url.includes('/view/document/')
                ? "'unsafe-inline'"
                : `'nonce-${res.locals.nonce}'`
          ],
          connectSrc: [
            "'self'",
            '*.gov.uk',
            '*.google-analytics.com',
            '*.platform.hmcts.net',
            'https://*.dynatrace.com'
          ],
          mediaSrc: ["'self'"],
          frameSrc: [
            "'self'",
            'www.googletagmanager.com',
            'vcc-eu4.8x8.com'
          ],
          frameAncestors: [
            "'self'",
            'www.googletagmanager.com'
          ],
          imgSrc: [
            "'self'",
            'data:',
            'www.google-analytics.com',
            'www.googletagmanager.com',
            'tagmanager.google.com',
            'vcc-eu4.8x8.com',
            'https://*.dynatrace.com'
          ]
        }
      },
      permittedCrossDomainPolicies: { permittedPolicies: 'none' }
    })
  );
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    next();
  });
  app.use(featurePolicy({
    features: {
      accelerometer: ['\'none\''],
      ambientLightSensor: ['\'none\''],
      autoplay: ['\'none\''],
      camera: ['\'none\''],
      geolocation: ['\'none\''],
      gyroscope: ['\'none\''],
      magnetometer: ['\'none\''],
      microphone: ['\'none\''],
      payment: ['\'none\''],
      speaker: ['\'none\''],
      usb: ['\'none\''],
      vibrate: ['\'none\'']
    }
  }));
  app.use(permissionsPolicy);
  app.use(nocache());
}

function permissionsPolicy(req: Request, res: Response, next: NextFunction) {
  res.setHeader(
    'Permissions-Policy',
    [
      'accelerometer=()',
      'ambient-light-sensor=()',
      'autoplay=()',
      'camera=()',
      'geolocation=()',
      'gyroscope=()',
      'magnetometer=()',
      'microphone=()',
      'payment=()',
      'speaker=()',
      'usb=()',
      'vibrate=()'
    ].join(', ')
  );
  next();
}

export {
  createApp
};
