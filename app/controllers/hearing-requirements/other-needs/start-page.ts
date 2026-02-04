import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../../../paths';

function getHearingRequirementsStartPage(req: Request, res: Response, next: NextFunction) {
  try {
    const previousPage = paths.submitHearingRequirements.taskList;

    return res.render('hearing-requirements/other-needs/other-needs-section.njk', {
      previousPage
    });
  } catch (e) {
    next(e);
  }
}

function setupHearingRequirementsStartPageController(middleware: Middleware[]): Router {
  const router = Router();
  router.get(paths.submitHearingRequirements.otherNeeds, middleware, getHearingRequirementsStartPage);

  return router;
}

export {
  setupHearingRequirementsStartPageController,
  getHearingRequirementsStartPage
};
