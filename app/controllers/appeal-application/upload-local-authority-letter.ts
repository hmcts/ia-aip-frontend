import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import i18n from '../../../locale/en.json';
import { Events } from '../../data/events';
import { PageSetup } from '../../interfaces/PageSetup';
import { paths } from '../../paths';
import { DocumentManagementService } from '../../service/document-management-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { createStructuredError } from '../../utils/validations/fields-validations';

function getLocalAuthorityLetter(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    let validationErrors: ValidationErrors;
    if (req.query.error) {
      validationErrors = {
        uploadFile: createStructuredError('uploadFile', i18n.validationErrors.fileUpload[`${req.query.error}`])
      };

    }
    const localAuthorityLetterEvidences = req.session.appeal.application.localAuthorityLetter || [];
    let previousPage = paths.appealStarted.feeSupport;

    res.render('appeal-application/fee-support/upload-local-authority-letter.njk', {
      title: i18n.pages.uploadLocalAuthorityLetter.title,
      formSubmitAction: paths.appealStarted.uploadLocalAuthorityLetter,
      evidenceUploadAction: paths.appealStarted.uploadLocalAuthorityLetterUpload,
      evidences: localAuthorityLetterEvidences,
      evidenceCTA: paths.appealStarted.uploadLocalAuthorityLetterDelete,
      previousPage: previousPage,
      saveForLaterCTA: paths.common.overview,
      ...validationErrors && { error: validationErrors },
      ...validationErrors && { errorList: Object.values(validationErrors) }
    });
  } catch (e) {
    next(e);
  }
}

function postLocalAuthorityLetter(req: Request, res: Response, next: NextFunction) {
  try {
    const authLetterUploads = req.session.appeal.application.localAuthorityLetter || [];
    if (authLetterUploads.length > 0) {
      const redirectTo = req.session.appeal.application.isEdit ? paths.appealStarted.checkAndSend : paths.appealStarted.taskList;
      return res.redirect(redirectTo);
    } else {
      return res.redirect(`${paths.appealStarted.uploadLocalAuthorityLetter}?error=noFileSelected`);
    }
  } catch (e) {
    next(e);
  }
}

function validate(req: Request, res: Response, next: NextFunction) {
  try {
    let errorCode: string;
    if (res.locals.errorCode) {
      errorCode = res.locals.errorCode;
    }
    if (errorCode) {
      return res.redirect(`${paths.appealStarted.uploadLocalAuthorityLetter}?error=${errorCode}`);
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
        let localAuthorityLetterEvidences: Evidence[] = req.session.appeal.application.localAuthorityLetter || [];
        const localAuthorityLetter: Evidence = await documentManagementService.uploadFile(req);
        localAuthorityLetterEvidences.push(localAuthorityLetter);

        const appeal = {
          ...req.session.appeal,
          application: {
            ...req.session.appeal.application,
            localAuthorityLetter: localAuthorityLetterEvidences
          }
        };
        const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
        req.session.appeal = {
          ...req.session.appeal,
          ...appealUpdated
        };
        return res.redirect(paths.appealStarted.uploadLocalAuthorityLetter);
      }
      return res.redirect(`${paths.appealStarted.uploadLocalAuthorityLetter}?error=noFileSelected`);
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
            localAuthorityLetter: req.session.appeal.application.localAuthorityLetter.filter(document => document.fileId !== req.query.id)
          }
        };
        const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
        req.session.appeal = {
          ...req.session.appeal,
          ...appealUpdated
        };
        return res.redirect(paths.appealStarted.uploadLocalAuthorityLetter);
      }
    } catch (e) {
      next(e);
    }
  };
}

@PageSetup.register
class SetupLocalAuthorityLetterController {
  initialise(middleware: any[], updateAppealService, documentManagementService: DocumentManagementService): any {
    const router = Router();
    router.get(paths.appealStarted.uploadLocalAuthorityLetter, middleware, getLocalAuthorityLetter);
    router.post(paths.appealStarted.uploadLocalAuthorityLetter, middleware, postLocalAuthorityLetter);
    router.post(paths.appealStarted.uploadLocalAuthorityLetterUpload, middleware, validate, uploadLocalAuthorityLetter(updateAppealService, documentManagementService));
    router.get(paths.appealStarted.uploadLocalAuthorityLetterDelete, middleware, deleteLocalAuthorityLetter(updateAppealService, documentManagementService));
    return router;
  }
}

export {
  getLocalAuthorityLetter,
  postLocalAuthorityLetter,
  uploadLocalAuthorityLetter,
  deleteLocalAuthorityLetter,
  SetupLocalAuthorityLetterController,
  validate
};
