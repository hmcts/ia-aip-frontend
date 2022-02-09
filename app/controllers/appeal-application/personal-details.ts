import { Address, OSPlacesClient } from '@hmcts/os-places-client';
import { NextFunction, Request, Response, Router } from 'express';
import * as _ from 'lodash';
import i18n from '../../../locale/en.json';
import { countryList } from '../../data/country-list';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import UpdateAppealService from '../../service/update-appeal-service';
import { getAddress } from '../../utils/address-utils';
import { getNationalitiesOptions } from '../../utils/nationalities';
import { shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { getRedirectPage } from '../../utils/utils';
import {
  addressValidation,
  appellantNamesValidation,
  dateOfBirthValidation,
  dropdownValidation,
  nationalityValidation,
  postcodeValidation
} from '../../utils/validations/fields-validations';

function getDateOfBirthPage(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');

    const { application } = req.session.appeal;
    const dob = application.personalDetails && application.personalDetails.dob || null;
    return res.render('appeal-application/personal-details/date-of-birth.njk', {
      dob,
      previousPage: paths.appealStarted.name
    });
  } catch (e) {
    next(e);
  }
}

function postDateOfBirth(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'day', 'month', 'year')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      const validation = dateOfBirthValidation(req.body);
      if (validation != null) {
        return res.render('appeal-application/personal-details/date-of-birth.njk', {
          errors: validation,
          errorList: Object.values(validation),
          dob: { ...req.body },
          previousPage: paths.appealStarted.name
        });
      }

      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          personalDetails: {
            ...req.session.appeal.application.personalDetails,
            dob: {
              day: req.body.day,
              month: req.body.month,
              year: req.body.year
            }
          }
        }
      };
      const editingMode: boolean = req.session.appeal.application.isEdit || false;
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      let redirectPage = getRedirectPage(editingMode, paths.appealStarted.checkAndSend, req.body.saveForLater, paths.appealStarted.nationality);
      return res.redirect(redirectPage);
    } catch (e) {
      next(e);
    }
  };
}

function getNamePage(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    const personalDetails = req.session.appeal.application.personalDetails || null;
    return res.render('appeal-application/personal-details/name.njk', {
      personalDetails,
      previousPage: paths.appealStarted.taskList
    });
  } catch (e) {
    next(e);
  }
}

function postNamePage(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'familyName', 'givenNames')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      const validation = appellantNamesValidation(req.body);
      if (validation) {
        return res.render('appeal-application/personal-details/name.njk', {
          personalDetails: {
            familyName: req.body.familyName,
            givenNames: req.body.givenNames
          },
          error: validation,
          errorList: Object.values(validation),
          previousPage: paths.appealStarted.taskList
        });
      }

      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          personalDetails: {
            ...req.session.appeal.application.personalDetails,
            familyName: req.body.familyName,
            givenNames: req.body.givenNames
          },
          appellantInUk: false
        },
        appealOutOfCountry: false
      };

      // tslint:disable:no-console
      console.log('postNamePage appeal', appeal, '_______________________________________________________');

      const editingMode: boolean = req.session.appeal.application.isEdit || false;
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      let redirectPage = getRedirectPage(editingMode, paths.appealStarted.checkAndSend, req.body.saveForLater, paths.appealStarted.dob);
      return res.redirect(redirectPage);
    } catch (e) {
      next(e);
    }
  };
}

function getNationalityPage(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.previousPage = paths.appealStarted.nationality;
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');

    const { application } = req.session.appeal;
    const stateless = application.personalDetails.stateless;
    const nationality = application.personalDetails && application.personalDetails.nationality || null;
    const nationalitiesOptions = getNationalitiesOptions(countryList, nationality, i18n.pages.nationality.defaultNationality);
    return res.render('appeal-application/personal-details/nationality.njk', {
      stateless,
      nationalitiesOptions,
      previousPage: paths.appealStarted.dob
    });
  } catch (e) {
    next(e);
  }
}

function postNationalityPage(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'nationality', 'stateless')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      const validation = nationalityValidation(req.body);
      if (validation) {
        const nationality = req.body.nationality;
        const nationalitiesOptions = getNationalitiesOptions(countryList, nationality, i18n.pages.nationality.defaultNationality);
        return res.render('appeal-application/personal-details/nationality.njk', {
          nationalitiesOptions,
          errors: validation,
          errorList: Object.values(validation),
          previousPage: paths.appealStarted.dob
        });
      }
      const { application } = req.session.appeal;
      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          personalDetails: {
            ...req.session.appeal.application.personalDetails,
            nationality: req.body.nationality || null,
            stateless: req.body.stateless || 'hasNationality'
          }
        }
      };
      const editingMode: boolean = req.session.appeal.application.isEdit || false;
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      let redirectPage = getRedirectPage(
        editingMode,
        paths.appealStarted.checkAndSend,
        req.body.saveForLater,
        _.has(application, 'personalDetails.address.line1') ? paths.appealStarted.enterAddress : paths.appealStarted.enterPostcode
      );
      return res.redirect(redirectPage);
    } catch (e) {
      next(e);
    }
  };
}

