import { Address, OSPlacesClient } from '@hmcts/os-places-client';
import { NextFunction, Request, Response, Router } from 'express';
import * as _ from 'lodash';
import { countryList } from '../data/country-list';
import { paths } from '../paths';
import { Events } from '../service/ccd-service';
import UpdateAppealService from '../service/update-appeal-service';
import { getAddress } from '../utils/address-utils';
import {
  addressValidation,
  appellantNamesValidation,
  dateOfBirthValidation,
  dropdownValidation,
  nationalityValidation,
  postcodeValidation
} from '../utils/fields-validations';
import { getNationalitiesOptions } from '../utils/nationalities';
import { getNextPage, shouldValidateWhenSaveForLater } from '../utils/save-for-later-utils';
import {
  buildAddressList,
  getConditionalRedirectUrl } from '../utils/url-utils';

function getDateOfBirthPage(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');

    const { application } = req.session.appeal;
    const dob = application.personalDetails && application.personalDetails.dob || null;
    return res.render('appeal-application/personal-details/date-of-birth.njk', {
      dob,
      previousPage: paths.personalDetails.name
    });
  } catch (e) {
    next(e);
  }
}

function postDateOfBirth(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const validation = dateOfBirthValidation(req.body);
      if (validation != null) {
        return res.render('appeal-application/personal-details/date-of-birth.njk', {
          errors: validation,
          errorList: Object.values(validation),
          dob: { ...req.body },
          previousPage: paths.personalDetails.name
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

      await updateAppealService.submitEvent(Events.EDIT_APPEAL, req);
      return getConditionalRedirectUrl(req, res, paths.personalDetails.nationality);
    } catch (e) {
      next(e);
    }
  };
}

function getNamePage(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    const personalDetails = req.session.appeal.application.personalDetails;
    return res.render('appeal-application/personal-details/name.njk', {
      personalDetails,
      previousPage: paths.taskList
    });
  } catch (e) {
    next(e);
  }
}

function postNamePage(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      if (shouldValidateWhenSaveForLater(req.body, 'familyName', 'givenNames')) {
        const validation = appellantNamesValidation(req.body);
        if (validation) {
          return res.render('appeal-application/personal-details/name.njk', {
            personalDetails: {
              familyName: req.body.familyName,
              givenNames: req.body.givenNames
            },
            error: validation,
            errorList: Object.values(validation),
            previousPage: paths.taskList
          });
        }
      }
      const { application } = req.session.appeal;
      application.personalDetails = {
        ...application.personalDetails,
        familyName: req.body.familyName,
        givenNames: req.body.givenNames
      };

      await updateAppealService.submitEvent(Events.EDIT_APPEAL, req);

      return getConditionalRedirectUrl(req, res, getNextPage(req.body, paths.personalDetails.dob));
    } catch (e) {
      next(e);
    }
  };
}

function getNationalityPage(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');

    const { application } = req.session.appeal;
    const nationality = application.personalDetails && application.personalDetails.nationality || null;
    const nationalitiesOptions = getNationalitiesOptions(countryList, nationality);
    return res.render('appeal-application/personal-details/nationality.njk', {
      nationalitiesOptions,
      previousPage: paths.personalDetails.dob
    });
  } catch (e) {
    next(e);
  }
}

function postNationalityPage(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const validation = nationalityValidation(req.body);
      if (validation) {
        const nationality = req.body.nationality;
        const nationalitiesOptions = getNationalitiesOptions(countryList, nationality);
        return res.render('appeal-application/personal-details/nationality.njk', {
          nationalitiesOptions,
          errors: validation,
          errorList: Object.values(validation),
          previousPage: paths.personalDetails.dob
        });
      }

      const { application } = req.session.appeal;
      application.personalDetails = {
        ...application.personalDetails,
        nationality: req.body.nationality
      };
      await updateAppealService.submitEvent(Events.EDIT_APPEAL, req);
      if (_.has(application, 'personalDetails.address.line1')) {
        return getConditionalRedirectUrl(req, res, paths.personalDetails.enterAddress);

      }
      return getConditionalRedirectUrl(req, res, paths.personalDetails.enterPostcode);

    } catch (e) {
      next(e);
    }
  };
}

