import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import i18n from '../../../locale/en.json';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import UpdateAppealService from '../../service/update-appeal-service';
import { shouldValidateWhenSaveForLater } from '../../utils/save-for-later-utils';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { getRedirectPage } from '../../utils/utils';
import {
  contactDetailsValidation,
  hasSponsorValidation, sponsorAddressValidation,
  sponsorAuthorisationValidation, sponsorContactDetailsValidation,
  sponsorNamesValidation
} from '../../utils/validations/fields-validations';

function getContactDetails(req: Request, res: Response, next: NextFunction) {
  try {
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
        req.body.selections = '';
      }
      const validation = contactDetailsValidation(req.body);
      const contactDetails = {
        email: req.body.selections.includes('email') ? req.body['email-value'] : null,
        wantsEmail: req.body.selections.includes('email'),
        phone: req.body.selections.includes('text-message') ? req.body['text-message-value'].replace(/\s/g, '') : null,
        wantsSms: req.body.selections.includes('text-message')
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

      if (['Yes'].includes(appeal.application.appellantInUk)) return res.redirect(paths.appealStarted.taskList);

      let redirectPage = getRedirectPage(editingMode, paths.appealStarted.checkAndSend, req.body.saveForLater, paths.appealStarted.hasSponsor);

      return res.redirect(redirectPage);
    } catch (error) {
      next(error);
    }
  };
}

async function getHasSponsor(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    const answer = req.session.appeal.application.hasSponsor;
    return res.render('appeal-application/sponsor-details/has-sponsor.njk', {
      question: i18n.pages.hasSponsor.title,
      description: undefined,
      modal: undefined,
      questionId: undefined,
      previousPage: paths.appealStarted.contactDetails,
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

      if (validation) {
        return res.render('appeal-application/sponsor-details/has-sponsor.njk', {
          question: i18n.pages.hasSponsor.title,
          description: undefined,
          modal: undefined,
          questionId: undefined,
          previousPage: paths.appealStarted.contactDetails,
          answer: undefined,
          errors: validation,
          errorList: Object.values(validation)
        });
      }

      const appeal: Appeal = {
        ...req.session.appeal,
        application: {
          ...req.session.appeal.application,
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
        req.body.selections = '';
      }
      const validation = sponsorContactDetailsValidation(req.body);
      const sponsorContactDetails = {
        email: req.body.selections.includes('email') ? req.body['email-value'] : null,
        wantsEmail: req.body.selections.includes('email'),
        phone: req.body.selections.includes('text-message') ? req.body['text-message-value'].replace(/\s/g, '') : null,
        wantsSms: req.body.selections.includes('text-message')

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

function setupContactDetailsController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.appealStarted.contactDetails, middleware, getContactDetails);
  router.post(paths.appealStarted.contactDetails, middleware, postContactDetails(updateAppealService));
  router.get(paths.appealStarted.hasSponsor, middleware, getHasSponsor);
  router.post(paths.appealStarted.hasSponsor, middleware, postHasSponsor(updateAppealService));
  router.get(paths.appealStarted.sponsorName, middleware, getSponsorName);
  router.post(paths.appealStarted.sponsorName, middleware, postSponsorName(updateAppealService));
  router.get(paths.appealStarted.sponsorAddress, middleware, getSponsorAddress);
  router.post(paths.appealStarted.sponsorAddress, middleware, postSponsorAddress(updateAppealService));
  router.get(paths.appealStarted.sponsorContactDetails, middleware, getSponsorContactDetails);
  router.post(paths.appealStarted.sponsorContactDetails, middleware, postSponsorContactDetails(updateAppealService));
  router.get(paths.appealStarted.sponsorAuthorisation, middleware, getSponsorAuthorisation);
  router.post(paths.appealStarted.sponsorAuthorisation, middleware, postSponsorAuthorisation(updateAppealService));
  return router;
}

export {
  setupContactDetailsController,
  getContactDetails,
  postContactDetails,
  getHasSponsor,
  postHasSponsor,
  getSponsorName,
  postSponsorName,
  getSponsorAddress,
  postSponsorAddress,
  getSponsorContactDetails,
  postSponsorContactDetails,
  getSponsorAuthorisation,
  postSponsorAuthorisation
};
