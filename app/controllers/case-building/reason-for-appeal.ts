import { NextFunction, Request, Response, Router } from 'express';
import * as path from 'path';
import i18n from '../../../locale/en.json';
import { handleFileUploadErrors, SUPPORTED_FORMATS } from '../../middleware/file-upload-validation-middleware';
import { paths } from '../../paths';
import { DocumentManagementService } from '../../service/document-management-service';
import UpdateAppealService from '../../service/update-appeal-service';
import {
  createStructuredError,
  reasonForAppealDecisionValidation,
  supportingEvidenceRequiredValidation
} from '../../utils/validations/fields-validations';
import { daysToWaitUntilContact } from '../appeal-application/confirmation-page';

const config = require('config');
const multer = require('multer');
const maxFileSizeInMb: number = config.get('evidenceUpload.maxFileSizeInMb');

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
      const validation = reasonForAppealDecisionValidation(req.body);
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
    const validations = supportingEvidenceRequiredValidation(req.body);
    if (validations !== null) {
      return res.render('case-building/reasons-for-appeal/supporting-evidence-page.njk', {
        errorList: Object.values(validations),
        error: validations,
        previousPage: paths.reasonsForAppeal.decision
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
    const evidences = req.session.appeal.caseBuilding.evidences || {};
    return res.render('case-building/reasons-for-appeal/supporting-evidence-upload-page.njk', {
      evidences: Object.values(evidences),
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
        const evidenceStored: DocumentUploadResponse = await documentManagementService.uploadFile(req);
        const { caseBuilding } = req.session.appeal;
        caseBuilding.evidences = {
          ...caseBuilding.evidences,
          [evidenceStored.id]: {
            id: evidenceStored.id,
            url: evidenceStored.url,
            name: evidenceStored.name
          }
        };
        return res.redirect(paths.reasonsForAppeal.supportingEvidenceUpload);
      } else {
        let validationError;
        validationError = res.locals.multerError
          ? { uploadFile: createStructuredError('uploadFile', res.locals.multerError) }
          : { uploadFile: createStructuredError('uploadFile', i18n.validationErrors.fileUpload.noFileSelected) };

        return res.render('case-building/reasons-for-appeal/supporting-evidence-upload-page.njk', {
          error: validationError,
          errorList: Object.values(validationError),
          previousPage: paths.reasonsForAppeal.decision
        });
      }
    } catch (e) {
      next(e);
    }
  };
}

function getSupportingEvidenceDeleteFile(documentManagementService: DocumentManagementService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.query['id']) {
        const fileId = req.query['id'];
        const evidences: Evidences = req.session.appeal.caseBuilding.evidences;
        const target: Evidence = evidences[fileId];
        await documentManagementService.deleteFile(req, target.url);
        delete req.session.appeal.caseBuilding.evidences[fileId];
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

const upload = multer({
  limits: { fileSize: (maxFileSizeInMb * 1024 * 1024) },
  fileFilter: (req, file, cb) => {
    const fileTypeError = 'LIMIT_FILE_TYPE';
    if (SUPPORTED_FORMATS.includes(path.extname(file.originalname.toLowerCase()))) {
      cb(null, true);
    } else {
      cb(new multer.MulterError(fileTypeError), false);
    }
  }
}).single('file-upload');

function setupReasonsForAppealController(deps?: any): Router {
  const router = Router();
  router.get(paths.reasonsForAppeal.decision, getReasonForAppeal);
  router.post(paths.reasonsForAppeal.decision, postReasonForAppeal(deps.updateAppealService));
  router.get(paths.reasonsForAppeal.supportingEvidence, getSupportingEvidencePage);
  router.post(paths.reasonsForAppeal.supportingEvidence, postSupportingEvidencePage);
  router.get(paths.reasonsForAppeal.supportingEvidenceUpload, getSupportingEvidenceUploadPage);
  router.post(paths.reasonsForAppeal.supportingEvidenceUploadFile, upload, handleFileUploadErrors, postSupportingEvidenceUploadFile(deps.documentManagementService));
  router.get(paths.reasonsForAppeal.supportingEvidenceDeleteFile, getSupportingEvidenceDeleteFile(deps.documentManagementService));
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
  postSupportingEvidenceUploadFile,
  getSupportingEvidenceDeleteFile,
  getCheckAndSendPage,
  postCheckAndSendPage,
  getConfirmationPage
};
