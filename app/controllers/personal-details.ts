import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../paths';
import {
  addressValidation,
  appellantNamesValidation,
  dateValidation,
  nationalityValidation,
  postcodeValidation, selectPostcodeValidation
} from '../utils/fields-validations';
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
    if (validation != null) {
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
    res.render('appeal-application/personal-details/enter-postcode.njk');
  } catch (e) {
    next(e);
  }
}

function postEnterPostcodePage(req: Request, res: Response, next: NextFunction) {
  try {
    const validation = postcodeValidation(req.body);
    if (validation !== null) {
      res.render('appeal-application/personal-details/enter-postcode.njk', {
        error: validation,
        errorList: Object.values(validation)
      });
    }
    // TODO - Fetch the address from the valid postcode.
    return res.render('appeal-application/personal-details/enter-postcode.njk');

  } catch (e) {
    next(e);
  }
}

function getManualEnterAddressPage(req: Request, res: Response, next: NextFunction) {
  try {
    res.render('appeal-application/personal-details/enter-address.njk');
  } catch (e) {
    next(e);
  }
}

function postManualEnterAddressPage(req: Request, res: Response, next: NextFunction) {
  try {
    const validation = addressValidation(req.body);
    if (validation !== null) {
      res.render('appeal-application/personal-details/enter-address.njk', {
        error: validation,
        errorList: Object.values(validation)
      });
    }
    req.session.personalDetails.address = req.body;
    // TODO - add address to session.
    // TODO - Fetch the address from the valid postcode.
    return res.render('appeal-application/personal-details/enter-address.njk');

  } catch (e) {
    next(e);
  }
}

function getPostcodeLookupPage(req: Request, res: Response, next: NextFunction) {
  const addresses = [
    {
      value: '',
      text: 'Select'
    },
    {
      value: 'address',
      text: '60 GPS London United Kingdom  W1W 7RT'
    }
  ];
  try {
    res.render('appeal-application/personal-details/postcode-lookup.njk', { addresses: addresses });
  } catch (e) {
    next(e);
  }
}

function postPostcodeLookupPage(req: Request, res: Response, next: NextFunction) {
  const addresses = [
    {
      value: '',
      text: 'Select'
    },
    {
      value: '60 GPS London United Kingdom  W1W 7RT',
      text: '60 GPS London United Kingdom  W1W 7RT'
    } ];
  try {
    const validation = selectPostcodeValidation(req.body);
    if (validation !== null) {
      return res.render('appeal-application/personal-details/postcode-lookup.njk', {
        error: validation,
        errorList: Object.values(validation),
        addresses: addresses
      });
    }
    // TODO - add postcode to session.
    req.session.personalDetails = {
      address: req.body.dropdown
    };
    return res.redirect(paths.taskList);
    // TODO - Fetch the address from the valid postcode.
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
  router.get(paths.personalDetails.postcodeLookup, getPostcodeLookupPage);
  router.post(paths.personalDetails.postcodeLookup, postPostcodeLookupPage);
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
  postManualEnterAddressPage,
  getPostcodeLookupPage,
  postPostcodeLookupPage
};
