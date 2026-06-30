import { NextFunction, Request, Response, Router } from 'express';
import _ from 'lodash';
import i18n from '../../../locale/en.json';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import UpdateAppealService from '../../service/update-appeal-service';
import { addSummaryRow, Delimiter } from '../../utils/summary-list';
import { getRedirectPage } from '../../utils/utils';
import {
  createStructuredError,
  isSamePersonValidation,
  nlrAddressValidation,
  nlrNamesValidation,
  nonLegalRepContactDetailsValidation,
  textAreaValidation
} from '../../utils/validations/fields-validations';

function getSamePerson(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    const application = req.session.appeal.application;
    const isSponsorSameAsNlr = application.isSponsorSameAsNlr;
    return res.render('appeal-application/sponsor-details/is-same-person.njk', {
      question: i18n.pages.isSponsorSameAsNlr.titlePersonal,
      previousPage: paths.common.overview,
      isSponsorSameAsNlr: isSponsorSameAsNlr
    });
  } catch (error) {
    next(error);
  }
}

function postSamePerson() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = isSamePersonValidation(req.body, true);

      const application = req.session.appeal.application;

      if (validation) {
        return res.render('appeal-application/sponsor-details/is-same-person.njk', {
          question: i18n.pages.isSponsorSameAsNlr.titlePersonal,
          previousPage: paths.common.overview,
          isSponsorSameAsNlr: application.isSponsorSameAsNlr,
          errors: validation,
          errorList: Object.values(validation)
        });
      }

      req.session.appeal = {
        ...req.session.appeal,
        application: {
          ...application,
          isSponsorSameAsNlr: req.body['isSponsorSameAsNlr']
        }
      };

      return res.redirect(paths.nonLegalRep.updateName);
    } catch (error) {
      next(error);
    }
  };
}

function getNlrName(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    const nlrDetails = req.session?.appeal?.nlrDetails;
    const nlrGivenNames = nlrDetails?.givenNames;
    const nlrFamilyName = nlrDetails?.familyName;
    const hasSponsor = req.session.appeal?.application?.hasSponsor === 'Yes';
    return res.render('appeal-application/non-legal-rep-details/name.njk', {
      title: i18n.pages.nlrName.titlePersonal,
      formAction: paths.nonLegalRep.updateName,
      nlrGivenNames,
      nlrFamilyName,
      previousPage: hasSponsor ? paths.nonLegalRep.updateIsSamePerson : paths.common.overview
    });
  } catch (e) {
    next(e);
  }
}

function postNlrName() {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const validation = nlrNamesValidation(req.body, true);
      if (validation) {
        const hasSponsor = req.session.appeal?.application?.hasSponsor === 'Yes';
        return res.render('appeal-application/non-legal-rep-details/name.njk', {
          title: i18n.pages.nlrName.titlePersonal,
          formAction: paths.nonLegalRep.updateName,
          nlrGivenNames: req.body.nlrGivenNames,
          nlrFamilyName: req.body.nlrFamilyName,
          error: validation,
          errorList: Object.values(validation),
          previousPage: hasSponsor ? paths.nonLegalRep.updateIsSamePerson : paths.common.overview
        });
      }
      req.session.appeal = {
        ...req.session.appeal,
        nlrDetails: {
          ...req.session.appeal.nlrDetails,
          givenNames: req.body.nlrGivenNames,
          familyName: req.body.nlrFamilyName
        },
      };
      const editingMode: boolean = req.session.appeal.application.isEdit || false;
      const redirectPage = getRedirectPage(editingMode, paths.nonLegalRep.updateDetailsCheckAndSend, false, paths.nonLegalRep.updateAddress);
      return res.redirect(redirectPage);
    } catch (e) {
      next(e);
    }
  };
}

