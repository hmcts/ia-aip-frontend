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
  emailValidation,
  nlrAddressValidation,
  nlrNamesValidation,
  nonLegalRepPhoneValidation
} from '../../utils/validations/fields-validations';

export enum ErrorCode {
  stepTwoNoEmailProvided = 'stepTwoNoEmailProvided',
  stepThreeNoEmailProvided = 'stepThreeNoEmailProvided',
  stepThreeNoDetailsProvided = 'stepThreeNoDetailsProvided',
  stepThreeUserNotExisting = 'stepThreeUserNotExisting',
  unknown = 'unknown',
}

function stringToErrorCode(someString: string) {
  if (Object.values(ErrorCode).includes(someString as any)) {
    return ErrorCode[someString];
  } else {
    return ErrorCode.unknown;
  }
}

function getAddNonLegalRepresentative(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.query?.errorCode) {
      const error: ErrorCode = stringToErrorCode(req.query.errorCode as string);
      let structuredError: ValidationErrors;
      const renderObject = {
        previousPage: paths.common.overview
      };
      switch (error) {
        case ErrorCode.stepTwoNoEmailProvided:
          structuredError = { 'provideNlrDetails': createStructuredError('provideNlrDetails', i18n.pages.addNonLegalRepresentative.noEmailProvidedError) };
          renderObject['shouldProvideEmailDirectionStepTwoShow'] = true;
          break;
        case ErrorCode.stepThreeNoEmailProvided:
          structuredError = { 'inviteJoinAppeal': createStructuredError('inviteJoinAppeal', i18n.pages.addNonLegalRepresentative.noEmailProvidedError) };
          renderObject['shouldProvideEmailDirectionStepThreeShow'] = true;
          break;
        case ErrorCode.stepThreeNoDetailsProvided:
          structuredError = { 'inviteJoinAppeal': createStructuredError('inviteJoinAppeal', i18n.pages.addNonLegalRepresentative.noDetailsProvidedError) };
          renderObject['shouldNoDetailsProvidedStepThreeShow'] = true;
          break;
        case ErrorCode.stepThreeUserNotExisting:
          structuredError = { 'inviteJoinAppeal': createStructuredError('inviteJoinAppeal', i18n.pages.addNonLegalRepresentative.userNotExistsError) };
          renderObject['shouldUserNotExistStepThreeShow'] = true;
          break;
        case ErrorCode.unknown:
          structuredError = { 'provideNlrDetails': createStructuredError('provideNlrDetails', i18n.pages.addNonLegalRepresentative.unknownError) };
      }
      renderObject['errors'] = structuredError;
      renderObject['errorList'] = Object.values(structuredError);
      return res.render('non-legal-rep/add-non-legal-representative.njk', renderObject);
    }
    return res.render('non-legal-rep/add-non-legal-representative.njk', {
      previousPage: paths.common.overview
    });
  } catch (error) {
    next(error);
  }
}

function getInviteToCreateAccount(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('non-legal-rep/provide-email-create-account.njk', {
      previousPage: paths.nonLegalRep.addNonLegalRep
    });
  } catch (error) {
    next(error);
  }
}

function postInviteToCreateAccount(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = emailValidation(req.body);
      if (validation) {
        return res.render('non-legal-rep/provide-email-create-account.njk', {
          nlrEmail: req.body['email-value'],
          errors: validation,
          errorList: Object.values(validation),
          previousPage: paths.nonLegalRep.addNonLegalRep
        });
      }

      const appeal: Appeal = {
        ...req.session.appeal,
        nlrDetails: {
          ...req.session.nlrDetails,
          emailAddress: req.body['email-value'],
        },
        application: {
          ...req.session.appeal.application,
          hasNonLegalRep: 'Yes'
        }
      };

      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.SEND_INVITE_TO_NON_LEGAL_REP, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      return res.redirect(paths.nonLegalRep.inviteToCreateAccountConfirmation);
    } catch (error) {
      next(error);
    }
  };
}

