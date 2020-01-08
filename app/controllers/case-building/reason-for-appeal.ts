
import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../../paths';
import { Events } from '../../service/ccd-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { homeOfficeDecisionValidation } from '../../utils/validations/fields-validations';
import { daysToWaitUntilContact } from '../appeal-application/confirmation-page';

function getReasonForAppeal(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('case-building/reasons-for-appeal/reason-for-appeal.njk', {
      previousPage:  '/appellant-timeline'
    });
  } catch (e) {
    next(e);
  }
}

function postReasonForAppeal(updateAppealService: UpdateAppealService) {
  return async function(req: Request, res: Response, next: NextFunction) {
    try {
      // Should submit evidence
      return res.redirect('case-building/reasons-for-appeal/check-and-send.njk');
    } catch (e) {
      next(e);
    }
  };
}

function getConfirmationPage(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('case-building/confirmation-page.njk',{
      date: daysToWaitUntilContact(14)
    });
  } catch (e) {
    next(e);
  }
}

function getReasonsUploadPage(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('case-building/reasons-for-appeal/reasons-for-appeal-upload.njk',{
    });
  } catch (e) {
    next(e);
  }
}

function setupReasonsForAppealController(deps?: any): Router {
  const router = Router();
  router.get(paths.reasonsForAppeal.decision, getReasonForAppeal);
  router.post(paths.reasonsForAppeal.decision, postReasonForAppeal(deps.updateAppealService));
  router.get(paths.reasonsForAppeal.confirmation, getConfirmationPage);
  router.get(paths.reasonsForAppeal.uplaod, getReasonsUploadPage);

  return router;
}

export {
    setupReasonsForAppealController,
    getReasonForAppeal,
    postReasonForAppeal,
    getConfirmationPage,
    getReasonsUploadPage

};
