import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import i18n from '../../../locale/en.json';
import { FEATURE_FLAGS } from '../../data/constants';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import LaunchDarklyService from '../../service/launchDarkly-service';
import { Address, OSPlacesClient } from '../../service/OSPlacesClient';
import UpdateAppealService from '../../service/update-appeal-service';
import { getAddress } from '../../utils/address-utils';
import { shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { getRedirectPage } from '../../utils/utils';
import {
  addressValidation,
  contactDetailsValidation,
  dropdownValidation,
  hasSponsorValidation,
  postcodeValidation,
  sponsorAddressValidation,
  sponsorAuthorisationValidation,
  sponsorContactDetailsValidation,
  sponsorNamesValidation,
  textAreaValidation
} from '../../utils/validations/fields-validations';

function getContactDetails(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.previousPage = paths.appealStarted.contactDetails;
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    const { application } = req.session.appeal;
    const contactDetails = application && application.contactDetails || null;
    return res.render('appeal-application/contact-details.njk', {
      contactDetails,
      previousPage: paths.appealStarted.taskList
    });
  } catch (error) {
    next(error);
  }
}

function postContactDetails(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'selections')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      if (!req.body.selections) {
        req.body.contactDetails = '';
      } else {
        req.body.contactDetails = req.body.selections;
      }
      const validation = contactDetailsValidation(req.body);
      const contactDetails = {
        email: req.body.contactDetails.includes('email') ? req.body['email-value'] : null,
        wantsEmail: req.body.contactDetails.includes('email'),
        phone: req.body.contactDetails.includes('text-message') ? req.body['text-message-value'].replace(/\s/g, '') : null,
        wantsSms: req.body.contactDetails.includes('text-message')
      };
      if (validation) {
        return res.render('appeal-application/contact-details.njk', {
          contactDetails,
          errors: validation,
          errorList: Object.values(validation),
          previousPage: paths.appealStarted.taskList
        });
      }

      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          contactDetails
        }
      };
      const editingMode: boolean = req.session.appeal.application.isEdit || false;
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };

      const ukAddress = _.has(appeal.application, 'personalDetails.address.line1') ? paths.appealStarted.enterAddress : paths.appealStarted.enterPostcode;
      const redirectedPagePath = await isOutOfCountryAppeal(req) ? paths.appealStarted.oocAddress : ukAddress;

      let redirectPage = getRedirectPage(
          editingMode,
          paths.appealStarted.checkAndSend,
          req.body.saveForLater,
          redirectedPagePath
      );
      return res.redirect(redirectPage);
    } catch (error) {
      next(error);
    }
  };
}

async function isOutOfCountryAppeal(req: Request) {
  let appealOutOfCountry = req.session.appeal.appealOutOfCountry;
  let outOfCountryFeatureEnabled: boolean = await LaunchDarklyService.getInstance().getVariation(req, FEATURE_FLAGS.OUT_OF_COUNTRY, false);
  return (outOfCountryFeatureEnabled && appealOutOfCountry && appealOutOfCountry === 'Yes');
}

function getEnterAddressForOutOfCountryAppeal(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.previousPage = paths.appealStarted.contactDetails;
    const oocAddress = req.session.appeal.application.appellantOutOfCountryAddress || null;
    res.render('templates/textarea-question-page.njk', {
      previousPage: paths.appealStarted.contactDetails,
      formAction: paths.appealStarted.oocAddress,
      pageTitle: i18n.pages.outOfCountryAddress.title,
      question: {
        name: 'outofcountry-address',
        title: i18n.pages.outOfCountryAddress.title,
        description: i18n.pages.outOfCountryAddress.description,
        value: oocAddress ? oocAddress : ''
      }
    });
  } catch (e) {
    next(e);
  }
}

