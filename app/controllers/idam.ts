import idamExpressMiddleware from '@hmcts/div-idam-express-middleware';
import config from 'config';
import { Request, Router } from 'express';
import { paths } from '../paths';
import { getRedirectUrl } from '../utils/url-utils';

function setupIdamController(): Router {
  const idamArgs = {
    redirectUri: 'https://localhost:3000/redirectUrl',
    indexUrl: '/start',
    idamApiUrl: config.get('idam.apiUrl'),
    idamLoginUrl: `${config.get('idam.webUrl')}/login`,
    idamSecret: config.get('idam.secret'),
    idamClientID: config.get('microservice')
  };

  const router = Router();

  router.get('/redirectUrl', idamExpressMiddleware.landingPage(idamArgs), (req: Request, res) => {
    // Initializing the session, to replace with the proper call to CCD api to get the case
    req.session.appealApplication = {
      files: {}
    };
    res.redirect(paths.taskList);
  });
  router.use(idamExpressMiddleware.userDetails(idamArgs));
  router.use('/login', (req, res, next) => {
    const loginIdamArgs = idamArgs;
    loginIdamArgs.redirectUri = getRedirectUrl(req);
    return idamExpressMiddleware.authenticate(idamArgs)(req, res, next);
  });
  router.get(paths.start, (req, res) => {
    res.render('start.njk');
  });
  router.get(paths.logout, idamExpressMiddleware.logout(idamArgs));
  router.use(idamExpressMiddleware.protect(idamArgs));
  router.get(paths.login, (req, res) => {
    res.redirect(paths.index);
  });

  return router;
}

export {
  setupIdamController
};
