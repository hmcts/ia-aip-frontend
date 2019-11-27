import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../paths';
import { Events } from '../service/ccd-service';
import UpdateAppealService from '../service/update-appeal-service';
import { contactDetailsValidation } from '../utils/fields-validations';

function getContactDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const { application } = req.session.appeal;
    const contactDetails = application && application.contactDetails || null;
    return res.render('appeal-application/contact-details.njk', { contactDetails });
  } catch (error) {
    next(error);
  }
}

function postContactDetails(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = contactDetailsValidation(req.body);

      const selections = req.body['selections'] || [];

      let email = null;
      let wantsEmail = false;
      let phone = null;
      let wantsSms = false;

      if (selections.includes('email')) {
        email = req.body['email-value'];
        if (email) {
          wantsEmail = true;
        }
      }
      if (selections.includes('text-message')) {
        phone = req.body['text-message-value'];
        if (phone) {
          wantsSms = true;
        }
      }

      const contactDetails = { email, wantsEmail, phone, wantsSms };

      if (validation) {
        return res.render('appeal-application/contact-details.njk', {
          contactDetails,
          errors: validation,
          errorList: Object.values(validation)
        });
      }

      req.session.appeal.application.contactDetails = contactDetails;
      await updateAppealService.submitEvent(Events.EDIT_APPEAL, req);

      return res.redirect(paths.taskList);
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
