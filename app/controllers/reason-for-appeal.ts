
import { NextFunction, Request, Response, Router } from 'express';
import multer from 'multer';
import { paths } from '../paths';
import UpdateAppealService from '../service/update-appeal-service';
import { homeOfficeDecisionValidation, textAreaValidation } from '../utils/fields-validations';
import { daysToWaitUntilContact } from './confirmation-page';

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
      const validation = homeOfficeDecisionValidation(req.body);
      if (validation != null) {
        return res.render('case-building/reasons-for-appeal/reason-for-appeal.njk', {
          errorList: Object.values(validation),
          error: validation

        });
      }
      req.session.appeal.caseBuilding = {
        decision: req.body.moreDetail
      };
      // TODO Save to CCD.
      // await updateAppealService.submitEvent(Events.UPLOAD_RESPONDENT_EVIDENCE, req);
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
    const evidence = req.session.appeal.caseBuilding.evidences || {};
    return res.render('case-building/reasons-for-appeal/reasons-for-appeal-upload.njk',{
      evidences: Object.values(evidence),
      evidenceCTA: paths.reasonsForAppeal.deleteReason,
      previousPage: paths.reasonsForAppeal.decision
    });
  } catch (e) {
    next(e);
  }
}

function postDeleteEvidence(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.body.delete) {
      const fileId = Object.keys(req.body.delete)[0];
      delete req.session.appeal.caseBuilding.evidences[fileId];
    }
    return res.redirect(paths.reasonsForAppeal.uplaod);
  } catch (e) {
    next(e);
  }
}

function postUploadEvidence(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.file) {
      const { caseBuilding } = req.session.appeal;
      caseBuilding.evidences = {
        ...caseBuilding.evidences,
        [req.file.originalname]: {
          url: req.file.originalname,
          name: req.file.originalname
        }
      };
    }
    return res.redirect(paths.reasonsForAppeal.uplaod);
  } catch (e) {
    next(e);
  }
}

const upload = multer().single('file-upload');

function setupReasonsForAppealController(deps?: any): Router {
  const router = Router();
  router.get(paths.reasonsForAppeal.decision, getReasonForAppeal);
  router.post(paths.reasonsForAppeal.decision, postReasonForAppeal(deps.updateAppealService));
  router.get(paths.reasonsForAppeal.confirmation, getConfirmationPage);
  router.post(paths.reasonsForAppeal.deleteReason, upload, postDeleteEvidence);
  router.post(paths.reasonsForAppeal.fileUpload, upload, postUploadEvidence);
  router.get(paths.reasonsForAppeal.uplaod, getReasonsUploadPage);

  return router;
}

export {
    setupReasonsForAppealController,
    getReasonForAppeal,
    postReasonForAppeal,
    getConfirmationPage,
    getReasonsUploadPage,
    postDeleteEvidence,
    postUploadEvidence

};
