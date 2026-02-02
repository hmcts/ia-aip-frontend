import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../paths';
import UpdateAppealService from '../service/update-appeal-service';

function createNewCase(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const securityHeaders = await updateAppealService.getAuthenticationService().getSecurityHeaders(req);
      const userId = req.idam.userDetails.uid;

      // Use the existing createCase functionality
      const newCase = await updateAppealService.getCcdService().createCase(userId, securityHeaders);

      // Load the new case into session
      req.session.ccdCaseId = newCase.id;
      req.session.appeal = updateAppealService.mapCcdCaseToAppeal(newCase);

      // Update the cases list in session
      if (!req.session.ccdCases) {
        req.session.ccdCases = [];
      }
      req.session.ccdCases.push(newCase);

      // Redirect to task list to start filling out the appeal
      return res.redirect(paths.appealStarted.taskList);
    } catch (e) {
      next(e);
    }
  };
}

function setupCreateCaseController(updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.common.createCase, createNewCase(updateAppealService));
  return router;
}

export {
  setupCreateCaseController,
  createNewCase
};
