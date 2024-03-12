import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import i18n from '../../../locale/en.json';
import { FEATURE_FLAGS } from '../../data/constants';
import { Events } from '../../data/events';
import { PageSetup } from '../../interfaces/PageSetup';
import { paths } from '../../paths';
import { DocumentManagementService } from '../../service/document-management-service';
import LaunchDarklyService from '../../service/launchDarkly-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { createStructuredError } from '../../utils/validations/fields-validations';

async function getLocalAuthorityLetterRefund(req: Request, res: Response, next: NextFunction) {
  try {
    const refundFeatureEnabled = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_REFUND_FEATURE_FLAG, false);
    if (!refundFeatureEnabled) return res.redirect(paths.common.overview);
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    const evidenceListTitle = i18n.pages.uploadLocalAuthorityLetter.uploadedFileTitle;
    let validationErrors: ValidationErrors;
    if (req.query.error) {
      validationErrors = {
        uploadFile: createStructuredError('uploadFile', i18n.validationErrors.fileUpload[`${req.query.error}`])
      };
    }
    const localAuthorityLetterEvidences = req.session.appeal.application.localAuthorityLetters || [];
    let previousPage = paths.appealSubmitted.feeSupportRefund;

    res.render('appeal-application/fee-support/upload-local-authority-letter.njk', {
      title: i18n.pages.uploadLocalAuthorityLetter.title,
      evidenceListTitle,
      formSubmitAction: paths.appealSubmitted.localAuthorityLetterRefund,
      evidenceUploadAction: paths.appealSubmitted.localAuthorityLetterUploadRefund,
      evidences: localAuthorityLetterEvidences,
      evidenceCTA: paths.appealSubmitted.localAuthorityLetterDeleteRefund,
      previousPage: previousPage,
      saveForLaterCTA: paths.common.overview,
      ...validationErrors && { error: validationErrors },
      ...validationErrors && { errorList: Object.values(validationErrors) },
      continueCancelButtons: true
    });
  } catch (e) {
    next(e);
  }
}

function postLocalAuthorityLetterRefund(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const refundFeatureEnabled = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_REFUND_FEATURE_FLAG, false);
    if (!refundFeatureEnabled) return res.redirect(paths.common.overview);

    async function persistAppeal(appeal: Appeal, refundFeatureEnabled) {
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token'], refundFeatureEnabled);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
    }

    try {
      const authLetterUploads = req.session.appeal.application.localAuthorityLetters || [];
      if (authLetterUploads.length > 0) {
        req.session.appeal.application.feeSupportPersisted = true;
        resetJourneyValues(req.session.appeal.application);
        await persistAppeal(req.session.appeal, refundFeatureEnabled);
        return res.redirect(paths.appealSubmitted.checkYourAnswersRefund);
      } else {
        return res.redirect(`${paths.appealSubmitted.localAuthorityLetterRefund}?error=noFileSelected`);
      }
    } catch (error) {
      next(error);
    }
  };
}

function validate(req: Request, res: Response, next: NextFunction) {
  try {
    let errorCode: string;
    if (res.locals.errorCode) {
      errorCode = res.locals.errorCode;
    }
    if (errorCode) {
      return res.redirect(`${paths.appealSubmitted.localAuthorityLetterRefund}?error=${errorCode}`);
    }
    next();
  } catch (e) {
    next(e);
  }
}

function uploadLocalAuthorityLetterRefund(updateAppealService: UpdateAppealService, documentManagementService: DocumentManagementService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.file) {
        let localAuthorityLetterEvidences: Evidence[] = req.session.appeal.application.localAuthorityLetters || [];
        const localAuthorityLetter: Evidence = await documentManagementService.uploadFile(req);
        localAuthorityLetterEvidences.push(localAuthorityLetter);

        const appeal = {
          ...req.session.appeal,
          application: {
            ...req.session.appeal.application,
            localAuthorityLetters: localAuthorityLetterEvidences
          }
        };
        const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
        req.session.appeal = {
          ...req.session.appeal,
          ...appealUpdated
        };
        return res.redirect(paths.appealSubmitted.localAuthorityLetterRefund);
      }
      return res.redirect(`${paths.appealSubmitted.localAuthorityLetterRefund}?error=noFileSelected`);
    } catch (e) {
      next(e);
    }
  };
}

function deleteLocalAuthorityLetterRefund(updateAppealService: UpdateAppealService, documentManagementService: DocumentManagementService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.query.id) {
        await documentManagementService.deleteFile(req, req.query.id as string);

        const appeal: Appeal = {
          ...req.session.appeal,
          application: {
            ...req.session.appeal.application,
            localAuthorityLetters: req.session.appeal.application.localAuthorityLetters.filter(document => document.fileId !== req.query.id)
          }
        };
        const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
        req.session.appeal = {
          ...req.session.appeal,
          ...appealUpdated
        };
        return res.redirect(paths.appealSubmitted.localAuthorityLetterRefund);
      }
    } catch (e) {
      next(e);
    }
  };
}

// Function used in CYA page edit mode, when the start page option is changed other values should be reset and the journey should start from the new selected option
function resetJourneyValues(application: AppealApplication) {
  application.asylumSupportRefNumber = null;
  application.helpWithFeesOption = null;
  application.helpWithFeesRefNumber = null;
}

@PageSetup.register
class SetupLocalAuthorityLetterRefundController {
  initialise(middleware: any[], updateAppealService, documentManagementService: DocumentManagementService): any {
    const router = Router();
    router.get(paths.appealSubmitted.localAuthorityLetterRefund, middleware, getLocalAuthorityLetterRefund);
    router.post(paths.appealSubmitted.localAuthorityLetterRefund, middleware, postLocalAuthorityLetterRefund(updateAppealService));
    router.post(paths.appealSubmitted.localAuthorityLetterUploadRefund, middleware, validate, uploadLocalAuthorityLetterRefund(updateAppealService, documentManagementService));
    router.get(paths.appealSubmitted.localAuthorityLetterDeleteRefund, middleware, deleteLocalAuthorityLetterRefund(updateAppealService, documentManagementService));
    return router;
  }
}

export {
  getLocalAuthorityLetterRefund,
  postLocalAuthorityLetterRefund,
  uploadLocalAuthorityLetterRefund,
  deleteLocalAuthorityLetterRefund,
  SetupLocalAuthorityLetterRefundController,
  validate,
  resetJourneyValues
};
