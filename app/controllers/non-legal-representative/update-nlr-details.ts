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
  nonLegalRepContactDetailsValidation
} from '../../utils/validations/fields-validations';

function getNlrName(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    const nlrDetails = req.session?.appeal?.nlrDetails;
    const nlrGivenNames = nlrDetails?.givenNames;
    const nlrFamilyName = nlrDetails?.familyName;
    return res.render('appeal-application/non-legal-rep-details/name.njk', {
      title: i18n.pages.nlrName.titlePersonal,
      postAction: paths.nonLegalRep.updateName,
      nlrGivenNames,
      nlrFamilyName,
      previousPage: paths.common.overview
    });
  } catch (e) {
    next(e);
  }
}

function postNlrName() {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const validation = nlrNamesValidation(req.body);
      if (validation) {
        return res.render('appeal-application/non-legal-rep-details/name.njk', {
          title: i18n.pages.nlrName.titlePersonal,
          postAction: paths.nonLegalRep.updateName,
          nlrGivenNames: req.body.nlrGivenNames,
          nlrFamilyName: req.body.nlrFamilyName,
          error: validation,
          errorList: Object.values(validation),
          previousPage: paths.common.overview
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
    const address: Address = req.session.appeal?.nlrDetails?.address;
    res.render('appeal-application/non-legal-rep-details/address.njk', {
      title: i18n.pages.nlrAddress.titlePersonal,
      postAction: paths.nonLegalRep.updateAddress,
      address,
      previousPage: paths.nonLegalRep.updateName
    });
  } catch (e) {
    next(e);
  }
}

function postNlrAddress() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = nlrAddressValidation(req.body);
      if (validation !== null) {
        return res.render('appeal-application/non-legal-rep-details/address.njk', {
          title: i18n.pages.nlrAddress.titlePersonal,
          postAction: paths.nonLegalRep.updateAddress,
          nlrAddress: {
            line1: req.body['address-line-1'],
            line2: req.body['address-line-2'],
            city: req.body['address-town'],
            county: req.body['address-county'],
            postcode: req.body['address-postcode']
          },
          error: validation,
          errorList: Object.values(validation),
          previousPage: paths.nonLegalRep.updateName
        });
      }

      req.session.appeal = {
        ...req.session.appeal,
        nlrDetails: {
          ...req.session.appeal.nlrDetails,
          address: {
            line1: req.body['address-line-1'],
            line2: req.body['address-line-2'],
            city: req.body['address-town'],
            county: req.body['address-county'],
            postcode: req.body['address-postcode']
          }
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
      postAction: paths.nonLegalRep.updateContactDetails,
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
          postAction: paths.nonLegalRep.updateContactDetails,
          emailAddress: req.body['emailAddress'],
          phoneNumber: req.body['phoneNumber'],
          errors: validation,
          errorList: Object.values(validation),
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
      const hasSponsor: boolean = req.session.appeal?.application?.hasSponsor == 'Yes';
      return res.redirect(hasSponsor ? paths.nonLegalRep.updateIsSamePerson : paths.nonLegalRep.updateDetailsCheckAndSend);
    } catch (error) {
      next(error);
    }
  };
}

function getSamePerson(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    const application = req.session.appeal.application;
    const isSponsorSameAsNlr = application.isSponsorSameAsNlr;
    return res.render('appeal-application/sponsor-details/is-same-person.njk', {
      question: i18n.pages.isSponsorSameAsNlr.titlePersonal,
      previousPage: paths.nonLegalRep.updateContactDetails,
      isSponsorSameAsNlr: isSponsorSameAsNlr
    });
  } catch (error) {
    next(error);
  }
}

function postSamePerson() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = isSamePersonValidation(req.body);

      const application = req.session.appeal.application;

      if (validation) {
        return res.render('appeal-application/sponsor-details/is-same-person.njk', {
          question: i18n.pages.isSponsorSameAsNlr.titlePersonal,
          previousPage: paths.nonLegalRep.updateContactDetails,
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

      return res.redirect(paths.nonLegalRep.updateDetailsCheckAndSend);
    } catch (error) {
      next(error);
    }
  };
}

function getSummaryRows(req) {
  const editParameter = '?edit';
  const nlrDetails: NlrDetails = req.session.appeal.nlrDetails;
  const addressValues = nlrDetails.address ? Object.values(nlrDetails.address) : [];
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
      const nlrDetails: NlrDetails = req.session.appeal?.nlrDetails;
      if (nlrDetails.givenNames && nlrDetails.familyName && nlrDetails.phoneNumber && nlrDetails?.address?.line1
        && nlrDetails?.address?.city && nlrDetails?.address?.postcode && nlrDetails.emailAddress) {
        const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.NLR_DETAILS_UPDATED,
          req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
        req.session.appeal = {
          ...req.session.appeal,
          ...appealUpdated
        };
        return res.redirect(paths.nonLegalRep.updateDetailsConfirmation);
      } else {
        const validationErrors = {};

        const fields = [
          { key: 'givenNames', value: nlrDetails.givenNames },
          { key: 'familyName', value: nlrDetails.familyName },
          { key: 'phoneNumber', value: nlrDetails.phoneNumber },
          { key: 'emailAddress', value: nlrDetails.emailAddress },
          { key: 'address', value: nlrDetails.address },
          { key: 'addressLine1', value: nlrDetails.address?.line1 },
          { key: 'addressTownCity', value: nlrDetails.address?.city },
          { key: 'addressPostcode', value: nlrDetails.address?.postcode },
        ];

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
      whatHappensNextContent: i18n.pages.updateNlrDetails.confirmation.whatHappensNextContent,
    });
  } catch (e) {
    next(e);
  }
}

function setupNlrUpdatePhoneNumberControllers(middleware: Middleware[], updateAppealService: UpdateAppealService,): Router {
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
  setupNlrUpdatePhoneNumberControllers,
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
