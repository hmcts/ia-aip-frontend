import { NextFunction, Request, Response, Router } from 'express';
import multer from 'multer';
import { paths } from '../../paths';
import { DocumentManagementService } from '../../service/document-management-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { homeOfficeDecisionValidation, supportingEvidenceValidation } from '../../utils/validations/fields-validations';
import { fileUploadValidation } from '../../utils/validations/file-upload-validations';
import { daysToWaitUntilContact } from '../appeal-application/confirmation-page';

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
          error: validation
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
      previousPage: paths.reasonsForAppeal.decision
    });
  } catch (e) {
    next(e);
  }
}

function postSupportingEvidencePage(req: Request, res: Response, next: NextFunction) {
  try {
    const { value } = req.body;
    const validations = supportingEvidenceValidation(req.body);
    if (validations !== null) {
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

function postSupportingEvidenceUploadFile(documentManagementService: DocumentManagementService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.file) {

        const validation = fileUploadValidation(req.file);
        if (validation) {
          return res.render('case-building/reasons-for-appeal/reasons-for-appeal-upload.njk', {
            error: validation,
            errorList: Object.values(validation)
          });
        }

        const evidenceStored: DocumentUploadResponse = await documentManagementService.uploadFile(req);

        const { caseBuilding } = req.session.appeal;
        caseBuilding.evidences = {
          ...caseBuilding.evidences,
          [evidenceStored.id]: {
            url: evidenceStored.url,
            name: evidenceStored.name
          }
        };
        const evidence = req.session.appeal.caseBuilding.evidences || {};
        // update appeal application and pass as options to view
        return res.render('case-building/reasons-for-appeal/supporting-evidence-upload-page.njk', {
          evidences: Object.values(evidence),
          evidenceCTA: paths.reasonsForAppeal.supportingEvidenceDeleteFile,
          previousPage: paths.reasonsForAppeal.decision
        });
      }
    } catch (e) {
      next(e);
    }
  };
}

function postSupportingEvidenceDeleteFile(documentManagementService: DocumentManagementService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body.delete) {
        const fileId = Object.keys(req.body.delete)[0];
        delete req.session.appeal.caseBuilding.evidences[fileId];
        const evidence = req.session.appeal.caseBuilding.evidences || {};

        return res.render('case-building/reasons-for-appeal/supporting-evidence-upload-page.njk', {
          evidences: Object.values(evidence),
          evidenceCTA: paths.reasonsForAppeal.supportingEvidenceDeleteFile,
          previousPage: paths.reasonsForAppeal.decision
        });
      }
    } catch (e) {
      next(e);
    }
  };
}

function postSupportingEvidenceUploadPage(req: Request, res: Response, next: NextFunction) {
  try {
    // Should submit case and update session
    return res.redirect(paths.reasonsForAppeal.checkAndSend);

  } catch (e) {
    next(e);
  }
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

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './file-uploads');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage }).single('file-upload');

function setupReasonsForAppealController(deps?: any): Router {
  const router = Router();
  router.get(paths.reasonsForAppeal.decision, getReasonForAppeal);
  router.post(paths.reasonsForAppeal.decision, postReasonForAppeal(deps.updateAppealService));
  router.get(paths.reasonsForAppeal.supportingEvidence, getSupportingEvidencePage);
  router.post(paths.reasonsForAppeal.supportingEvidence, postSupportingEvidencePage);
  router.get(paths.reasonsForAppeal.supportingEvidenceUpload, getSupportingEvidenceUploadPage);
  router.post(paths.reasonsForAppeal.supportingEvidenceUpload, postSupportingEvidenceUploadPage);
  router.post(paths.reasonsForAppeal.supportingEvidenceUploadFile, upload, postSupportingEvidenceUploadFile(deps.documentManagementService));
  router.post(paths.reasonsForAppeal.supportingEvidenceDeleteFile, postSupportingEvidenceDeleteFile(deps.documentManagementService));
  router.get(paths.reasonsForAppeal.checkAndSend, getCheckAndSendPage);
  router.post(paths.reasonsForAppeal.checkAndSend, postCheckAndSendPage);
  router.get(paths.reasonsForAppeal.confirmation, getConfirmationPage);

  return router;
}

export {
  setupReasonsForAppealController,
  getReasonForAppeal,
  postReasonForAppeal,
  getSupportingEvidencePage,
  postSupportingEvidencePage,
  getSupportingEvidenceUploadPage,
  postSupportingEvidenceUploadPage,
  postSupportingEvidenceUploadFile,
  postSupportingEvidenceDeleteFile,
  getCheckAndSendPage,
  postCheckAndSendPage,
  getConfirmationPage
};