function postEnterAddressForOutOfCountryAppeal(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'outofcountry-address')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      const validationErrors = textAreaValidation(req.body['outofcountry-address'], 'outofcountry-address', i18n.validationErrors.outOfCountryAddress.addressRequired);
      if (validationErrors) {
        return res.render('templates/textarea-question-page.njk', {
          previousPage: paths.appealStarted.contactDetails,
          formAction: paths.appealStarted.oocAddress,
          pageTitle: i18n.pages.outOfCountryAddress.title,
          question: {
            name: 'outofcountry-address',
            title: i18n.pages.outOfCountryAddress.title,
            description: i18n.pages.outOfCountryAddress.description,
            value: ''
          },
          errorList: Object.values(validationErrors),
          error: validationErrors
        });
      }

      req.session.appeal.application.appellantOutOfCountryAddress = req.body['outofcountry-address'];
      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application
        }
      };
      let editingMode: boolean = req.session.appeal.application.isEdit || false;
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);

      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      let redirectPage = getRedirectPage(editingMode, paths.appealStarted.checkAndSend, req.body.saveForLater, paths.appealStarted.hasSponsor);
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
      previousPage: paths.appealStarted.contactDetails
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
        previousPage: paths.appealStarted.contactDetails
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

    const previousPage = req.session.previousPage ? req.session.previousPage : paths.appealStarted.contactDetails;

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
        const previousPage = req.session.previousPage ? req.session.previousPage : paths.appealStarted.contactDetails;
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
      let redirectPage = getRedirectPage(editingMode, paths.appealStarted.checkAndSend, req.body.saveForLater, paths.appealStarted.hasSponsor);
      return res.redirect(redirectPage);
    } catch (e) {
      next(e);
    }
  };
}

async function getHasSponsor(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    const application = req.session.appeal.application;
    const answer = application.hasSponsor;
    const ukAddress = _.has(application, 'personalDetails.address.line1') ? paths.appealStarted.enterAddress : paths.appealStarted.enterPostcode;
    const previousPage = await isOutOfCountryAppeal(req) ? paths.appealStarted.oocAddress : ukAddress;
    return res.render('appeal-application/sponsor-details/has-sponsor.njk', {
      question: i18n.pages.hasSponsor.title,
      description: undefined,
      modal: undefined,
      questionId: undefined,
      previousPage: previousPage,
      answer: answer,
      errors: undefined,
      errorList: undefined
    });
  } catch (error) {
    next(error);
  }
}

function postHasSponsor(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = hasSponsorValidation(req.body);

      const application = req.session.appeal.application;
      const ukAddress = _.has(application, 'personalDetails.address.line1') ? paths.appealStarted.enterAddress : paths.appealStarted.enterPostcode;
      const previousPage = await isOutOfCountryAppeal(req) ? paths.appealStarted.oocAddress : ukAddress;

      if (validation) {
        return res.render('appeal-application/sponsor-details/has-sponsor.njk', {
          question: i18n.pages.hasSponsor.title,
          description: undefined,
          modal: undefined,
          questionId: undefined,
          previousPage: previousPage,
          answer: undefined,
          errors: validation,
          errorList: Object.values(validation)
        });
      }

      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...application,
          hasSponsor: req.body['answer']
        }
      };

      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token'], false);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };

      if (['No'].includes(appeal.application.hasSponsor)) return res.redirect(paths.appealStarted.taskList);

      let redirectPage = paths.appealStarted.sponsorName;

      return res.redirect(redirectPage);
    } catch (error) {
      next(error);
    }
  };
}

function getSponsorName(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    const sponsorGivenNames = req.session.appeal.application.sponsorGivenNames || null;
    const sponsorFamilyName = req.session.appeal.application.sponsorFamilyName || null;
    return res.render('appeal-application/sponsor-details/sponsor-name.njk', {
      sponsorGivenNames,
      sponsorFamilyName,
      previousPage: paths.appealStarted.hasSponsor
    });
  } catch (e) {
    next(e);
  }
}

