import { NextFunction, Request, Response, Router } from 'express';
import { countryList } from '../data/country-list';
import { paths } from '../paths';
import UpdateAppealService from '../service/update-appeal-service';
import {
  addressValidation,
  appellantNamesValidation,
  dateValidation,
  dropdownValidation,
  nationalityValidation,
  postcodeValidation
} from '../utils/fields-validations';
import { getNationalitiesOptions } from '../utils/nationalities';

function getDateOfBirthPage(req: Request, res: Response, next: NextFunction) {
  try {
    const { application } = req.session.appeal;
    const dob = application.personalDetails && application.personalDetails.dob || null;
    return res.render('appeal-application/personal-details/date-of-birth.njk', { dob });
  } catch (e) {
    next(e);
  }
}

function postDateOfBirth(updateAppealService: UpdateAppealService) {
  return async function(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = dateValidation(req.body);
      if (validation != null) {
        return res.render('appeal-application/personal-details/date-of-birth.njk', {
          errors: validation,
          errorList: Object.values(validation)
        });
      }

      req.session.appeal.application.personalDetails = {
        ...req.session.appeal.application.personalDetails,
        dob: {
          day: req.body.day,
          month: req.body.month,
          year: req.body.year
        }
      };

      await updateAppealService.updateAppeal(req);

      return res.redirect(paths.personalDetails.nationality);
    } catch (e) {
      next(e);
    }
  };
}

function getNamePage(req: Request, res: Response, next: NextFunction) {
  try {
    const { personalDetails } = req.session.appeal.application || null;
    return res.render('appeal-application/personal-details/name.njk', { personalDetails });
  } catch (e) {
    next(e);
  }
}

function postNamePage(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
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
      const { application } = req.session.appeal;
      application.personalDetails = {
        ...application.personalDetails,
        familyName: req.body.familyName,
        givenNames: req.body.givenNames
      };

      await updateAppealService.updateAppeal(req);

      return res.redirect(paths.personalDetails.dob);
    } catch (e) {
      next(e);
    }
  };
}

function getNationalityPage(req: Request, res: Response, next: NextFunction) {
  try {
    const { application } = req.session.appeal;
    const nationality = application.personalDetails && application.personalDetails.nationality || null;
    const nationalitiesOptions = getNationalitiesOptions(countryList, nationality);
    return res.render('appeal-application/personal-details/nationality.njk', { nationalitiesOptions });
  } catch (e) {
    next(e);
  }
}

function postNationalityPage(req: Request, res: Response, next: NextFunction) {
  try {
    const validation = nationalityValidation(req.body);
    if (validation) {
      const { application } = req.session.appeal;
      const nationality = application.personalDetails && application.personalDetails.nationality || null;
      const nationalitiesOptions = getNationalitiesOptions(countryList, nationality);
      return res.render('appeal-application/personal-details/nationality.njk', {
        nationalitiesOptions,
        errors: { errorList: validation }
      });
    }

    const { application } = req.session.appeal;
    application.personalDetails = {
      ...application.personalDetails,
      nationality: req.body.nationality ? req.body.nationality : req.body.stateless
    };
    return res.redirect(paths.personalDetails.enterPostcode);
  } catch (e) {
    next(e);
  }
}

function getEnterPostcodePage(req: Request, res: Response, next: NextFunction) {
  try {
    const { contactDetails } = req.session.appeal.application;
    const postcode = contactDetails && contactDetails.address && contactDetails.address.postcode || null;
    res.render('appeal-application/personal-details/enter-postcode.njk', { postcode });
  } catch (e) {
    next(e);
  }
}

function postEnterPostcodePage(req: Request, res: Response, next: NextFunction) {
  try {
    const validation = postcodeValidation(req.body);
    if (validation !== null) {
      return res.render('appeal-application/personal-details/enter-postcode.njk', {
        error: validation,
        errorList: Object.values(validation)
      });
    }
    req.session.appeal.application.contactDetails = {
      ...req.session.appeal.application.contactDetails,
      address: {
        ...(
          req.session.appeal.application.contactDetails &&
          req.session.appeal.application.contactDetails.address || {}),
        postcode: req.body.postcode
      }
    };
    return res.redirect(paths.personalDetails.postcodeLookup);
  } catch (e) {
    next(e);
  }
}

function getPostcodeLookupPage(req: Request, res: Response, next: NextFunction) {
  try {
    const addresses = [
      {
        value: '',
        text: 'Select'
      },
      {
        value: '60 GPS London United Kingdom  W1W 7RT',
        text: '60 GPS London United Kingdom  W1W 7RT'
      }
    ];
    const { application } = req.session.appeal;
    const postcode = application.contactDetails && application.contactDetails.address.postcode || null;
    if (!postcode) return res.redirect(paths.personalDetails.enterPostcode);
    // TODO: Get addresses from postcode previously entered - shall we use CCD service?
    res.render('appeal-application/personal-details/postcode-lookup.njk', { addresses, postcode });
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
    const validation = dropdownValidation(req.body.address, 'address');
    if (validation) {
      return res.render('appeal-application/personal-details/postcode-lookup.njk', {
        error: validation,
        errorList: Object.values(validation),
        addresses: addresses
      });
    }
    req.session.appeal.application.contactDetails = {
      ...req.session.appeal.application.contactDetails,
      address: {
        ...(
          req.session.appeal.application.contactDetails &&
          req.session.appeal.application.contactDetails.address || {}),
        line1: req.body.address
      }
    };

    return res.redirect(paths.taskList);
  } catch (e) {
    next(e);
  }
}

function getManualEnterAddressPage(req: Request, res: Response, next: NextFunction) {
  try {
    const { application } = req.session.appeal;
    const address = application.contactDetails && application.contactDetails.address || null;
    if (!address || !address.postcode) return res.redirect(paths.personalDetails.enterPostcode);
    res.render('appeal-application/personal-details/enter-address.njk', { address });
  } catch (e) {
    next(e);
  }
}

function postManualEnterAddressPage(req: Request, res: Response, next: NextFunction) {
  try {
    const { application } = req.session.appeal;
    const postcode = application.contactDetails && application.contactDetails.address.postcode || null;
    if (!postcode) return res.redirect(paths.personalDetails.enterPostcode);
    const validation = addressValidation(req.body);
    if (validation !== null) {
      return res.render('appeal-application/personal-details/enter-address.njk', {
        postcode,
        error: validation,
        errorList: Object.values(validation)
      });
    }

    req.session.appeal.application.contactDetails = {
      ...req.session.appeal.application.contactDetails,
      address: {
        line1: req.body['address-line-1'],
        line2: req.body['address-line-2'],
        city: req.body['address-town'],
        country: req.body['address-county'],
        postcode: req.body['address-postcode']
      }
    };
    return res.redirect(paths.taskList);
  } catch (e) {
    next(e);
  }
}

function setupPersonalDetailsController(deps?: any): Router {
  const router = Router();
  router.get(paths.personalDetails.name, getNamePage);
  router.post(paths.personalDetails.name, postNamePage(deps.updateAppealService));
  router.get(paths.personalDetails.dob, getDateOfBirthPage);
  router.post(paths.personalDetails.dob, postDateOfBirth(deps.updateAppealService));
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
