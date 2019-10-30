import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../paths';
import { addressValidation, appellantNamesValidation, dateValidation, nationalityValidation, postcodeValidation } from '../utils/fields-validations';
import Logger from '../utils/logger';
import { nationalities } from '../utils/nationalities';

function getDateOfBirthPage(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('appeal-application/personal-details/date-of-birth.njk');
  } catch (e) {
    next(e);
  }
}

function postDateOfBirth(req: Request, res: Response, next: NextFunction) {
  try {
    const validation = dateValidation(req.body);
    if (validation) {
      return res.render('appeal-application/personal-details/date-of-birth.njk', {
        errors: validation,
        errorList: Object.values(validation)
      });
    }

    req.session.personalDetails.dob = {
      day: req.body.day,
      month: req.body.month,
      year: req.body.year
    };

    return res.redirect(paths.personalDetails.nationality);
  } catch (e) {
    next(e);
  }
}

function getNamePage(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('appeal-application/personal-details/name.njk');
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
      return res.render('appeal-application/personal-details/name.njk', {
        errors: {
          errorList: errors,
          fieldErrors: { givenNames: { text: errors[0].text }, familyName: { text: errors[1].text } }
        }
      });
    }

    req.session.personalDetails = {
      familyName: req.body.familyName,
      givenNames: req.body.givenNames
    };
    return res.redirect(paths.personalDetails.dob);
  } catch (e) {
    next(e);
  }
}

function getNationalityPage(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('appeal-application/personal-details/nationality.njk', { nationalities: nationalities });
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
      return res.render('appeal-application/personal-details/nationality.njk', {
        nationalities: nationalities,
        errors: { errorList: errors }
      });
    }
    req.session.personalDetails.nationality = req.body.nationality;
    return res.redirect(paths.taskList);
  } catch (e) {
    next(e);
  }
}

function getEnterPostcodePage(req: Request, res: Response, next: NextFunction) {
  try {
    res.render('appeal-application/enter-postcode.njk');
  } catch (e) {
    next(e);
  }
}

function postEnterPostcodePage(req: Request, res: Response, next: NextFunction) {
  try {
    const validation = postcodeValidation(req.body);
    if (validation) {
      res.render('appeal-application/enter-postcode.njk',{      error: validation,
        errorList: Object.values(validation) });
    } else {
      // TODO - add postcode to session.
      // TODO - Fetch the address from the valid postcode.
      res.render('appeal-application/enter-postcode.njk');
    }
  } catch (e) {
    next(e);
  }
}

function getManualEnterAddressPage(req: Request, res: Response, next: NextFunction) {
  try {
    res.render('appeal-application/enter-address.njk');
  } catch (e) {
    next(e);
  }
}

function postManualEnterAddressPage(req: Request, res: Response, next: NextFunction) {
  try {
    const validation = addressValidation(req.body);
    if (validation) {
      // console.log(JSON.stringify(validation))
      res.render('appeal-application/enter-address.njk',{
        error: validation,
        errorList: Object.values(validation) });
    } else {
      // TODO - add postcode to session.
      res.render('appeal-application/enter-address.njk');
      req.session.personalDetails.address = req.body;
      // TODO - Fetch the address from the valid postcode.
    }
  } catch (e) {
    next(e);
  }
}

function setupPersonalDetailsController(deps?: any): Router {
  const router = Router();
  router.get(paths.personalDetails.name, getNamePage);
  router.post(paths.personalDetails.name, postNamePage);
  router.get(paths.personalDetails.dob, getDateOfBirthPage);
  router.post(paths.personalDetails.dob, postDateOfBirth);
  router.get(paths.personalDetails.nationality, getNationalityPage);
  router.post(paths.personalDetails.nationality, postNationalityPage);
  router.get(paths.personalDetails.enterPostcode, getEnterPostcodePage);
  router.post(paths.personalDetails.enterPostcode, postEnterPostcodePage);
  router.get(paths.personalDetails.enterAddress, getManualEnterAddressPage);
  router.post(paths.personalDetails.enterAddress, postManualEnterAddressPage);
  return router;
}

export {
    setupPersonalDetailsController,
    getNamePage,
    postNamePage,
    getDateOfBirthPage,
    postDateOfBirth,
    postNationalityPage,
    getNationalityPage,
    postEnterPostcodePage,
    getEnterPostcodePage,
    getManualEnterAddressPage,
    postManualEnterAddressPage
};
