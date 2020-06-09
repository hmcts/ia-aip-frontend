import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../../paths';

function getCmaGuidancePage(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('case-management-appointment/what-to-expect.njk', {
      previousPage: paths.awaitingCmaRequirements.taskList
    });
  } catch (error) {
    next(error);
  }
}

function setupcmaGuidancePageController(middleware: Middleware[]): Router {
  const router = Router();
  router.get(paths.common.whatToExpect, getCmaGuidancePage, middleware);
  return router;
}

export {
  setupcmaGuidancePageController,
  getCmaGuidancePage
};
