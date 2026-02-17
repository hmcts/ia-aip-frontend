import { NextFunction, Request, Response, Router } from 'express';
import { paths } from '../paths';
import UpdateAppealService from '../service/update-appeal-service';
import { getStateName } from '../utils/utils';

function getCasesList(req: Request, res: Response, next: NextFunction) {
  try {
    const casesList = req.session.casesList || [];
    const casesWithStateName = casesList.map(caseItem => ({
      ...caseItem,
      stateName: getStateName(caseItem.state)
    }));

    return res.render('cases-list.njk', {
      previousPage: paths.common.overview,
      createNewAppealUrl: paths.common.createNewAppeal,
      cases: casesWithStateName
    });
  } catch (e) {
    next(e);
  }
}

function getCreateNewAppeal(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
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
  router.get(paths.common.casesList, getCasesList);
  router.get(paths.common.createNewAppeal, getCreateNewAppeal(updateAppealService));
  return router;
}

export {
  setupCasesListController,
  getCasesList,
  getCreateNewAppeal
};
