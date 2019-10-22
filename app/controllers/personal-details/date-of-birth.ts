import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../../paths';
import Logger from '../../utils/logger';
import { enterDateValidation } from '../../utils/personal-details-schemas/date-field-validations';

const logLabel: string = __filename;

function getDateOfBirthPage(req: Request, res: Response, next: NextFunction) {
  const logger: Logger = req.app.locals.logger;
  try {
    res.render('personal-details/date-of-birth.njk');
  } catch (e) {
    logger.exception(e.message, logLabel);
    next(e);
  }
}

function postDateOfBirth(req: Request, res: Response, next: NextFunction) {
  const logger: Logger = req.app.locals.logger;
  try {
    const validation = enterDateValidation(req.body);
    let errors = null;
    if (validation) {
      errors = validation;
      res.render('personal-details/date-of-birth.njk', { errors: { errorList: errors, fieldErrors: {  day: { text: errors[0].text }, month: { text: errors[1].text }, year: { text: errors[2].text } } } });
    } else {
      res.render('personal-details/date-of-birth.njk');
    }
  } catch (e) {
    logger.exception(e.message, logLabel);
    next(e);
  }
}

function setupDateOfBirthController(deps?: any): Router {
  const router = Router();
  router.get(paths.DOB, getDateOfBirthPage);
  router.post(paths.DOB, postDateOfBirth);
  return router;
}

export {
    setupDateOfBirthController,
    getDateOfBirthPage,
    postDateOfBirth
};
