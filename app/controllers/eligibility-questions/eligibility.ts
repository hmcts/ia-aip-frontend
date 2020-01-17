import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../../paths';

function getIneligible(req: Request, res: Response, next: NextFunction) {
  try {
    res.render('eligibility/ineligible-page.njk', {
      previousPage: paths.eligibility.start
    });
  } catch (e) {
    next(e);
  }
}

function setupEligibilityQuestionsController() {
  const router = Router();
  router.get(paths.eligibility.ineligible, getIneligible);

  return router;
}

export {
  getIneligible,
  setupEligibilityQuestionsController
};
