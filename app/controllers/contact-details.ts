import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../paths';
import { contactDetailsValidation } from '../utils/fields-validations';

function getContactDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, phone } = req.session.appeal.application.contactDetails || null;
    return res.render('appeal-application/contact-details.njk', { email, phone });
  } catch (error) {
    next(error);
  }
}

function postContactDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const validation = contactDetailsValidation(req.body);
    const { email, phone } = req.session.appeal.application.contactDetails || null;

    if (validation) {
      return res.render('appeal-application/contact-details.njk', {
        email,
        phone,
        errors: validation,
        errorList: Object.values(validation)
      });

    }
    // TODO: Saving data in session for now should save to CCD once implementation is finished
    // as both buttons save-and-continue and save-for-later do the same thing we store the data and re-direct to task list

    req.session.appeal.application.contactDetails = {
      ...req.session.appeal.application.contactDetails,
      email: req.body['email-value'],
      phone: req.body['text-message-value']
    };
    return res.redirect(paths.taskList);
  } catch
    (error) {
    next(error);
  }
}

function setupContactDetailsController(): Router {
  const router = Router();
  router.get(paths.contactDetails, getContactDetails);
  router.post(paths.contactDetails, postContactDetails);
  return router;
}

export {
  setupContactDetailsController,
  getContactDetails,
  postContactDetails
};
