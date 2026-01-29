import { NextFunction, Response, Router } from 'express';
import type { Request } from 'express-serve-static-core';
import { paths } from '../../../paths';

function getCMARequirementsStartPage(req: Request<Params>, res: Response, next: NextFunction) {
  try {
    const previousPage = paths.awaitingCmaRequirements.taskList;

    return res.render('cma-requirements/other-needs/other-needs-section.njk', {
      previousPage
    });
  } catch (e) {
    next(e);
  }
}

function setupCMARequirementsStartPageController(middleware: Middleware[]): Router {
  const router = Router();
  router.get(paths.awaitingCmaRequirements.otherNeeds, middleware, getCMARequirementsStartPage);

  return router;
}

export {
  setupCMARequirementsStartPageController,
  getCMARequirementsStartPage
};