function getEnterPostcodePage(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.previousPage = paths.appealStarted.enterPostcode;
    _.set(req.session.appeal.application, 'addressLookup', {});
    const { personalDetails } = req.session.appeal.application;
    const postcode = personalDetails && personalDetails.address && personalDetails.address.postcode || null;
    res.render('appeal-application/personal-details/enter-postcode.njk', {
      postcode,
      previousPage: paths.appealStarted.nationality
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
        previousPage: paths.appealStarted.nationality
      });
    }
    req.session.appeal.application.personalDetails.address = {
      postcode: req.body.postcode
    };
    return res.redirect(paths.appealStarted.postcodeLookup);
  } catch (e) {
    next(e);
  }
}

function buildAddressList(addressLookupResult) {
  const lookedUpAddresses = addressLookupResult.addresses.map(address => {
    return {
      value: address.udprn,
      text: address.formattedAddress
    };
  });

  const selectAddresses = lookedUpAddresses.length === 1 ?
    i18n.pages.postcodeLookup.addressFound :
    `${lookedUpAddresses.length} ${i18n.pages.postcodeLookup.addressesFound}`;
  const addresses = [
    {
      value: '',
      text: selectAddresses
    }].concat(lookedUpAddresses);
  return addresses;
}

function getPostcodeLookupPage(osPlacesClient: OSPlacesClient) {
  return async (req: Request, res: Response, next: NextFunction) => {
    req.session.previousPage = paths.appealStarted.postcodeLookup;
    try {
      const postcode = _.get(req.session.appeal.application, 'personalDetails.address.postcode');
      if (!postcode) return res.redirect(paths.appealStarted.enterPostcode);
      const addressLookupResult = await osPlacesClient.lookupByPostcode(postcode);
      req.session.appeal.application.addressLookup.result = addressLookupResult;
      const addresses = buildAddressList(addressLookupResult);

      res.render('appeal-application/personal-details/postcode-lookup.njk', {
        addresses,
        postcode,
        previousPage: paths.appealStarted.enterPostcode
      });
    } catch (e) {
      next(e);
    }
  };
}

function postPostcodeLookupPage(req: Request, res: Response, next: NextFunction) {
  try {
    if (!shouldValidateWhenSaveForLater(req.body, 'address')) {
      return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
    }
    const validation = dropdownValidation(req.body.address, 'address');
    if (validation) {
      const addresses = buildAddressList(_.get(req.session.appeal.application, 'addressLookup.result'));

      return res.render('appeal-application/personal-details/postcode-lookup.njk', {
        error: validation,
        errorList: Object.values(validation),
        addresses: addresses,
        previousPage: paths.appealStarted.enterPostcode
      });
    }
    const osAddress = findAddress(req.body.address, _.get(req.session.appeal.application, 'addressLookup.result.addresses'));
    const address = getAddress(osAddress, _.get(req.session.appeal.application, 'personalDetails.address.postcode'));
    req.session.appeal.application.personalDetails.address = {
      ...address
    };

    return res.redirect(paths.appealStarted.enterAddress);
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

    const previousPage = req.session.previousPage ? req.session.previousPage : paths.appealStarted.nationality;

    res.render('appeal-application/personal-details/enter-address.njk', { address, previousPage });
  } catch (e) {
    next(e);
  }
}

function postManualEnterAddressPage(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'address-line-1', 'address-line-2', 'address-town', 'address-county', 'address-postcode')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      const validation = addressValidation(req.body);
      if (validation !== null) {
        const previousPage = req.session.previousPage ? req.session.previousPage : paths.appealStarted.nationality;
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
          previousPage: previousPage
        });
      }

      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          personalDetails: {
            ...req.session.appeal.application.personalDetails,
            address: {
              line1: req.body['address-line-1'],
              line2: req.body['address-line-2'],
              city: req.body['address-town'],
              county: req.body['address-county'],
              postcode: req.body['address-postcode']
            }
          }
        }
      };
      let editingMode: boolean;
      editingMode = req.session.appeal.application.isEdit || false;
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      let redirectPage = getRedirectPage(editingMode, paths.appealStarted.checkAndSend, req.body.saveForLater, paths.appealStarted.taskList);
      return res.redirect(redirectPage);
    } catch (e) {
      next(e);
    }
  };
}

function setupPersonalDetailsController(middleware: Middleware[], deps?: any): Router {
  const router = Router();
  router.get(paths.appealStarted.name, middleware, getNamePage);
  router.post(paths.appealStarted.name, middleware, postNamePage(deps.updateAppealService));
  router.get(paths.appealStarted.dob, middleware, getDateOfBirthPage);
  router.post(paths.appealStarted.dob, middleware, postDateOfBirth(deps.updateAppealService));
  router.get(paths.appealStarted.nationality, middleware, getNationalityPage);
  router.post(paths.appealStarted.nationality, middleware, postNationalityPage(deps.updateAppealService));
  router.get(paths.appealStarted.enterPostcode, middleware, getEnterPostcodePage);
  router.post(paths.appealStarted.enterPostcode, middleware, postEnterPostcodePage);
  router.get(paths.appealStarted.enterAddress, middleware, getManualEnterAddressPage);
  router.post(paths.appealStarted.enterAddress, middleware, postManualEnterAddressPage(deps.updateAppealService));
  router.get(paths.appealStarted.postcodeLookup, middleware, getPostcodeLookupPage(deps.osPlacesClient));
  router.post(paths.appealStarted.postcodeLookup, middleware, postPostcodeLookupPage);
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
