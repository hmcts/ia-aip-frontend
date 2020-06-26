import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../../paths';

function getCmaGuidancePage(req: Request, res: Response, next: NextFunction) {
  const previousPage = { attributes: { onclick: 'history.go(-1); return false;' } };
  try {
    return res.render('case-management-appointment/what-to-expect.njk', {
      previousPage
    });
  } catch (error) {
    next(error);
  }
}

function setupcmaGuidancePageController(middleware: Middleware[]): Router {
  const router = Router();
  router.get(paths.common.whatToExpectAtCMA, getCmaGuidancePage, middleware);
  return router;
}

export {
  setupcmaGuidancePageController,
  getCmaGuidancePage
};
