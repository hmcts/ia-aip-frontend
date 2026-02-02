import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../paths';
import UpdateAppealService from '../service/update-appeal-service';

function getCaseList(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Load all cases for the user
      await updateAppealService.loadAppeal(req);

      const ccdCases = req.session.ccdCases || [];

      return res.render('ccd-case-details-list.njk', {
        ccdCaseDetails: ccdCases,
        previousPage: paths.common.login
      });
    } catch (e) {
      next(e);
    }
  };
}

function setupCaseListController(updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.common.caseList, getCaseList(updateAppealService));
  return router;
}

export {
  setupCaseListController,
  getCaseList
};