function getInviteToCreateAccountConfirmation(req: Request, res: Response, next: NextFunction) {
  try {
    res.render('templates/confirmation-page.njk', {
      title: i18n.pages.inviteNlrToCreateAccount.confirmation.title,
      whatNextListItems: i18n.pages.inviteNlrToCreateAccount.confirmation.whatNextListItems,
      nlrEmail: req.session.appeal?.nlrDetails?.emailAddress,
      backToAddNlr: true
    });
  } catch (e) {
    next(e);
  }
}

function getNlrName(req: Request, res: Response, next: NextFunction) {
  try {

    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    const nlrDetails = req.session?.appeal?.nlrDetails;
    if (!nlrDetails?.emailAddress) {
      return res.redirect(`${paths.nonLegalRep.addNonLegalRep}?errorCode=${ErrorCode.stepTwoNoEmailProvided}`);
    }
    const nlrGivenNames = nlrDetails?.givenNames;
    const nlrFamilyName = nlrDetails?.familyName;
    return res.render('appeal-application/non-legal-rep-details/name.njk', {
      postAction: paths.nonLegalRep.provideNlrName,
      nlrGivenNames,
      nlrFamilyName,
      previousPage: paths.nonLegalRep.addNonLegalRep
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
          postAction: paths.nonLegalRep.provideNlrName,
          nlrGivenNames: req.body.nlrGivenNames,
          nlrFamilyName: req.body.nlrFamilyName,
          error: validation,
          errorList: Object.values(validation),
          previousPage: paths.nonLegalRep.addNonLegalRep
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
      const redirectPage = getRedirectPage(editingMode, paths.nonLegalRep.provideNlrDetailsCheckAndSend, false, paths.nonLegalRep.provideNlrAddress);
      return res.redirect(redirectPage);
    } catch (e) {
      next(e);
    }
  };
}

function getNlrAddress(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    const address = req.session.appeal?.nlrDetails?.address;
    res.render('appeal-application/non-legal-rep-details/address.njk', {
      postAction: paths.nonLegalRep.provideNlrAddress,
      address,
      previousPage: paths.nonLegalRep.provideNlrName
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
          postAction: paths.nonLegalRep.provideNlrAddress,
          nlrAddress: {
            line1: req.body['address-line-1'],
            line2: req.body['address-line-2'],
            city: req.body['address-town'],
            county: req.body['address-county'],
            postcode: req.body['address-postcode']
          },
          error: validation,
          errorList: Object.values(validation),
          previousPage: paths.nonLegalRep.provideNlrName
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
      const redirectPage = getRedirectPage(editingMode, paths.nonLegalRep.provideNlrDetailsCheckAndSend, false, paths.nonLegalRep.provideNlrPhoneNumber);
      return res.redirect(redirectPage);
    } catch (e) {
      next(e);
    }
  };
}

function getNlrPhoneNumber(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    const phoneNumber = req.session.appeal?.nlrDetails?.phoneNumber;
    return res.render('appeal-application/non-legal-rep-details/contact-details.njk', {
      title: i18n.pages.nlrPhoneNumber.title,
      hint: i18n.pages.nlrPhoneNumber.hint,
      postAction: paths.nonLegalRep.provideNlrPhoneNumber,
      showEmail: false,
      phoneNumber,
      previousPage: paths.nonLegalRep.provideNlrAddress
    });
  } catch (error) {
    next(error);
  }
}

function postNlrPhoneNumber() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = nonLegalRepPhoneValidation(req.body);
      if (validation) {
        return res.render('appeal-application/non-legal-rep-details/contact-details.njk', {
          title: i18n.pages.nlrPhoneNumber.title,
          hint: i18n.pages.nlrPhoneNumber.hint,
          postAction: paths.nonLegalRep.provideNlrPhoneNumber,
          showEmail: false,
          phoneNumber: req.body['phoneNumber'],
          errors: validation,
          errorList: Object.values(validation),
          previousPage: paths.nonLegalRep.provideNlrAddress
        });
      }

      req.session.appeal = {
        ...req.session.appeal,
        nlrDetails: {
          ...req.session.appeal.nlrDetails,
          phoneNumber: req.body['phoneNumber']
        }
      };

      return res.redirect(paths.nonLegalRep.provideNlrDetailsCheckAndSend);
    } catch (error) {
      next(error);
    }
  };
}

