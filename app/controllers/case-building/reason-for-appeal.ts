import { NextFunction, Request, Response, Router } from 'express';
import multer from 'multer';
import { paths } from '../../paths';
import { DocumentManagementService } from '../../service/document-management-service';
import UpdateAppealService from '../../service/update-appeal-service';
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
      // Should submit and update case  and session with text reason
      return res.redirect(paths.reasonsForAppeal.supportingEvidence);
    } catch (e) {
      next(e);
    }
  };
}

function getSupportingEvidencePage(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('case-building/reasons-for-appeal/supporting-evidence-page.njk', {
      previousPage: '/appellant-timeline'
    });
  } catch (e) {
    next(e);
  }
}

function postSupportingEvidencePage(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      // Should have conditional redirect to supporting evidence upload based on radio buttons
      return res.redirect(paths.reasonsForAppeal.supportingEvidenceUpload);
    } catch (e) {
      next(e);
    }
  };
}

function getSupportingEvidenceUploadPage(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('case-building/reasons-for-appeal/supporting-evidence-upload-page.njk', {});
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
        const { application } = req.session.appeal;
        await documentManagementService.uploadFile(req);
        // update appeal application and pass as options to view
        return res.render('case-building/reasons-for-appeal/reasons-for-appeal-upload.njk', {});
      }
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
  router.get(paths.reasonsForAppeal.checkAndSend, getCheckAndSendPage);
  router.post(paths.reasonsForAppeal.checkAndSend, postCheckAndSendPage);
  router.get(paths.reasonsForAppeal.confirmation, getConfirmationPage);

  return router;
}

export {
  setupReasonsForAppealController,
  getReasonForAppeal,
  postReasonForAppeal,
  getConfirmationPage,
  getSupportingEvidenceUploadPage

};
