import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import { DocmosisService } from '../../service/docmosis-service';
import UpdateAppealService from '../../service/update-appeal-service';
import { createStructuredError, emailAddressValidation } from '../../utils/validations/fields-validations';

const docmosis: DocmosisService = new DocmosisService();

function getAddNonLegalRepresentative(req: Request, res: Response, next: NextFunction) {
  try {
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
      const validation = emailAddressValidation(req.body);
      if (validation) {
        return res.render('non-legal-rep/provide-email-create-account.njk', {
          nlrEmail: req.body['emailAddress'],
          errors: validation,
          errorList: Object.values(validation),
          previousPage: paths.nonLegalRep.addNonLegalRep
        });
      }

      const appeal: Appeal = {
        ...req.session.appeal,
        nlrEmail: req.body['emailAddress']
      };
      Object.assign(req.session.appeal, { nlrEmail: appeal.nlrEmail });
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
      nlrEmail: req.session.appeal?.nlrEmail
    });
  } catch (e) {
    next(e);
  }
}

function getInviteToJoinAppeal(req: Request, res: Response, next: NextFunction) {
  try {
    return res.render('non-legal-rep/provide-email-join-appeal.njk', {
      previousPage: paths.nonLegalRep.addNonLegalRep
    });
  } catch (error) {
    next(error);
  }
}

function postInviteToJoinAppeal(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validation = emailAddressValidation(req.body);
      if (validation) {
        return res.render('non-legal-rep/provide-email-join-appeal.njk', {
          nlrEmail: req.body['emailAddress'],
          errors: validation,
          errorList: Object.values(validation),
          previousPage: paths.nonLegalRep.addNonLegalRep
        });
      }

      const appeal: Appeal = {
        ...req.session.appeal,
        nlrEmail: req.body['emailAddress']
      };
      const pageIds: string[] = ['sendPipToNonLegalRepsendPipToNonLegalRep'];
      const midEventData = {
        nlrEmail: req.body['emailAddress']
      };
      const midEventErrors = await updateAppealService.validateMidEvent(Events.SEND_PIP_TO_NON_LEGAL_REP, pageIds, appeal, midEventData, req.idam.userDetails.uid, req.cookies['__auth-token']);
      if (midEventErrors?.length > 0) {
        const errorMsg = i18n.pages.inviteNlrToJoinAppeal.userNotExistsError;
        return res.render('non-legal-rep/provide-email-join-appeal.njk', {
          nlrEmail: req.body['emailAddress'],
          shouldAdviceShow: true,
          errorList: [createStructuredError('emailAddress', errorMsg)],
          previousPage: paths.nonLegalRep.addNonLegalRep
        });
      }
      const appealUpdated: Appeal = await updateAppealService.submitEventWithMidEvents(Events.SEND_PIP_TO_NON_LEGAL_REP, appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      req.session.appeal.nlrEmail = appeal.nlrEmail;
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
      nlrEmail: req.session.appeal?.nlrEmail
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
  router.get(paths.nonLegalRep.inviteToJoinAppeal, middleware, getInviteToJoinAppeal);
  router.post(paths.nonLegalRep.inviteToJoinAppeal, middleware, postInviteToJoinAppeal(updateAppealService));
  router.get(paths.nonLegalRep.inviteToJoinAppealConfirmation, middleware, getInviteToJoinAppealConfirmation);
  return router;
}

export {
  setupNonLegalRepresentativeControllers
};
