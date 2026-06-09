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
  isSamePersonValidation,
  nlrAddressValidation,
  nlrNamesValidation,
  nonLegalRepPhoneValidation,
  textAreaValidation
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

interface RenderObject {
  previousPage: string;
  partTwoRedirect: string;
  shouldProvideEmailDirectionStepTwoShow?: boolean;
  shouldProvideEmailDirectionStepThreeShow?: boolean;
  shouldNoDetailsProvidedStepThreeShow?: boolean;
  shouldUserNotExistStepThreeShow?: boolean;
  errors?: ValidationErrors;
  errorList?: ValidationError[];
}

function getAddNonLegalRepresentative(req: Request, res: Response, next: NextFunction) {
  try {
    const hasSponsor = req.session.appeal?.application?.hasSponsor == 'Yes';
    const renderObject: RenderObject = {
      previousPage: paths.common.overview,
      partTwoRedirect: hasSponsor ? paths.nonLegalRep.provideNlrIsSamePerson : paths.nonLegalRep.provideNlrName
    };
    if (req.query?.errorCode) {
      const error: ErrorCode = stringToErrorCode(req.query.errorCode as string);
      let structuredError: ValidationErrors;
      switch (error) {
        case ErrorCode.stepTwoNoEmailProvided:
          structuredError = { 'provideNlrDetails': createStructuredError('provideNlrDetails', i18n.pages.addNonLegalRepresentative.noEmailProvidedError) };
          renderObject.shouldProvideEmailDirectionStepTwoShow = true;
          break;
        case ErrorCode.stepThreeNoEmailProvided:
          structuredError = { 'inviteJoinAppeal': createStructuredError('inviteJoinAppeal', i18n.pages.addNonLegalRepresentative.noEmailProvidedError) };
          renderObject.shouldProvideEmailDirectionStepThreeShow = true;
          break;
        case ErrorCode.stepThreeNoDetailsProvided:
          structuredError = { 'inviteJoinAppeal': createStructuredError('inviteJoinAppeal', i18n.pages.addNonLegalRepresentative.noDetailsProvidedError) };
          renderObject.shouldNoDetailsProvidedStepThreeShow = true;
          break;
        case ErrorCode.stepThreeUserNotExisting:
          structuredError = { 'inviteJoinAppeal': createStructuredError('inviteJoinAppeal', i18n.pages.addNonLegalRepresentative.userNotExistsError) };
          renderObject.shouldUserNotExistStepThreeShow = true;
          break;
        case ErrorCode.unknown:
          structuredError = { 'provideNlrDetails': createStructuredError('provideNlrDetails', i18n.pages.addNonLegalRepresentative.unknownError) };
      }
      renderObject.errors = structuredError;
      renderObject.errorList = Object.values(structuredError);
    }
    return res.render('non-legal-rep/add-non-legal-representative.njk', renderObject);
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

      const currentIdamEmail = req.idam.userDetails.sub;
      const appellantContactEmail = req.session.appeal?.application?.contactDetails?.email;
      if (currentIdamEmail === req.body['email-value'] || appellantContactEmail === req.body['email-value']) {
        const structuredError = createStructuredError('email-value', i18n.validationErrors.nlrDetails.nlrEmailCannotBeSameAsAppellant);
        return res.render('non-legal-rep/provide-email-create-account.njk', {
          nlrEmail: req.body['email-value'],
          errors: { 'email-value': structuredError },
          errorList: [structuredError],
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
        ...appeal,
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

function getSamePerson(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    const nlrDetails = req.session?.appeal?.nlrDetails;
    if (!nlrDetails?.emailAddress) {
      return res.redirect(`${paths.nonLegalRep.addNonLegalRep}?errorCode=${ErrorCode.stepTwoNoEmailProvided}`);
    }
    const application = req.session.appeal.application;
    const isSponsorSameAsNlr = application.isSponsorSameAsNlr;
    return res.render('appeal-application/sponsor-details/is-same-person.njk', {
      question: i18n.pages.isSponsorSameAsNlr.title,
      previousPage: paths.nonLegalRep.addNonLegalRep,
      formAction: paths.nonLegalRep.provideNlrIsSamePerson,
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
          question: i18n.pages.isSponsorSameAsNlr.title,
          previousPage: paths.nonLegalRep.addNonLegalRep,
          isSponsorSameAsNlr: application.isSponsorSameAsNlr,
          formAction: paths.nonLegalRep.provideNlrIsSamePerson,
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
      const editingMode: boolean = req.session.appeal.application.isEdit || false;
      const redirectPage = getRedirectPage(editingMode, paths.nonLegalRep.provideNlrDetailsCheckAndSend, false, paths.nonLegalRep.provideNlrName);
      return res.redirect(redirectPage);
    } catch (error) {
      next(error);
    }
  };
}

function isSponsorSame(req: Request): boolean {
  return req.session.appeal.application?.hasSponsor === 'Yes' && req.session.appeal.application?.isSponsorSameAsNlr === 'Yes';
}

function getNlrName(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    const isSponsorSameAsNlr = isSponsorSame(req);
    const nlrDetails = req.session?.appeal?.nlrDetails;
    if (!nlrDetails?.emailAddress) {
      return res.redirect(`${paths.nonLegalRep.addNonLegalRep}?errorCode=${ErrorCode.stepTwoNoEmailProvided}`);
    }
    const nlrGivenNames = nlrDetails?.givenNames || (isSponsorSameAsNlr ? req.session.appeal?.application?.sponsorGivenNames : '');
    const nlrFamilyName = nlrDetails?.familyName || (isSponsorSameAsNlr ? req.session.appeal?.application?.sponsorFamilyName : '');
    return res.render('appeal-application/non-legal-rep-details/name.njk', {
      postAction: paths.nonLegalRep.provideNlrName,
      nlrGivenNames,
      nlrFamilyName,
      previousPage: req.session.appeal.application?.hasSponsor === 'Yes'
        ? paths.nonLegalRep.provideNlrIsSamePerson : paths.nonLegalRep.addNonLegalRep
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
          previousPage: isSponsorSame(req) ? paths.nonLegalRep.provideNlrIsSamePerson : paths.nonLegalRep.addNonLegalRep
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

function getNlrAddressRenderObject(isSponsorSameAsNlr: boolean, req: Request): any {
  const renderObj: any = {
    previousPage: paths.nonLegalRep.provideNlrName,
    formAction: paths.nonLegalRep.provideNlrAddress,
    pageTitle: i18n.pages.nlrAddress.title
  };
  if (isSponsorSameAsNlr) {
    renderObj.address = req.session.appeal?.nlrDetails?.addressUk
      || req.session.appeal?.application?.sponsorAddress;
  } else {
    renderObj.question = {
      name: 'nlr-address',
      title: i18n.pages.nlrAddress.title,
      description: i18n.pages.nlrAddress.description,
      value: req.session.appeal?.nlrDetails?.address || ''
    };
  }
  return renderObj;
}

function getNlrAddress(req: Request, res: Response, next: NextFunction) {
  try {
    req.session.appeal.application.isEdit = _.has(req.query, 'edit');
    const isSponsorSameAsNlr = isSponsorSame(req);
    const renderPath = isSponsorSameAsNlr ? 'appeal-application/non-legal-rep-details/address.njk'
      : 'templates/textarea-question-page.njk';
    const renderObj = getNlrAddressRenderObject(isSponsorSameAsNlr, req);
    return res.render(renderPath, renderObj);
  } catch (e) {
    next(e);
  }
}

function postNlrAddress() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isSponsorSameAsNlr = isSponsorSame(req);
      const validation = isSponsorSameAsNlr ? nlrAddressValidation(req.body)
        : textAreaValidation(req.body['nlr-address'], 'nlr-address', i18n.validationErrors.nlrDetails.address);
      if (validation !== null) {
        const renderPath = isSponsorSameAsNlr ? 'appeal-application/non-legal-rep-details/address.njk'
          : 'templates/textarea-question-page.njk';
        const renderObj = getNlrAddressRenderObject(isSponsorSameAsNlr, req);
        renderObj.error = validation;
        renderObj.errorList = Object.values(validation);
        return res.render(renderPath, renderObj);
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

function getSummaryRows(req: Request) {
  const editParameter = '?edit';
  const nlrDetails: NlrDetails = req.session.appeal.nlrDetails;
  const isSponsorSameAsNlr = isSponsorSame(req);
  const nlrAddressUk = nlrDetails.addressUk ? Object.values(nlrDetails.addressUk) : [];
  const nlrAddress: string = nlrDetails.address;
  const hasSponsor: boolean = req.session.appeal?.application?.hasSponsor == 'Yes';
  const nlrAddressValues = isSponsorSameAsNlr ? [...nlrAddressUk] : nlrAddress.split('\n');
  const summaryRows: SummaryRow[] = [
    addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.nonLegalRepName,
      [nlrDetails.givenNames, nlrDetails.familyName], paths.nonLegalRep.provideNlrName + editParameter, Delimiter.SPACE),
    addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.nonLegalRepAddress,
      nlrAddressValues, paths.nonLegalRep.provideNlrAddress + editParameter, Delimiter.BREAK_LINE),
    addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.nonLegalRepPhone,
      [nlrDetails.phoneNumber], paths.nonLegalRep.provideNlrPhoneNumber + editParameter)];
  if (hasSponsor) {
    summaryRows.push(addSummaryRow(i18n.pages.checkYourAnswers.rowTitles.isSponsorSameAsNlr,
      [req.session.appeal?.application?.isSponsorSameAsNlr], paths.nonLegalRep.provideNlrIsSamePerson + editParameter));
  }
  return summaryRows;
}

function getCheckAndSend(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('templates/check-and-send.njk', {
      pageTitle: i18n.pages.inviteNlrToJoinAppeal.title,
      formAction: paths.nonLegalRep.provideNlrDetailsCheckAndSend,
      previousPage: paths.nonLegalRep.provideNlrPhoneNumber,
      summaryLists: [{ summaryRows: getSummaryRows(req) }],
      noSaveForLater: true
    });
  } catch (e) {
    next(e);
  }
}

function postCheckAndSend(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const nlrDetails = req.session.appeal?.nlrDetails;
      const isSponsorSameAsNlr = isSponsorSame(req);
      const address = nlrDetails?.address;
      const addressUk = nlrDetails?.addressUk;

      const baseValid =
        !!nlrDetails?.givenNames &&
        !!nlrDetails?.familyName &&
        !!nlrDetails?.phoneNumber;

      const addressValid = isSponsorSameAsNlr ? !!addressUk?.line1 && !!addressUk?.city && !!addressUk?.postcode
        : !!address;

      if (baseValid && addressValid) {
        const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.PROVIDE_NON_LEGAL_REP_DETAILS,
          req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
        req.session.appeal = {
          ...req.session.appeal,
          ...appealUpdated
        };
        return res.redirect(paths.nonLegalRep.provideNlrDetailsConfirmation);
      } else {
        const validationErrors = {};

        const fields: { key: string, value: string | Address }[] = [
          { key: 'givenNames', value: nlrDetails.givenNames },
          { key: 'familyName', value: nlrDetails.familyName },
          { key: 'phoneNumber', value: nlrDetails.phoneNumber }
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
              i18n.validationErrors.nlrDetails[key]
            );
          }
        });

        return res.render('templates/check-and-send.njk', {
          pageTitle: i18n.pages.provideNlrDetails.title,
          formAction: paths.nonLegalRep.provideNlrDetailsCheckAndSend,
          previousPage: paths.nonLegalRep.provideNlrPhoneNumber,
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

      const details = [
        nlrDetails?.givenNames,
        nlrDetails?.familyName,
        nlrDetails?.phoneNumber,
        // nlrDetails?.address
      ];


      // TODO fix
      // const address = nlrDetails?.address;
      // const isAddress = isAddressTypeAddress(address);
      //
      // if (isAddress) {
      //   details.push(address?.line1, address?.city, address?.postcode);
      // }
      // console.log(nlrDetails)
      const missingDetails = details.filter(value => !value);

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

function isAddressTypeAddress(addr: string | Address | undefined): addr is Address {
  return typeof addr === 'object' && addr !== null;
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
  router.get(paths.nonLegalRep.provideNlrIsSamePerson, middleware, getSamePerson);
  router.post(paths.nonLegalRep.provideNlrIsSamePerson, middleware, postSamePerson());
  router.get(paths.nonLegalRep.provideNlrDetailsCheckAndSend, middleware, getCheckAndSend);
  router.post(paths.nonLegalRep.provideNlrDetailsCheckAndSend, middleware, postCheckAndSend(updateAppealService));
  router.get(paths.nonLegalRep.provideNlrDetailsConfirmation, middleware, getProvideNlrDetailsConfirmation);
  router.post(paths.nonLegalRep.inviteToJoinAppeal, middleware, postInviteToJoinAppeal(updateAppealService));
  router.get(paths.nonLegalRep.inviteToJoinAppealConfirmation, middleware, getInviteToJoinAppealConfirmation);

  return router;
}

export {
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
  getSamePerson,
  postSamePerson,
  getCheckAndSend,
  postCheckAndSend,
  getProvideNlrDetailsConfirmation,
  postInviteToJoinAppeal,
  getInviteToJoinAppealConfirmation,
  setupNonLegalRepresentativeControllers
};
