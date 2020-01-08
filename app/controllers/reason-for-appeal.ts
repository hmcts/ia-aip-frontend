import { NextFunction, Request, Response, Router } from 'express';
import multer from 'multer';
import { paths } from '../paths';
import UpdateAppealService from '../service/update-appeal-service';
import { homeOfficeDecisionValidation, supportingEvidenceValidation } from '../utils/fields-validations';
import { daysToWaitUntilContact } from './confirmation-page';

function getReasonForAppeal(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('case-building/reasons-for-appeal/reason-for-appeal-page.njk', {
      previousPage: '/appellant-timeline'
    });
  } catch (e) {
    next(e);
  }
}

function postReasonForAppeal(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const validation = homeOfficeDecisionValidation(req.body);
      if (validation != null) {
        return res.render('case-building/reasons-for-appeal/reason-for-appeal-page.njk', {
          errorList: Object.values(validation),
          error: validation,
          previousPage: '/appellant-timeline'
        });
      }
      req.session.appeal.caseBuilding = {
        decision: req.body.moreDetail
      };
      // TODO Save to CCD.
      // await updateAppealService.submitEvent(Events.UPLOAD_RESPONDENT_EVIDENCE, req);
      return res.redirect(paths.reasonsForAppeal.supportingEvidence);
    } catch (e) {
      next(e);
    }
  };
}

function getSupportingEvidencePage(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('case-building/reasons-for-appeal/supporting-evidence-page.njk', {
      previousPage: '/reason-for-appeal'
    });
  } catch (e) {
    next(e);
  }
}

function postSupportingEvidencePage(req: Request, res: Response, next: NextFunction) {
  try {
    const { value } = req.body;
    const validations = supportingEvidenceValidation(req);
    if (validations === null) {
      return res.render('case-building/reasons-for-appeal/supporting-evidence-page.njk', {
        errorList: Object.values(validations),
        error: validations
      });
    }
    if (value === 'yes') {
      return res.redirect(paths.reasonsForAppeal.supportingEvidenceUpload);
    } else {
      return res.redirect(paths.reasonsForAppeal.checkAndSend);
    }
  } catch (e) {
    next(e);
  }
}

function getSupportingEvidenceUploadPage(req: Request, res: Response, next: NextFunction) {
  try {
    const evidence = req.session.appeal.caseBuilding.evidences || {};
    return res.render('case-building/reasons-for-appeal/supporting-evidence-upload-page.njk', {
      evidences: Object.values(evidence),
      evidenceCTA: paths.reasonsForAppeal.supportingEvidenceDeleteFile,
      previousPage: paths.reasonsForAppeal.decision
    });
  } catch (e) {
    next(e);
  }
}

function postSupportingEvidenceUploadPage(req: Request, res: Response, next: NextFunction) {
  try {
    // Should submit case and update session
    return res.redirect(paths.reasonsForAppeal.checkAndSend);
  } catch (e) {
    next(e);
  }
}

function postSupportingEvidenceUploadFile() {
  return async (req: Request, res: Response, next: NextFunction) => {
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
      return res.redirect(paths.reasonsForAppeal.supportingEvidenceUpload);
    } catch (e) {
      next(e);
    }
  };
}

function getCheckAndSendPage(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('case-building/reasons-for-appeal/check-and-send-page.njk', {
      previousPage: '/appellant-timeline'
    });
  } catch (e) {
    next(e);
  }
}

function postCheckAndSendPage(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      // Should submit and update case event
      return res.redirect(paths.reasonsForAppeal.confirmation);
    } catch (e) {
      next(e);
    }
  };
}

function getConfirmationPage(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('case-building/reasons-for-appeal/confirmation-page.njk', {
      date: daysToWaitUntilContact(14)
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
    return res.redirect(paths.reasonsForAppeal.supportingEvidenceUpload);
  } catch (e) {
    next(e);
  }
}

const upload = multer().single('file-upload');

function setupReasonsForAppealController(deps?: any): Router {
  const router = Router();
  router.get(paths.reasonsForAppeal.decision, getReasonForAppeal);
  router.post(paths.reasonsForAppeal.decision, postReasonForAppeal(deps.updateAppealService));
  router.get(paths.reasonsForAppeal.supportingEvidence, getSupportingEvidencePage);
  router.post(paths.reasonsForAppeal.supportingEvidence, postSupportingEvidencePage);
  router.get(paths.reasonsForAppeal.supportingEvidenceUpload, getSupportingEvidenceUploadPage);
  router.post(paths.reasonsForAppeal.supportingEvidenceUpload, postSupportingEvidenceUploadPage);
  router.post(paths.reasonsForAppeal.supportingEvidenceUploadFile, upload, postSupportingEvidenceUploadFile);
  router.get(paths.reasonsForAppeal.checkAndSend, getCheckAndSendPage);
  router.post(paths.reasonsForAppeal.checkAndSend, postCheckAndSendPage);
  router.get(paths.reasonsForAppeal.confirmation, getConfirmationPage);
  return router;
}

export {
  setupReasonsForAppealController
};
