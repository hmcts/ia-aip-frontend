import { NextFunction, Request, Response } from 'express';
import i18n from '../../../locale/en.json';
import { paths } from '../../paths';
import { documentIdToDocStoreUrl, DocumentManagementService } from '../../service/document-management-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { createStructuredError, yesOrNoRequiredValidation } from '../../utils/validations/fields-validations';

export interface EvidenceUploadConfig {
  evidenceYesNoPath: string;
  evidenceUploadPath: string;
  evidenceDeletePath: string;
  evidenceSubmitPath: string;
  cancelPath: string;
  nextPath: string;
  askForMoreTimeFeatureEnabled: boolean;
  updateCcdEvent: any; // todo work out how to put an enum here
  getEvidenceFromSessionFunction: (req: Request) => any;
  addEvidenceToSessionFunction: (evidence: any, req: Request) => void;
  removeEvidenceFromSessionFunction: (id: string, req: Request) => void;
}

const evidenceYesNoTemplate: string = 'ask-for-more-time/supporting-evidence-yes-or-no.njk';

export function getEvidenceYesNo(previousPage: string, extraPageModel, res: Response, next: NextFunction) {
  try {
    res.render(evidenceYesNoTemplate, Object.assign({
      previousPage: previousPage
    }, extraPageModel));
  } catch (e) {
    next(e);
  }
}

export function postEvidenceYesNo(previousPage: string,
                                  extraPageModel,
                                  evidenceUploadConfig: EvidenceUploadConfig,
                                  req: Request,
                                  res: Response,
                                  next: NextFunction) {
  try {
    const { answer } = req.body;
    const validations = yesOrNoRequiredValidation(req.body, i18n.validationErrors.reasonForAppeal.supportingEvidenceRequired);
    if (validations !== null) {
      return res.render(evidenceYesNoTemplate, Object.assign({
        errorList: Object.values(validations),
        error: validations,
        previousPage: previousPage
      }, extraPageModel));
    }
    if (answer === 'yes') {
      return res.redirect(evidenceUploadConfig.evidenceUploadPath);
    } else {
      const evidenceFromSession = evidenceUploadConfig.getEvidenceFromSessionFunction(req);
      evidenceFromSession.forEach(evidence => {
        evidenceUploadConfig.removeEvidenceFromSessionFunction(evidence.fileId, req);
      });

      return res.redirect(evidenceUploadConfig.nextPath);
    }
  } catch (e) {
    next(e);
  }
}

function getEvidenceUploadPageOptions(evidences, evidenceUploadConfig: EvidenceUploadConfig) {
  return {
    evidences: Object.values(evidences),
    evidenceCTA: evidenceUploadConfig.evidenceDeletePath,
    previousPage: evidenceUploadConfig.evidenceYesNoPath,
    askForMoreTimeFeatureEnabled: evidenceUploadConfig.askForMoreTimeFeatureEnabled,
    pathToUploadEvidence: evidenceUploadConfig.evidenceUploadPath,
    pathToSubmitEvidence: evidenceUploadConfig.evidenceSubmitPath,
    pathToCancel: evidenceUploadConfig.cancelPath
  };
}

export function getUploadPage(evidenceUploadConfig: EvidenceUploadConfig,
                              req: Request,
                              res: Response,
                              next: NextFunction) {
  try {
    const evidences = evidenceUploadConfig.getEvidenceFromSessionFunction(req) || {};
    return res.render(
      'upload-evidence/evidence-upload-page.njk',
      getEvidenceUploadPageOptions(evidences, evidenceUploadConfig)
    );
  } catch (e) {
    next(e);
  }
}

export function postUploadFile(documentManagementService: DocumentManagementService, updateAppealService: UpdateAppealService, evidenceUploadConfig: EvidenceUploadConfig) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.file) {
        const evidenceStored: DocumentUploadResponse = await documentManagementService.uploadFile(req);
        const evidences = {
          fileId: evidenceStored.fileId,
          name: evidenceStored.name
        };
        evidenceUploadConfig.addEvidenceToSessionFunction(evidences, req);
        await updateAppealService.submitEvent(evidenceUploadConfig.updateCcdEvent, req);
        return res.redirect(evidenceUploadConfig.evidenceUploadPath);
      } else {
        let validationError;
        validationError = res.locals.multerError
          ? { uploadFile: createStructuredError('uploadFile', res.locals.multerError) }
          : { uploadFile: createStructuredError('uploadFile', i18n.validationErrors.fileUpload.noFileSelected) };
        const evidences = evidenceUploadConfig.getEvidenceFromSessionFunction(req) || {};

        return res.render('upload-evidence/evidence-upload-page.njk', {
          ...getEvidenceUploadPageOptions(evidences, evidenceUploadConfig),
          ...{
            error: validationError,
            errorList: Object.values(validationError)
          }
        });
      }
    } catch (e) {
      next(e);
    }
  };
}

export function getSupportingEvidenceDeleteFile(documentManagementService: DocumentManagementService, evidenceUploadConfig: EvidenceUploadConfig) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.query['id']) {
        const fileId = req.query['id'];
        const targetUrl: string = documentIdToDocStoreUrl(fileId, req.session.appeal.documentMap);
        await documentManagementService.deleteFile(req, targetUrl);
        evidenceUploadConfig.removeEvidenceFromSessionFunction(fileId, req);
      }
      return res.redirect(evidenceUploadConfig.evidenceUploadPath);
    } catch (e) {
      next(e);
    }
  };
}

export function postSupportingEvidence(updateAppealService: UpdateAppealService, evidenceUploadConfig: EvidenceUploadConfig) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      if (req.body['saveForLater']) {
        return res.redirect(paths.common.overview + '?saved');
      } else {
        const evidences = evidenceUploadConfig.getEvidenceFromSessionFunction(req);

        if (evidences === undefined || !evidences.length) {
          const validation = [ {
            href: 'uploadFile',
            text: i18n.validationErrors.fileUpload.noFileSelected,
            value: '#uploadFile'
          } ];

          return res.render('upload-evidence/evidence-upload-page.njk', {
            ...getEvidenceUploadPageOptions(evidences, evidenceUploadConfig),
            ...{
              error: validation,
              errorList: Object.values(validation)
            }
          });
        }

        await updateAppealService.submitEvent(evidenceUploadConfig.updateCcdEvent, req);
        return getConditionalRedirectUrl(req, res, evidenceUploadConfig.nextPath);
      }
    } catch (e) {
      next(e);
    }
  };
}
