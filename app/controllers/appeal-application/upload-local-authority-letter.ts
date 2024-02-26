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

async function getLocalAuthorityLetter(req: Request, res: Response, next: NextFunction) {
  try {
    const drlmSetAsideFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false);
    if (!drlmSetAsideFlag) return res.redirect(paths.common.overview);
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    let validationErrors: ValidationErrors;
    if (req.query.error) {
      validationErrors = {
        uploadFile: createStructuredError('uploadFile', i18n.validationErrors.fileUpload[`${req.query.error}`])
      };

    }
    const localAuthorityLetterEvidences = req.session.appeal.application.localAuthorityLetters || [];
    let previousPage = paths.appealStarted.feeSupport;

    res.render('appeal-application/fee-support/upload-local-authority-letter.njk', {
      title: i18n.pages.uploadLocalAuthorityLetter.title,
      formSubmitAction: paths.appealStarted.localAuthorityLetter,
      evidenceUploadAction: paths.appealStarted.localAuthorityLetterUpload,
      evidences: localAuthorityLetterEvidences,
      evidenceCTA: paths.appealStarted.localAuthorityLetterDelete,
      previousPage: previousPage,
      saveForLaterCTA: paths.common.overview,
      ...validationErrors && { error: validationErrors },
      ...validationErrors && { errorList: Object.values(validationErrors) }
    });
  } catch (e) {
    next(e);
  }
}

function postLocalAuthorityLetter(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    async function persistAppeal(appeal: Appeal, drlmSetAsideFlag) {
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token'], drlmSetAsideFlag);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
    }

    try {
      const dlrmFeeRemissionFlag = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.DLRM_FEE_REMISSION_FEATURE_FLAG, false);
      if (!dlrmFeeRemissionFlag) return res.redirect(paths.common.overview);
      const authLetterUploads = req.session.appeal.application.localAuthorityLetters || [];
      if (authLetterUploads.length > 0) {
        req.session.appeal.application.feeSupportPersisted = true;
        resetJourneyValues(req.session.appeal.application);
        await persistAppeal(req.session.appeal, dlrmFeeRemissionFlag);
        const redirectTo = req.session.appeal.application.isEdit ? paths.appealStarted.checkAndSend : paths.appealStarted.taskList;
        return res.redirect(redirectTo);
      } else {
        return res.redirect(`${paths.appealStarted.localAuthorityLetter}?error=noFileSelected`);
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
      return res.redirect(`${paths.appealStarted.localAuthorityLetter}?error=${errorCode}`);
    }
    next();
  } catch (e) {
    next(e);
  }
}

function uploadLocalAuthorityLetter(updateAppealService: UpdateAppealService, documentManagementService: DocumentManagementService) {
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
        return res.redirect(paths.appealStarted.localAuthorityLetter);
      }
      return res.redirect(`${paths.appealStarted.localAuthorityLetter}?error=noFileSelected`);
    } catch (e) {
      next(e);
    }
  };
}

function deleteLocalAuthorityLetter(updateAppealService: UpdateAppealService, documentManagementService: DocumentManagementService) {
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
        return res.redirect(paths.appealStarted.localAuthorityLetter);
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
class SetupLocalAuthorityLetterController {
  initialise(middleware: any[], updateAppealService, documentManagementService: DocumentManagementService): any {
    const router = Router();
    router.get(paths.appealStarted.localAuthorityLetter, middleware, getLocalAuthorityLetter);
    router.post(paths.appealStarted.localAuthorityLetter, middleware, postLocalAuthorityLetter(updateAppealService));
    router.post(paths.appealStarted.localAuthorityLetterUpload, middleware, validate, uploadLocalAuthorityLetter(updateAppealService, documentManagementService));
    router.get(paths.appealStarted.localAuthorityLetterDelete, middleware, deleteLocalAuthorityLetter(updateAppealService, documentManagementService));
    return router;
  }
}

export {
  getLocalAuthorityLetter,
  postLocalAuthorityLetter,
  uploadLocalAuthorityLetter,
  deleteLocalAuthorityLetter,
  SetupLocalAuthorityLetterController,
  validate,
  resetJourneyValues
};
