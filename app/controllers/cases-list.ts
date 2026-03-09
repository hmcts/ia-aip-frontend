import config from 'config';
import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../locale/en.json';
import { States } from '../data/states';
import { citizenLimiter } from '../middleware/distributedRateLimiter';
import { paths } from '../paths';
import UpdateAppealService from '../service/update-appeal-service';
import { createStructuredError } from '../utils/validations/fields-validations';
const maxDraftAppeals: number = config.get('maxDraftAppeals');

function getCasesList(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.session.refreshCasesList) {
        await updateAppealService.loadAppealsList(req);
        req.session.refreshCasesList = false;
      }

      const casesList: CaseListItem[] = req.session.casesList || [];
      const description = i18n.pages.casesList.createAppealModal.description
        .replace('{{ maxDraftAppeals }}', maxDraftAppeals.toString());
      return res.render('cases-list.njk', {
        previousPage: paths.common.overview,
        createNewAppealUrl: paths.common.createNewAppeal,
        cases: casesList,
        description
      });
    } catch (e) {
      next(e);
    }
  };
}

function getCreateNewAppeal(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const casesList: CaseListItem[] = req.session.casesList || [];
    const draftAppeals: CaseListItem[] = casesList
      .filter(appeal => appeal.state === States.APPEAL_STARTED.id);
    if (draftAppeals.length >= maxDraftAppeals) {
      const description = i18n.pages.casesList.createAppealModal.description
        .replace('{{ maxDraftAppeals }}', maxDraftAppeals.toString());
      const createNewAppealId = i18n.pages.casesList.createNewAppealId;
      const tooManyAppeals: ValidationErrors = {};
      tooManyAppeals[createNewAppealId] = createStructuredError(createNewAppealId,
        i18n.pages.casesList.tooManyDraftsError);

      return res.render('cases-list.njk', {
        previousPage: paths.common.overview,
        createNewAppealUrl: paths.common.createNewAppeal,
        cases: casesList,
        description: description,
        errors: tooManyAppeals,
        errorList: Object.values(tooManyAppeals),
      });
    }
    try {
      await updateAppealService.createNewAppeal(req);
      return res.redirect(paths.common.overview);
    } catch (e) {
      next(e);
    }
  };
}

function setupCasesListController(updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.common.casesList, getCasesList(updateAppealService));
  router.get(paths.common.createNewAppeal, citizenLimiter, getCreateNewAppeal(updateAppealService));
  return router;
}

export {
  setupCasesListController,
  getCasesList,
  getCreateNewAppeal
};
