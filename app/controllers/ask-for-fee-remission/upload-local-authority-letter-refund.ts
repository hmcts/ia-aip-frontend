import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import i18n from '../../../locale/en.json';
import { FEATURE_FLAGS } from '../../data/constants';
import { PageSetup } from '../../interfaces/PageSetup';
import { paths } from '../../paths';
import { DocumentManagementService } from '../../service/document-management-service';
import LaunchDarklyService from '../../service/launchDarkly-service';
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
    const localAuthorityLetterEvidences = req.session.appeal.application.lateLocalAuthorityLetters || [];
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

function postLocalAuthorityLetterRefund() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const refundFeatureEnabled = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_REFUND_FEATURE_FLAG, false);
    if (!refundFeatureEnabled) return res.redirect(paths.common.overview);

    try {
      const authLetterUploads = req.session.appeal.application.lateLocalAuthorityLetters || [];
      if (authLetterUploads.length > 0) {
        resetJourneyValues(req.session.appeal.application);
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

function uploadLocalAuthorityLetterRefund(documentManagementService: DocumentManagementService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.file) {
        let localAuthorityLetterEvidences: Evidence[] = req.session.appeal.application.lateLocalAuthorityLetters || [];
        const localAuthorityLetter: Evidence = await documentManagementService.uploadFile(req);
        localAuthorityLetterEvidences.push(localAuthorityLetter);
        const application = req.session.appeal.application;
        application.lateLocalAuthorityLetters = localAuthorityLetterEvidences;
        return res.redirect(paths.appealSubmitted.localAuthorityLetterRefund);
      }
      return res.redirect(`${paths.appealSubmitted.localAuthorityLetterRefund}?error=noFileSelected`);
    } catch (e) {
      next(e);
    }
  };
}

function deleteLocalAuthorityLetterRefund(documentManagementService: DocumentManagementService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.query.id) {
        await documentManagementService.deleteFile(req, req.query.id as string);
        const application = req.session.appeal.application;
        application.lateLocalAuthorityLetters = req.session.appeal.application.lateLocalAuthorityLetters.filter(document => document.fileId !== req.query.id);
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
    router.post(paths.appealSubmitted.localAuthorityLetterRefund, middleware, postLocalAuthorityLetterRefund());
    router.post(paths.appealSubmitted.localAuthorityLetterUploadRefund, middleware, validate, uploadLocalAuthorityLetterRefund(documentManagementService));
    router.get(paths.appealSubmitted.localAuthorityLetterDeleteRefund, middleware, deleteLocalAuthorityLetterRefund(documentManagementService));
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
