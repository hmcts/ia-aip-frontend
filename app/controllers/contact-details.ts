import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../paths';
import { emailValidation, phoneValidation } from '../utils/fields-validations';

function hasSelections(data: []) {
  return data !== undefined;
}

function validate(request: any) {

  let validationErrors = {};
  const selections = request.selections;

  if (selections.includes('email')) {
    // Validate email
    const validationResult = emailValidation(request);
    if (validationResult != null) {
      validationErrors = { ...validationErrors, ...validationResult };
    }
  }

  if (selections.includes('text-message')) {
    // Validate phone number
    const validationResult = phoneValidation(request);
    if (validationResult != null) {
      validationErrors = { ...validationErrors, ...validationResult };
    }
  }
  return Object.keys(validationErrors).length === 0 ? null : validationErrors;
}

function getContactDetails(req: Request, res: Response, next: NextFunction) {
  try {
    // TODO: get email and phone from idam
    const data = {
      email: { value: '' },
      textMessage: { value: '' }
    };
    return res.render('appeal-application/contact-details.njk', { data: data });
  } catch (error) {
    next(error);
  }
}

function postContactDetails(req: Request, res: Response, next: NextFunction) {
  const request = req.body;

  try {
    const data = {
      email: { value: request['email-value'] },
      textMessage: { value: request['text-message-value'] }
    };

    if (!hasSelections(request.selections)) {
      return res.render('appeal-application/contact-details.njk', { data: data, errors: { selections: 0 } });
    }
    const validationErrors = validate(request);
    if (validationErrors != null) {
      return res.render('appeal-application/contact-details.njk', {
        data: data,
        errors: validationErrors,
        errorList: Object.values(validationErrors)
      });

    }
    // TODO: Saving data in session for now should save to CCD once implementation is finished
    // as both buttons save-and-continue and save-for-later do the same thing we store the data and re-direct to task list
    req.session.contactDetails = request.data;
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
