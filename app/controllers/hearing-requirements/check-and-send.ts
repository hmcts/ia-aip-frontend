import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import UpdateAppealService from '../../service/update-appeal-service';
import { handleNlrStatementValidation, hasActiveNlr } from '../../utils/utils';
import { handleHearingRequirementsSaveForLater } from './common';
import { buildHearingRequirementsSummarySections } from './hearing-requirements-summary-sections';

function getCheckAndSendRenderArgs(req: Request): RenderArgs {
  const hearingRequirements: HearingRequirements = req.session.appeal.hearingRequirements;
  const hasNlr: boolean = hasActiveNlr(req.session.appeal);
  const hearingRequirementsSummarySections = buildHearingRequirementsSummarySections(hearingRequirements, true, hasNlr);

  return {
    renderPath: 'templates/check-and-send.njk',
    renderObj: {
      pageTitle: i18n.pages.cmaRequirementsCYA.title,
      formAction: paths.submitHearingRequirements.checkAndSend,
      previousPage: paths.submitHearingRequirements.taskList,
      summarySections: hearingRequirementsSummarySections,
      hasNlr
    }
  };
}

function getCheckAndSendPage(req: Request, res: Response, next: NextFunction) {
  try {
    const { renderPath, renderObj } = getCheckAndSendRenderArgs(req);
    res.render(renderPath, renderObj);
  } catch (e) {
    next(e);
  }
}

function postCheckAndSendPage(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body['saveForLater']) {
        await updateAppealService.submitEvent(Events.EDIT_AIP_HEARING_REQUIREMENTS, req);
        return handleHearingRequirementsSaveForLater(req, res);
      }
      if (hasActiveNlr(req.session.appeal)) {
        const canContinue = handleNlrStatementValidation(req, res, getCheckAndSendRenderArgs(req));
        if (!canContinue) {
          return;
        }
      }
      const appealUpdated: Appeal = await updateAppealService.submitEventRefactored(Events.SUBMIT_AIP_HEARING_REQUIREMENTS, req.session.appeal, req.idam.userDetails.uid, req.cookies['__auth-token']);
      req.session.refreshCasesList = true;
      req.session.appeal = {
        ...req.session.appeal,
        ...appealUpdated
      };
      req.app.locals.logger.trace(`Hearing requirements submitted for AIP appeal with ccd id ${JSON.stringify(req.session.appeal.ccdCaseId)}`, 'Confirmation Hearing Requirements');
      res.redirect(paths.submitHearingRequirements.confirmation);
    } catch (e) {
      next(e);
    }
  };
}

function setupHearingRequirementsCYAController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.submitHearingRequirements.checkAndSend, middleware, getCheckAndSendPage);
  router.post(paths.submitHearingRequirements.checkAndSend, middleware, postCheckAndSendPage(updateAppealService));

  return router;
}

export {
  setupHearingRequirementsCYAController,
  getCheckAndSendPage,
  postCheckAndSendPage
};