function getNlrAddress(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    const isSponsorSameAsNlr: boolean = req.session.appeal?.application?.isSponsorSameAsNlr === 'Yes';
    const renderObj: any = {
      previousPage: paths.nonLegalRep.updateName,
      formAction: paths.nonLegalRep.updateAddress,
      pageTitle: i18n.pages.nlrAddress.titlePersonal
    };
    if (isSponsorSameAsNlr) {
      return res.render('appeal-application/non-legal-rep-details/address.njk', {
        ...renderObj,
        address: req.session.appeal?.nlrDetails?.addressUk
          || req.session.appeal?.application?.sponsorAddress
      });
    } else {
      return res.render('templates/textarea-question-page.njk', {
        ...renderObj,
        question: {
          name: 'nlr-address',
          title: i18n.pages.nlrAddress.titlePersonal,
          description: i18n.pages.nlrAddress.descriptionPersonal,
          value: req.session.appeal?.nlrDetails?.address || ''
        }
      });
    }
  } catch (e) {
    next(e);
  }
}

function postNlrAddress() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isSponsorSameAsNlr: boolean = req.session.appeal?.application?.isSponsorSameAsNlr === 'Yes';
      const validation = isSponsorSameAsNlr ? nlrAddressValidation(req.body, true)
        : textAreaValidation(req.body['nlr-address'], 'nlr-address', i18n.validationErrors.nlrDetailsPersonal.address);
      if (validation !== null) {
        const renderObj: any = {
          previousPage: paths.nonLegalRep.updateName,
          formAction: paths.nonLegalRep.updateAddress,
          pageTitle: i18n.pages.nlrAddress.titlePersonal,
          error: validation,
          errorList: Object.values(validation)
        };
        if (isSponsorSameAsNlr) {
          return res.render('appeal-application/non-legal-rep-details/address.njk', {
            ...renderObj,
            address: {
              line1: req.body['address-line-1'],
              line2: req.body['address-line-2'],
              city: req.body['address-town'],
              county: req.body['address-county'],
              postcode: req.body['address-postcode']
            }
          });
        } else {
          return res.render('templates/textarea-question-page.njk', {
            ...renderObj,
            question: {
              name: 'nlr-address',
              title: i18n.pages.nlrAddress.titlePersonal,
              description: i18n.pages.nlrAddress.descriptionPersonal,
              value: req.body['nlr-address']
            }
          });
        }
      }
      const nlrAddress = isSponsorSameAsNlr ? {
        addressUk: {
          line1: req.body['address-line-1'],
          line2: req.body['address-line-2'],
          city: req.body['address-town'],
          county: req.body['address-county'],
          postcode: req.body['address-postcode']
        }
      } : { address: req.body['nlr-address'] };
      req.session.appeal = {
        ...req.session.appeal,
        nlrDetails: {
          ...req.session.appeal.nlrDetails,
          ...nlrAddress
        }
      };
      const editingMode: boolean = req.session.appeal.application.isEdit || false;
      const redirectPage = getRedirectPage(editingMode, paths.nonLegalRep.updateDetailsCheckAndSend, false, paths.nonLegalRep.updateContactDetails);
      return res.redirect(redirectPage);
    } catch (e) {
      next(e);
    }
  };
}

function getNlrContactDetails(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    const emailAddress = req.session.appeal?.nlrDetails?.emailAddress;
    const phoneNumber = req.session.appeal?.nlrDetails?.phoneNumber;
    return res.render('appeal-application/non-legal-rep-details/contact-details.njk', {
      title: i18n.pages.nlrContactDetails.titlePersonal,
      showEmail: true,
      formAction: paths.nonLegalRep.updateContactDetails,
      emailAddress,
      phoneNumber,
      previousPage: paths.nonLegalRep.updateAddress,
      saveForLater: false
    });
  } catch (error) {
    next(error);
  }
}

