import config from 'config';
import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../locale/en.json';
import { States } from '../data/states';
import { citizenLimiter } from '../middleware/distributedRateLimiter';
import { paths } from '../paths';
import UpdateAppealService from '../service/update-appeal-service';
import Logger, { getLogLabel } from '../utils/logger';
import { createStructuredError } from '../utils/validations/fields-validations';

const maxDraftAppeals: number = config.get('maxDraftAppeals');
const createAppealModalDescription = i18n.pages.casesList.createAppealModal.description
  .replace('{{ maxDraftAppeals }}', maxDraftAppeals.toString());
const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

export enum ErrorCode {
  tooManyDrafts = 'tooManyDrafts',
  deleteDraftError = 'deleteDraftError',
  caseNotFound = 'caseNotFound'
}

function getCasesList(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.session.refreshCasesList) {
        await updateAppealService.loadAppealsList(req);
        req.session.refreshCasesList = false;
      }
      let errorList: ValidationError[] = null;
      const caseId: string = req?.query?.caseId as string;
      const deleteDraftAppealId = `${i18n.pages.casesList.deleteLinkId}-${caseId}`;
      switch (req?.query?.errorCode as ErrorCode) {
        case ErrorCode.tooManyDrafts:
          errorList = [(createStructuredError(i18n.pages.casesList.createNewAppealId,
            i18n.pages.casesList.tooManyDraftsError))];
          break;
        case ErrorCode.deleteDraftError:
          errorList = [(createStructuredError(deleteDraftAppealId,
            i18n.pages.casesList.deleteDraftError.replace('{{ caseId }}', caseId)))];
          break;
        case ErrorCode.caseNotFound:
          errorList = [(createStructuredError('',
            i18n.pages.casesList.caseNotFoundError.replace('{{ caseId }}', caseId)))];
          break;
        default:
          break;
      }

      return res.render('cases-list.njk', {
        createNewAppealUrl: paths.common.createNewAppeal,
        cases: req.session.casesList || [],
        createAppealModalDescription,
        errorList: errorList
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
      return res.redirect(`${paths.common.casesList}?errorCode=${ErrorCode.tooManyDrafts}`);
    }
    try {
      await updateAppealService.createNewAppeal(req);
      return res.redirect(paths.common.overview);
    } catch (e) {
      next(e);
    }
  };
}

function getDeleteDraftAppeal(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await updateAppealService.deleteDraftAppeal(req);
      return res.redirect(paths.common.casesList);
    } catch (e) {
      logger.exception(e, logLabel);
      return res.redirect(`${paths.common.casesList}?errorCode=${ErrorCode.deleteDraftError}&caseId=${req?.params?.id}`);
    }
  };
}

function setupCasesListController(updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.common.casesList, getCasesList(updateAppealService));
  router.get(paths.common.createNewAppeal, citizenLimiter, getCreateNewAppeal(updateAppealService));
  router.get(paths.common.deleteDraftAppeal, getDeleteDraftAppeal(updateAppealService));
  return router;
}

export {
  setupCasesListController,
  getCasesList,
  getCreateNewAppeal,
  getDeleteDraftAppeal
};