function getEnterPostcodePage(req: Request, res: Response, next: NextFunction) {
  try {
    _.set(req.session.appeal.application, 'addressLookup', {});
    const { personalDetails } = req.session.appeal.application;
    const postcode = personalDetails && personalDetails.address && personalDetails.address.postcode || null;
    res.render('appeal-application/personal-details/enter-postcode.njk', {
      postcode,
      previousPage: paths.personalDetails.nationality
    });
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
        errorList: Object.values(validation),
        postcode: req.body.postcode,
        previousPage: paths.personalDetails.nationality
      });
    }
    req.session.appeal.application.personalDetails.address = {
      postcode: req.body.postcode
    };
    return res.redirect(paths.personalDetails.postcodeLookup);
  } catch (e) {
    next(e);
  }
}

function getPostcodeLookupPage(osPlacesClient: OSPlacesClient) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const postcode = _.get(req.session.appeal.application, 'personalDetails.address.postcode');
      if (!postcode) return res.redirect(paths.personalDetails.enterPostcode);
      const addressLookupResult = await osPlacesClient.lookupByPostcode(postcode);
      req.session.appeal.application.addressLookup.result = addressLookupResult;
      const addresses = buildAddressList(addressLookupResult);

      res.render('appeal-application/personal-details/postcode-lookup.njk', {
        addresses,
        postcode,
        previousPage: paths.personalDetails.enterPostcode
      });
    } catch (e) {
      next(e);
    }
  };
}

function postPostcodeLookupPage(req: Request, res: Response, next: NextFunction) {
  try {
    const validation = dropdownValidation(req.body.address, 'address');
    if (validation) {
      const addresses = buildAddressList(_.get(req.session.appeal.application, 'addressLookup.result'));

      return res.render('appeal-application/personal-details/postcode-lookup.njk', {
        error: validation,
        errorList: Object.values(validation),
        addresses: addresses,
        previousPage: paths.personalDetails.enterPostcode
      });
    }
    const osAddress = findAddress(req.body.address, _.get(req.session.appeal.application, 'addressLookup.result.addresses'));
    const address = getAddress(osAddress, _.get(req.session.appeal.application, 'personalDetails.address.postcode'));
    req.session.appeal.application.personalDetails.address = {
      ...address
    };

    return res.redirect(paths.personalDetails.enterAddress);
  } catch (e) {
    next(e);
  }
}

function findAddress(udprn: string, addresses: Address[]): Address {
  return (udprn && addresses) ? addresses.find(address => address.udprn === udprn) : null;
}

function getManualEnterAddressPage(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    const address = _.get(req.session.appeal.application, 'personalDetails.address');

    res.render('appeal-application/personal-details/enter-address.njk', { address });
  } catch (e) {
    next(e);
  }
}

function postManualEnterAddressPage(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = addressValidation(req.body);
      if (validation !== null) {
        return res.render('appeal-application/personal-details/enter-address.njk', {
          address: {
            line1: req.body['address-line-1'],
            line2: req.body['address-line-2'],
            city: req.body['address-town'],
            county: req.body['address-county'],
            postcode: req.body['address-postcode']
          },
          error: validation,
          errorList: Object.values(validation),
          previousPage: paths.personalDetails.postcodeLookup
        });
      }

      req.session.appeal.application.personalDetails = {
        ...req.session.appeal.application.personalDetails,
        address: {
          line1: req.body['address-line-1'],
          line2: req.body['address-line-2'],
          city: req.body['address-town'],
          county: req.body['address-county'],
          postcode: req.body['address-postcode']
        }
      };
      await updateAppealService.submitEvent(Events.EDIT_APPEAL, req);
      return getConditionalRedirectUrl(req, res, paths.taskList);
    } catch (e) {
      next(e);
    }
  };
}

function setupPersonalDetailsController(deps?: any): Router {
  const router = Router();
  router.get(paths.personalDetails.name, getNamePage);
  router.post(paths.personalDetails.name, postNamePage(deps.updateAppealService));
  router.get(paths.personalDetails.dob, getDateOfBirthPage);
  router.post(paths.personalDetails.dob, postDateOfBirth(deps.updateAppealService));
  router.get(paths.personalDetails.nationality, getNationalityPage);
  router.post(paths.personalDetails.nationality, postNationalityPage(deps.updateAppealService));
  router.get(paths.personalDetails.enterPostcode, getEnterPostcodePage);
  router.post(paths.personalDetails.enterPostcode, postEnterPostcodePage);
  router.get(paths.personalDetails.enterAddress, getManualEnterAddressPage);
  router.post(paths.personalDetails.enterAddress, postManualEnterAddressPage(deps.updateAppealService));
  router.get(paths.personalDetails.postcodeLookup, getPostcodeLookupPage(deps.osPlacesClient));
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