function postNlrContactDetails() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = nonLegalRepContactDetailsValidation(req.body);
      if (validation) {
        return res.render('appeal-application/non-legal-rep-details/contact-details.njk', {
          title: i18n.pages.nlrContactDetails.titlePersonal,
          showEmail: true,
          formAction: paths.nonLegalRep.updateContactDetails,
          emailAddress: req.body['emailAddress'],
          phoneNumber: req.body['phoneNumber'],
          errors: validation,
          errorList: Object.values(validation),
          previousPage: paths.nonLegalRep.updateAddress
        });
      }
      const appellantContactEmail = req.session.appeal?.application?.contactDetails?.email;
      const errorList = [];
      const errors = {};
      if (appellantContactEmail === req.body['emailAddress']) {
        const emailError = createStructuredError('emailAddress', i18n.validationErrors.nlrDetails.nlrEmailCannotBeSameAsAppellantPersonal);
        errors['emailAddress'] = emailError;
        errorList.push(emailError);
      }
      const appellantPhone = req.session.appeal?.application?.contactDetails?.phone;
      if (appellantPhone === req.body['phoneNumber']) {
        const phoneError = createStructuredError('phoneNumber', i18n.validationErrors.nlrDetails.nlrPhoneCannotBeSameAsAppellantPersonal);
        errors['phoneNumber'] = phoneError;
        errorList.push(phoneError);
      }
      if (errorList.length > 0) {
        return res.render('appeal-application/non-legal-rep-details/contact-details.njk', {
          title: i18n.pages.nlrContactDetails.titlePersonal,
          showEmail: true,
          formAction: paths.nonLegalRep.updateContactDetails,
          emailAddress: req.body['emailAddress'],
          phoneNumber: req.body['phoneNumber'],
          errors,
          errorList,
          previousPage: paths.nonLegalRep.updateAddress
        });
      }

      req.session.appeal = {
        ...req.session.appeal,
        nlrDetails: {
          ...req.session.appeal.nlrDetails,
          phoneNumber: req.body['phoneNumber'],
          emailAddress: req.body['emailAddress'],
        }
      };
      return res.redirect(paths.nonLegalRep.updateDetailsCheckAndSend);
    } catch (error) {
      next(error);
    }
  };
}

function getSummaryRows(req) {
  const editParameter = '?edit';
  const nlrDetails: NlrDetails = req.session.appeal.nlrDetails;
  const nlrAddressUk = nlrDetails.addressUk ? Object.values(nlrDetails.addressUk) : [];
  const nlrAddress: string = nlrDetails.address;
  const isSponsorSameAsNlr = req.session.appeal.application?.hasSponsor === 'Yes'
    && req.session.appeal.application?.isSponsorSameAsNlr === 'Yes';
  const addressValues = isSponsorSameAsNlr ? [...nlrAddressUk] : nlrAddress?.split('\n') || [];
  const summaryRows: SummaryRow[] = [
    addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.nonLegalRepNamePersonal,
      [nlrDetails?.givenNames, nlrDetails?.familyName], paths.nonLegalRep.updateName + editParameter, Delimiter.SPACE),
    addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.nonLegalRepAddressPersonal,
      [...addressValues], paths.nonLegalRep.updateAddress + editParameter, Delimiter.BREAK_LINE),
    addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.nonLegalRepEmailPersonal,
      [nlrDetails?.emailAddress], paths.nonLegalRep.updateContactDetails + editParameter),
    addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.nonLegalRepPhonePersonal,
      [nlrDetails?.phoneNumber], paths.nonLegalRep.updateContactDetails + editParameter)
  ];
  if (req.session.appeal?.application?.hasSponsor == 'Yes') {
    summaryRows.push(addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.isSponsorSameAsNlrPersonal,
      [req.session.appeal?.application?.isSponsorSameAsNlr], paths.nonLegalRep.updateIsSamePerson + editParameter));
  }

  return summaryRows;
}

function getUpdateNlrDetailsCheckAndSend(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('templates/check-and-send.njk', {
      pageTitle: i18n.pages.updateNlrDetails.title,
      formAction: paths.nonLegalRep.updateDetailsCheckAndSend,
      previousPage: paths.nonLegalRep.updateContactDetails,
      summaryLists: [{ summaryRows: getSummaryRows(req) }],
      noSaveForLater: true
    });
  } catch (e) {
    next(e);
  }
}

