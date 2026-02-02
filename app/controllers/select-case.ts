import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../paths';
import UpdateAppealService from '../service/update-appeal-service';

function selectCase(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const caseId = req.params.caseId;

      if (!caseId) {
        return res.redirect(paths.common.caseList);
      }

      // Find the selected case from the session
      const ccdCases = req.session.ccdCases || [];
      const selectedCase = ccdCases.find(c => c.id === caseId);

      if (!selectedCase) {
        return res.redirect(paths.common.caseList);
      }

      // Load the selected case into session
      req.session.ccdCaseId = selectedCase.id;
      req.session.appeal = updateAppealService.mapCcdCaseToAppeal(selectedCase);

      // Redirect to overview
      return res.redirect(paths.common.overview);
    } catch (e) {
      next(e);
    }
  };
}

function setupSelectCaseController(updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.common.selectCase, selectCase(updateAppealService));
  return router;
}

export {
  setupSelectCaseController,
  selectCase
};
