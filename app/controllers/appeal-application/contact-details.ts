import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import { paths } from '../../paths';
import { Events } from '../../service/ccd-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { contactDetailsValidation } from '../../utils/validations/fields-validations';

function getContactDetails(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    const { application } = req.session.appeal;
    const contactDetails = application && application.contactDetails || null;
    return res.render('appeal-application/contact-details.njk', {
      contactDetails,
      previousPage: paths.taskList
    });
  } catch (error) {
    next(error);
  }
}

function postContactDetails(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.body.selections) {
        req.body.selections = '';
      }

      let email = null;
      let wantsEmail = false;
      let phone = null;
      let wantsSms = false;

      if (req.body.selections.includes('email')) {
        email = req.body['email-value'];
        if (email && email.length > 0) {
          wantsEmail = true;
        }
      }
      if (req.body.selections.includes('text-message')) {
        req.body['text-message-value'] = req.body['text-message-value'].replace(/\s/g, '');
        phone = req.body['text-message-value'];
        if (phone) {
          wantsSms = true;
        }
      }

      const contactDetails = { email, wantsEmail, phone, wantsSms };

      if (shouldValidateWhenSaveForLater(req.body, 'selections')) {
        const validation = contactDetailsValidation(req.body);

        if (validation) {
          return res.render('appeal-application/contact-details.njk', {
            contactDetails,
            errors: validation,
            errorList: Object.values(validation),
            previousPage: paths.taskList
          });
        }
      }

      req.session.appeal.application.contactDetails = contactDetails;
      await updateAppealService.submitEvent(Events.EDIT_APPEAL, req);
      return getConditionalRedirectUrl(req, res, paths.taskList);

    } catch
      (error) {
      next(error);
    }
  };
}

function setupContactDetailsController(updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.contactDetails, getContactDetails);
  router.post(paths.contactDetails, postContactDetails(updateAppealService));
  return router;
}

export {
  setupContactDetailsController,
  getContactDetails,
  postContactDetails
};
