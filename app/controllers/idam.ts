import idamExpressMiddleware from '@hmcts/div-idam-express-middleware';
import config from 'config';
import { Router } from 'express';

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

  router.get('/redirectUrl', idamExpressMiddleware.landingPage(idamArgs), (req, res) => {
    res.redirect('/');
  });
  router.use(idamExpressMiddleware.userDetails(idamArgs));
  router.use('/login', idamExpressMiddleware.authenticate(idamArgs));
  router.get('/start', (req, res) => {
    res.end(`<p>This will be the start page </p><a href='/login'>Login</a>`);
  });
  router.get('/logout', idamExpressMiddleware.logout(idamArgs));
  router.use(idamExpressMiddleware.protect(idamArgs));
  router.get('/login', (req, res) => {
    res.redirect('/');
  });

  return router;
}

export {
  setupIdamController
};
