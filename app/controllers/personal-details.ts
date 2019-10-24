import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../paths';
import { appellantNamesValidation, dateOfBirthValidation, nationalityValidation } from '../utils/fields-validations';
import Logger from '../utils/logger';
import { nationalities } from '../utils/nationalities';
const logLabel: string = __filename;

function getDateOfBirthPage(req: Request, res: Response, next: NextFunction) {
  const logger: Logger = req.app.locals.logger;
  try {
    res.render('appeal-application/date-of-birth.njk');
  } catch (e) {
    logger.exception(e.message, logLabel);
    next(e);
  }
}

function postDateOfBirth(req: Request, res: Response, next: NextFunction) {
  const logger: Logger = req.app.locals.logger;
  try {
    const validation = dateOfBirthValidation(req.body);
    let errors = null;
    if (validation) {
      errors = validation;
      res.render('appeal-application/date-of-birth.njk', { errors: { errorList: errors, fieldErrors: {  day: { text: errors[0].text }, month: { text: errors[1].text }, year: { text: errors[2].text } } } });
    } else {
      res.render('appeal-application/date-of-birth.njk');
    }
  } catch (e) {
    logger.exception(e.message, logLabel);
    next(e);
  }
}

function getNamePage(req: Request, res: Response, next: NextFunction) {
  try {
    res.render('appeal-application/appellant-names-page.njk');
  } catch (e) {
    next(e);
  }
}

function postNamePage(req: Request, res: Response, next: NextFunction) {
  try {
    const validation = appellantNamesValidation(req.body);
    let errors = null;
    if (validation) {
      errors = validation;
      res.render('appeal-application/appellant-names-page.njk', {
        errors: {
          errorList: errors,
          fieldErrors: { givenNames: { text: errors[0].text }, familyName: { text: errors[1].text } }
        }
      });
    } else {
      res.render('appeal-application/appellant-names-page.njk', { familyName: req.body.familyName, givenNames: req.body.givenNames });
    }
  } catch (e) {
    next(e);
  }
}

function getNationalityPage(req: Request, res: Response, next: NextFunction) {
  try {
    res.render('appeal-application/nationality.njk',{ nationalities:  nationalities });
  } catch (e) {
    next(e);
  }
}

function postNationalityPage(req: Request, res: Response, next: NextFunction) {
  try {
    const validation = nationalityValidation(req.body);
    let errors = null;
    if (validation) {
      errors = validation;
      res.render('appeal-application/nationality.njk',{ nationalities:  nationalities, errors: { errorList: errors } });
    } else {
      // TODO - add nationality to session.
      res.render('appeal-application/nationality.njk',{ nationalities:  nationalities });
    }
  } catch (e) {
    next(e);
  }
}

function setupPersonalDetailsController(deps?: any): Router {
  const router = Router();
  router.get(paths.enterName, getNamePage);
  router.post(paths.enterName, postNamePage);
  router.get(paths.DOB, postDateOfBirth);
  router.post(paths.DOB, getDateOfBirthPage);
  router.get(paths.nationality, getNationalityPage);
  router.post(paths.nationality, postNationalityPage);
  return router;
}

export {
    setupPersonalDetailsController,
    getNamePage,
    postNamePage,
    getDateOfBirthPage,
    postDateOfBirth,
    postNationalityPage,
    getNationalityPage
};
