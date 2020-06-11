import config from 'config';
import { NextFunction, Request, Response, Router } from 'express';
import * as _ from 'lodash';
import i18n from '../../../locale/en.json';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import { documentIdToDocStoreUrl, DocumentManagementService } from '../../service/document-management-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { addDaysToDate } from '../../utils/date-utils';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { asBooleanValue, hasInflightTimeExtension, nowAppealDate } from '../../utils/utils';
import {
  createStructuredError,
  reasonForAppealDecisionValidation,
  yesOrNoRequiredValidation
} from '../../utils/validations/fields-validations';

const askForMoreTimeFeatureEnabled: boolean = asBooleanValue(config.get('features.askForMoreTime'));

function getReasonForAppeal(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.reasonsForAppeal.isEdit = _.has(req.query, 'edit');
    return res.render('reasons-for-appeal/reason-for-appeal-page.njk', {
      previousPage: paths.common.overview,
      applicationReason: req.session.appeal.reasonsForAppeal.applicationReason,
      askForMoreTimeFeatureEnabled: askForMoreTimeFeatureEnabled,
      askForMoreTimeInFlight: hasInflightTimeExtension(req.session.appeal)
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
        return res.render('reasons-for-appeal/reason-for-appeal-page.njk', {
          errorList: Object.values(validation),
          error: validation,
          askForMoreTimeFeatureEnabled: askForMoreTimeFeatureEnabled
        });
      }
      req.session.appeal.reasonsForAppeal = {
        ...req.session.appeal.reasonsForAppeal,
        applicationReason: req.body.applicationReason
      };

      await updateAppealService.submitEvent(Events.EDIT_REASONS_FOR_APPEAL, req);

      if (req.body['saveForLater']) {
        if (_.has(req.session, 'appeal.reasonsForAppeal.isEdit')
          && req.session.appeal.reasonsForAppeal.isEdit === true) {
          req.session.appeal.reasonsForAppeal.isEdit = false;
        }
        return res.redirect(paths.common.overview + '?saved');
      }
      if (req.body['saveAndAskForMoreTime']) {
        if (_.has(req.session, 'appeal.reasonsForAppeal.isEdit')
          && req.session.appeal.reasonsForAppeal.isEdit === true) {
          req.session.appeal.reasonsForAppeal.isEdit = false;
        }
        return res.redirect(paths.common.askForMoreTime.reason);
      }

      return getConditionalRedirectUrl(req, res, paths.awaitingReasonsForAppeal.supportingEvidence);
    } catch (e) {
      next(e);
    }
  };
}

function getAdditionalSupportingEvidenceQuestionPage(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.reasonsForAppeal.isEdit = _.has(req.query, 'edit');
    return res.render('reasons-for-appeal/supporting-evidence-page.njk', {
      previousPage: paths.awaitingReasonsForAppeal.decision,
      askForMoreTimeFeatureEnabled: askForMoreTimeFeatureEnabled
    });
  } catch (e) {
    next(e);
  }
}

function postAdditionalSupportingEvidenceQuestionPage(req: Request, res: Response, next: NextFunction) {
  try {
    const { answer } = req.body;
    const validations = yesOrNoRequiredValidation(req.body, i18n.validationErrors.reasonForAppeal.supportingEvidenceRequired);
    if (validations !== null) {
      return res.render('reasons-for-appeal/supporting-evidence-page.njk', {
        errorList: Object.values(validations),
        error: validations,
        previousPage: paths.awaitingReasonsForAppeal.supportingEvidence,
        askForMoreTimeFeatureEnabled: askForMoreTimeFeatureEnabled
      });
    }
    if (answer === 'yes') {
      return res.redirect(paths.awaitingReasonsForAppeal.supportingEvidenceUpload);
    } else if (answer === 'no') {
      return res.redirect(paths.awaitingReasonsForAppeal.checkAndSend);
    }
  } catch (e) {
    next(e);
  }
}

function getSupportingEvidenceUploadPage(req: Request, res: Response, next: NextFunction) {
  try {

    req.session.appeal.reasonsForAppeal.isEdit = _.has(req.query, 'edit');

    const evidences = req.session.appeal.reasonsForAppeal.evidences || {};
    return res.render('reasons-for-appeal/supporting-evidence-upload-page.njk', {
      evidences: Object.values(evidences),
      evidenceCTA: paths.awaitingReasonsForAppeal.supportingEvidenceDeleteFile,
      previousPage: paths.awaitingReasonsForAppeal.supportingEvidence,
      askForMoreTimeFeatureEnabled: askForMoreTimeFeatureEnabled
    });
  } catch (e) {
    next(e);
  }
}

