import config from 'config';
import { NextFunction, Request, Response, Router } from 'express';
import { States } from '../data/states';
import { citizenLimiter } from '../middleware/distributedRateLimiter';
import { paths } from '../paths';
import UpdateAppealService from '../service/update-appeal-service';
import { createStructuredError } from '../utils/validations/fields-validations';

function getCasesList(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.session.refreshCasesList) {
        await updateAppealService.loadAppealsList(req);
        req.session.refreshCasesList = false;
      }

      const casesList: CaseListItem[] = req.session.casesList || [];

      return res.render('cases-list.njk', {
        previousPage: paths.common.overview,
        createNewAppealUrl: paths.common.createNewAppeal,
        cases: casesList
      });
    } catch (e) {
      next(e);
    }
  };
}

function getCreateNewAppeal(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const maxDraftAppeals: number = config.get('maxDraftAppeals');
    const casesList: CaseListItem[] = req.session.casesList || [];
    const draftAppeals: CaseListItem[] = casesList
      .filter(appeal => appeal.state === States.APPEAL_STARTED.id);
    if (draftAppeals.length >= maxDraftAppeals) {
      const tooManyAppeals: ValidationErrors = { 'createNewAppeal': createStructuredError('createNewAppeal',
          'You have too many draft appeals. Please submit or delete them before creating a new appeal.') };
      return res.render('cases-list.njk', {
        previousPage: paths.common.overview,
        createNewAppealUrl: paths.common.createNewAppeal,
        cases: casesList,
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