function postSponsorName(updateAppealService: UpdateAppealService) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'sponsorFamilyName', 'sponsorGivenNames')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      const validation = sponsorNamesValidation(req.body);
      if (validation) {
        return res.render('appeal-application/sponsor-details/sponsor-name.njk', {
          sponsorFamilyName: req.body.sponsorFamilyName,
          sponsorGivenNames: req.body.sponsorGivenNames,
          error: validation,
          errorList: Object.values(validation),
          previousPage: paths.appealStarted.hasSponsor
        });
      }

      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          ...req.session.appeal.application,
          sponsorFamilyName: req.body.sponsorFamilyName,
          sponsorGivenNames: req.body.sponsorGivenNames
        }
      };

      const editingMode: boolean = req.session.appeal.application.isEdit || false;
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      let redirectPage = getRedirectPage(editingMode, paths.appealStarted.checkAndSend, req.body.saveForLater, paths.appealStarted.sponsorAddress);
      return res.redirect(redirectPage);
    } catch (e) {
      next(e);
    }
  };
}

function getSponsorAddress(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    const address = req.session.appeal.application.sponsorAddress || null;
    res.render('appeal-application/sponsor-details/sponsor-address.njk', {
      address,
      previousPage: paths.appealStarted.sponsorName
    });
  } catch (e) {
    next(e);
  }
}

function postSponsorAddress(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'address-line-1', 'address-line-2', 'address-town', 'address-county', 'address-postcode')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      const validation = sponsorAddressValidation(req.body);
      if (validation !== null) {
        const previousPage = req.session.previousPage ? req.session.previousPage : paths.appealStarted.sponsorName;
        return res.render('appeal-application/sponsor-details/sponsor-address.njk', {
          sponsorAddress: {
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
          sponsorAddress: {
            line1: req.body['address-line-1'],
            line2: req.body['address-line-2'],
            city: req.body['address-town'],
            county: req.body['address-county'],
            postcode: req.body['address-postcode']
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
      let redirectPage = getRedirectPage(editingMode, paths.appealStarted.checkAndSend, req.body.saveForLater, paths.appealStarted.sponsorContactDetails);
      return res.redirect(redirectPage);
    } catch (e) {
      next(e);
    }
  };
}

function getSponsorContactDetails(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    const { application } = req.session.appeal;
    const sponsorContactDetails = application && application.sponsorContactDetails || null;
    return res.render('appeal-application/sponsor-details/sponsor-contact-details.njk', {
      sponsorContactDetails,
      previousPage: paths.appealStarted.sponsorAddress
    });
  } catch (error) {
    next(error);
  }
}

function postSponsorContactDetails(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!shouldValidateWhenSaveForLater(req.body, 'selections')) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      if (!req.body.selections) {
        req.body.sponsorContactDetails = '';
      } else {
        req.body.sponsorContactDetails = req.body.selections;
      }
      const validation = sponsorContactDetailsValidation(req.body);
      const sponsorContactDetails = {
        email: req.body.sponsorContactDetails.includes('email') ? req.body['email-value'] : null,
        wantsEmail: req.body.sponsorContactDetails.includes('email'),
        phone: req.body.sponsorContactDetails.includes('text-message') ? req.body['text-message-value'].replace(/\s/g, '') : null,
        wantsSms: req.body.sponsorContactDetails.includes('text-message')

      };
      if (validation) {
        return res.render('appeal-application/sponsor-details/sponsor-contact-details.njk', {
          sponsorContactDetails,
          errors: validation,
          errorList: Object.values(validation),
          previousPage: paths.appealStarted.sponsorAddress
        });
      }

      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          sponsorContactDetails
        }
      };
      const editingMode: boolean = req.session.appeal.application.isEdit || false;
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      let redirectPage = getRedirectPage(editingMode, paths.appealStarted.checkAndSend, req.body.saveForLater, paths.appealStarted.sponsorAuthorisation);
      return res.redirect(redirectPage);
    } catch (error) {
      next(error);
    }
  };
}

async function getSponsorAuthorisation(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    const answer = req.session.appeal.application.sponsorAuthorisation;
    return res.render('appeal-application/sponsor-details/sponsor-authorisation.njk', {
      question: i18n.pages.sponsorAuthorisation.title,
      description: undefined,
      modal: undefined,
      questionId: undefined,
      previousPage: paths.appealStarted.sponsorContactDetails,
      answer: answer,
      errors: undefined,
      errorList: undefined
    });
  } catch (error) {
    next(error);
  }
}

