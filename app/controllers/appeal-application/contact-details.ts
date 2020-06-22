import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import UpdateAppealService from '../../service/update-appeal-service';
import { shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { getRedirectPage } from '../../utils/utils';
import { contactDetailsValidation } from '../../utils/validations/fields-validations';

function getContactDetails(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    const { application } = req.session.appeal;
    const contactDetails = application && application.contactDetails || null;
    return res.render('appeal-application/contact-details.njk', {
      contactDetails,
      previousPage: paths.appealStarted.taskList
    });
  } catch (error) {
    next(error);
  }
}

function postContactDetails(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'selections')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      if (!req.body.selections) {
        req.body.selections = '';
      }
      const validation = contactDetailsValidation(req.body);
      const contactDetails = {
        email: req.body.selections.includes('email') ? req.body['email-value'] : null,
        wantsEmail: req.body.selections.includes('email'),
        phone: req.body.selections.includes('text-message') ? req.body['text-message-value'].replace(/\s/g, '') : null,
        wantsSms: req.body.selections.includes('text-message')
      };
      if (validation) {
        return res.render('appeal-application/contact-details.njk', {
          contactDetails,
          errors: validation,
          errorList: Object.values(validation),
          previousPage: paths.appealStarted.taskList
        });
      }

      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          contactDetails
        }
      };
      const editingMode: boolean = req.session.appeal.application.isEdit || false;
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      let redirectPage = getRedirectPage(editingMode, paths.appealStarted.checkAndSend, req.body.saveForLater, paths.appealStarted.taskList);
      return res.redirect(redirectPage);
    } catch (error) {
      next(error);
    }
  };
}

function setupContactDetailsController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.appealStarted.contactDetails, middleware, getContactDetails);
  router.post(paths.appealStarted.contactDetails, middleware, postContactDetails(updateAppealService));
  return router;
}

export {
  setupContactDetailsController,
  getContactDetails,
  postContactDetails
};