function postSupportingEvidenceSubmit(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      if (req.body['saveForLater']) {
        if (_.has(req.session, 'appeal.reasonsForAppeal.isEdit')
          && req.session.appeal.reasonsForAppeal.isEdit === true) {
          req.session.appeal.reasonsForAppeal.isEdit = false;
        }
        return res.redirect(paths.common.overview + '?saved');
      } else {
        if (req.session.appeal.reasonsForAppeal.evidences === undefined) {
          const validation = [ {
            href: 'uploadFile',
            text: i18n.validationErrors.fileUpload.noFileSelected,
            value: '#uploadFile'
          } ];
          return res.render('reasons-for-appeal/supporting-evidence-upload-page.njk', {
            errorList: Object.values(validation),
            error: validation,
            askForMoreTimeFeatureEnabled: askForMoreTimeFeatureEnabled
          });
        }
        await updateAppealService.submitEvent(Events.EDIT_REASONS_FOR_APPEAL, req);
        return getConditionalRedirectUrl(req, res, paths.awaitingReasonsForAppeal.checkAndSend);
      }
    } catch (e) {
      next(e);
    }
  };
}

function postSupportingEvidenceUploadFile(documentManagementService: DocumentManagementService, updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.file) {
        const evidenceStored: DocumentUploadResponse = await documentManagementService.uploadFile(req);
        const evidences: Evidence[] = [ ...(req.session.appeal.reasonsForAppeal.evidences || []) ];
        evidences.push({
          fileId: evidenceStored.fileId,
          name: evidenceStored.name,
          dateUploaded: nowAppealDate(),
          description: 'Appeal Reasons supporting evidence'
        });
        req.session.appeal.reasonsForAppeal.evidences = [ ...evidences ];
        return res.redirect(paths.awaitingReasonsForAppeal.supportingEvidenceUpload);
      } else {
        let validationError;
        validationError = res.locals.multerError
          ? { uploadFile: createStructuredError('uploadFile', res.locals.multerError) }
          : { uploadFile: createStructuredError('uploadFile', i18n.validationErrors.fileUpload.noFileSelected) };
        const evidences = req.session.appeal.reasonsForAppeal.evidences || {};

        return res.render('reasons-for-appeal/supporting-evidence-upload-page.njk', {
          evidences: Object.values(evidences),
          error: validationError,
          errorList: Object.values(validationError),
          previousPage: paths.awaitingReasonsForAppeal.supportingEvidence,
          askForMoreTimeFeatureEnabled: askForMoreTimeFeatureEnabled

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
      const fileId: string = req.query.id as string;
      if (fileId) {
        const targetUrl: string = documentIdToDocStoreUrl(fileId, req.session.appeal.documentMap);
        await documentManagementService.deleteFile(req, targetUrl);
        const evidences: Evidence[] = [ ...req.session.appeal.reasonsForAppeal.evidences ];
        req.session.appeal.reasonsForAppeal.evidences = evidences.filter((evidence: Evidence) => evidence.fileId !== req.query['id']);
      }
      return res.redirect(paths.awaitingReasonsForAppeal.supportingEvidenceUpload);
    } catch (e) {
      next(e);
    }
  };
}

function getConfirmationPage(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('reasons-for-appeal/confirmation-page.njk', {
      date: addDaysToDate(14)
    });
  } catch (e) {
    next(e);
  }
}

function setupReasonsForAppealController(middleare: Middleware[], deps?: any): Router {
  const router = Router();
  router.get(paths.awaitingReasonsForAppeal.decision, middleare, getReasonForAppeal);
  router.post(paths.awaitingReasonsForAppeal.decision, middleare, postReasonForAppeal(deps.updateAppealService));
  router.get(paths.awaitingReasonsForAppeal.supportingEvidence, middleare, getAdditionalSupportingEvidenceQuestionPage);
  router.post(paths.awaitingReasonsForAppeal.supportingEvidence, middleare, postAdditionalSupportingEvidenceQuestionPage);
  router.get(paths.awaitingReasonsForAppeal.supportingEvidenceUpload, middleare, getSupportingEvidenceUploadPage);
  router.post(paths.awaitingReasonsForAppeal.supportingEvidenceUploadFile, middleare, postSupportingEvidenceUploadFile(deps.documentManagementService, deps.updateAppealService));
  router.get(paths.awaitingReasonsForAppeal.supportingEvidenceDeleteFile, middleare, getSupportingEvidenceDeleteFile(deps.documentManagementService));
  router.post(paths.awaitingReasonsForAppeal.supportingEvidenceSubmit, middleare, postSupportingEvidenceSubmit(deps.updateAppealService));
  router.get(paths.reasonsForAppealSubmitted.confirmation, middleare, getConfirmationPage);

  return router;
}

export {
  setupReasonsForAppealController,
  getReasonForAppeal,
  postReasonForAppeal,
  getAdditionalSupportingEvidenceQuestionPage,
  postAdditionalSupportingEvidenceQuestionPage,
  getSupportingEvidenceUploadPage,
  postSupportingEvidenceUploadFile,
  getSupportingEvidenceDeleteFile,
  postSupportingEvidenceSubmit,
  getConfirmationPage
};