function getCheckAndSend(req: Request, res: Response, next: NextFunction) {
  try {
    const editParameter = '?edit';
    const nlrDetails: NlrDetails = req.session.appeal.nlrDetails;
    const summaryLists: SummaryList[] = [{
      summaryRows: [
        addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.nonLegalRepName,
          [nlrDetails.givenNames, nlrDetails.familyName], paths.nonLegalRep.provideNlrName + editParameter, Delimiter.SPACE),
        addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.nonLegalRepAddress,
          [...Object.values(nlrDetails.address)], paths.nonLegalRep.provideNlrAddress + editParameter, Delimiter.BREAK_LINE),
        addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.nonLegalRepPhone,
          [nlrDetails.phoneNumber], paths.nonLegalRep.provideNlrPhoneNumber + editParameter)
      ]
    }];

    return res.render('templates/check-and-send.njk', {
      pageTitle: i18n.pages.inviteNlrToJoinAppeal.title,
      formAction: paths.nonLegalRep.provideNlrDetailsCheckAndSend,
      previousPage: paths.nonLegalRep.provideNlrPhoneNumber,
      summaryLists: summaryLists,
      noSaveForLater: true
    });
  } catch (e) {
    next(e);
  }
}

function postCheckAndSend(updateAppealService: UpdateAppealService) {
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
        return res.redirect(paths.nonLegalRep.provideNlrDetailsConfirmation);
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
        const summaryLists: SummaryList[] = [{
          summaryRows: [
            addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.nonLegalRepName,
              [nlrDetails.givenNames, nlrDetails.familyName], paths.nonLegalRep.provideNlrName + editParameter, Delimiter.SPACE),
            addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.nonLegalRepAddress,
              [...Object.values(nlrDetails.address)], paths.nonLegalRep.provideNlrAddress + editParameter, Delimiter.BREAK_LINE),
            addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.nonLegalRepPhone,
              [nlrDetails.phoneNumber], paths.nonLegalRep.provideNlrPhoneNumber + editParameter)
          ]
        }];
        return res.render('templates/check-and-send.njk', {
          pageTitle: i18n.pages.provideNlrDetails.title,
          formAction: paths.nonLegalRep.provideNlrDetailsCheckAndSend,
          previousPage: paths.nonLegalRep.provideNlrPhoneNumber,
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

function getProvideNlrDetailsConfirmation(req: Request, res: Response, next: NextFunction) {
  try {
    res.render('templates/confirmation-page.njk', {
      title: i18n.pages.provideNlrDetails.confirmation.title,
      whatNextContent: i18n.pages.provideNlrDetails.confirmation.whatNextContent,
      backToAddNlr: true
    });
  } catch (e) {
    next(e);
  }
}

function postInviteToJoinAppeal(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const nlrDetails = req.session?.appeal?.nlrDetails;
      if (!nlrDetails?.emailAddress) {
        return res.redirect(`${paths.nonLegalRep.addNonLegalRep}?errorCode=${ErrorCode.stepThreeNoEmailProvided}`);
      }

      const missingDetails = [
        nlrDetails?.givenNames,
        nlrDetails?.familyName,
        nlrDetails?.phoneNumber,
        nlrDetails?.address,
        nlrDetails?.address?.line1,
        nlrDetails?.address?.city,
        nlrDetails?.address?.postcode,
      ].filter(value => !value);

      if (missingDetails.length > 0) {
        return res.redirect(`${paths.nonLegalRep.addNonLegalRep}?errorCode=${ErrorCode.stepThreeNoDetailsProvided}`);
      }
      const pageIds: string[] = ['sendPipToNonLegalRepsendPipToNonLegalRep'];
      const midEventData = updateAppealService.mapToCCDCaseNlrDetails(req.session.appeal, {});
      const midEventErrors = await updateAppealService.validateMidEvent(Events.SEND_PIP_TO_NON_LEGAL_REP, pageIds, req.session.appeal, midEventData, req.idam.userDetails.uid, req.cookies['__auth-token']);
      if (midEventErrors?.length > 0) {
        return res.redirect(`${paths.nonLegalRep.addNonLegalRep}?errorCode=${ErrorCode.stepThreeUserNotExisting}`);
      }
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.SEND_PIP_TO_NON_LEGAL_REP,
        req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };

      return res.redirect(paths.nonLegalRep.inviteToJoinAppealConfirmation);
    } catch (error) {
      next(error);
    }
  };
}