function postSponsorAuthorisation(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = sponsorAuthorisationValidation(req.body);

      if (validation) {
        return res.render('appeal-application/sponsor-details/sponsor-authorisation.njk', {
          question: i18n.pages.sponsorAuthorisation.title,
          description: undefined,
          modal: undefined,
          questionId: undefined,
          previousPage: paths.appealStarted.sponsorContactDetails,
          answer: undefined,
          errors: validation,
          errorList: Object.values(validation)
        });
      }

      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
          sponsorAuthorisation: req.body['answer']
        }
      };

      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.EDIT_APPEAL, appeal, req.idam.userDetails.uid, req.cookies['__auth-token'], false);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };

      let redirectPage = paths.appealStarted.taskList;

      return res.redirect(redirectPage);
    } catch (error) {
      next(error);
    }
  };
}

type ContactDetailsControllerDependencies = { updateAppealService: UpdateAppealService, osPlacesClient: OSPlacesClient };

function setupContactDetailsController(middleware: Middleware[], deps: ContactDetailsControllerDependencies): Router {
  const router = Router();
  router.get(paths.appealStarted.contactDetails, middleware, getContactDetails);
  router.post(paths.appealStarted.contactDetails, middleware, postContactDetails(deps.updateAppealService));
  router.get(paths.appealStarted.enterPostcode, middleware, getEnterPostcodePage);
  router.post(paths.appealStarted.enterPostcode, middleware, postEnterPostcodePage);
  router.get(paths.appealStarted.enterAddress, middleware, getManualEnterAddressPage);
  router.post(paths.appealStarted.enterAddress, middleware, postManualEnterAddressPage(deps.updateAppealService));
  router.get(paths.appealStarted.postcodeLookup, middleware, getPostcodeLookupPage(deps.osPlacesClient));
  router.post(paths.appealStarted.postcodeLookup, middleware, postPostcodeLookupPage);
  router.get(paths.appealStarted.oocAddress, middleware, getEnterAddressForOutOfCountryAppeal);
  router.post(paths.appealStarted.oocAddress, middleware, postEnterAddressForOutOfCountryAppeal(deps.updateAppealService));
  router.get(paths.appealStarted.hasSponsor, middleware, getHasSponsor);
  router.post(paths.appealStarted.hasSponsor, middleware, postHasSponsor(deps.updateAppealService));
  router.get(paths.appealStarted.sponsorName, middleware, getSponsorName);
  router.post(paths.appealStarted.sponsorName, middleware, postSponsorName(deps.updateAppealService));
  router.get(paths.appealStarted.sponsorAddress, middleware, getSponsorAddress);
  router.post(paths.appealStarted.sponsorAddress, middleware, postSponsorAddress(deps.updateAppealService));
  router.get(paths.appealStarted.sponsorContactDetails, middleware, getSponsorContactDetails);
  router.post(paths.appealStarted.sponsorContactDetails, middleware, postSponsorContactDetails(deps.updateAppealService));
  router.get(paths.appealStarted.sponsorAuthorisation, middleware, getSponsorAuthorisation);
  router.post(paths.appealStarted.sponsorAuthorisation, middleware, postSponsorAuthorisation(deps.updateAppealService));
  return router;
}

export {
  setupContactDetailsController,
  getContactDetails,
  postContactDetails,
  postEnterPostcodePage,
  getEnterPostcodePage,
  getManualEnterAddressPage,
  postManualEnterAddressPage,
  getPostcodeLookupPage,
  postPostcodeLookupPage,
  getEnterAddressForOutOfCountryAppeal,
  postEnterAddressForOutOfCountryAppeal,
  isOutOfCountryAppeal,
  getHasSponsor,
  postHasSponsor,
  getSponsorName,
  postSponsorName,
  getSponsorAddress,
  postSponsorAddress,
  getSponsorContactDetails,
  postSponsorContactDetails,
  getSponsorAuthorisation,
  postSponsorAuthorisation,
  ContactDetailsControllerDependencies
};
