
import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';

import i18n from '../../../locale/en.json';
import { Events } from '../../data/events';
import { PageSetup } from '../../interfaces/PageSetup';
import { paths } from '../../paths';
import { documentIdToDocStoreUrl, DocumentManagementService } from '../../service/document-management-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { createStructuredError } from '../../utils/validations/fields-validations';

function getHomeOfficeDecisionLetter(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    let validationErrors: ValidationErrors;
    if (req.query.error) {
      validationErrors = {
        uploadFile: createStructuredError('uploadFile', i18n.validationErrors.fileUpload[`${req.query.error}`])
      };

    }
    const homeOfficeLetterEvidences = req.session.appeal.application.homeOfficeLetter || [];
    res.render('templates/multiple-evidence-upload-page.njk', {
      title: i18n.pages.homeOfficeLetterUpload.title,
      content: i18n.pages.homeOfficeLetterUpload.content,
      formSubmitAction: paths.appealStarted.homeOfficeDecisionLetter,
      evidenceUploadAction: paths.appealStarted.homeOfficeDecisionLetterUpload,
      evidences: homeOfficeLetterEvidences,
      evidenceCTA: paths.appealStarted.homeOfficeDecisionLetterDelete,
      ...validationErrors && { error: validationErrors },
      ...validationErrors && { errorList: Object.values(validationErrors) }
    });
  } catch (e) {
    next(e);
  }
}

function postHomeOfficeDecisionLetter(req: Request, res: Response, next: NextFunction) {
  try {
    const decisionLetterUploads = req.session.appeal.application.homeOfficeLetter || [];
    if (decisionLetterUploads.length > 0) {
      const redirectTo = req.session.appeal.application.isEdit ? paths.appealStarted.checkAndSend : paths.appealStarted.taskList;
      return res.redirect(redirectTo);
    } else {
      return res.redirect(`${paths.appealStarted.homeOfficeDecisionLetter}?error=noFileSelected`);
    }
  } catch (e) {
    next(e);
  }
}

function validate(req: Request, res: Response, next: NextFunction) {
  try {
    let errorCode: string;
    if (res.locals.multerError) {
      errorCode = res.locals.multerError;
    }
    if (errorCode) {
      return res.redirect(`${paths.appealStarted.homeOfficeDecisionLetter}?error=${errorCode}`);
    }
    next();
  } catch (e) {
    next(e);
  }
}

function uploadHomeOfficeDecisionLetter(updateAppealService: UpdateAppealService, documentManagementService: DocumentManagementService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.file) {
        let homeOfficeLetterEvidences: Evidence[] = req.session.appeal.application.homeOfficeLetter || [];
        const homeOfficeLetter: Evidence = await documentManagementService.uploadFile(req);
        homeOfficeLetterEvidences.push(homeOfficeLetter);

        const appeal = {
          ...req.session.appeal,
          application: {
            ...req.session.appeal.application,
            homeOfficeLetter: homeOfficeLetterEvidences
          }
        };
        const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
        req.session.appeal = {
          ...req.session.appeal,
          ...appealUpdated
        };
        return res.redirect(paths.appealStarted.homeOfficeDecisionLetter);
      }
      return res.redirect(`${paths.appealStarted.homeOfficeDecisionLetter}?error=noFileSelected`);
    } catch (e) {
      next(e);
    }
  };
}

function deleteHomeOfficeDecisionLetter(updateAppealService: UpdateAppealService, documentManagementService: DocumentManagementService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.query.id) {
        const targetUrl: string = documentIdToDocStoreUrl(req.query.id as string, req.session.appeal.documentMap);
        await documentManagementService.deleteFile(req, targetUrl);

        const appeal: Appeal = {
          ...req.session.appeal,
          application: {
            ...req.session.appeal.application,
            homeOfficeLetter: req.session.appeal.application.homeOfficeLetter.filter(document => document.fileId !== req.query.id)
          }
        };
        const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
        req.session.appeal = {
          ...req.session.appeal,
          ...appealUpdated
        };
        return res.redirect(paths.appealStarted.homeOfficeDecisionLetter);
      }
    } catch (e) {
      next(e);
    }
  };
}

@PageSetup.register
class SetupHomeOfficeDecisionLetterController {
  initialise(middleware: any[], updateAppealService, documentManagementService: DocumentManagementService): any {
    const router = Router();
    router.get(paths.appealStarted.homeOfficeDecisionLetter, middleware, getHomeOfficeDecisionLetter);
    router.post(paths.appealStarted.homeOfficeDecisionLetter, middleware, postHomeOfficeDecisionLetter);
    router.post(paths.appealStarted.homeOfficeDecisionLetterUpload, middleware, validate, uploadHomeOfficeDecisionLetter(updateAppealService, documentManagementService));
    router.get(paths.appealStarted.homeOfficeDecisionLetterDelete, middleware, deleteHomeOfficeDecisionLetter(updateAppealService, documentManagementService));
    return router;
  }
}

export {
  getHomeOfficeDecisionLetter,
  postHomeOfficeDecisionLetter,
  uploadHomeOfficeDecisionLetter,
  deleteHomeOfficeDecisionLetter,
  SetupHomeOfficeDecisionLetterController,
  validate
};