function getInviteToJoinAppealConfirmation(req: Request, res: Response, next: NextFunction) {
  try {
    res.render('templates/confirmation-page.njk', {
      title: i18n.pages.inviteNlrToJoinAppeal.confirmation.title,
      whatNextListItems: i18n.pages.inviteNlrToJoinAppeal.confirmation.whatNextListItems,
      nlrEmail: req.session.appeal?.nlrDetails?.emailAddress
    });
  } catch (e) {
    next(e);
  }
}

function setupNonLegalRepresentativeControllers(middleware: Middleware[], updateAppealService: UpdateAppealService,): Router {
  const router = Router();
  router.get(paths.nonLegalRep.addNonLegalRep, middleware, getAddNonLegalRepresentative);
  router.get(paths.nonLegalRep.inviteToCreateAccount, middleware, getInviteToCreateAccount);
  router.post(paths.nonLegalRep.inviteToCreateAccount, middleware, postInviteToCreateAccount(updateAppealService));
  router.get(paths.nonLegalRep.inviteToCreateAccountConfirmation, middleware, getInviteToCreateAccountConfirmation);
  router.get(paths.nonLegalRep.provideNlrName, middleware, getNlrName);
  router.post(paths.nonLegalRep.provideNlrName, middleware, postNlrName());
  router.get(paths.nonLegalRep.provideNlrAddress, middleware, getNlrAddress);
  router.post(paths.nonLegalRep.provideNlrAddress, middleware, postNlrAddress());
  router.get(paths.nonLegalRep.provideNlrPhoneNumber, middleware, getNlrPhoneNumber);
  router.post(paths.nonLegalRep.provideNlrPhoneNumber, middleware, postNlrPhoneNumber());
  router.get(paths.nonLegalRep.provideNlrDetailsCheckAndSend, middleware, getCheckAndSend);
  router.post(paths.nonLegalRep.provideNlrDetailsCheckAndSend, middleware, postCheckAndSend(updateAppealService));
  router.get(paths.nonLegalRep.provideNlrDetailsConfirmation, middleware, getProvideNlrDetailsConfirmation);
  router.post(paths.nonLegalRep.inviteToJoinAppeal, middleware, postInviteToJoinAppeal(updateAppealService));
  router.get(paths.nonLegalRep.inviteToJoinAppealConfirmation, middleware, getInviteToJoinAppealConfirmation);

  return router;
}

export {
  setupNonLegalRepresentativeControllers,
  getAddNonLegalRepresentative,
  getInviteToCreateAccount,
  postInviteToCreateAccount,
  getInviteToCreateAccountConfirmation,
  getNlrName,
  postNlrName,
  getNlrAddress,
  postNlrAddress,
  getNlrPhoneNumber,
  postNlrPhoneNumber,
  getCheckAndSend,
  postCheckAndSend,
  getProvideNlrDetailsConfirmation,
  postInviteToJoinAppeal,
  getInviteToJoinAppealConfirmation
};
