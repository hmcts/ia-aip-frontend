import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../paths';

function getEligibilityServicePage(req: Request, res: Response, next: NextFunction) {
  try {
    res.render('appeal-application/service-page.njk', {
      previousPage: '/'
    });
  } catch (e) {
    next(e);
  }
}
function postEligibilityServicePage(req: Request, res: Response, next: NextFunction) {
  try {
    res.redirect('/eligible-service');
  } catch (e) {
    next(e);
  }
}
function setupEligibilityServicePageController(): Router {
  const router = Router();
  router.get(paths.eligibleService, getEligibilityServicePage);
  router.post(paths.eligibleService, postEligibilityServicePage);
  return router;
}

export {
  getEligibilityServicePage,
  postEligibilityServicePage,
  setupEligibilityServicePageController
};
