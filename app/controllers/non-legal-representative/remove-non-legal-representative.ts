import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import UpdateAppealService from '../../service/update-appeal-service';
import { statementValidation } from '../../utils/validations/fields-validations';

function getRemoveNonLegalRepresentative(req: Request, res: Response, next: NextFunction) {
  try {
    const isNlr = req.session.isNonLegalRep;
    return res.render('non-legal-rep/remove-non-legal-representative.njk', {
      title: isNlr ? i18n.pages.removeNonLegalRepresentative.titlePersonal : i18n.pages.removeNonLegalRepresentative.title,
      paragraphOne: isNlr ? i18n.pages.removeNonLegalRepresentative.paragraphOnePersonal
        : i18n.pages.removeNonLegalRepresentative.paragraphOne,
      paragraphTwo: isNlr ? null : i18n.pages.removeNonLegalRepresentative.paragraphTwo,
      agreement: isNlr ? i18n.pages.removeNonLegalRepresentative.agreementPersonal : i18n.pages.removeNonLegalRepresentative.agreement
    });
  } catch (error) {
    next(error);
  }
}

function postRemoveNonLegalRepresentative(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isNlr = req.session.isNonLegalRep;
      const validation = statementValidation(req.body, isNlr ? i18n.validationErrors.removeNlrSelfAgreement
        : i18n.validationErrors.removeNlrAgreement);
      if (validation) {
        return res.render('non-legal-rep/remove-non-legal-representative.njk', {
          title: isNlr ? i18n.pages.removeNonLegalRepresentative.titlePersonal : i18n.pages.removeNonLegalRepresentative.title,
          paragraphOne: isNlr ? i18n.pages.removeNonLegalRepresentative.paragraphOnePersonal
            : i18n.pages.removeNonLegalRepresentative.paragraphOne,
          paragraphTwo: isNlr ? null : i18n.pages.removeNonLegalRepresentative.paragraphTwo,
          errors: validation,
          errorList: Object.values(validation)
        });
      }
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(
        isNlr ? Events.REMOVE_NON_LEGAL_REP_SELF : Events.REMOVE_NON_LEGAL_REP,
        req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.refreshCasesList = true;
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      return res.redirect(paths.nonLegalRep.removeNonLegalRepConfirmation);
    } catch (error) {
      next(error);
    }
  };
}

function getRemoveNonLegalRepresentativeConfirmation(req: Request, res: Response, next: NextFunction) {
  try {
    const isNlr = req.session.isNonLegalRep;
    res.render('templates/confirmation-page.njk', {
      title: isNlr ? i18n.pages.removeNonLegalRepresentative.confirmation.titlePersonal
        : i18n.pages.removeNonLegalRepresentative.confirmation.title,
      whatNextListItems: isNlr ? i18n.pages.removeNonLegalRepresentative.confirmation.whatNextListItemsPersonal
        : i18n.pages.removeNonLegalRepresentative.confirmation.whatNextListItems,
      backToCasesList: isNlr
    });
  } catch (e) {
    next(e);
  }
}

function setupRemoveNonLegalRepresentativeControllers(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.nonLegalRep.removeNonLegalRep, middleware, getRemoveNonLegalRepresentative);
  router.post(paths.nonLegalRep.removeNonLegalRep, middleware, postRemoveNonLegalRepresentative(updateAppealService));
  router.get(paths.nonLegalRep.removeNonLegalRepConfirmation, middleware, getRemoveNonLegalRepresentativeConfirmation);

  return router;
}

export {
  getRemoveNonLegalRepresentative,
  postRemoveNonLegalRepresentative,
  getRemoveNonLegalRepresentativeConfirmation,
  setupRemoveNonLegalRepresentativeControllers
};