function postUpdateNlrDetailsCheckAndSend(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const nlrDetails = req.session.appeal?.nlrDetails;
      const isSponsorSameAsNlr = req.session.appeal.application?.isSponsorSameAsNlr === 'Yes';
      const address = nlrDetails?.address;
      const addressUk = nlrDetails?.addressUk;

      const baseValid =
        !!nlrDetails?.givenNames &&
        !!nlrDetails?.familyName &&
        !!nlrDetails?.phoneNumber;

      const addressValid = isSponsorSameAsNlr ? !!addressUk?.line1 && !!addressUk?.city && !!addressUk?.postcode
        : !!address;

      if (baseValid && addressValid) {
        const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.NLR_DETAILS_UPDATED,
          req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
        req.session.appeal = {
          ...req.session.appeal,
          ...appealUpdated
        };
        return res.redirect(paths.nonLegalRep.updateDetailsConfirmation);
      } else {
        const validationErrors = {};

        const fields: { key: string, value: string | Address }[] = [
          { key: 'givenNames', value: nlrDetails.givenNames },
          { key: 'familyName', value: nlrDetails.familyName },
          { key: 'phoneNumber', value: nlrDetails.phoneNumber },
          { key: 'emailAddress', value: nlrDetails.emailAddress }
        ];
        if (isSponsorSameAsNlr) {
          fields.push(
            { key: 'address', value: nlrDetails.addressUk },
            { key: 'addressLine1', value: nlrDetails.addressUk?.line1 },
            { key: 'addressTownCity', value: nlrDetails.addressUk?.city },
            { key: 'addressPostcode', value: nlrDetails.addressUk?.postcode });
        } else {
          fields.push({ key: 'address', value: nlrDetails.address },);
        }

        fields.forEach(({ key, value }) => {
          if (!value) {
            validationErrors[key] = createStructuredError(
              key,
              i18n.validationErrors.nlrDetailsPersonal[key]
            );
          }
        });

        return res.render('templates/check-and-send.njk', {
          pageTitle: i18n.pages.updateNlrDetails.title,
          formAction: paths.nonLegalRep.updateDetailsCheckAndSend,
          previousPage: paths.nonLegalRep.updateContactDetails,
          summaryLists: [{ summaryRows: getSummaryRows(req) }],
          errorList: Object.values(validationErrors),
          noSaveForLater: true
        });
      }
    } catch (e) {
      next(e);
    }
  };
}

function getUpdateNlrDetailsConfirmation(req: Request, res: Response, next: NextFunction) {
  try {
    res.render('templates/confirmation-page.njk', {
      title: i18n.pages.updateNlrDetails.confirmation.title,
      whatNextContent: i18n.pages.updateNlrDetails.confirmation.whatHappensNextContent,
      isNlr: req.session.isNonLegalRep
    });
  } catch (e) {
    next(e);
  }
}

function setupUpdateNlrDetailsControllers(middleware: Middleware[], updateAppealService: UpdateAppealService,): Router {
  const router = Router();
  router.get(paths.nonLegalRep.updateName, middleware, getNlrName);
  router.post(paths.nonLegalRep.updateName, middleware, postNlrName());
  router.get(paths.nonLegalRep.updateAddress, middleware, getNlrAddress);
  router.post(paths.nonLegalRep.updateAddress, middleware, postNlrAddress());
  router.get(paths.nonLegalRep.updateContactDetails, middleware, getNlrContactDetails);
  router.post(paths.nonLegalRep.updateContactDetails, middleware, postNlrContactDetails());
  router.get(paths.nonLegalRep.updateIsSamePerson, middleware, getSamePerson);
  router.post(paths.nonLegalRep.updateIsSamePerson, middleware, postSamePerson());
  router.get(paths.nonLegalRep.updateDetailsCheckAndSend, middleware, getUpdateNlrDetailsCheckAndSend);
  router.post(paths.nonLegalRep.updateDetailsCheckAndSend, middleware, postUpdateNlrDetailsCheckAndSend(updateAppealService));
  router.get(paths.nonLegalRep.updateDetailsConfirmation, middleware, getUpdateNlrDetailsConfirmation);
  return router;
}

export {
  setupUpdateNlrDetailsControllers,
  getNlrName,
  postNlrName,
  getNlrAddress,
  postNlrAddress,
  getNlrContactDetails,
  postNlrContactDetails,
  getSamePerson,
  postSamePerson,
  getUpdateNlrDetailsCheckAndSend,
  postUpdateNlrDetailsCheckAndSend,
  getUpdateNlrDetailsConfirmation
};
