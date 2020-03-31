import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../paths';

function getCookiesPage(req: Request, res: Response, next: NextFunction) {
  res.render('footer/cookies.njk', {
    previousPage: {
      attributes: { onclick: 'history.go(-1); return false;' }
    }
  });
}

function getPrivacyPolicyPage(req: Request, res: Response, next: NextFunction) {
  res.render('footer/privacy-policy.njk', {
    previousPage: {
      attributes: { onclick: 'history.go(-1); return false;' }
    }
  });
}

function getTermsAndConditionsPage(req: Request, res: Response, next: NextFunction) {
  res.render('footer/terms-and-conditions.njk', {
    previousPage: {
      attributes: { onclick: 'history.go(-1); return false;' }
    }
  });
}

function setupFooterController(): Router {
  const router: Router = Router();
  router.get(paths.common.cookies, getCookiesPage);
  router.get(paths.common.privacyPolicy, getPrivacyPolicyPage);
  router.get(paths.common.termsAndConditions, getTermsAndConditionsPage);
  return router;
}

export {
  getCookiesPage,
  getPrivacyPolicyPage,
  getTermsAndConditionsPage,
  setupFooterController
};
