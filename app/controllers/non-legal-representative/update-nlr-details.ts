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
      title: i18n.pages.nlrContactDetails.title,
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
          title: i18n.pages.nlrContactDetails.title,
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
      return res.redirect(paths.nonLegalRep.updateDetailsCheckAndSend);
    } catch (error) {
      next(error);
    }
  };
}

function getUpdateNlrDetailsCheckAndSend(req: Request, res: Response, next: NextFunction) {
  try {
    const editParameter = '?edit';
    const nlrDetails: NlrDetails = req.session.appeal.nlrDetails;
    const addressValues = nlrDetails.address ? Object.values(nlrDetails.address) : [];
    const summaryLists: SummaryList[] = [{
      summaryRows: [
        addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.nonLegalRepName,
          [nlrDetails?.givenNames, nlrDetails?.familyName], paths.nonLegalRep.updateName + editParameter, Delimiter.SPACE),
        addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.nonLegalRepAddress,
          [...addressValues], paths.nonLegalRep.updateAddress + editParameter, Delimiter.BREAK_LINE),
        addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.nonLegalRepEmail,
          [nlrDetails?.emailAddress], paths.nonLegalRep.updateContactDetails + editParameter),
        addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.nonLegalRepPhone,
          [nlrDetails?.phoneNumber], paths.nonLegalRep.updateContactDetails + editParameter)
      ]
    }];

    return res.render('templates/check-and-send.njk', {
      pageTitle: i18n.pages.inviteNlrToJoinAppeal.title,
      formAction: paths.nonLegalRep.updateDetailsCheckAndSend,
      previousPage: paths.nonLegalRep.updateContactDetails,
      summaryLists: summaryLists,
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
      if (nlrDetails.givenNames && nlrDetails.familyName && nlrDetails.phoneNumber && nlrDetails.address
        && nlrDetails.address?.line1 && nlrDetails.address?.city && nlrDetails.address?.postcode) {
        const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.PROVIDE_NON_LEGAL_REP_DETAILS,
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
          { key: 'address', value: nlrDetails.address },
          { key: 'addressLine1', value: nlrDetails.address?.line1 },
          { key: 'addressTownCity', value: nlrDetails.address?.city },
          { key: 'addressPostcode', value: nlrDetails.address?.postcode },
        ];

        fields.forEach(({ key, value }) => {
          if (!value) {
            validationErrors[key] = createStructuredError(
              key,
              i18n.validationErrors.nlrDetails[key]
            );
          }
        });
        const editParameter = '?edit';
        const addressValues = nlrDetails.address ? Object.values(nlrDetails.address) : [];
        const summaryLists: SummaryList[] = [{
          summaryRows: [
            addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.nonLegalRepName,
              [nlrDetails.givenNames, nlrDetails.familyName], paths.nonLegalRep.updateName + editParameter, Delimiter.SPACE),
            addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.nonLegalRepAddress,
              [...addressValues], paths.nonLegalRep.updateAddress + editParameter, Delimiter.BREAK_LINE),
            addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.nonLegalRepEmail,
              [nlrDetails.emailAddress], paths.nonLegalRep.updateContactDetails + editParameter),
            addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.nonLegalRepPhone,
              [nlrDetails.phoneNumber], paths.nonLegalRep.updateContactDetails + editParameter)
          ]
        }];
        return res.render('templates/check-and-send.njk', {
          pageTitle: i18n.pages.updateNlrDetails.title,
          formAction: paths.nonLegalRep.updateDetailsCheckAndSend,
          previousPage: paths.nonLegalRep.updateContactDetails,
          summaryLists: summaryLists,
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
      whatHappensNextContent: i18n.pages.updateNlrDetails.confirmation.title,
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
  getUpdateNlrDetailsCheckAndSend,
  postUpdateNlrDetailsCheckAndSend,
  getUpdateNlrDetailsConfirmation
};
